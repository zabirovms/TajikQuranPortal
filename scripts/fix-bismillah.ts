import { db } from "../server/db";
import { verses, surahs } from "../shared/schema";
import { eq, like, and } from "drizzle-orm";
import { sql } from "drizzle-orm";

/**
 * Script to fix Bismillah issues in the Quran database
 * 
 * According to Islamic standards:
 * - Surah Al-Fatiha (1) should have Bismillah as verse 1
 * - Surah At-Tawbah (9) should NOT have Bismillah
 * - All other surahs should NOT have Bismillah as part of verse 1 text
 */
async function fixBismillahIssues() {
  console.log("Starting Bismillah correction process...");

  // First, make sure Surah Al-Fatiha (1) has the correct Bismillah as verse 1
  await db.update(verses)
    .set({
      arabic_text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      tajik_text: "Ба номи Худованди бахшояндаи меҳрубон!"
    })
    .where(
      and(
        eq(verses.surah_id, await getSurahIdByNumber(1)),
        eq(verses.verse_number, 1)
      )
    );
  console.log("✓ Fixed Surah Al-Fatiha (1)");

  // Fix all other surahs - remove Bismillah from the first verse
  await db.execute(sql`
    UPDATE verses
    SET 
      arabic_text = REGEXP_REPLACE(arabic_text, 
        '^بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\\s*', ''),
      tajik_text = REGEXP_REPLACE(tajik_text, 
        '^Ба номи Худованди бахшояндаи меҳрубон[!]?\\s*', '')
    WHERE 
      verse_number = 1 AND 
      surah_id IN (SELECT id FROM surahs WHERE number != 1 AND number != 9) AND
      (
        arabic_text LIKE 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ%'
        OR 
        tajik_text LIKE 'Ба номи Худованди бахшояндаи меҳрубон%'
      )
  `);
  console.log("✓ Fixed all other surahs with Bismillah issues");

  console.log("✅ Bismillah correction complete!");
}

/**
 * Helper function to get a surah ID by its number
 */
async function getSurahIdByNumber(surahNumber: number): Promise<number> {
  const result = await db.select({ id: surahs.id })
    .from(surahs)
    .where(eq(surahs.number, surahNumber))
    .limit(1);
  
  if (result.length === 0) {
    throw new Error(`Surah number ${surahNumber} not found`);
  }
  
  return result[0].id;
}

// Execute the script
fixBismillahIssues()
  .then(() => {
    console.log("Script finished successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error fixing Bismillah issues:", error);
    process.exit(1);
  });