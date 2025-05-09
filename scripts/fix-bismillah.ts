import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function fixVersesWithBismillah() {
  console.log('Starting to fix verses with incorrectly included Bismillah...');

  // Get all first verses except from Surah 1 (Al-Fatiha)
  const firstVerses = await db.execute(sql`
    SELECT id, surah_id, verse_number, arabic_text, tajik_text 
    FROM verses 
    WHERE verse_number = 1 AND surah_id != 1
  `);

  console.log(`Found ${firstVerses.rows.length} first verses to check for Bismillah...`);
  let updatedCount = 0;

  for (const verse of firstVerses.rows) {
    const arabicText = verse.arabic_text as string;
    
    // Check if the verse starts with Bismillah
    if (arabicText.startsWith('بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ')) {
      // Remove the Bismillah part
      const correctedArabicText = arabicText.replace('بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ ', '');
      
      // Update the verse in the database
      await db.execute(sql`
        UPDATE verses 
        SET arabic_text = ${correctedArabicText}
        WHERE id = ${verse.id}
      `);
      
      updatedCount++;
      console.log(`Updated verse ${verse.surah_id}:${verse.verse_number} (ID: ${verse.id})`);
    }
  }

  console.log(`Updated ${updatedCount} verses by removing Bismillah.`);
  console.log('Done fixing verses!');
}

// Run the fix
fixVersesWithBismillah()
  .then(() => {
    console.log('Script completed successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error running script:', err);
    process.exit(1);
  });