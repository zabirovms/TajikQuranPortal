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

  // Fix specific surahs one by one (with exact content matching)
  
  // 1. Ensure Al-Fatiha has correct Bismillah as verse 1
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

  // 2. Fix Surah Al-A'raf (7)
  await db.update(verses)
    .set({
      arabic_text: "المص",
      tajik_text: "Алиф, лом, мим, сод."
    })
    .where(
      and(
        eq(verses.surah_id, await getSurahIdByNumber(7)),
        eq(verses.verse_number, 1)
      )
    );
  console.log("✓ Fixed Surah Al-A'raf (7)");

  // 3. Fix Surah Ar-Ra'd (13)
  await db.update(verses)
    .set({
      arabic_text: "المر ۚ تِلْكَ آيَاتُ الْكِتَابِ ۗ وَالَّذِي",
      tajik_text: "Алиф, лом, мим, ро. Инҳо оёти ин китоб аст ва он чӣ аз Парвардигорат ба ту нозил шуда, ҳақ аст, вале бештари мардум имон намеоваранд."
    })
    .where(
      and(
        eq(verses.surah_id, await getSurahIdByNumber(13)),
        eq(verses.verse_number, 1)
      )
    );
  console.log("✓ Fixed Surah Ar-Ra'd (13)");

  // 4. Fix Surah Ya-Sin (36)
  await db.update(verses)
    .set({
      arabic_text: "يس",
      tajik_text: "Ё, син."
    })
    .where(
      and(
        eq(verses.surah_id, await getSurahIdByNumber(36)),
        eq(verses.verse_number, 1)
      )
    );
  console.log("✓ Fixed Surah Ya-Sin (36)");

  // 5. Fix Surah Ar-Rahman (55)
  await db.update(verses)
    .set({
      arabic_text: "الرَّحْمَٰنُ",
      tajik_text: "Худои раҳмон"
    })
    .where(
      and(
        eq(verses.surah_id, await getSurahIdByNumber(55)),
        eq(verses.verse_number, 1)
      )
    );
  console.log("✓ Fixed Surah Ar-Rahman (55)");

  // 6. Fix Surah An-Naba (78)
  await db.update(verses)
    .set({
      arabic_text: "عَمَّ يَتَسَاءَلُونَ",
      tajik_text: "Аз чӣ чиз (ҳамдигарро) мепурсанд?"
    })
    .where(
      and(
        eq(verses.surah_id, await getSurahIdByNumber(78)),
        eq(verses.verse_number, 1)
      )
    );
  console.log("✓ Fixed Surah An-Naba (78)");

  // 7. Fix Surah Al-Alaq (96)
  await db.update(verses)
    .set({
      arabic_text: "اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ",
      tajik_text: "Бихон ба номи Парвардигорат, ки биёфарид,"
    })
    .where(
      and(
        eq(verses.surah_id, await getSurahIdByNumber(96)),
        eq(verses.verse_number, 1)
      )
    );
  console.log("✓ Fixed Surah Al-Alaq (96)");

  // 8. Fix Surah Al-Ikhlas (112)
  await db.update(verses)
    .set({
      arabic_text: "قُلْ هُوَ اللَّهُ أَحَدٌ",
      tajik_text: "Бигӯ: «Ӯст Худои якто,"
    })
    .where(
      and(
        eq(verses.surah_id, await getSurahIdByNumber(112)),
        eq(verses.verse_number, 1)
      )
    );
  console.log("✓ Fixed Surah Al-Ikhlas (112)");

  // 9. Fix Surah Al-Falaq (113)
  await db.update(verses)
    .set({
      arabic_text: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ",
      tajik_text: "Бигӯ: «Ба Парвардигори субҳгоҳ паноҳ мебарам,"
    })
    .where(
      and(
        eq(verses.surah_id, await getSurahIdByNumber(113)),
        eq(verses.verse_number, 1)
      )
    );
  console.log("✓ Fixed Surah Al-Falaq (113)");

  // 10. Fix Surah An-Nas (114)
  await db.update(verses)
    .set({
      arabic_text: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ",
      tajik_text: "Бигӯ: «Ба Парвардигори мардум паноҳ мебарам,"
    })
    .where(
      and(
        eq(verses.surah_id, await getSurahIdByNumber(114)),
        eq(verses.verse_number, 1)
      )
    );
  console.log("✓ Fixed Surah An-Nas (114)");

  // Check for any remaining issues
  const problematicVerses = await db.select()
    .from(verses)
    .innerJoin(surahs, eq(verses.surah_id, surahs.id))
    .where(
      and(
        eq(verses.verse_number, 1),
        sql`${surahs.number} != 1`,
        sql`${surahs.number} != 9`,
        sql`(${verses.arabic_text} LIKE 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ%' OR 
            ${verses.tajik_text} LIKE 'Ба номи Худованди бахшояндаи меҳрубон%')`
      )
    );

  if (problematicVerses.length > 0) {
    console.log(`Found ${problematicVerses.length} more surahs with Bismillah issues. Fixing...`);
    
    // Use raw SQL for the regex replacement (Drizzle doesn't have direct regex support)
    await db.execute(sql`
      UPDATE verses
      SET arabic_text = REGEXP_REPLACE(arabic_text, 
        '^بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\\s*', ''),
          tajik_text = REGEXP_REPLACE(tajik_text, 
        '^Ба номи Худованди бахшояндаи меҳрубон[!]?\\s*', '')
      WHERE surah_id IN (
        SELECT id FROM surahs WHERE number != 1 AND number != 9
      )
      AND verse_number = 1
      AND (
        arabic_text LIKE 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ%'
        OR 
        tajik_text LIKE 'Ба номи Худованди бахшояндаи меҳрубон%'
      )
    `);
  }

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