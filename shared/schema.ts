import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Original users table
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

// Surahs table (chapters of the Quran)
export const surahs = pgTable("surahs", {
  id: serial("id").primaryKey(),
  number: integer("number").notNull().unique(),
  name_arabic: text("name_arabic").notNull(),
  name_tajik: text("name_tajik").notNull(),
  name_english: text("name_english").notNull(),
  revelation_type: text("revelation_type").notNull(), // 'Meccan' or 'Medinan'
  verses_count: integer("verses_count").notNull(),
});

export const insertSurahSchema = createInsertSchema(surahs).omit({
  id: true,
});

export type InsertSurah = z.infer<typeof insertSurahSchema>;
export type Surah = typeof surahs.$inferSelect;

// Translations table (metadata about available translations)
export const translations = pgTable("translations", {
  id: serial("id").primaryKey(),
  translator_id: text("translator_id").notNull().unique(), // unique identifier for the translator
  name: text("name").notNull(),
  description: text("description"),
  language: text("language").notNull(),
  source: text("source").notNull(), // e.g., 'default', 'quran_foundation'
});

export const insertTranslationSchema = createInsertSchema(translations).omit({
  id: true,
});

export type InsertTranslation = z.infer<typeof insertTranslationSchema>;
export type Translation = typeof translations.$inferSelect;

// Verses table (ayahs of the Quran)
export const verses = pgTable("verses", {
  id: serial("id").primaryKey(),
  surah_id: integer("surah_id").notNull(),
  verse_number: integer("verse_number").notNull(),
  arabic_text: text("arabic_text").notNull(),
  tajik_text: text("tajik_text").notNull(), // Default Tajik translation
  page: integer("page"),
  juz: integer("juz"),
  audio_url: text("audio_url"),
  unique_key: text("unique_key").notNull().unique(), // Format: surah:verse (e.g., "2:255")
});

// Translation content table (to store different translations for verses)
export const translationContents = pgTable("translation_contents", {
  id: serial("id").primaryKey(),
  verse_id: integer("verse_id").notNull(),
  translation_id: integer("translation_id").notNull(),
  text: text("text").notNull(),
  // A unique constraint on verse_id + translation_id would be added in migration
});

export const insertTranslationContentSchema = createInsertSchema(translationContents).omit({
  id: true,
});

export type InsertTranslationContent = z.infer<typeof insertTranslationContentSchema>;
export type TranslationContent = typeof translationContents.$inferSelect;

export const insertVerseSchema = createInsertSchema(verses).omit({
  id: true,
});

export type InsertVerse = z.infer<typeof insertVerseSchema>;
export type Verse = typeof verses.$inferSelect;

// Bookmarks table
export const bookmarks = pgTable("bookmarks", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  verse_id: integer("verse_id").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertBookmarkSchema = createInsertSchema(bookmarks).omit({
  id: true,
  created_at: true,
});

export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;
export type Bookmark = typeof bookmarks.$inferSelect;

// Search history
export const searchHistory = pgTable("search_history", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  query: text("query").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertSearchHistorySchema = createInsertSchema(searchHistory).omit({
  id: true,
  created_at: true,
});

export type InsertSearchHistory = z.infer<typeof insertSearchHistorySchema>;
export type SearchHistory = typeof searchHistory.$inferSelect;
