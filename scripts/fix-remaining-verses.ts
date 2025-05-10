import { db } from "../server/db";
import { verses, surahs } from "../shared/schema";
import { eq, and, sql } from "drizzle-orm";

/**
 * Function to add the remaining missing verses
 */
async function fixRemainingVerses() {
  console.log("Starting to fix remaining missing verses...");

  // These are the remaining verses we need to add
  const missingVerses = [
    // Surah 48:23 - missing verse
    { surah: 48, verse: 23, arabic: 'سُنَّةَ اللَّهِ الَّتِي قَدْ خَلَتْ مِن قَبْلُ ۖ وَلَن تَجِدَ لِسُنَّةِ اللَّهِ تَبْدِيلًا' },
    // Surah 63:7 - missing verse
    { surah: 63, verse: 7, arabic: 'هُمُ الَّذِينَ يَقُولُونَ لَا تُنفِقُوا عَلَىٰ مَنْ عِندَ رَسُولِ اللَّهِ حَتَّىٰ يَنفَضُّوا ۗ وَلِلَّهِ خَزَائِنُ السَّمَاوَاتِ وَالْأَرْضِ وَلَـٰكِنَّ الْمُنَافِقِينَ لَا يَفْقَهُونَ' },
    // Surah 64:9 - missing verse
    { surah: 64, verse: 9, arabic: 'يَوْمَ يَجْمَعُكُمْ لِيَوْمِ الْجَمْعِ ۖ ذَٰلِكَ يَوْمُ التَّغَابُنِ ۗ وَمَن يُؤْمِن بِاللَّهِ وَيَعْمَلْ صَالِحًا يُكَفِّرْ عَنْهُ سَيِّئَاتِهِ وَيُدْخِلْهُ جَنَّاتٍ تَجْرِي مِن تَحْتِهَا الْأَنْهَارُ خَالِدِينَ فِيهَا أَبَدًا ۚ ذَٰلِكَ الْفَوْزُ الْعَظِيمُ' },
    // Surah 65:6 - missing verse
    { surah: 65, verse: 6, arabic: 'أَسْكِنُوهُنَّ مِنْ حَيْثُ سَكَنتُم مِّن وُجْدِكُمْ وَلَا تُضَارُّوهُنَّ لِتُضَيِّقُوا عَلَيْهِنَّ ۚ وَإِن كُنَّ أُولَاتِ حَمْلٍ فَأَنفِقُوا عَلَيْهِنَّ حَتَّىٰ يَضَعْنَ حَمْلَهُنَّ ۚ فَإِنْ أَرْضَعْنَ لَكُمْ فَآتُوهُنَّ أُجُورَهُنَّ ۖ وَأْتَمِرُوا بَيْنَكُم بِمَعْرُوفٍ ۖ وَإِن تَعَاسَرْتُمْ فَسَتُرْضِعُ لَهُ أُخْرَىٰ' },
    // Surah 68:43 - missing verse
    { surah: 68, verse: 43, arabic: 'خَاشِعَةً أَبْصَارُهُمْ تَرْهَقُهُمْ ذِلَّةٌ ۖ وَقَدْ كَانُوا يُدْعَوْنَ إِلَى السُّجُودِ وَهُمْ سَالِمُونَ' },
    // Surah 69:32 - missing verse
    { surah: 69, verse: 32, arabic: 'ثُمَّ فِي سِلْسِلَةٍ ذَرْعُهَا سَبْعُونَ ذِرَاعًا فَاسْلُكُوهُ' },
    // Surah 71:15 - missing verse
    { surah: 71, verse: 15, arabic: 'أَلَمْ تَرَوْا كَيْفَ خَلَقَ اللَّهُ سَبْعَ سَمَاوَاتٍ طِبَاقًا' },
    // Surah 72:6 - missing verse
    { surah: 72, verse: 6, arabic: 'وَأَنَّهُ كَانَ رِجَالٌ مِّنَ الْإِنسِ يَعُوذُونَ بِرِجَالٍ مِّنَ الْجِنِّ فَزَادُوهُمْ رَهَقًا' },
    // Surah 81:15 - missing verse
    { surah: 81, verse: 15, arabic: 'فَلَا أُقْسِمُ بِالْخُنَّسِ' }
  ];

  // Add each missing verse
  for (const missingVerse of missingVerses) {
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
fixRemainingVerses()
  .then(() => {
    console.log("Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });