import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { log } from "./vite";
import { insertBookmarkSchema, insertSearchHistorySchema } from "@shared/schema";
import { z } from "zod";
import fetch from "node-fetch";

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
      const language = req.query.language as 'arabic' | 'tajik' | 'both' || 'both';
      const surahId = req.query.surah ? parseInt(req.query.surah as string) : undefined;
      
      log(`Received search request: q=${query}, language=${language}, surahId=${surahId}`, "search");
      
      if (!query) {
        log("Search rejected: empty query", "search");
        return res.status(400).json({ 
          message: "Search query is required",
          success: false
        });
      }
      
      const results = await storage.searchVerses(query, language, surahId);
      log(`Search completed: found ${results.length} results`, "search");
      
      // If a user is logged in, save the search query to history
      if (req.query.userId) {
        const userId = parseInt(req.query.userId as string);
        await storage.addSearchHistory({ user_id: userId, query });
        log(`Search history saved for user ${userId}`, "search");
      }
      
      res.json(results);
    } catch (error: any) {
      const errorMessage = error?.message || "Unknown error";
      log(`Search error: ${errorMessage}`, "search");
      console.error("Search error:", error);
      
      res.status(500).json({ 
        message: "Error searching verses", 
        error: errorMessage,
        success: false
      });
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

  // Proxy for Tajweed API to avoid CORS issues
  apiRouter.get("/tajweed/ayah/:reference", async (req: Request, res: Response) => {
    try {
      const reference = req.params.reference;
      const url = `https://api.alquran.cloud/ayah/${reference}/quran-tajweed`;
      
      log(`Fetching Tajweed ayah: ${reference}`, "tajweed");
      
      const response = await fetch(url);
      const data = await response.json();
      
      res.json(data);
    } catch (error) {
      log(`Error fetching Tajweed ayah: ${error}`, "tajweed");
      res.status(500).json({ message: "Error fetching Tajweed ayah", error: String(error) });
    }
  });

  // Proxy for Tajweed Surah API
  apiRouter.get("/tajweed/surah/:number", async (req: Request, res: Response) => {
    try {
      const surahNumber = req.params.number;
      const url = `https://api.alquran.cloud/surah/${surahNumber}/quran-tajweed`;
      
      log(`Fetching Tajweed surah: ${surahNumber}`, "tajweed");
      
      const response = await fetch(url);
      const data = await response.json();
      
      res.json(data);
    } catch (error) {
      log(`Error fetching Tajweed surah: ${error}`, "tajweed");
      res.status(500).json({ message: "Error fetching Tajweed surah", error: String(error) });
    }
  });

  // Quran Foundation API proxy endpoints
  // Function to get an OAuth token from Quran Foundation
  const getQuranFoundationToken = async () => {
    // Use the prelive endpoint as provided by the user
    const clientId = '1399dcc4-be59-4bca-a70a-b2ff9153ed9f';
    const clientSecret = 'EVqvZgkwt1ATR.1HSe9LX1QQv7';
    
    try {
      // Create the form data for the token request
      const data = new URLSearchParams();
      data.append('grant_type', 'client_credentials');
      data.append('client_id', clientId);
      data.append('client_secret', clientSecret);
      
      log(`Requesting Quran Foundation token from prelive endpoint`, "quranFoundation");
      
      const response = await fetch('https://prelive-oauth2.quran.foundation/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: data.toString(),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to obtain token: ${response.status} ${response.statusText}`);
      }
      
      const tokenData = await response.json() as { access_token: string };
      log(`Successfully obtained Quran Foundation token`, "quranFoundation");
      
      // Return token data with both the token and client ID for headers
      return {
        accessToken: tokenData.access_token,
        clientId: clientId
      };
    } catch (error) {
      log(`Error getting Quran Foundation token: ${error}`, "quranFoundation");
      throw error;
    }
  };

  // Endpoint to get available Tajik translations
  apiRouter.get("/quran-foundation/translations", async (_req: Request, res: Response) => {
    try {
      // Get auth token and client ID
      const authData = await getQuranFoundationToken();
      
      log(`Fetching Quran Foundation Tajik translations`, "quranFoundation");
      
      // Use the prelive API endpoint with the correct headers
      const response = await fetch(
        'https://apis-prelive.quran.foundation/content/api/v4/resources/translations?language=tg',
        {
          headers: {
            'x-auth-token': authData.accessToken,
            'x-client-id': authData.clientId,
            'Accept': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch translations: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Log success and return data
      log(`Successfully fetched Quran Foundation translations`, "quranFoundation");
      res.json(data);
    } catch (error) {
      log(`Error fetching Quran Foundation translations: ${error}`, "quranFoundation");
      res.status(500).json({ error: "Failed to fetch translations" });
    }
  });

  // Endpoint to get verses by surah with specific translation
  apiRouter.get("/quran-foundation/surahs/:number/verses", async (req: Request, res: Response) => {
    try {
      const surahNumber = req.params.number;
      const translationId = req.query.translation_id as string;
      
      if (!translationId) {
        return res.status(400).json({ error: "Missing translation_id parameter" });
      }
      
      log(`Fetching Quran Foundation verses for surah ${surahNumber} with translation ${translationId}`, "quranFoundation");
      
      // Get auth token and client ID
      const authData = await getQuranFoundationToken();
      
      // Use the prelive API endpoint with the correct headers
      const response = await fetch(
        `https://apis-prelive.quran.foundation/content/api/v4/verses/by_chapter/${surahNumber}?translations=${translationId}`,
        {
          headers: {
            'x-auth-token': authData.accessToken,
            'x-client-id': authData.clientId,
            'Accept': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch verses: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Log success and return data
      log(`Successfully fetched Quran Foundation verses for surah ${surahNumber}`, "quranFoundation");
      res.json(data);
    } catch (error) {
      log(`Error fetching Quran Foundation verses: ${error}`, "quranFoundation");
      res.status(500).json({ error: "Failed to fetch verses" });
    }
  });

  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}
