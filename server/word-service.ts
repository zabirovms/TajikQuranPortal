import { Request, Response } from 'express';
import { db } from './db';
import { wordAnalysis, verses } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { log } from './vite';

/**
 * Service to handle word-by-word analysis of Quranic verses
 */
export class WordService {
  private static instance: WordService;

  private constructor() {
    // Singleton constructor
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): WordService {
    if (!WordService.instance) {
      WordService.instance = new WordService();
    }
    return WordService.instance;
  }

  /**
   * Get word-by-word analysis for a verse
   */
  public async getVerseWordAnalysis(req: Request, res: Response) {
    try {
      const { surahNumber, verseNumber } = req.params;
      
      // Validate parameters
      if (!surahNumber || !verseNumber) {
        return res.status(400).json({ 
          message: "Surah number and verse number are required",
          success: false 
        });
      }
      
      const surahNum = parseInt(surahNumber);
      const verseNum = parseInt(verseNumber);
      
      if (isNaN(surahNum) || isNaN(verseNum)) {
        return res.status(400).json({ 
          message: "Invalid surah or verse number",
          success: false 
        });
      }
      
      log(`Processing word analysis request for ${surahNum}:${verseNum}`, 'word-service');
      
      // Get verse ID from database
      const verseKey = `${surahNum}:${verseNum}`;
      const verseResults = await db.select().from(verses).where(eq(verses.unique_key, verseKey));
      
      if (!verseResults || verseResults.length === 0) {
        return res.status(404).json({ 
          message: "Verse not found",
          success: false 
        });
      }
      
      const verse = verseResults[0];
      
      // Check if word analysis already exists in database
      const existingAnalysis = await db.select().from(wordAnalysis).where(eq(wordAnalysis.verse_id, verse.id));
      
      if (existingAnalysis && existingAnalysis.length > 0) {
        // Sort by word position
        existingAnalysis.sort((a: any, b: any) => a.word_position - b.word_position);
        log(`Returning existing word analysis for ${surahNum}:${verseNum}`, 'word-service');
        return res.json(existingAnalysis);
      }
      
      // Extract words directly from the Arabic text
      log(`Processing verse ${surahNum}:${verseNum}: "${verse.arabic_text}"`, 'word-service');
      
      // Get simple word analysis from the text
      const wordData = await extractSimpleWordAnalysis(verse.id, verse.arabic_text);
      const wordEntries = [];
      
      // Store each word in the database
      for (const word of wordData) {
        // Insert the word into the database
        const result = await db.insert(wordAnalysis).values(word).returning();
        
        if (result && result.length > 0) {
          wordEntries.push(result[0]);
        }
      }
      
      log(`Stored ${wordData.length} words for ${surahNum}:${verseNum}`, 'word-service');
      
      // Sort by word position
      wordEntries.sort((a, b) => a.word_position - b.word_position);
      
      return res.json(wordEntries);
    } catch (error: any) {
      console.error("Error in word analysis:", error);
      return res.status(500).json({ 
        message: "Error processing word analysis",
        error: error.message,
        success: false 
      });
    }
  }
}

/**
 * Gets basic word analysis data from Arabic text
 */
export async function extractSimpleWordAnalysis(verseId: number, arabicText: string) {
  // Split the text into words
  const words = arabicText.split(' ').filter(word => word.trim().length > 0);
  const result = [];
  
  // Create simple word data
  for (let i = 0; i < words.length; i++) {
    result.push({
      verse_id: verseId,
      word_position: i + 1,
      word_text: words[i],
      transliteration: null, // Will show placeholder "талаффуз"
      translation: null, // Will show placeholder "тарҷума"
      root: null,
      part_of_speech: null,
      created_at: new Date()
    });
  }
  
  return result;
}

/**
 * Register the word service routes
 */
export function registerWordServiceRoutes(app: any) {
  const wordService = WordService.getInstance();
  
  // Get word analysis for a verse
  app.get('/api/word-analysis/:surahNumber/:verseNumber', 
    (req: Request, res: Response) => wordService.getVerseWordAnalysis(req, res));
}