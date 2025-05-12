const fs = require('fs');
const { db } = require('./server/db');
const { wordAnalysis, verses } = require('./shared/schema');
const { eq } = require('drizzle-orm');

async function importWordData() {
  try {
    console.log('Starting import of word data...');
    
    // Read the JSON file
    const wordData = JSON.parse(fs.readFileSync('quran_words.json', 'utf8'));
    console.log(`Found ${wordData.length} words in the JSON file.`);
    
    // Clear existing word analysis data
    /*
    console.log('Clearing existing word analysis data...');
    await db.delete(wordAnalysis);
    console.log('Existing data cleared.');
    */
    
    // Track which verses we've processed
    const processedVerses = new Set();
    let importedWords = 0;
    
    // Process each word
    for (const word of wordData) {
      const { surah_number, verse_number, word_position, arabic, transliteration } = word;
      
      // Get the verse ID from the database (only once per verse)
      const verseKey = `${surah_number}:${verse_number}`;
      
      if (!processedVerses.has(verseKey)) {
        console.log(`Processing verse ${verseKey}`);
        processedVerses.add(verseKey);
      }
      
      // Find the verse in our database
      const verseResult = await db.select().from(verses).where(eq(verses.unique_key, verseKey));
      
      if (!verseResult || verseResult.length === 0) {
        console.log(`Warning: Verse not found in database: ${verseKey}`);
        continue;
      }
      
      const verse = verseResult[0];
      
      // Check if we already have this word in the database
      const existingWord = await db
        .select()
        .from(wordAnalysis)
        .where(
          eq(wordAnalysis.verse_id, verse.id),
          eq(wordAnalysis.word_position, word_position)
        );
      
      if (existingWord && existingWord.length > 0) {
        // Update the existing word
        await db
          .update(wordAnalysis)
          .set({
            word_text: arabic,
            transliteration: transliteration,
            // No translation - we'll add that separately if needed
          })
          .where(
            eq(wordAnalysis.verse_id, verse.id),
            eq(wordAnalysis.word_position, word_position)
          );
      } else {
        // Insert a new word
        await db.insert(wordAnalysis).values({
          verse_id: verse.id,
          word_position: word_position,
          word_text: arabic,
          transliteration: transliteration,
          translation: null,
          root: null,
          part_of_speech: null,
          created_at: new Date()
        });
      }
      
      importedWords++;
      
      // Log progress every 100 words
      if (importedWords % 100 === 0) {
        console.log(`Imported ${importedWords} words...`);
      }
    }
    
    console.log(`Done! Successfully imported ${importedWords} words.`);
    console.log(`Processed ${processedVerses.size} unique verses.`);
    
  } catch (error) {
    console.error('Error importing word data:', error);
  } finally {
    process.exit();
  }
}

// Run the import
importWordData();