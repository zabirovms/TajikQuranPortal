import { db } from "../server/db";
import { verses, surahs } from "../shared/schema";
import { eq, and, sql } from "drizzle-orm";

// Bismillah text pattern to recognize and remove
const BISMILLAH_ARABIC = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";
const BISMILLAH_TAJIK = "Ба номи Худованди бахшояндаи меҳрубон";

/**
 * Fix all Bismillah issues across the entire Quran
 * 1. Ensure Surah Al-Fatiha has correct Bismillah as verse 1
 * 2. Remove Bismillah from all other surahs' first verses
 */
async function fixAllBismillahIssues() {
  console.log("Starting comprehensive Bismillah fix...");

  try {
    // 1. First, ensure Surah Al-Fatiha (1) has Bismillah properly set as verse 1
    const fatihaId = await getSurahIdByNumber(1);
    await db.update(verses)
      .set({
        arabic_text: BISMILLAH_ARABIC,
        tajik_text: "Ба номи Худованди бахшояндаи меҳрубон!"
      })
      .where(
        and(
          eq(verses.surah_id, fatihaId),
          eq(verses.verse_number, 1)
        )
      );
    console.log("✓ Corrected Bismillah for Surah Al-Fatiha (1)");

    // 2. For all other surahs, remove Bismillah from first verses if present
    console.log("Finding all first verses with Bismillah text (except Surah 1)...");
    
    // First get a list of all problematic verses
    const problemVerses = await db
      .select({
        id: verses.id,
        surah_id: verses.surah_id,
        surah_number: surahs.number,
        surah_name: surahs.name_tajik,
        arabic_text: verses.arabic_text,
        tajik_text: verses.tajik_text
      })
      .from(verses)
      .innerJoin(surahs, eq(verses.surah_id, surahs.id))
      .where(
        and(
          eq(verses.verse_number, 1),
          sql`${surahs.number} != 1`,
          sql`${surahs.number} != 9`,
          sql`(${verses.arabic_text} LIKE ${BISMILLAH_ARABIC + '%'} OR ${verses.tajik_text} LIKE ${BISMILLAH_TAJIK + '%'})`
        )
      );
    
    console.log(`Found ${problemVerses.length} surahs with Bismillah in first verse`);

    // Process each verse individually
    for (const verse of problemVerses) {
      let arabicText = verse.arabic_text;
      let tajikText = verse.tajik_text;
      
      // Remove Bismillah from Arabic text
      if (arabicText.startsWith(BISMILLAH_ARABIC)) {
        arabicText = arabicText.substring(BISMILLAH_ARABIC.length).trim();
      }
      
      // Remove Bismillah from Tajik text (with optional punctuation)
      if (tajikText.startsWith(BISMILLAH_TAJIK)) {
        const parts = tajikText.split(/[!.] /);
        if (parts.length > 1) {
          parts.shift(); // Remove first part (Bismillah)
          tajikText = parts.join('. ').trim();
        } else {
          tajikText = tajikText.substring(BISMILLAH_TAJIK.length).replace(/^[!., ]+/, '').trim();
        }
      }
      
      // Update the verse
      await db.update(verses)
        .set({
          arabic_text: arabicText,
          tajik_text: tajikText
        })
        .where(eq(verses.id, verse.id));
      
      console.log(`  ✓ Fixed Surah ${verse.surah_number} (${verse.surah_name})`);
    }

    console.log("✅ All Bismillah issues fixed!");
    
    // Verify that only Surah 1 has Bismillah now
    const remainingIssues = await db
      .select({ count: sql<number>`count(*)` })
      .from(verses)
      .innerJoin(surahs, eq(verses.surah_id, surahs.id))
      .where(
        and(
          eq(verses.verse_number, 1),
          sql`${surahs.number} != 1`,
          sql`(${verses.arabic_text} LIKE ${BISMILLAH_ARABIC + '%'} OR ${verses.tajik_text} LIKE ${BISMILLAH_TAJIK + '%'})`
        )
      );
    
    console.log(`Verification: ${remainingIssues[0].count} remaining issues (should be 0)`);
    
  } catch (error) {
    console.error("Error fixing Bismillah issues:", error);
    throw error;
  }
}

/**
 * Helper function to get a surah ID by its number
 */
async function getSurahIdByNumber(surahNumber: number): Promise<number> {
  const result = await db
    .select({ id: surahs.id })
    .from(surahs)
    .where(eq(surahs.number, surahNumber))
    .limit(1);
  
  if (!result.length) {
    throw new Error(`Surah ${surahNumber} not found`);
  }
  
  return result[0].id;
}

// Execute the script
fixAllBismillahIssues()
  .then(() => {
    console.log("Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });