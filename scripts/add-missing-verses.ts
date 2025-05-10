import { db } from "../server/db";
import { verses, surahs } from "../shared/schema";
import { eq, and, sql } from "drizzle-orm";
import * as fs from 'fs';
import * as path from 'path';

interface VerseData {
  index: number;
  sura: number;
  aya: number;
  text: string;
}

/**
 * Main function to add missing verses in the database
 */
async function addMissingVerses() {
  console.log("Starting to add missing verses...");

  // Get list of surahs with missing verses
  const missingVersesResult = await db.select({
    id: surahs.id,
    number: surahs.number,
    name_tajik: surahs.name_tajik,
    expected: surahs.verses_count,
    actual: sql<number>`COUNT(${verses.id})`
  })
  .from(surahs)
  .leftJoin(verses, eq(surahs.id, verses.surah_id))
  .groupBy(surahs.id, surahs.number, surahs.name_tajik, surahs.verses_count)
  .having(sql`${surahs.verses_count} > COUNT(${verses.id})`)
  .orderBy(surahs.number);

  if (missingVersesResult.length === 0) {
    console.log("✅ No missing verses found!");
    return;
  }

  console.log(`Found ${missingVersesResult.length} surahs with missing verses:`);
  for (const surah of missingVersesResult) {
    console.log(`  Surah ${surah.number} (${surah.name_tajik}): ${surah.actual}/${surah.expected} verses`);
  }

  // For each surah with missing verses, find which verses are missing
  // and manually add them (since we know which ones they are)
  for (const surah of missingVersesResult) {
    // Get existing verse numbers
    const existingVerses = await db.select({
      verse_number: verses.verse_number
    })
    .from(verses)
    .where(eq(verses.surah_id, surah.id))
    .orderBy(verses.verse_number);

    const existingVerseNumbers = new Set(existingVerses.map(v => v.verse_number));
    
    // Find missing verse numbers
    const missingVerseNumbers: number[] = [];
    for (let i = 1; i <= surah.expected; i++) {
      if (!existingVerseNumbers.has(i)) {
        missingVerseNumbers.push(i);
      }
    }

    if (missingVerseNumbers.length === 0) {
      console.log(`✓ No missing verses in Surah ${surah.number} despite count mismatch`);
      continue;
    }

    console.log(`Surah ${surah.number} (${surah.name_tajik}) missing verses: ${missingVerseNumbers.join(', ')}`);

    // Now add each missing verse with appropriate text
    for (const verseNumber of missingVerseNumbers) {
      // Manually add the missing verse based on known data
      // We know exactly which verses are missing in each surah
      let arabicText = '';
      
      // Surah 3:67 - missing verse
      if (surah.number === 3 && verseNumber === 67) {
        arabicText = 'مَا كَانَ إِبْرَاهِيمُ يَهُودِيًّا وَلَا نَصْرَانِيًّا وَلَـٰكِن كَانَ حَنِيفًا مُّسْلِمًا وَمَا كَانَ مِنَ الْمُشْرِكِينَ';
      }
      // Surah 8:17 - missing verse
      else if (surah.number === 8 && verseNumber === 17) {
        arabicText = 'فَلَمْ تَقْتُلُوهُمْ وَلَـٰكِنَّ اللَّهَ قَتَلَهُمْ ۚ وَمَا رَمَيْتَ إِذْ رَمَيْتَ وَلَـٰكِنَّ اللَّهَ رَمَىٰ ۚ وَلِيُبْلِيَ الْمُؤْمِنِينَ مِنْهُ بَلَاءً حَسَنًا ۚ إِنَّ اللَّهَ سَمِيعٌ عَلِيمٌ';
      }
      // Surah 9:85 - missing verse
      else if (surah.number === 9 && verseNumber === 85) {
        arabicText = 'وَلَا تُعْجِبْكَ أَمْوَالُهُمْ وَأَوْلَادُهُمْ ۚ إِنَّمَا يُرِيدُ اللَّهُ أَن يُعَذِّبَهُم بِهَا فِي الدُّنْيَا وَتَزْهَقَ أَنفُسُهُمْ وَهُمْ كَافِرُونَ';
      }
      // Surah 33:18 - missing verse
      else if (surah.number === 33 && verseNumber === 18) {
        arabicText = 'قَدْ يَعْلَمُ اللَّهُ الْمُعَوِّقِينَ مِنكُمْ وَالْقَائِلِينَ لِإِخْوَانِهِمْ هَلُمَّ إِلَيْنَا ۖ وَلَا يَأْتُونَ الْبَأْسَ إِلَّا قَلِيلًا';
      }
      // Surah 33:32 - missing verse
      else if (surah.number === 33 && verseNumber === 32) {
        arabicText = 'يَا نِسَاءَ النَّبِيِّ لَسْتُنَّ كَأَحَدٍ مِّنَ النِّسَاءِ ۚ إِنِ اتَّقَيْتُنَّ فَلَا تَخْضَعْنَ بِالْقَوْلِ فَيَطْمَعَ الَّذِي فِي قَلْبِهِ مَرَضٌ وَقُلْنَ قَوْلًا مَّعْرُوفًا';
      }
      // Surah 40:35 - missing verse
      else if (surah.number === 40 && verseNumber === 35) {
        arabicText = 'الَّذِينَ يُجَادِلُونَ فِي آيَاتِ اللَّهِ بِغَيْرِ سُلْطَانٍ أَتَاهُمْ ۖ كَبُرَ مَقْتًا عِندَ اللَّهِ وَعِندَ الَّذِينَ آمَنُوا ۚ كَذَٰلِكَ يَطْبَعُ اللَّهُ عَلَىٰ كُلِّ قَلْبِ مُتَكَبِّرٍ جَبَّارٍ';
      }
      // Surah 47:11 - missing verse
      else if (surah.number === 47 && verseNumber === 11) {
        arabicText = 'ذَٰلِكَ بِأَنَّ اللَّهَ مَوْلَى الَّذِينَ آمَنُوا وَأَنَّ الْكَافِرِينَ لَا مَوْلَىٰ لَهُمْ';
      }
      // Surah 47:30 - missing verse
      else if (surah.number === 47 && verseNumber === 30) {
        arabicText = 'وَلَوْ نَشَاءُ لَأَرَيْنَاكَهُمْ فَلَعَرَفْتَهُم بِسِيمَاهُمْ ۚ وَلَتَعْرِفَنَّهُمْ فِي لَحْنِ الْقَوْلِ ۚ وَاللَّهُ يَعْلَمُ أَعْمَالَكُمْ';
      }
      // Surah 48:6 - missing verse
      else if (surah.number === 48 && verseNumber === 6) {
        arabicText = 'وَيُعَذِّبَ الْمُنَافِقِينَ وَالْمُنَافِقَاتِ وَالْمُشْرِكِينَ وَالْمُشْرِكَاتِ الظَّانِّينَ بِاللَّهِ ظَنَّ السَّوْءِ ۚ عَلَيْهِمْ دَائِرَةُ السَّوْءِ ۖ وَغَضِبَ اللَّهُ عَلَيْهِمْ وَلَعَنَهُمْ وَأَعَدَّ لَهُمْ جَهَنَّمَ ۖ وَسَاءَتْ مَصِيرًا';
      }
      // Surah 48:15 - missing verse
      else if (surah.number === 48 && verseNumber === 15) {
        arabicText = 'سَيَقُولُ الْمُخَلَّفُونَ إِذَا انطَلَقْتُمْ إِلَىٰ مَغَانِمَ لِتَأْخُذُوهَا ذَرُونَا نَتَّبِعْكُمْ ۖ يُرِيدُونَ أَن يُبَدِّلُوا كَلَامَ اللَّهِ ۚ قُل لَّن تَتَّبِعُونَا كَذَٰلِكُمْ قَالَ اللَّهُ مِن قَبْلُ ۖ فَسَيَقُولُونَ بَلْ تَحْسُدُونَنَا ۚ بَلْ كَانُوا لَا يَفْقَهُونَ إِلَّا قَلِيلًا';
      }
      // Surah 48:23 - missing verse
      else if (surah.number === 48 && verseNumber === 23) {
        arabicText = 'سُنَّةَ اللَّهِ الَّتِي قَدْ خَلَتْ مِن قَبْلُ ۖ وَلَن تَجِدَ لِسُنَّةِ اللَّهِ تَبْدِيلًا';
      }
      // Surah 63:7 - missing verse
      else if (surah.number === 63 && verseNumber === 7) {
        arabicText = 'هُمُ الَّذِينَ يَقُولُونَ لَا تُنفِقُوا عَلَىٰ مَنْ عِندَ رَسُولِ اللَّهِ حَتَّىٰ يَنفَضُّوا ۗ وَلِلَّهِ خَزَائِنُ السَّمَاوَاتِ وَالْأَرْضِ وَلَـٰكِنَّ الْمُنَافِقِينَ لَا يَفْقَهُونَ';
      }
      // Surah 64:9 - missing verse
      else if (surah.number === 64 && verseNumber === 9) {
        arabicText = 'يَوْمَ يَجْمَعُكُمْ لِيَوْمِ الْجَمْعِ ۖ ذَٰلِكَ يَوْمُ التَّغَابُنِ ۗ وَمَن يُؤْمِن بِاللَّهِ وَيَعْمَلْ صَالِحًا يُكَفِّرْ عَنْهُ سَيِّئَاتِهِ وَيُدْخِلْهُ جَنَّاتٍ تَجْرِي مِن تَحْتِهَا الْأَنْهَارُ خَالِدِينَ فِيهَا أَبَدًا ۚ ذَٰلِكَ الْفَوْزُ الْعَظِيمُ';
      }
      // Surah 65:6 - missing verse
      else if (surah.number === 65 && verseNumber === 6) {
        arabicText = 'أَسْكِنُوهُنَّ مِنْ حَيْثُ سَكَنتُم مِّن وُجْدِكُمْ وَلَا تُضَارُّوهُنَّ لِتُضَيِّقُوا عَلَيْهِنَّ ۚ وَإِن كُنَّ أُولَاتِ حَمْلٍ فَأَنفِقُوا عَلَيْهِنَّ حَتَّىٰ يَضَعْنَ حَمْلَهُنَّ ۚ فَإِنْ أَرْضَعْنَ لَكُمْ فَآتُوهُنَّ أُجُورَهُنَّ ۖ وَأْتَمِرُوا بَيْنَكُم بِمَعْرُوفٍ ۖ وَإِن تَعَاسَرْتُمْ فَسَتُرْضِعُ لَهُ أُخْرَىٰ';
      }
      // Surah 68:43 - missing verse
      else if (surah.number === 68 && verseNumber === 43) {
        arabicText = 'خَاشِعَةً أَبْصَارُهُمْ تَرْهَقُهُمْ ذِلَّةٌ ۖ وَقَدْ كَانُوا يُدْعَوْنَ إِلَى السُّجُودِ وَهُمْ سَالِمُونَ';
      }
      // Surah 69:32 - missing verse
      else if (surah.number === 69 && verseNumber === 32) {
        arabicText = 'ثُمَّ فِي سِلْسِلَةٍ ذَرْعُهَا سَبْعُونَ ذِرَاعًا فَاسْلُكُوهُ';
      }
      // Surah 71:15 - missing verse
      else if (surah.number === 71 && verseNumber === 15) {
        arabicText = 'أَلَمْ تَرَوْا كَيْفَ خَلَقَ اللَّهُ سَبْعَ سَمَاوَاتٍ طِبَاقًا';
      }
      // Surah 72:6 - missing verse
      else if (surah.number === 72 && verseNumber === 6) {
        arabicText = 'وَأَنَّهُ كَانَ رِجَالٌ مِّنَ الْإِنسِ يَعُوذُونَ بِرِجَالٍ مِّنَ الْجِنِّ فَزَادُوهُمْ رَهَقًا';
      }
      // Surah 81:15 - missing verse
      else if (surah.number === 81 && verseNumber === 15) {
        arabicText = 'فَلَا أُقْسِمُ بِالْخُنَّسِ';
      }
      // For any other verse (should not happen, but just in case)
      else {
        console.error(`  ✗ No predefined Arabic text for Surah ${surah.number}, verse ${verseNumber}`);
        continue;
      }
      
      // Get next verse ID
      const nextId = await getNextVerseId();
      
      // Add the missing verse
      await db.insert(verses).values({
        id: nextId,
        surah_id: surah.id,
        verse_number: verseNumber,
        arabic_text: arabicText,
        tajik_text: '', // Will need a translation later
        unique_key: `${surah.number}:${verseNumber}`,
        page: 0, // Will need to be set later
        juz: 0,  // Will need to be set later
        audio_url: ''
      });
      
      console.log(`  ✓ Added missing verse ${surah.number}:${verseNumber}`);
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
  .having(sql`${surahs.verses_count} > COUNT(${verses.id})`)
  .orderBy(surahs.number);
  
  if (remainingIssues.length === 0) {
    console.log("✅ All missing verses have been added!");
  } else {
    console.log(`⚠️ ${remainingIssues.length} surahs still have missing verses.`);
    console.table(remainingIssues);
  }
}

/**
 * Get the next available verse ID
 */
async function getNextVerseId(): Promise<number> {
  const result = await db.select({ max: sql<number>`MAX(id)` }).from(verses);
  const maxId = result[0]?.max || 0;
  return maxId + 1;
}

// Run the script
addMissingVerses()
  .then(() => {
    console.log("Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });