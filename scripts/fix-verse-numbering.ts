import { db } from "../server/db";
import { verses, surahs } from "../shared/schema";
import { eq, and, sql } from "drizzle-orm";

/**
 * Function to fix verse numbering issues in the database
 */
async function fixVerseNumbering() {
  console.log("Starting to fix verse numbering issues...");

  // Define the missing verses to add
  const missingVerses = [
    // Surah 63:10 (verse 11 exists, but verse 10 is missing)
    { surah: 63, verse: 10, arabic: 'وَأَنفِقُوا مِن مَّا رَزَقْنَاكُم مِّن قَبْلِ أَن يَأْتِيَ أَحَدَكُمُ الْمَوْتُ فَيَقُولَ رَبِّ لَوْلَا أَخَّرْتَنِي إِلَىٰ أَجَلٍ قَرِيبٍ فَأَصَّدَّقَ وَأَكُن مِّنَ الصَّالِحِينَ' },
    
    // Surah 64:17 (verse 18 exists, but verse 17 is missing)
    { surah: 64, verse: 17, arabic: 'إِن تُقْرِضُوا اللَّهَ قَرْضًا حَسَنًا يُضَاعِفْهُ لَكُمْ وَيَغْفِرْ لَكُمْ ۚ وَاللَّهُ شَكُورٌ حَلِيمٌ' },
    
    // Surah 68:32 (missing between 31 and 33)
    { surah: 68, verse: 32, arabic: 'عَسَىٰ رَبُّنَا أَن يُبْدِلَنَا خَيْرًا مِّنْهَا إِنَّا إِلَىٰ رَبِّنَا رَاغِبُونَ' },
    
    // Surah 69:19 (missing between 18 and 20)
    { surah: 69, verse: 19, arabic: 'فَأَمَّا مَنْ أُوتِيَ كِتَابَهُ بِيَمِينِهِ فَيَقُولُ هَاؤُمُ اقْرَءُوا كِتَابِيَهْ' },
    
    // Surah 71:12 (missing between 11 and 13)
    { surah: 71, verse: 12, arabic: 'وَيُمْدِدْكُم بِأَمْوَالٍ وَبَنِينَ وَيَجْعَل لَّكُمْ جَنَّاتٍ وَيَجْعَل لَّكُمْ أَنْهَارًا' },
    
    // Surah 72:12 (missing between 11 and 13)
    { surah: 72, verse: 12, arabic: 'وَأَنَّا ظَنَنَّا أَن لَّن نُّعْجِزَ اللَّهَ فِي الْأَرْضِ وَلَن نُّعْجِزَهُ هَرَبًا' },
    
    // Surah 81:11 (missing between 10 and 12)
    { surah: 81, verse: 11, arabic: 'وَإِذَا الصُّحُفُ نُشِرَتْ' }
  ];

  // Add each missing verse
  for (const missingVerse of missingVerses) {
    try {
      // Get the surah ID
      const surahResult = await db.select({
        id: surahs.id,
        name_tajik: surahs.name_tajik
      })
      .from(surahs)
      .where(eq(surahs.number, missingVerse.surah))
      .limit(1);
      
      if (surahResult.length === 0) {
        console.error(`Could not find surah with number ${missingVerse.surah}`);
        continue;
      }
      
      const surahId = surahResult[0].id;
      
      // Check if verse already exists (to avoid duplicates)
      const existingVerse = await db.select()
        .from(verses)
        .where(
          and(
            eq(verses.surah_id, surahId),
            eq(verses.verse_number, missingVerse.verse)
          )
        )
        .limit(1);
      
      if (existingVerse.length > 0) {
        console.log(`Verse ${missingVerse.surah}:${missingVerse.verse} already exists, skipping`);
        continue;
      }
      
      // Get next verse ID
      const nextIdResult = await db.select({ max: sql<number>`MAX(id)` }).from(verses);
      const nextId = (nextIdResult[0]?.max || 0) + 1;
      
      // Add the missing verse
      await db.insert(verses).values({
        id: nextId,
        surah_id: surahId,
        verse_number: missingVerse.verse,
        arabic_text: missingVerse.arabic,
        tajik_text: '', // Will need tajik translations later
        unique_key: `${missingVerse.surah}:${missingVerse.verse}`,
        page: 0,
        juz: 0,
        audio_url: ''
      });
      
      console.log(`✓ Added verse ${missingVerse.surah}:${missingVerse.verse} to Surah ${surahResult[0].name_tajik}`);
    } catch (error) {
      console.error(`Error adding verse ${missingVerse.surah}:${missingVerse.verse}:`, error);
    }
  }
  
  // Verify fixes
  const remainingIssues = await db.select({
    number: surahs.number,
    name_tajik: surahs.name_tajik,
    expected: surahs.verses_count,
    actual: sql<number>`COUNT(${verses.id})`
  })
  .from(surahs)
  .leftJoin(verses, eq(surahs.id, verses.surah_id))
  .groupBy(surahs.id, surahs.number, surahs.name_tajik, surahs.verses_count)
  .having(sql`${surahs.verses_count} != COUNT(${verses.id})`)
  .orderBy(surahs.number);
  
  if (remainingIssues.length === 0) {
    console.log("✅ All verse count issues have been fixed!");
  } else {
    console.log(`⚠️ ${remainingIssues.length} surahs still have verse count issues:`);
    for (const issue of remainingIssues) {
      console.log(`  - Surah ${issue.number} (${issue.name_tajik}): ${issue.actual}/${issue.expected}`);
    }
  }
}

// Run the script
fixVerseNumbering()
  .then(() => {
    console.log("Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });