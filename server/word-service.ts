import { exec } from 'child_process';
import { promises as fs } from 'fs';
import { Request, Response } from 'express';
import { db } from './db';
import { wordAnalysis, verses } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import path from 'path';
import { log } from './vite';
import { promisify } from 'util';

/**
 * Service to handle word-by-word analysis of Quranic verses
 */
export class WordService {
  private static instance: WordService;
  private execPromise = promisify(exec);
  private jarPath = 'jqurantree-1.0.0.jar';

  private constructor() {
    // Singleton constructor
    this.checkJarFile();
  }

  /**
   * Check if the JQuranTree jar file exists
   */
  private async checkJarFile() {
    try {
      await fs.access(this.jarPath);
      log(`JQuranTree jar file found at ${this.jarPath}`, 'word-service');
    } catch (error) {
      log(`WARNING: JQuranTree jar file not found at ${this.jarPath}`, 'word-service');
    }
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
   * Run JQuranTree jar file to analyze a verse
   */
  private async runJQuranTreeAnalysis(surahNumber: number, verseNumber: number): Promise<any> {
    try {
      log(`Running JQuranTree analysis for ${surahNumber}:${verseNumber}`, 'word-service');
      
      // Command to run JQuranTree jar with surah and verse parameters
      const command = `java -jar ${this.jarPath} analyze ${surahNumber} ${verseNumber}`;
      
      const { stdout, stderr } = await this.execPromise(command);
      
      if (stderr) {
        log(`JQuranTree stderr: ${stderr}`, 'word-service');
      }
      
      // Parse the output as JSON
      try {
        return JSON.parse(stdout);
      } catch (error) {
        log(`Error parsing JQuranTree output: ${error}`, 'word-service');
        log(`Raw output: ${stdout}`, 'word-service');
        return null;
      }
    } catch (error) {
      log(`Error running JQuranTree: ${error}`, 'word-service');
      return null;
    }
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
      log(`Extracting words from Arabic text for verse ${surahNum}:${verseNum}`, 'word-service');
      const words = this.extractWordsFromArabicText(verse.id, verse.arabic_text);
      
      try {
        // Store the generated analysis in the database
        for (const word of words) {
          await db.insert(wordAnalysis).values({
            verse_id: word.verse_id,
            word_position: word.word_position,
            word_text: word.word_text,
            translation: word.translation,
            transliteration: word.transliteration,
            root: word.root,
            part_of_speech: word.part_of_speech,
            created_at: new Date()
          });
        }
        
        log(`Stored ${words.length} words for ${surahNum}:${verseNum}`, 'word-service');
        
        // Fetch the newly stored data from the database
        const storedAnalysis = await db.select().from(wordAnalysis).where(eq(wordAnalysis.verse_id, verse.id));
        
        // Sort by word position
        storedAnalysis.sort((a, b) => a.word_position - b.word_position);
        
        return res.json(storedAnalysis);
      } catch (error) {
        console.error("Error storing word analysis:", error);
        // If storage fails, just return the generated data without storing
        return res.json(words);
      }
    } catch (error: any) {
      console.error("Error in word analysis:", error);
      return res.status(500).json({ 
        message: "Error processing word analysis",
        error: error.message,
        success: false 
      });
    }
  }
  
  /**
   * Extract word analysis directly from Arabic text
   * This version doesn't use translations - it just extracts the words
   */
  private extractWordsFromArabicText(verseId: number, arabicText: string) {
    // Split the Arabic text by spaces (this is a simple approach)
    const words = arabicText.split(' ').filter(word => word.trim().length > 0);
    
    // Map each word to our data structure
    return words.map((word, index) => {
      return {
        id: 0, // Will be assigned by database
        verse_id: verseId,
        word_position: index + 1,
        word_text: word,
        translation: word, // No translation, just use the Arabic
        transliteration: null,
        root: null,
        part_of_speech: null,
        created_at: new Date()
      };
    });
  }
}

/**
 * Register the word service routes
 */
export function registerWordServiceRoutes(app: any) {
  const wordService = WordService.getInstance();
  
  app.get('/api/word-analysis/:surahNumber/:verseNumber', 
    (req: Request, res: Response) => wordService.getVerseWordAnalysis(req, res));
}