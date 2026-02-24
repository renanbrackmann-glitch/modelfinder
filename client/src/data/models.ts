// Data mapped from the provided CSV and rules

export interface ModelEntry {
  id: string; // eprocId (Codigo)
  dbId: number; // numeric primary key from DB (for API calls)
  orgao: string;
  descricao: string;
  sigla: string;
  classificacaoOriginal: string; // The original string from eproc
  
  // Parsed fields for the frontend
  categoria: string; // Extracted prefix (e.g. "LOCAÇÃO")
  tags: string[]; // Parsed from classificacaoOriginal
  unifiedTags: string[]; // Normalized tags combining categoria and tags for search
  corHex: string; // The hex color based on eproc rules
  conteudo?: string | null; // Full text content of the model
}

// E-proc color mapping rules
const COLOR_RULES = [
  { tipo: "Competência residual", hex: "#EDEF93", trigers: ["Corretagem", "representação comercial", "gestão de negócios", "depósito mercantil"] },
  { tipo: "Despachos", hex: "#8CACCC", trigers: ["Despacho", "Distribuição"] },
  { tipo: "Admissibilidade, Preliminares", hex: "#EBD992", trigers: ["Admissibilidade", "Preliminares", "Prejudiciais", "Interesse"] },
  { tipo: "Nulidades", hex: "#C8DEFA", trigers: ["Nulidades"] },
  { tipo: "Estrutura", hex: "#ACECA8", trigers: ["Estrutura"] },
  { tipo: "Locação", hex: "#EFB778", trigers: ["Locação", "Despejo"] },
  { tipo: "Honorários e Ônus", hex: "#F7C5DF", trigers: ["Honorários", "Sucumbência", "AJG", "Gratuidade de Justiça"] },
  { tipo: "Danos", hex: "#D58381", trigers: ["Danos", "Responsabilidade Civil", "Multas", "Sanções"] },
  { tipo: "Execução", hex: "#BB946C", trigers: ["Execução", "Penhora"] },
  { tipo: "Ações de consumo", hex: "#E9AA91", trigers: ["Ações de consumo", "CDC", "Consumidor"] },
];

function determineColor(tags: string[], categoria: string): string {
  // Check against rules (simplified heuristic based on description)
  const allTerms = [...tags, categoria].map(t => t.toLowerCase());
  
  for (const rule of COLOR_RULES) {
    if (rule.trigers.some(trigger => allTerms.some(t => t.includes(trigger.toLowerCase())))) {
      return rule.hex;
    }
  }
  return "#FFFFFF"; // Default Branco
}

function normalizeTerm(term: string): string {
  return term
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .trim();
}

function parseModel(raw: any): ModelEntry {
  // Extract category (Text before " - ")
  const match = raw.descricao.match(/^([A-ZÀ-Ú\s\/]+)\s*-/);
  const categoria = match ? match[1].trim() : "OUTROS";
  
  const tags = raw.classificacao.split(" - ").map((t: string) => t.trim()).filter(Boolean);
  
  // Create unified tags array (normalized)
  // This solves the problem of "BANCÁRIO" and "Bancário" being different
  const rawUnified = [categoria, ...tags];
  const unifiedTags = Array.from(new Set(rawUnified.map(normalizeTerm)));
  
  return {
    id: raw.codigo,
    dbId: 0,
    orgao: raw.orgao,
    descricao: raw.descricao,
    sigla: raw.sigla,
    classificacaoOriginal: raw.classificacao,
    categoria,
    tags,
    unifiedTags,
    corHex: determineColor(tags, categoria),
    conteudo: null,
  };
}

// Raw data from the CSV snippet
const rawData = [
  { orgao: "GabRJL", codigo: "20000016663", descricao: "HONORÁRIOS - Não fixação/majoração de honorários recursais. Cabimento apenas em caso de não conhecimento integral ou improvimento do recurso (art. 85, §11º, CPC, EDcl no AgInt no REsp 1.573.573-RJ)", sigla: "hon-recursais-nao-fixa-majora", classificacao: "Honorários - Sucumbência" },
  { orgao: "GabRJL", codigo: "20000022902", descricao: "HONORÁRIOS - Arbitramento. Revogação de mandato (direito potestativo). Necessidade de remuneração proporcional ao trabalho prestado. Vedação ao enriquecimento sem causa. Art. 22 EOAB e Art. 14 CED/OAB", sigla: "hon-arbit-revog-intro", classificacao: "Honorários - MÉRITO" },
  { orgao: "GabRJL", codigo: "20000029350", descricao: "HONORÁRIOS - Revisional bancária. Fixação sobre o valor da causa ante a impossibilidade de mensurar o proveito econômico imediato (Tema 1076 STJ, REsp 1.989.284/RS).", sigla: "hon-rev-banc-vlcausa", classificacao: "Honorários - Sucumbência - Bancário" },
  { orgao: "GabRJL", codigo: "20000037984", descricao: "HONORÁRIOS - Cobrança. Prescrição. Cláusula de êxito (termo inicial na ciência do levantamento do alvará). Interrupção por demanda anterior extinta sem mérito (afastamento da inércia).", sigla: "hon-presc-interrup-exito", classificacao: "Honorários - MÉRITO - Prescrição" },
  { orgao: "GabRJL", codigo: "20000038502", descricao: "HONORÁRIOS - Responsabilização pessoal do advogado pelas custas e despesas processuais. Ausência de regularização de procuração com indícios de fraude equivale a inexistência de mandato.", sigla: "hon-resp-adv-sem-mandato", classificacao: "Honorários - Nulidades - Sucumbência" },
  { orgao: "GabRJL", codigo: "20000040640", descricao: "HONORÁRIOS - Sucumbência. Fixação por equidade para evitar distorção quando inestimável o proveito econômico ou valor da causa desproporcional (Tema 1076 STJ, REsp 1.978.842/MA)", sigla: "hon-equidade-distorção", classificacao: "Honorários - Sucumbência" },
  { orgao: "GabRJL", codigo: "20000016533", descricao: "LOCAÇÃO - Liminar de despejo e requisitos do art 59 da Lei 8245/91 - Texto introdutório", sigla: "estr-loc-despejo-liminar", classificacao: "Estrutura - Despejo - Locação - LIMINAR" },
  { orgao: "GabRJL", codigo: "20000027908", descricao: "LOCAÇÃO - Função social e direito fundamental à moradia não impedem o despejo por inadimplemento. Inexistência de direito a moradia gratuita em imóvel alheio (Art. 6º CF, Lei 8245, dignidade, liminar)", sigla: "loc-moradia-funcaosocial", classificacao: "Locação - Despejo" },
  { orgao: "GabRJL", codigo: "20000040351", descricao: "LOCAÇÃO - Requisitos para despejo liminar por falta de garantia após exoneração de fiança e validade da notificação eletrônica (art 59 §1 IX, art 40 pu Lei 8245, art 835 CC, e-mail, prazo determinado)", sigla: "loc-despejo-fianca", classificacao: "Locação - Despejo" },
  { orgao: "GabRJL", codigo: "20000040356", descricao: "LOCAÇÃO - Possibilidade de dispensa de caução para despejo liminar se o inadimplemento for superior a três meses de aluguel. Crédito supre a garantia.", sigla: "loc-despejo-caução", classificacao: "Locação - Despejo" },
  { orgao: "GabRJL", codigo: "20000040357", descricao: "LOCAÇÃO - Pedido de efeito suspensivo à apelação - excepcionalidade mediante prova de risco de dano e probabilidade (Art. 58, V, Lei 8245, Art. 1012 CPC, despejo, sentença)", sigla: "loc-apel-efeito-susp", classificacao: "Locação - Efeito Suspensivo à Apelação" },
  { orgao: "GabRJL", codigo: "20000040341", descricao: "LOCAÇÃO - Responsabilidade da imobiliária por culpa no exercício do mandato. Inexistência de dever de indenizar danos do locatário sem prova de negligência ou dolo (667 CC, 14 CDC, 186 927 CC)", sigla: "loc-resp-imobil-mand", classificacao: "Locação - MÉRITO" },
  { orgao: "GabRJL", codigo: "20000040343", descricao: "LOCAÇÃO - Exame da legitimidade passiva da imobiliária sob a ótica da teoria da asserção, distinguindo atos de gestão de falhas na prestação do serviço (mandatária, 653 667 CC, 186 927)", sigla: "loc-legit-pass-imobil", classificacao: "Locação - Legitimidade Passiva" },
  { orgao: "GabRJL", codigo: "20000040345", descricao: "LOCAÇÃO - Prazo prescricional trienal para a pretensão de recebimento de aluguéis e encargos acessórios da relação locatícia (206 §3º I CC, três anos, prédios urbanos rústicos)", sigla: "loc-prescricao-trienal", classificacao: "Locação - Prescrição - MÉRITO" },
  { orgao: "GabRJL", codigo: "20000040346", descricao: "LOCAÇÃO - Termo final do contrato fixado na entrega das chaves ou imissão na posse. Aluguéis são devidos durante o período em que o bem permaneceu indisponível por culpa do ex-inquilino", sigla: "loc-locativos-reparos", classificacao: "Locação - MÉRITO" },
  { orgao: "GabRJL", codigo: "20000040339", descricao: "LOCAÇÃO - Necessidade de notificação prévia do locatário para acompanhar a vistoria final. Prova unilateral que impede a cobrança de reparos e multas (23 III Lei 8245/91, contraditório, dano, laudo)", sigla: "loc-vistoria-notif", classificacao: "Locação - MÉRITO" },
  { orgao: "GabRJL", codigo: "20000040340", descricao: "LOCAÇÃO - Possibilidade de cumulação de multa moratória e compensatória se fatos geradores distintos. Veda bis in idem se ambas decorrem do inadimplemento (Cláusula penal, infração, atraso, aluguel)", sigla: "loc-multas-bisidem", classificacao: "Locação - MÉRITO" },
  { orgao: "GabRJL", codigo: "20000040344", descricao: "LOCAÇÃO - Legitimidade ativa do locador independe de prova da propriedade do imóvel. (Art. 22 Lei 8245, Art. 60, natureza pessoal, posse)", sigla: "loc-legit-propriedade", classificacao: "Locação - Legitimidade Ativa" },
  { orgao: "GabRJL", codigo: "20000040349", descricao: "LOCAÇÃO - Validade da cláusula de renúncia à indenização por benfeitorias e ao direito de retenção. Inexistência de abusividade (Art. 35 Lei 8245, Súmula 335 STJ, necessária, útil, incorporação, dano)", sigla: "loc-benfeit-renuncia", classificacao: "Locação - MÉRITO" },
  { orgao: "GabRJL", codigo: "20000041081", descricao: "LOCAÇÃO - Legitimidade ativa do novo proprietário para cobrar alugueis. Sub-rogação legal do adquirente nos direitos do locador após alienação.", sigla: "loc-legit-novo-proprietario", classificacao: "Locação - Legitimidade Ativa" },
  { orgao: "GabRJL", codigo: "20000041082", descricao: "LOCAÇÃO - Ilegitimidade ativa da administradora de imóveis para atuar em nome próprio. Mera representante/mandatária do locador. Vedação de pleitear direito alheio.", sigla: "loc-ilegit-imobiliaria", classificacao: "Locação - Legitimidade Ativa" },
  { orgao: "GabRJL", codigo: "20000022854", descricao: "CORRETAGEM - Texto introdutório. Características do contrato. Aproximação das partes e resultado útil (art. 722 a 725 CC). Comissão. Cláusula de exclusividade (art. 726 CC).", sigla: "corretagemintro", classificacao: "Estrutura - MÉRITO" },
  { orgao: "GabRJL", codigo: "20000016993", descricao: "ADMISS - Afastar preliminar de ofensa à dialeticidade por haver enfrentamento suficiente dos fundamentos da decisão (conhecimento do recurso,", sigla: "adm-dialet-afasta-preliminar", classificacao: "Admissibilidade - MÉRITO - Dialeticidade" },
  { orgao: "GabRJL", codigo: "20000019880", descricao: "ADMISS - Inadmissibilidade por violação à dialeticidade (razões dissociadas, repetição de argumentos, impugnação específica, art. 932, III, art. 1.010, III, art. 1.016, III e art. 1.021, §1º, do CPC)", sigla: "adm-dialeticidade-intro", classificacao: "Admissibilidade - Agravo de instrumento - Agravo interno - Apelação - Estrutura - Dialeticidade" },
  { orgao: "GabRJL", codigo: "20000021624", descricao: "ADMISS - Inadmissibilidade de pedidos formulados em contrarrazões sem recurso próprio ou adesivo", sigla: "adm-contrarraz-pedidos", classificacao: "Admissibilidade - MÉRITO" },
  { orgao: "GabRJL", codigo: "20000022896", descricao: "ADMISS - Inadmissibilidade por ausência de interesse recursal (binômio utilidade-necessidade, art. 996 e 504, I, CPC, recurso contra fundamentação, dispositivo)", sigla: "adm-interesse-recursal-intro", classificacao: "Admissibilidade - Interesse" },
  { orgao: "GabRJL", codigo: "20000023236", descricao: "ADMISS - Deserção preparo recolhido guia primeiro grau", sigla: "desp-desercao-1grau", classificacao: "Distribuição - Preparo - Admissibilidade - Agravo de instrumento" },
  { orgao: "GabRJL", codigo: "20000023237", descricao: "ADMISS - Deserção guia simples pagamento dobro determinado insuficiência", sigla: "desp-desercao-guia-simples", classificacao: "Distribuição - Admissibilidade - Preparo" },
  { orgao: "GabRJL", codigo: "20000023238", descricao: "ADMISS - Deserção pagamento preparo cinco dias", sigla: "desp-desercao-5dias", classificacao: "Distribuição - Admissibilidade - Preparo" },
  { orgao: "GabRJL", codigo: "20000023249", descricao: "ADMISS - Não conhecer AI embargos declaração recebidos como pedido reconsideração intempestividade", sigla: "embargos como reconsideração", classificacao: "Distribuição - Admissibilidade - Tempestividade - Agravo de instrumento" },
  { orgao: "GabRJL", codigo: "20000023267", descricao: "ADMISS - Inadmissibilidade de agravo contra determinação de emenda à inicial (despacho de mero expediente, ausência de cunho decisório, art. 1.001 CPC, irrecorribilidade)", sigla: "adm-cab-despacho", classificacao: "Admissibilidade - Cabimento - Distribuição - Agravo de instrumento" },
  { orgao: "GabRJL", codigo: "20000023270", descricao: "ADMISS - Inadmissibilidade de agravo contra decisão que rejeita preliminar de ilegitimidade (rol taxativo, art. 1.015 CPC, Tema 988 STJ, condição da ação, preliminar apelação, exclusão litisconsorte)", sigla: "adm-cab-legitimidade-mantida", classificacao: "Admissibilidade - Agravo de instrumento - Cabimento - Legitimidade Ativa - Legitimidade Passiva - Distribuição" },
  { orgao: "GabRJL", codigo: "20000023271", descricao: "ADMISS - Inadmissibilidade de agravo contra decisão em embargos à execução (ação de conhecimento incidental, rol taxativo, art. 1.015, parágrafo único, REsp 1.682.120/RS)", sigla: "adm-cab-embexec", classificacao: "Admissibilidade - Cabimento - Distribuição - Execução" },
  { orgao: "GabRJL", codigo: "20000023272", descricao: "ADMISS - Inadmissibilidade de agravo contra decisão que designa, dispensa ou indefere cancelamento de audiência de conciliação (rol taxativo, art. 1.015 CPC, Tema 988 STJ)", sigla: "adm-cab-audiencia", classificacao: "Admissibilidade - Agravo de instrumento - Cabimento - Distribuição" },
  { orgao: "GabRJL", codigo: "20000023273", descricao: "ADMISS - Inadmissibilidade de agravo de instrumento contra decisão que decreta ou afasta a revelia (rol taxativo, art. 1.015 CPC, ausência de urgência, Tema 988 STJ)", sigla: "adm-cab-revelia", classificacao: "Admissibilidade - Cabimento - Distribuição - Agravo de instrumento" },
  { orgao: "GabRJL", codigo: "20000023274", descricao: "ADMISS - Inadmissibilidade de agravo contra decisão que defere gratuidade de justiça ou rejeita pedido de sua revogação (rol taxativo, art. 1.015, V, CPC, impugnação via art. 100, preliminar apelação)", sigla: "adm-cab-ajg-deferida-nao-revog", classificacao: "Admissibilidade - Cabimento - Distribuição - Gratuidade de Justiça" },
  { orgao: "GabRJL", codigo: "20000023278", descricao: "ADMISS - Inadmissibilidade de agravo contra sentença que extingue a execução (erro grosseiro, fungibilidade inviável, recurso cabível apelação, art. 203, §1º, art. 1.009 CPC)", sigla: "adm-cab-extinção-execução", classificacao: "Admissibilidade - Cabimento - Agravo de instrumento - Distribuição - Execução" },
  { orgao: "GabRJL", codigo: "20000023610", descricao: "ADMISS - Rejeição de falta de interesse de agir por desnecessidade de prévia tentativa extrajudicial ou administrativa (acesso à justiça, pretensão resistida, art 5 XXXV CF, condição da ação)", sigla: "afastar falta de interesse", classificacao: "Preliminares - Interesse" },
  { orgao: "GabRJL", codigo: "20000024187", descricao: "AJG - Indeferimento de gratuidade para pessoa física com renda superior a 5 salários mínimos. Afastamento da presunção de pobreza por provas em contrário (99 §2º CPC, Conclusão 49 TJRS)", sigla: "ajg-pf-indeferir", classificacao: "MÉRITO - Gratuidade de Justiça" },
  { orgao: "GabRJL", codigo: "20000024189", descricao: "AJG - Pessoa física deferir gratuidade justiça monocrática hipossuficiência presunção renda 98 CPC", sigla: "ajg-pf-deferir", classificacao: "Gratuidade de Justiça - MÉRITO" },
  { orgao: "GabRJL", codigo: "20000024190", descricao: "AJG - Indeferimento de gratuidade à pessoa jurídica em atividade regular com saldo positivo. Ausência de prova de hipossuficiência atual ou prejuízo (Súmula 481 STJ, CNPJ ativo, faturamento, negar)", sigla: "ajg-pj-indefere", classificacao: "Gratuidade de Justiça - MÉRITO" },
  { orgao: "GabRJL", codigo: "20000024191", descricao: "AJG - Deferimento de gratuidade à pessoa jurídica mediante comprovação documental de insuficiência financeira", sigla: "ajg-pj-defere", classificacao: "Gratuidade de Justiça - MÉRITO" },
  { orgao: "GabRJL", codigo: "20000024303", descricao: "ADMISS - Inadmissibilidade de agravo contra decisão que indefere produção de provas ou dilação probatória (rol taxativo, art. 1.015, preliminar apelação, Tema 988 STJ, testemunha, perícia)", sigla: "adm-cab-provas", classificacao: "Admissibilidade - Agravo de instrumento - Cabimento - Distribuição - Provas" }
];

export const models: ModelEntry[] = rawData.map(parseModel);

// Extract all unique unified tags for the frontend filter
const allTagsSet = new Set<string>();
const allCategoriesSet = new Set<string>();
const displayNames = new Map<string, string>(); // mapping normalized to display name

models.forEach(model => {
  // Save display version of category
  const normCat = normalizeTerm(model.categoria);
  if (!displayNames.has(normCat)) {
    displayNames.set(normCat, model.categoria);
    allCategoriesSet.add(normCat);
  }

  // Add all unified tags to set
  model.unifiedTags.forEach(tag => {
    allTagsSet.add(tag);
    
    // Attempt to store a nice capitalized display name for tags if we don't have one
    if (!displayNames.has(tag)) {
      // Find the original term that created this normalized tag to use as display
      const originalMatch = [model.categoria, ...model.tags].find(t => normalizeTerm(t) === tag);
      if (originalMatch) {
        displayNames.set(tag, originalMatch);
      } else {
        displayNames.set(tag, tag); // fallback
      }
    }
  });
});

export const availableTags = Array.from(allTagsSet).sort();
export const availableCategories = Array.from(allCategoriesSet).sort();

export function getDisplayName(normalizedTag: string): string {
  return displayNames.get(normalizedTag) || normalizedTag;
}

export function searchModels(query: string, selectedTags: string[], dataSet: ModelEntry[] = models): ModelEntry[] {
  // Filter logic: 
  // If no query and no tags, return EMPTY array (as requested by user)
  if (!query.trim() && selectedTags.length === 0) {
    return [];
  }

  let results = [...dataSet];

  // Apply selected tags (AND logic - must match all selected tags)
  if (selectedTags.length > 0) {
    results = results.filter(model => 
      selectedTags.every(selectedTag => model.unifiedTags.includes(selectedTag))
    );
  }

  // Apply free text query (searches in descricao, sigla, and original tags)
  if (query.trim()) {
    const q = normalizeTerm(query);
    results = results.filter(model => {
      const matchDesc = normalizeTerm(model.descricao).includes(q);
      const matchSigla = normalizeTerm(model.sigla).includes(q);
      const matchTags = model.unifiedTags.some(t => t.includes(q)); // Search within tags too
      return matchDesc || matchSigla || matchTags;
    });
  }

  return results;
}
