import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const models = pgTable("models", {
  id: serial("id").primaryKey(),
  eprocId: text("eproc_id").unique().notNull(),
  orgao: text("orgao").notNull().default("GabRJL"),
  descricao: text("descricao").notNull(),
  sigla: text("sigla").notNull(),
  classificacaoOriginal: text("classificacao_original").notNull().default(""),
  categoria: text("categoria").notNull().default("OUTROS"),
  tags: text("tags").array().notNull().default([]),
  unifiedTags: text("unified_tags").array().notNull().default([]),
  corHex: text("cor_hex").notNull().default("#FFFFFF"),
  conteudo: text("conteudo"),
  manualTags: text("manual_tags").array(),
});

export const insertModelSchema = createInsertSchema(models).omit({ id: true });
export type InsertModel = z.infer<typeof insertModelSchema>;
export type Model = typeof models.$inferSelect;

export const uploadRowSchema = z.object({
  descricao: z.string(),
  sigla: z.string(),
  codigo: z.string(),
  orgao: z.string().optional(),
  classificacao: z.string().optional(),
});

export const uploadBatchSchema = z.array(uploadRowSchema);
export type UploadRow = z.infer<typeof uploadRowSchema>;

export const pageGroups = pgTable("page_groups", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  tags: text("tags").array().notNull().default([]),
  displayOrder: integer("display_order").notNull().default(0),
});

export const insertPageGroupSchema = createInsertSchema(pageGroups).omit({ id: true });
export type InsertPageGroup = z.infer<typeof insertPageGroupSchema>;
export type PageGroup = typeof pageGroups.$inferSelect;

export const appSettings = pgTable("app_settings", {
  id: serial("id").primaryKey(),
  key: text("key").unique().notNull(),
  value: text("value").notNull(),
});

export type AppSetting = typeof appSettings.$inferSelect;
