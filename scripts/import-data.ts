import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { 
  users, surahs, verses, insertSurahSchema, insertVerseSchema
} from '../shared/schema';

// Helper to get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Surah metadata (available from various APIs like api.quran.com)
const surahsMetadata = [
  { number: 1, name_arabic: "الفاتحة", name_tajik: "Фотиҳа", name_english: "Al-Fatihah", revelation_type: "Meccan", verses_count: 7 },
  { number: 2, name_arabic: "البقرة", name_tajik: "Бақара", name_english: "Al-Baqarah", revelation_type: "Medinan", verses_count: 286 },
  { number: 3, name_arabic: "آل عمران", name_tajik: "Оли Имрон", name_english: "Aal-Imran", revelation_type: "Medinan", verses_count: 200 },
  { number: 4, name_arabic: "النساء", name_tajik: "Нисо", name_english: "An-Nisa", revelation_type: "Medinan", verses_count: 176 },
  { number: 5, name_arabic: "المائدة", name_tajik: "Моида", name_english: "Al-Ma'idah", revelation_type: "Medinan", verses_count: 120 },
  // Add more surahs here
];

async function setupDatabase() {
  // Check if database URL is provided
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  // Create connection
  const sql = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(sql);

  try {
    console.log('Setting up database schema...');
    
    // Push schema to database
    // Note: In a production environment, you should use migrations
    await db.execute(/* sql */`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS surahs (
        id SERIAL PRIMARY KEY,
        number INTEGER NOT NULL UNIQUE,
        name_arabic TEXT NOT NULL,
        name_tajik TEXT NOT NULL,
        name_english TEXT NOT NULL,
        revelation_type TEXT NOT NULL,
        verses_count INTEGER NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS verses (
        id SERIAL PRIMARY KEY,
        surah_id INTEGER NOT NULL,
        verse_number INTEGER NOT NULL,
        arabic_text TEXT NOT NULL,
        tajik_text TEXT NOT NULL,
        page INTEGER,
        juz INTEGER,
        audio_url TEXT,
        unique_key TEXT NOT NULL UNIQUE
      );
      
      CREATE TABLE IF NOT EXISTS bookmarks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        verse_id INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS search_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        query TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('Database schema created successfully');

    // Insert surahs
    console.log('Importing surahs metadata...');
    for (const surahData of surahsMetadata) {
      try {
        await db.insert(surahs).values({
          number: surahData.number,
          name_arabic: surahData.name_arabic,
          name_tajik: surahData.name_tajik,
          name_english: surahData.name_english,
          revelation_type: surahData.revelation_type,
          verses_count: surahData.verses_count
        }).onConflictDoNothing();
      } catch (error) {
        console.error(`Error inserting surah ${surahData.number}:`, error);
      }
    }
    
    console.log('Surahs imported successfully');

    // We need to read the SQL files and extract data for verses
    console.log('Preparing to import Quran verses...');
    
    // Get a mapping of surah numbers to IDs from the database
    const surahsFromDb = await db.select().from(surahs);
    const surahMapping = new Map(surahsFromDb.map(s => [s.number, s.id]));
    
    if (surahMapping.size === 0) {
      console.error('No surahs found in database');
      process.exit(1);
    }
    
    // Read Arabic text file
    const arabicFilePath = path.join(__dirname, '..', 'quran-simple.sql');
    const arabicData = fs.readFileSync(arabicFilePath, 'utf8');
    
    // Read Tajik translation file
    const tajikFilePath = path.join(__dirname, '..', 'tg.ayati.sql');
    const tajikData = fs.readFileSync(tajikFilePath, 'utf8');
    
    // Extract Arabic verses
    console.log('Extracting Arabic verses...');
    const arabicVerses = new Map();
    const arabicRegex = /INSERT INTO `quran_text` \(`index`, `sura`, `aya`, `text`\) VALUES\s*\((\d+), (\d+), (\d+), '(.+?)'\)/g;
    
    let arabicMatch;
    while ((arabicMatch = arabicRegex.exec(arabicData))) {
      const [_, index, sura, aya, text] = arabicMatch;
      const key = `${sura}:${aya}`;
      arabicVerses.set(key, text);
    }
    
    // Extract Tajik verses
    console.log('Extracting Tajik verses...');
    const tajikVerses = new Map();
    const tajikRegex = /INSERT INTO `tg_ayati` \(`index`, `sura`, `aya`, `text`\) VALUES\s*\((\d+), (\d+), (\d+), '(.+?)'\)/g;
    
    let tajikMatch;
    while ((tajikMatch = tajikRegex.exec(tajikData))) {
      const [_, index, sura, aya, text] = tajikMatch;
      const key = `${sura}:${aya}`;
      tajikVerses.set(key, text);
    }
    
    // Insert verses (batch processing to avoid memory issues)
    console.log('Importing verses...');
    let currentSura = 1;
    const totalVerses = arabicVerses.size;
    let processedVerses = 0;
    const batchSize = 50;
    let batch = [];

    for (const [key, arabicText] of arabicVerses.entries()) {
      const [suraStr, ayaStr] = key.split(':');
      const sura = parseInt(suraStr);
      const aya = parseInt(ayaStr);
      
      // Get surah ID
      const surahId = surahMapping.get(sura);
      if (!surahId) {
        console.warn(`Surah ${sura} not found in database, skipping verse ${key}`);
        continue;
      }
      
      // Skip if no Tajik translation
      if (!tajikVerses.has(key)) {
        console.warn(`No Tajik translation for verse ${key}, skipping`);
        continue;
      }
      
      // Log progress for a new surah
      if (sura !== currentSura) {
        console.log(`Processing Surah ${sura}...`);
        currentSura = sura;
      }
      
      // Create verse object
      const verse = {
        surah_id: surahId,
        verse_number: aya,
        arabic_text: arabicText,
        tajik_text: tajikVerses.get(key),
        page: null,  // We don't have this data
        juz: null,   // We don't have this data
        audio_url: `https://verse.audio/${sura}_${aya}.mp3`, // Placeholder URL
        unique_key: key
      };
      
      batch.push(verse);
      
      // Process batch when it reaches the batch size
      if (batch.length >= batchSize) {
        try {
          await db.insert(verses).values(batch).onConflictDoNothing();
          processedVerses += batch.length;
          console.log(`Imported ${processedVerses}/${totalVerses} verses`);
        } catch (error) {
          console.error(`Error inserting batch of verses:`, error);
        }
        batch = [];
      }
    }
    
    // Process remaining verses
    if (batch.length > 0) {
      try {
        await db.insert(verses).values(batch).onConflictDoNothing();
        processedVerses += batch.length;
      } catch (error) {
        console.error(`Error inserting batch of verses:`, error);
      }
    }
    
    console.log(`Verses import completed. Imported ${processedVerses}/${totalVerses} verses.`);
    
    // Insert a default user
    await db.insert(users).values({
      username: 'user123',
      password: 'password123'
    }).onConflictDoNothing();
    
    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await sql.end();
  }
}

setupDatabase().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});