import { exec } from 'child_process';
import { promises as fs } from 'fs';
import { Request, Response } from 'express';
import { db } from './db';
import { wordAnalysis, verses, eq, and } from '@shared/schema';
import path from 'path';

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
      
      // Get verse ID from database
      const verseKey = `${surahNum}:${verseNum}`;
      const verse = await db.query.verses.findFirst({
        where: eq(verses.unique_key, verseKey)
      });
      
      if (!verse) {
        return res.status(404).json({ 
          message: "Verse not found",
          success: false 
        });
      }
      
      // Check if word analysis already exists in database
      const existingAnalysis = await db.query.wordAnalysis.findMany({
        where: eq(wordAnalysis.verse_id, verse.id)
      });
      
      if (existingAnalysis && existingAnalysis.length > 0) {
        // Sort by word position
        existingAnalysis.sort((a, b) => a.word_position - b.word_position);
        return res.json(existingAnalysis);
      }
      
      // If not in database, analyze using JQuranTree (not implemented yet)
      // For now, we'll return a placeholder implementation
      const placeholderAnalysis = this.generatePlaceholderAnalysis(verse.id, verse.arabic_text);
      
      return res.json(placeholderAnalysis);
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
   * Generate placeholder word analysis
   * This is a temporary implementation until we fully integrate with JQuranTree
   */
  private generatePlaceholderAnalysis(verseId: number, arabicText: string) {
    // Simple word splitting (not accurate for Arabic)
    const words = arabicText.split(' ');
    
    return words.map((word, index) => ({
      id: 0, // Will be assigned by database
      verse_id: verseId,
      word_position: index + 1,
      word_text: word,
      translation: null,
      transliteration: null,
      root: null,
      part_of_speech: null,
      created_at: new Date()
    }));
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