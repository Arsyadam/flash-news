import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Article schema
export const articleSchema = z.object({
  url: z.string().url(),
  title: z.string(),
  author: z.string(),
  source: z.string(),
  imageUrl: z.string().url().optional(),
  content: z.string().optional(),
});

export type Article = z.infer<typeof articleSchema>;

// AI Description schema
export const descriptionSchema = z.object({
  content: z.string(),
});

export type Description = z.infer<typeof descriptionSchema>;

// News Recommendation schema
export const recommendationSchema = z.object({
  title: z.string(),
  source: z.string(),
  url: z.string().url(),
  imageUrl: z.string().url().optional(),
});

export type Recommendation = z.infer<typeof recommendationSchema>;

// Original DB schemas (keeping as is not to break existing code)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
