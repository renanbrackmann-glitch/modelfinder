import { db } from "./db";
import { models, pageGroups, appSettings, type Model, type InsertModel, type PageGroup, type InsertPageGroup } from "@shared/schema";
import { eq } from "drizzle-orm";

const DEFAULT_PAGE_GROUPS: InsertPageGroup[] = [
  {
    title: "Competência",
    tags: ["Locação", "Honorários", "Corretagem", "Mandatos", "Bancário", "Representação Comercial", "Comissão Mercantil", "Gestão de Negócios", "Depósito Mercantil"],
    displayOrder: 0,
  },
  {
    title: "Fase Processual",
    tags: ["Petição Inicial", "Liminares", "Contestação", "Instrução", "Sentença", "Execução"],
    displayOrder: 1,
  },
  {
    title: "Tipo de Decisão",
    tags: ["Despachos", "Decisões Interlocutórias", "Admissibilidade"],
    displayOrder: 2,
  },
  {
    title: "Natureza",
    tags: ["Mérito", "Liminares", "Embargos de declaração"],
    displayOrder: 3,
  },
  {
    title: "Temáticas",
    tags: ["Nulidades", "Prescrição", "Sucumbência", "Gratuidade de Justiça", "Juros e Correção Monetária", "CDC", "Responsabilidade Civil"],
    displayOrder: 4,
  },
];

function normalizeTerm(term: string): string {
  return term
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export interface IStorage {
  getModels(): Promise<Model[]>;
  getModelById(id: number): Promise<Model | null>;
  upsertModels(newModels: InsertModel[]): Promise<{ count: number }>;
  clearModels(): Promise<void>;
  updateModelContent(eprocId: string, conteudo: string): Promise<boolean>;
  updateModelTags(id: number, tags: string[]): Promise<boolean>;
  resetModelTags(id: number): Promise<boolean>;
  getPageGroups(): Promise<PageGroup[]>;
  savePageGroups(groups: InsertPageGroup[]): Promise<void>;
  getSetting(key: string): Promise<string | null>;
  setSetting(key: string, value: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getModels(): Promise<Model[]> {
    return db.select().from(models).orderBy(models.categoria, models.descricao);
  }

  async getModelById(id: number): Promise<Model | null> {
    const rows = await db.select().from(models).where(eq(models.id, id)).limit(1);
    return rows[0] ?? null;
  }

  async upsertModels(newModels: InsertModel[]): Promise<{ count: number }> {
    if (newModels.length === 0) return { count: 0 };

    // Load existing manualTags keyed by eprocId to preserve admin edits across uploads
    const existing = await db.select({ eprocId: models.eprocId, manualTags: models.manualTags }).from(models);
    const manualTagsMap = new Map<string, string[]>();
    for (const row of existing) {
      if (row.manualTags && row.manualTags.length > 0) {
        manualTagsMap.set(row.eprocId, row.manualTags);
      }
    }

    for (const model of newModels) {
      const savedManualTags = manualTagsMap.get(model.eprocId);
      const effectiveTags = savedManualTags ?? model.tags;
      const effectiveUnifiedTags = savedManualTags
        ? Array.from(new Set(savedManualTags.map(normalizeTerm)))
        : model.unifiedTags;

      await db
        .insert(models)
        .values(model)
        .onConflictDoUpdate({
          target: models.eprocId,
          set: {
            orgao: model.orgao,
            descricao: model.descricao,
            sigla: model.sigla,
            classificacaoOriginal: model.classificacaoOriginal,
            categoria: model.categoria,
            corHex: model.corHex,
            tags: effectiveTags,
            unifiedTags: effectiveUnifiedTags,
          },
        });
    }

    return { count: newModels.length };
  }

  async clearModels(): Promise<void> {
    await db.delete(models);
  }

  async updateModelContent(eprocId: string, conteudo: string): Promise<boolean> {
    const result = await db
      .update(models)
      .set({ conteudo })
      .where(eq(models.eprocId, eprocId));
    return (result.rowCount ?? 0) > 0;
  }

  async updateModelTags(id: number, tags: string[]): Promise<boolean> {
    const unifiedTags = Array.from(new Set(tags.map(normalizeTerm)));
    const result = await db
      .update(models)
      .set({ tags, unifiedTags, manualTags: tags })
      .where(eq(models.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async resetModelTags(id: number): Promise<boolean> {
    const result = await db
      .update(models)
      .set({ manualTags: null })
      .where(eq(models.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getPageGroups(): Promise<PageGroup[]> {
    const groups = await db.select().from(pageGroups).orderBy(pageGroups.displayOrder);
    if (groups.length === 0) {
      await this.savePageGroups(DEFAULT_PAGE_GROUPS);
      return db.select().from(pageGroups).orderBy(pageGroups.displayOrder);
    }
    return groups;
  }

  async savePageGroups(groups: InsertPageGroup[]): Promise<void> {
    await db.delete(pageGroups);
    if (groups.length > 0) {
      await db.insert(pageGroups).values(groups.map((g, i) => ({ ...g, displayOrder: i })));
    }
  }

  async getSetting(key: string): Promise<string | null> {
    const rows = await db.select().from(appSettings).where(eq(appSettings.key, key)).limit(1);
    return rows[0]?.value ?? null;
  }

  async setSetting(key: string, value: string): Promise<void> {
    await db
      .insert(appSettings)
      .values({ key, value })
      .onConflictDoUpdate({ target: appSettings.key, set: { value } });
  }
}

export const storage = new DatabaseStorage();
