import { db } from "../server/db";
import { verses as versesTable, surahs as surahsTable } from "../shared/schema";
import { eq, inArray } from "drizzle-orm";
import * as fs from 'fs';
import * as readline from 'readline';
import { sql } from "drizzle-orm";

// Define the bismillah text for consistent removal
const BISMILLAH_ARABIC = "بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ";

interface QuranVerse {
  index: number;
  sura: number;
  aya: number;
  text: string;
}

/**
 * Main function to import and fix the Quran data in batches
 */
async function rebuildQuranData() {
  console.log("Starting Quran data rebuild process...");

  try {
    // Parse the quran-simple.sql file
    const verses = await parseQuranSimpleSql();
    
    // Process surahs in batches of 10
    for (let batchStart = 1; batchStart <= 114; batchStart += 10) {
      const batchEnd = Math.min(batchStart + 9, 114);
      
      console.log(`\nProcessing surahs ${batchStart}-${batchEnd}...`);
      
      // Filter verses for current batch
      const batchVerses = verses.filter(v => v.sura >= batchStart && v.sura <= batchEnd);
      
      // Process and import this batch
      await processBatch(batchVerses, batchStart, batchEnd);
      
      console.log(`✓ Completed surahs ${batchStart}-${batchEnd}`);
    }

    console.log("\n✅ Quran data rebuild complete!");
  } catch (error) {
    console.error("Error rebuilding Quran data:", error);
    throw error;
  }
}

/**
 * Parse the quran-simple.sql file and extract verse data
 */
async function parseQuranSimpleSql(): Promise<QuranVerse[]> {
  const verses: QuranVerse[] = [];
  const fileStream = fs.createReadStream('quran-simple.sql');
  
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  
  // Regular expression to extract verse data from SQL INSERT statements
  const regex = /\((\d+),\s*(\d+),\s*(\d+),\s*'(.+?)'\)/g;
  
  for await (const line of rl) {
    // Skip lines that don't contain INSERT statements
    if (!line.includes('INSERT INTO') && !line.includes('VALUES')) {
      continue;
    }
    
    // Extract all verse data from the line
    let match;
    while ((match = regex.exec(line)) !== null) {
      verses.push({
        index: parseInt(match[1]),
        sura: parseInt(match[2]),
        aya: parseInt(match[3]),
        text: match[4]
      });
    }
  }
  
  console.log(`Parsed ${verses.length} verses from quran-simple.sql`);
  return verses;
}

/**
 * Process a batch of verses and import them into the database
 */
async function processBatch(batchVerses: QuranVerse[], startSurah: number, endSurah: number) {
  // Get surah IDs mapping
  const surahIdsMap = await getSurahIdsMap();
  
  // Group verses by surah
  const versesBySurah = new Map<number, QuranVerse[]>();
  
  for (const verse of batchVerses) {
    if (!versesBySurah.has(verse.sura)) {
      versesBySurah.set(verse.sura, []);
    }
    versesBySurah.get(verse.sura)!.push(verse);
  }
  
  // Process each surah
  for (let surahNumber = startSurah; surahNumber <= endSurah; surahNumber++) {
    const surahVerses = versesBySurah.get(surahNumber) || [];
    
    if (surahVerses.length === 0) {
      console.log(`No verses found for surah ${surahNumber}`);
      continue;
    }
    
    const surahId = surahIdsMap.get(surahNumber);
    if (!surahId) {
      console.log(`No ID found for surah ${surahNumber}, skipping`);
      continue;
    }
    
    console.log(`  Processing surah ${surahNumber} (ID: ${surahId}) with ${surahVerses.length} verses`);
    
    // For each verse in the surah, update or create it
    for (const verse of surahVerses) {
      // Special handling for first verse of each surah
      let arabicText = verse.text;
      if (verse.aya === 1) {
        // For Surah Al-Fatiha, ensure Bismillah is set correctly as the only text
        if (surahNumber === 1) {
          arabicText = BISMILLAH_ARABIC;
        } 
        // For all other surahs, remove Bismillah if present
        else if (arabicText.startsWith(BISMILLAH_ARABIC)) {
          arabicText = arabicText.substring(BISMILLAH_ARABIC.length).trim();
        }
      }
      
      // Create unique key in format "surah:verse"
      const uniqueKey = `${surahNumber}:${verse.aya}`;
      
      // First check if the verse exists and update it
      const existingVerse = await db.select()
        .from(verses)
        .where(
          sql`${verses.surah_id} = ${surahId} AND ${verses.verse_number} = ${verse.aya}`
        )
        .limit(1);
      
      if (existingVerse.length > 0) {
        // Update the existing verse with the correct Arabic text but preserve other fields
        await db.update(versesTable)
          .set({
            arabic_text: arabicText
          })
          .where(
            sql`${versesTable.id} = ${existingVerse[0].id}`
          );
      } else {
        // If the verse doesn't exist, insert a new one
        const nextId = await getNextVerseId();
        
        await db.insert(versesTable)
          .values({
            id: nextId,
            surah_id: surahId,
            verse_number: verse.aya,
            arabic_text: arabicText,
            tajik_text: '', // Will need to be populated from tg.ayati.sql
            unique_key: uniqueKey,
            page: 0,
            juz: 0,
            audio_url: ''
          });
      }
    }
    
    // Verify the correct verse count
    const count = await db.select({ count: sql<number>`count(*)` })
      .from(verses)
      .where(sql`${verses.surah_id} = ${surahId}`);
    
    console.log(`  ✓ Processed surah ${surahNumber}: ${count[0].count} verses`);
  }
}

/**
 * Clear existing verses for the specified surah range
 */
async function clearExistingVerses(startSurah: number, endSurah: number) {
  // Get surah IDs for the range
  const surahs = await db.select({ id: surahs.id, number: surahs.number })
    .from(surahs)
    .where(inArray(surahs.number, Array.from({ length: endSurah - startSurah + 1 }, (_, i) => startSurah + i)));
  
  const surahIds = surahs.map(s => s.id);
  
  if (surahIds.length === 0) {
    console.log(`No surahs found for range ${startSurah}-${endSurah}`);
    return;
  }
  
  // Delete existing verses
  const result = await db.delete(verses)
    .where(inArray(verses.surah_id, surahIds));
  
  console.log(`Cleared existing verses for surahs ${startSurah}-${endSurah}`);
}

/**
 * Get the mapping of surah numbers to surah IDs
 */
async function getSurahIdsMap(): Promise<Map<number, number>> {
  const surahsData = await db.select({
    id: surahs.id,
    number: surahs.number
  }).from(surahs);
  
  const map = new Map<number, number>();
  for (const surah of surahsData) {
    map.set(surah.number, surah.id);
  }
  
  return map;
}

/**
 * Get the next available verse ID
 */
async function getNextVerseId(): Promise<number> {
  const result = await db.select({
    maxId: sql<number>`COALESCE(MAX(${verses.id}), 0)`
  }).from(verses);
  
  return (result[0]?.maxId || 0) + 1;
}

/**
 * Run the rebuild process
 */
rebuildQuranData()
  .then(() => {
    console.log("Script finished successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });