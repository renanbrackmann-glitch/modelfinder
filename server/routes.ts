import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import XLSX from "xlsx";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse") as (buffer: Buffer) => Promise<{ text: string; numpages: number }>;
import { storage } from "./storage";
import type { InsertModel, InsertPageGroup } from "@shared/schema";

const upload = multer({ storage: multer.memoryStorage() });

function normalizeTerm(term: string): string {
  return term
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

const COLOR_RULES: { trigers: string[]; hex: string }[] = [
  { hex: "#8CACCC", trigers: ["despacho", "distribuição", "distribuicao"] },
  { hex: "#EBD992", trigers: ["admissibilidade", "preliminar", "prejudicial", "interesse"] },
  { hex: "#C8DEFA", trigers: ["nulidade"] },
  { hex: "#ACECA8", trigers: ["estrutura"] },
  { hex: "#EFB778", trigers: ["locação", "locacao", "despejo"] },
  { hex: "#F7C5DF", trigers: ["honorário", "honorario", "sucumbência", "sucumbencia", "ajg", "gratuidade de justiça"] },
  { hex: "#D58381", trigers: ["dano", "responsabilidade civil", "sanção", "sancao"] },
  { hex: "#BB946C", trigers: ["execução", "execucao", "penhora"] },
  { hex: "#E9AA91", trigers: ["consumidor", "cdc"] },
  { hex: "#EDEF93", trigers: ["corretagem", "representação comercial", "gestão de negócios", "depósito mercantil"] },
];

function determineColor(allTerms: string[]): string {
  const joined = allTerms.map(normalizeTerm).join(" ");
  for (const rule of COLOR_RULES) {
    if (rule.trigers.some(t => joined.includes(t))) return rule.hex;
  }
  return "#FFFFFF";
}

function processRow(row: any, index: number): InsertModel {
  const descricao = String(
    row.Descricao ?? row.descricao ?? row["Descrição"] ?? row.DESCRICAO ?? row["Descricão"] ?? ""
  ).trim();
  const classificacao = String(
    row.Classificacao ?? row.classificacao ?? row["Classificação"] ?? row.CLASSIFICACAO ?? ""
  ).trim();
  const codigo = String(
    row.Codigo ?? row.codigo ?? row["Código"] ?? row.CODIGO ?? `auto-${Date.now()}-${index}`
  ).trim();
  const sigla = String(
    row.Sigla ?? row.sigla ?? row.SIGLA ?? `modelo-${index}`
  ).trim();
  const orgao = String(
    row.Orgao ?? row.orgao ?? row["Órgão"] ?? row.ORGAO ?? "GabRJL"
  ).trim();

  const match = descricao.match(/^([A-ZÀ-Ú\s\/]+)\s*-/);
  const categoria = match ? match[1].trim() : "OUTROS";

  const tags = classificacao.split(" - ").map((t: string) => t.trim()).filter(Boolean);

  const descLower = descricao.toLowerCase();
  const autoTags: string[] = [];

  if (descLower.includes("liminar") || descLower.includes("antecipada") || descLower.includes("urgência")) autoTags.push("Liminares");
  if (descLower.includes("despacho") && !descLower.includes("decisão interlocutória")) autoTags.push("Despachos");
  if (descLower.includes("interlocutória") || descLower.includes("tutela")) autoTags.push("Decisões Interlocutórias");
  if (descLower.includes("petição inicial") || descLower.includes("emenda à inicial")) autoTags.push("Petição Inicial");
  if (descLower.includes("contestação") || descLower.includes("revelia")) autoTags.push("Contestação");
  if (descLower.includes("execução") || descLower.includes("cumprimento de sentença") || descLower.includes("penhora") || descLower.includes("embargos à execução")) autoTags.push("Execução");
  if (descLower.includes("perícia") || descLower.includes("audiência") || descLower.includes("ônus da prova")) autoTags.push("Instrução");
  if (descLower.includes("sentença") && !descLower.includes("nulidade da sentença")) autoTags.push("Sentença");
  if (descLower.includes("nulidade")) autoTags.push("Sentença");
  if (descLower.includes("locação") || descLower.includes("despejo")) autoTags.push("Locação");
  if (descLower.includes("honorários")) autoTags.push("Honorários");
  if (descLower.includes("bancário") || descLower.includes("revisional bancária")) autoTags.push("Bancário");
  if (descLower.includes("corretagem")) autoTags.push("Corretagem");
  if (descLower.includes("representação comercial")) autoTags.push("Representação Comercial");
  if (descLower.includes("gestão de negócios")) autoTags.push("Gestão de Negócios");
  if (descLower.includes("depósito mercantil")) autoTags.push("Depósito Mercantil");
  if (descLower.includes("comissão mercantil")) autoTags.push("Comissão Mercantil");
  if (descLower.includes("mandato") || descLower.includes("procuração")) autoTags.push("Mandatos");
  if (descLower.includes("gratuidade") || descLower.includes("ajg")) autoTags.push("Gratuidade de Justiça");
  if (descLower.includes("mérito")) autoTags.push("Mérito");
  if (descLower.includes("admissibilidade") || descLower.includes("preparo") || descLower.includes("deserção") || descLower.includes("dialeticidade")) autoTags.push("Admissibilidade");

  const finalTags = Array.from(new Set([...tags, ...autoTags]));
  const rawUnified = [categoria, ...finalTags];
  const unifiedTags = Array.from(new Set(rawUnified.map(normalizeTerm)));
  const corHex = determineColor([categoria, ...finalTags, descricao.substring(0, 60)]);

  return {
    eprocId: codigo,
    orgao,
    descricao,
    sigla,
    classificacaoOriginal: classificacao,
    categoria,
    tags: finalTags,
    unifiedTags,
    corHex,
  };
}

function analyzeLegalText(text: string): { tags: string[]; query: string } {
  const t = text.toLowerCase();
  const tags: string[] = [];

  if (t.includes("locação") || t.includes("inquilino") || t.includes("locador") || t.includes("aluguel")) tags.push("Locação");
  if (t.includes("despejo") || t.includes("desocupação")) tags.push("Despejo");
  if (t.includes("liminar") || t.includes("tutela de urgência") || t.includes("antecipação")) tags.push("Liminares");
  if (t.includes("honorários advocatícios") || t.includes("honorários")) tags.push("Honorários");
  if (t.includes("gratuidade") || t.includes("justiça gratuita")) tags.push("Gratuidade de Justiça");
  if (t.includes("execução") || t.includes("cumprimento de sentença") || t.includes("penhora")) tags.push("Execução");
  if (t.includes("admissibilidade") || t.includes("deserção") || t.includes("preparo")) tags.push("Admissibilidade");
  if (t.includes("bancário") || t.includes("contrato bancário") || t.includes("revisional")) tags.push("Bancário");
  if (t.includes("contestação") || t.includes("ilegitimidade") || t.includes("prescrição")) tags.push("Contestação");
  if (t.includes("mérito") || t.includes("procedente") || t.includes("improcedente")) tags.push("Mérito");

  // Extract most important keywords for the query
  const keywords: string[] = [];
  const legalTerms = [
    "caução", "fiança", "inadimplemento", "rescisão", "penhora", "prescrição",
    "honorários recursais", "sucumbência", "gratuidade", "tutela", "liminar",
    "dialeticidade", "tempestividade", "legitimidade", "competência",
  ];
  for (const term of legalTerms) {
    if (t.includes(term)) keywords.push(term);
  }

  return {
    tags: Array.from(new Set(tags)).slice(0, 4),
    query: keywords.slice(0, 3).join(" "),
  };
}

async function getAdminPassword(): Promise<string> {
  const saved = await storage.getSetting("adminPassword");
  return saved ?? process.env.ADMIN_PASSWORD ?? "admin123";
}

async function checkAdminAuth(req: Request, res: Response): Promise<boolean> {
  console.log("Tentativa de login recebida. Senha fornecida:", req.headers["x-admin-password"] ? "via Header" : "via Body");

  const provided = req.headers["x-admin-password"]; || req.body.password;
  const expected = await getAdminPassword();
  if (provided !== expected) {
    res.status(401).json({ message: "Senha de administrador incorreta" });
    return false;
  }
  return true;
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {

  // GET /api/models - returns all models from DB
  app.get("/api/models", async (_req: Request, res: Response) => {
    try {
      const data = await storage.getModels();
      res.json(data);
    } catch (err) {
      console.error("Error fetching models:", err);
      res.status(500).json({ message: "Erro ao buscar modelos" });
    }
  });

  // GET /api/models/:id - returns a single model with full content
  app.get("/api/models/:id", async (req: Request, res: Response) => {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) {
      res.status(400).json({ message: "ID inválido" });
      return;
    }
    try {
      const model = await storage.getModelById(id);
      if (!model) {
        res.status(404).json({ message: "Modelo não encontrado" });
        return;
      }
      res.json(model);
    } catch (err) {
      console.error("Error fetching model:", err);
      res.status(500).json({ message: "Erro ao buscar modelo" });
    }
  });

  // POST /api/models/upload-content - admin uploads XLS with eprocId + conteudo
  app.post(
    "/api/models/upload-content",
    upload.single("file"),
    async (req: Request, res: Response) => {
      if (!await checkAdminAuth(req, res)) return;

      if (!req.file) {
        res.status(400).json({ message: "Nenhum arquivo enviado" });
        return;
      }

      try {
        const wb = XLSX.read(req.file.buffer, { type: "buffer" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" }) as any[][];

        if (rawRows.length < 2) {
          res.status(400).json({ message: "Planilha vazia ou formato inválido" });
          return;
        }

        // Find the header row containing "eprocId" or "eproc" (may be row 0 or row 1)
        let headerRowIndex = 0;
        for (let i = 0; i < Math.min(rawRows.length, 5); i++) {
          const rowStr = rawRows[i].map(String).join(" ").toLowerCase();
          if (rowStr.includes("eprocid") || rowStr.includes("eproc_id") || rowStr.includes("eproc id")) {
            headerRowIndex = i;
            break;
          }
        }

        const headerRow = rawRows[headerRowIndex].map(String);
        const dataRows = rawRows.slice(headerRowIndex + 1);

        // Find column indices for eprocId and conteudo
        let eprocIdCol = 0;
        let conteudoCol = 1;
        headerRow.forEach((h, i) => {
          const hn = h.toLowerCase().replace(/\s/g, "");
          if (hn.includes("eprocid") || hn.includes("eproc_id") || hn === "eprocid") eprocIdCol = i;
          else if (hn.includes("conteud") || hn.includes("ntegra") || hn.includes("texto")) conteudoCol = i;
        });

        let updated = 0;
        let skipped = 0;
        let notFound = 0;

        for (const row of dataRows) {
          const eprocId = String(row[eprocIdCol] ?? "").trim();
          const conteudo = String(row[conteudoCol] ?? "").trim();

          if (!eprocId || conteudo.length < 10) {
            skipped++;
            continue;
          }

          const found = await storage.updateModelContent(eprocId, conteudo);
          if (found) updated++;
          else notFound++;
        }

        res.json({
          message: `${updated} modelos atualizados com íntegra`,
          updated,
          skipped,
          notFound,
        });
      } catch (err) {
        console.error("Error processing content XLS:", err);
        res.status(500).json({ message: "Erro ao processar planilha de conteúdo." });
      }
    }
  );

  // POST /api/models/upload - admin uploads XLS, models get saved to DB
  app.post(
    "/api/models/upload",
    upload.single("file"),
    async (req: Request, res: Response) => {
      if (!await checkAdminAuth(req, res)) return;

      if (!req.file) {
        res.status(400).json({ message: "Nenhum arquivo enviado" });
        return;
      }

      try {
        const wb = XLSX.read(req.file.buffer, { type: "buffer" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];

        // Read all rows as raw arrays first to handle eproc's extra metadata row
        const rawRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" }) as any[][];

        if (rawRows.length < 2) {
          res.status(400).json({ message: "Planilha vazia ou formato inválido" });
          return;
        }

        // Find the actual header row (the one that contains "Órgão" or "Código" or "Descrição")
        let headerRowIndex = 0;
        for (let i = 0; i < Math.min(rawRows.length, 5); i++) {
          const row = rawRows[i];
          const rowStr = row.map(String).join(" ").toLowerCase();
          if (rowStr.includes("rgão") || rowStr.includes("código") || rowStr.includes("escri")) {
            headerRowIndex = i;
            break;
          }
        }

        const headerRow = rawRows[headerRowIndex].map(String);
        const dataRows = rawRows.slice(headerRowIndex + 1);

        // Map header names to normalized keys
        const colMap: Record<string, string> = {};
        headerRow.forEach((h, i) => {
          const hn = h.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
          if (hn.includes("rgao") || hn.includes("orgao")) colMap["orgao"] = String(i);
          else if (hn.includes("codigo") || hn.includes("cdigo")) colMap["codigo"] = String(i);
          else if (hn.includes("descri")) colMap["descricao"] = String(i);
          else if (hn.includes("sigla")) colMap["sigla"] = String(i);
          else if (hn.includes("classifica")) colMap["classificacao"] = String(i);
        });

        const data = dataRows
          .filter(row => row.some(cell => String(cell).trim() !== ""))
          .map(row => ({
            orgao: row[parseInt(colMap["orgao"] ?? "0")] ?? "GabRJL",
            codigo: row[parseInt(colMap["codigo"] ?? "1")] ?? "",
            descricao: row[parseInt(colMap["descricao"] ?? "2")] ?? "",
            sigla: row[parseInt(colMap["sigla"] ?? "3")] ?? "",
            classificacao: row[parseInt(colMap["classificacao"] ?? "4")] ?? "",
          }));

        if (data.length === 0) {
          res.status(400).json({ message: "Planilha vazia ou nenhum dado reconhecido" });
          return;
        }

        const processedModels = data.map((row, idx) => processRow(row, idx));
        const result = await storage.upsertModels(processedModels);

        res.json({
          message: `${result.count} modelos importados com sucesso`,
          count: result.count,
        });
      } catch (err) {
        console.error("Error processing XLS:", err);
        res.status(500).json({ message: "Erro ao processar planilha. Verifique o formato do arquivo." });
      }
    }
  );

  // POST /api/analyze-pdf - parse PDF text and analyze with Gemini
  app.post(
    "/api/analyze-pdf",
    upload.single("file"),
    async (req: Request, res: Response) => {
      if (!req.file) {
        res.status(400).json({ message: "Nenhum arquivo enviado" });
        return;
      }

      try {
        const parsed = await pdfParse(req.file.buffer);
        const text = parsed.text;

        if (!text || text.trim().length < 50) {
          res.status(422).json({ message: "Não foi possível extrair texto do PDF. Verifique se o arquivo não está protegido ou escaneado sem OCR." });
          return;
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          res.status(500).json({ message: "Chave de API do Gemini não configurada." });
          return;
        }

        // Load all models from DB to give to Gemini
        const allModels = await storage.getModels();
        const modelCatalog = allModels.map(m =>
          `ID:${m.id} | SIGLA:${m.sigla} | CATEGORIA:${m.categoria} | DESC:${m.descricao} | TAGS:${m.tags.join(", ")}`
        ).join("\n");

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `Você é um assistente especializado em análise de recursos jurídicos para um gabinete de desembargador no TJRS.

Sua tarefa: ler o texto do recurso abaixo e identificar todos os modelos relevantes da base de dados do gabinete.

## BASE DE MODELOS DO GABINETE
Cada linha tem: ID | SIGLA | CATEGORIA | DESCRIÇÃO | TAGS
${modelCatalog}

## TEXTO DO RECURSO
${text.substring(0, 12000)}

## INSTRUÇÕES

Analise o recurso e identifique TODAS as questões jurídicas que precisarão ser enfrentadas no voto/decisão. Para cada questão, busque os modelos relevantes da base acima.

Organize em 4 seções:
1. ESTRUTURA - relatórios, esqueletos de voto, estrutura processual
2. ADMISSIBILIDADE - cabimento, preparo, dialeticidade, interesse recursal  
3. PRELIMINARES_E_MERITO - teses jurídicas centrais do recurso
4. DISPOSITIVO - honorários, juros, custas, prequestionamento

Para cada questão identificada, liste os IDs dos modelos aplicáveis (pode ser [] se nenhum servir).

RESPONDA APENAS com JSON válido neste formato exato:
{
  "tipoRecurso": "string",
  "recorrente": "string",
  "recorrido": "string",
  "decisaoRecorrida": "string",
  "secoes": [
    {
      "titulo": "ESTRUTURA",
      "questoes": [
        {
          "descricao": "descrição da questão",
          "modeloIds": [1, 2],
          "forca": "direto",
          "observacao": "opcional"
        }
      ]
    },
    {
      "titulo": "ADMISSIBILIDADE",
      "questoes": []
    },
    {
      "titulo": "PRELIMINARES E MÉRITO",
      "questoes": []
    },
    {
      "titulo": "DISPOSITIVO",
      "questoes": []
    }
  ]
}

Valores válidos para "forca": "direto" (match exato), "parcial" (match parcial), "ausente" (sem modelo disponível).
Se forca for "ausente", modeloIds deve ser [].
Seja exaustivo mas preciso. Não invente modelos — use apenas IDs que existem na base acima.`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Extract JSON from response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.error("Gemini response not JSON:", responseText.substring(0, 500));
          res.status(500).json({ message: "Resposta da IA em formato inválido. Tente novamente." });
          return;
        }

        const analysis = JSON.parse(jsonMatch[0]);

        // Enrich with full model data
        const modelMap = new Map(allModels.map(m => [m.id, m]));
        for (const secao of analysis.secoes) {
          for (const questao of secao.questoes) {
            questao.modelos = (questao.modeloIds || [])
              .map((id: number) => modelMap.get(id))
              .filter(Boolean);
          }
        }

        res.json(analysis);
      } catch (err) {
        console.error("Error parsing PDF:", err);
        res.status(500).json({ message: "Erro ao processar PDF" });
      }
    }
  );

  // GET /api/page-groups - public, returns page groups (seeds defaults if empty)
  app.get("/api/page-groups", async (_req: Request, res: Response) => {
    try {
      const groups = await storage.getPageGroups();
      res.json(groups);
    } catch (err) {
      console.error("Error fetching page groups:", err);
      res.status(500).json({ message: "Erro ao buscar grupos" });
    }
  });

  // PUT /api/admin/page-groups - save all groups (replaces existing)
  app.put("/api/admin/page-groups", async (req: Request, res: Response) => {
    if (!await checkAdminAuth(req, res)) return;
    try {
      const groups = req.body as InsertPageGroup[];
      if (!Array.isArray(groups)) {
        res.status(400).json({ message: "Formato inválido: esperado array de grupos" });
        return;
      }
      await storage.savePageGroups(groups);
      res.json({ message: "Grupos salvos com sucesso", count: groups.length });
    } catch (err) {
      console.error("Error saving page groups:", err);
      res.status(500).json({ message: "Erro ao salvar grupos" });
    }
  });

  // PUT /api/admin/models/:id/tags - manually set tags for a model
  app.put("/api/admin/models/:id/tags", async (req: Request, res: Response) => {
    if (!await checkAdminAuth(req, res)) return;
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) {
      res.status(400).json({ message: "ID inválido" });
      return;
    }
    try {
      const { tags } = req.body as { tags: string[] };
      if (!Array.isArray(tags)) {
        res.status(400).json({ message: "Formato inválido: esperado { tags: string[] }" });
        return;
      }
      const ok = await storage.updateModelTags(id, tags);
      if (!ok) {
        res.status(404).json({ message: "Modelo não encontrado" });
        return;
      }
      res.json({ message: "Tags atualizadas com sucesso" });
    } catch (err) {
      console.error("Error updating model tags:", err);
      res.status(500).json({ message: "Erro ao atualizar tags" });
    }
  });

  // PUT /api/admin/models/:id/reset-tags - clear manual tags, revert to auto
  app.put("/api/admin/models/:id/reset-tags", async (req: Request, res: Response) => {
    if (!await checkAdminAuth(req, res)) return;
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) {
      res.status(400).json({ message: "ID inválido" });
      return;
    }
    try {
      const ok = await storage.resetModelTags(id);
      if (!ok) {
        res.status(404).json({ message: "Modelo não encontrado" });
        return;
      }
      res.json({ message: "Tags revertidas para automático. Reprocesse na próxima importação." });
    } catch (err) {
      console.error("Error resetting model tags:", err);
      res.status(500).json({ message: "Erro ao redefinir tags" });
    }
  });

  // POST /api/admin/verify-password - verify current password without changing
  app.post("/api/admin/verify-password", async (req: Request, res: Response) => {
    const { password } = req.body as { password: string };
    const expected = await getAdminPassword();
    if (password === expected) {
      res.json({ ok: true });
    } else {
      res.status(401).json({ message: "Senha incorreta" });
    }
  });

  // PUT /api/admin/password - change admin password
  app.put("/api/admin/password", async (req: Request, res: Response) => {
    if (!await checkAdminAuth(req, res)) return;
    try {
      const { newPassword } = req.body as { newPassword: string };
      if (!newPassword || newPassword.length < 6) {
        res.status(400).json({ message: "A nova senha deve ter pelo menos 6 caracteres" });
        return;
      }
      await storage.setSetting("adminPassword", newPassword);
      res.json({ message: "Senha alterada com sucesso" });
    } catch (err) {
      console.error("Error changing password:", err);
      res.status(500).json({ message: "Erro ao alterar senha" });
    }
  });

  return httpServer;
}
