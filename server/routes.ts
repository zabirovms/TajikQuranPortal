import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookmarkSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes - prefix all routes with /api
  const apiRouter = express.Router();
  
  // Get all surahs
  apiRouter.get("/surahs", async (_req: Request, res: Response) => {
    try {
      const surahs = await storage.getAllSurahs();
      res.json(surahs);
    } catch (error) {
      res.status(500).json({ message: "Error fetching surahs" });
    }
  });

  // Get a specific surah by number
  apiRouter.get("/surahs/:number", async (req: Request, res: Response) => {
    try {
      const surahNumber = parseInt(req.params.number);
      
      if (isNaN(surahNumber)) {
        return res.status(400).json({ message: "Invalid surah number" });
      }
      
      const surah = await storage.getSurahByNumber(surahNumber);
      
      if (!surah) {
        return res.status(404).json({ message: "Surah not found" });
      }
      
      res.json(surah);
    } catch (error) {
      res.status(500).json({ message: "Error fetching surah" });
    }
  });

  // Get verses for a specific surah
  apiRouter.get("/surahs/:number/verses", async (req: Request, res: Response) => {
    try {
      const surahNumber = parseInt(req.params.number);
      
      if (isNaN(surahNumber)) {
        return res.status(400).json({ message: "Invalid surah number" });
      }
      
      const surah = await storage.getSurahByNumber(surahNumber);
      
      if (!surah) {
        return res.status(404).json({ message: "Surah not found" });
      }
      
      const verses = await storage.getVersesBySurah(surah.id);
      res.json(verses);
    } catch (error) {
      res.status(500).json({ message: "Error fetching verses" });
    }
  });

  // Get a specific verse by key (e.g., "2:255")
  apiRouter.get("/verses/:key", async (req: Request, res: Response) => {
    try {
      const verseKey = req.params.key;
      
      if (!verseKey.match(/^\d+:\d+$/)) {
        return res.status(400).json({ message: "Invalid verse key format. Should be surah:verse (e.g., 2:255)" });
      }
      
      const verse = await storage.getVerseByKey(verseKey);
      
      if (!verse) {
        return res.status(404).json({ message: "Verse not found" });
      }
      
      res.json(verse);
    } catch (error) {
      res.status(500).json({ message: "Error fetching verse" });
    }
  });

  // Search verses
  apiRouter.get("/search", async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      const language = req.query.language as 'arabic' | 'tajik' | 'both';
      const surahId = req.query.surah ? parseInt(req.query.surah as string) : undefined;
      
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const results = await storage.searchVerses(query, language, surahId);
      
      // If a user is logged in, save the search query to history
      if (req.query.userId) {
        const userId = parseInt(req.query.userId as string);
        await storage.addSearchHistory({ user_id: userId, query });
      }
      
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Error searching verses" });
    }
  });

  // Get bookmarks for a user
  apiRouter.get("/bookmarks", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const bookmarks = await storage.getBookmarksByUser(userId);
      res.json(bookmarks);
    } catch (error) {
      res.status(500).json({ message: "Error fetching bookmarks" });
    }
  });

  // Create a bookmark
  apiRouter.post("/bookmarks", async (req: Request, res: Response) => {
    try {
      const validatedData = insertBookmarkSchema.parse(req.body);
      const bookmark = await storage.createBookmark(validatedData);
      res.status(201).json(bookmark);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid bookmark data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating bookmark" });
    }
  });

  // Delete a bookmark
  apiRouter.delete("/bookmarks/:id", async (req: Request, res: Response) => {
    try {
      const bookmarkId = parseInt(req.params.id);
      
      if (isNaN(bookmarkId)) {
        return res.status(400).json({ message: "Invalid bookmark ID" });
      }
      
      const result = await storage.deleteBookmark(bookmarkId);
      
      if (!result) {
        return res.status(404).json({ message: "Bookmark not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting bookmark" });
    }
  });

  // Get search history for a user
  apiRouter.get("/search-history", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const history = await storage.getSearchHistoryByUser(userId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Error fetching search history" });
    }
  });

  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}
