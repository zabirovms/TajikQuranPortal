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
      
      // Split the Arabic text by spaces to extract individual words
      const words = verse.arabic_text.split(' ').filter(word => word.trim().length > 0);
      const wordEntries = [];
      
      // Store each word in the database
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        
        // Insert the word into the database
        const result = await db.insert(wordAnalysis).values({
          verse_id: verse.id,
          word_position: i + 1,
          word_text: word,
          translation: null, // No translations for now
          transliteration: null,
          root: null, 
          part_of_speech: null,
          created_at: new Date()
        }).returning();
        
        if (result && result.length > 0) {
          wordEntries.push(result[0]);
        }
      }
      
      log(`Stored ${words.length} words for ${surahNum}:${verseNum}`, 'word-service');
      
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
 * Import word data from the extracted JSON file
 */
export async function importWordData(surahLimit: number = 3) {
  try {
    console.log(`Starting import of word data for first ${surahLimit} surahs...`);
    
    // Read the JSON file
    const fs = await import('fs');
    const wordData = JSON.parse(fs.readFileSync('./quran_words.json', 'utf8'));
    console.log(`Found ${wordData.length} words in the JSON file.`);
    
    // Filter to only include data up to the surah limit
    const filteredData = wordData.filter((word: any) => word.surah_number <= surahLimit);
    console.log(`Filtered to ${filteredData.length} words for first ${surahLimit} surahs.`);
    
    let importedWords = 0;
    let errorCount = 0;
    
    // Process each word
    for (const word of filteredData) {
      try {
        const { surah_number, verse_number, word_position, arabic, transliteration } = word;
        
        // Get the verse ID from the database
        const verseKey = `${surah_number}:${verse_number}`;
        
        // Find the verse in our database
        const verseResult = await db.select().from(verses).where(eq(verses.unique_key, verseKey));
        
        if (!verseResult || verseResult.length === 0) {
          console.log(`Warning: Verse not found in database: ${verseKey}`);
          errorCount++;
          continue;
        }
        
        const verse = verseResult[0];
        
        // Check if we already have this word in the database
        const existingWord = await db
          .select()
          .from(wordAnalysis)
          .where(
            and(
              eq(wordAnalysis.verse_id, verse.id),
              eq(wordAnalysis.word_position, word_position)
            )
          );
        
        if (existingWord && existingWord.length > 0) {
          // Update the existing word
          await db
            .update(wordAnalysis)
            .set({
              word_text: arabic,
              transliteration: transliteration,
            })
            .where(
              and(
                eq(wordAnalysis.verse_id, verse.id),
                eq(wordAnalysis.word_position, word_position)
              )
            );
        } else {
          // Insert a new word
          await db.insert(wordAnalysis).values({
            verse_id: verse.id,
            word_position: word_position,
            word_text: arabic,
            transliteration: transliteration,
            translation: null,
            root: null,
            part_of_speech: null,
            created_at: new Date()
          });
        }
        
        importedWords++;
        
        // Log progress every 500 words
        if (importedWords % 500 === 0) {
          console.log(`Imported ${importedWords} words...`);
        }
      } catch (error) {
        console.error('Error processing word:', error);
        errorCount++;
      }
    }
    
    console.log(`Import complete! Successfully imported ${importedWords} words with ${errorCount} errors.`);
    return { success: true, importedWords, errorCount };
  } catch (error) {
    console.error('Error importing word data:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Register the word service routes
 */
export function registerWordServiceRoutes(app: any) {
  const wordService = WordService.getInstance();
  
  // Get word analysis for a verse
  app.get('/api/word-analysis/:surahNumber/:verseNumber', 
    (req: Request, res: Response) => wordService.getVerseWordAnalysis(req, res));
  
  // Route to import word data
  app.post('/api/word-analysis/import', async (req: Request, res: Response) => {
    try {
      const surahLimit = req.body.surahLimit || 3;
      const result = await importWordData(surahLimit);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  });
}