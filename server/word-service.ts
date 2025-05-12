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
      
      // Try to get analysis from JQuranTree
      let words;
      try {
        const jqtResult = await this.runJQuranTreeAnalysis(surahNum, verseNum);
        
        if (jqtResult && jqtResult.words) {
          log(`JQuranTree analysis successful for ${surahNum}:${verseNum}`, 'word-service');
          
          // Map JQuranTree results to our schema
          words = jqtResult.words.map((word: any, index: number) => ({
            verse_id: verse.id,
            word_position: index + 1,
            word_text: word.arabic || '',
            translation: word.translation || `калимаи ${index + 1}`,
            transliteration: word.transliteration || `Калимаи ${index + 1}`,
            root: word.root || null,
            part_of_speech: word.partOfSpeech || null,
            created_at: new Date()
          }));
        } else {
          // JQuranTree analysis failed or returned invalid data
          log(`Using fallback analysis for ${surahNum}:${verseNum}`, 'word-service');
          words = this.generatePlaceholderAnalysis(verse.id, verse.arabic_text);
        }
      } catch (error) {
        // JQuranTree analysis failed, use fallback
        log(`JQuranTree error, using fallback: ${error}`, 'word-service');
        words = this.generatePlaceholderAnalysis(verse.id, verse.arabic_text);
      }
      
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
   * Generate placeholder word analysis
   * This is a temporary implementation until we fully integrate with JQuranTree
   */
  private generatePlaceholderAnalysis(verseId: number, arabicText: string) {
    // Simple word splitting (not accurate for Arabic)
    const words = arabicText.split(' ');
    
    // Common Tajik translations for basic words in Al-Fatiha
    const commonTranslations: Record<string, { translation: string; transliteration: string }> = {
      'بِسْمِ': { translation: 'номи', transliteration: 'Bismi' },
      'اللَّهِ': { translation: 'Аллоҳ', transliteration: 'Allahi' },
      'الرَّحْمَٰنِ': { translation: 'Бахшоянда', transliteration: 'ar-Rahmani' },
      'الرَّحِيمِ': { translation: 'Меҳрубон', transliteration: 'ar-Rahimi' },
      'الْحَمْدُ': { translation: 'ситоиш', transliteration: 'al-Hamdu' },
      'لِلَّهِ': { translation: 'барои Аллоҳ', transliteration: 'lillahi' },
      'رَبِّ': { translation: 'Парвардигори', transliteration: 'Rabbi' },
      'الْعَالَمِينَ': { translation: 'ҷаҳониён', transliteration: 'al-alamina' },
      'مَالِكِ': { translation: 'Подшоҳи', transliteration: 'Maliki' },
      'يَوْمِ': { translation: 'рӯзи', transliteration: 'yawmi' },
      'الدِّينِ': { translation: 'қиёмат', transliteration: 'ad-dini' },
      'إِيَّاكَ': { translation: 'Танҳо Туро', transliteration: 'iyyaka' },
      'نَعْبُدُ': { translation: 'мепарастем', transliteration: 'na\'budu' },
      'وَإِيَّاكَ': { translation: 'ва танҳо аз Ту', transliteration: 'wa iyyaka' },
      'نَسْتَعِينُ': { translation: 'ёрӣ металабем', transliteration: 'nasta\'inu' },
      'اهْدِنَا': { translation: 'моро ҳидоят кун', transliteration: 'ihdina' },
      'الصِّرَاطَ': { translation: 'ба роҳи', transliteration: 'as-sirata' },
      'الْمُسْتَقِيمَ': { translation: 'рост', transliteration: 'al-mustaqima' },
      'صِرَاطَ': { translation: 'роҳи', transliteration: 'sirata' },
      'الَّذِينَ': { translation: 'касоне ки', transliteration: 'alladhina' },
      'أَنْعَمْتَ': { translation: 'неъмат додӣ', transliteration: 'an\'amta' },
      'عَلَيْهِمْ': { translation: 'ба онҳо', transliteration: '\'alayhim' },
      'غَيْرِ': { translation: 'ба ғайри', transliteration: 'ghayri' },
      'الْمَغْضُوبِ': { translation: 'ғазаб кардагон', transliteration: 'al-maghdubi' },
      'وَلَا': { translation: 'ва на', transliteration: 'wa la' },
      'الضَّالِّينَ': { translation: 'гумроҳон', transliteration: 'ad-dallina' },
    };
    
    return words.map((word, index) => {
      // Try to match with common translations
      const translation = commonTranslations[word] || {
        // If no match found, generate a placeholder
        translation: `калимаи ${index + 1}`,
        transliteration: `Калимаи ${index + 1}`
      };
      
      // Make sure we have translations, even if null in the dictionary
      if (translation.translation === null) {
        translation.translation = `калимаи ${index + 1}`;
      }
      if (translation.transliteration === null) {
        translation.transliteration = `Калимаи ${index + 1}`;
      }
      
      return {
        id: 0, // Will be assigned by database
        verse_id: verseId,
        word_position: index + 1,
        word_text: word,
        translation: translation.translation,
        transliteration: translation.transliteration,
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