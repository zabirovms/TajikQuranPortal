import { db } from "../server/db";
import { verses, surahs } from "../shared/schema";
import { eq, sql } from "drizzle-orm";
import * as fs from 'fs';
import * as readline from 'readline';
import * as path from 'path';

interface QuranVerse {
  index: number;
  sura: number;
  aya: number;
  text: string;
}

/**
 * Main function to fix missing verses in the database
 */
async function fixMissingVerses() {
  console.log("Starting to fix missing verses...");

  // First check if the SQL file exists
  const sqlFilePath = path.join('.', 'quran-simple.sql');
  try {
    await fs.promises.access(sqlFilePath, fs.constants.R_OK);
    console.log(`SQL file found at ${sqlFilePath}`);
  } catch (error) {
    console.error(`Error accessing SQL file: ${error}`);
    console.log("Listing files in current directory:");
    const files = await fs.promises.readdir('.');
    console.log(files);
    throw new Error("Cannot access quran-simple.sql file");
  }

  // Parse the quran-simple.sql file to get original verses
  const allVerses = await parseQuranSimpleSql();
  console.log(`Parsed ${allVerses.length} verses from quran-simple.sql`);

  // Get list of surahs with missing verses
  const surahsWithMissingVerses = await db.execute(sql`
    SELECT 
      s.id,
      s.number, 
      s.name_tajik, 
      s.verses_count as expected_count, 
      COUNT(v.id) as actual_count
    FROM 
      surahs s
    LEFT JOIN 
      verses v ON s.id = v.surah_id
    GROUP BY 
      s.id, s.number, s.name_tajik, s.verses_count
    HAVING 
      s.verses_count > COUNT(v.id)
    ORDER BY 
      s.number
  `);
  
  const problematicSurahs = surahsWithMissingVerses.rows.map(row => ({
    id: row.id,
    number: row.number,
    name_tajik: row.name_tajik,
    verses_count: row.expected_count,
    actual_count: row.actual_count
  }));
  
  console.log(`Found ${problematicSurahs.length} surahs with missing verses`);

  for (const surah of problematicSurahs) {
    const expectedCount = surah.verses_count;
    const actualCount = surah.actual_count;
    
    if (expectedCount > actualCount) {
      console.log(`Fixing Surah ${surah.number} (${surah.name_tajik}): Expected ${expectedCount}, found ${actualCount}`);
      
      // Find which verses are missing
      const existingVerseNumbers = new Set(surah.verses.map(v => v.verse_number));
      const missingVerseNumbers = [];
      
      for (let i = 1; i <= expectedCount; i++) {
        if (!existingVerseNumbers.has(i)) {
          missingVerseNumbers.push(i);
        }
      }
      
      console.log(`  Missing verses: ${missingVerseNumbers.join(', ')}`);
      
      // Add the missing verses
      for (const verseNumber of missingVerseNumbers) {
        // Find verse in the original quran data
        const originalVerse = allVerses.find(v => 
          v.sura === surah.number && v.aya === verseNumber
        );
        
        if (originalVerse) {
          // Get next verse ID
          const nextId = await getNextVerseId();
          
          await db.insert(verses).values({
            id: nextId,
            surah_id: surah.id,
            verse_number: verseNumber,
            arabic_text: originalVerse.text,
            tajik_text: '', // Will need tajik translation
            unique_key: `${surah.number}:${verseNumber}`,
            page: 0,
            juz: 0,
            audio_url: ''
          });
          
          console.log(`  ✓ Added verse ${verseNumber}`);
        } else {
          console.error(`  ✗ Could not find original verse ${verseNumber} for surah ${surah.number}`);
        }
      }
    }
  }
  
  console.log("Verifying verse counts after fixes...");
  
  // Check if all verses have been fixed
  const remainingIssues = await db.execute(sql`
    SELECT 
      s.number, 
      s.name_tajik, 
      s.verses_count as expected_count, 
      COUNT(v.id) as actual_count
    FROM 
      surahs s
    LEFT JOIN 
      verses v ON s.id = v.surah_id
    GROUP BY 
      s.id, s.number, s.name_tajik, s.verses_count
    HAVING 
      s.verses_count != COUNT(v.id)
    ORDER BY 
      s.number
  `);
  
  if (remainingIssues.rows.length === 0) {
    console.log("✅ All surahs now have the correct number of verses!");
  } else {
    console.log(`⚠️ ${remainingIssues.rows.length} surahs still have missing verses.`);
    console.table(remainingIssues.rows);
  }
}

/**
 * Parse the quran-simple.sql file and extract verse data
 */
async function parseQuranSimpleSql(): Promise<QuranVerse[]> {
  const verses: QuranVerse[] = [];
  const fileStream = fs.createReadStream('./quran-simple.sql');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let index = 0;
  for await (const line of rl) {
    if (line.startsWith('INSERT INTO')) {
      // Extract the values part of the SQL statement
      const match = line.match(/VALUES \((.*)\);/);
      if (match) {
        const values = match[1];
        // Split by commas, but respect string literals
        const parts = values.split(',');
        
        if (parts.length >= 4) {
          const verseIndex = parseInt(parts[0].trim(), 10);
          const surahNumber = parseInt(parts[1].trim(), 10);
          const verseNumber = parseInt(parts[2].trim(), 10);
          
          // Extract text (handle quoted strings)
          let text = parts[3].trim();
          if (text.startsWith("'") && text.endsWith("'")) {
            text = text.substring(1, text.length - 1);
            // Unescape single quotes
            text = text.replace(/''/g, "'");
          }
          
          verses.push({
            index: verseIndex,
            sura: surahNumber,
            aya: verseNumber,
            text
          });
          index++;
        }
      }
    }
  }

  return verses;
}

/**
 * Get the next available verse ID
 */
async function getNextVerseId(): Promise<number> {
  const result = await db.select({ max: sql<number>`MAX(id)` }).from(verses);
  const maxId = result[0]?.max || 0;
  return maxId + 1;
}

// Execute the script
fixMissingVerses()
  .then(() => {
    console.log("Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });