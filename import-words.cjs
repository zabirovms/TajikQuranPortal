// Import the extracted word data into the database
const fs = require('fs');
const { db } = require('./server/db');
const { wordAnalysis, verses } = require('./shared/schema');
const { and, eq } = require('drizzle-orm');

// Read word data from JSON file
const wordData = JSON.parse(fs.readFileSync('./quran_words.json', 'utf8'));
console.log(`Loaded ${wordData.length} words from JSON file`);

// Function to import a batch of words
async function importBatch(batch, batchNumber, totalBatches) {
  console.log(`Processing batch ${batchNumber}/${totalBatches} (${batch.length} words)...`);
  let successCount = 0;
  let errorCount = 0;
  
  for (const word of batch) {
    try {
      // Get verse ID
      const verseKey = `${word.surah_number}:${word.verse_number}`;
      const verseResult = await db.select().from(verses).where(eq(verses.unique_key, verseKey));
      
      if (!verseResult || verseResult.length === 0) {
        console.log(`Verse not found: ${verseKey}`);
        errorCount++;
        continue;
      }
      
      const verseId = verseResult[0].id;
      
      // Check if this word exists
      const existingWord = await db.select().from(wordAnalysis).where(
        and(
          eq(wordAnalysis.verse_id, verseId),
          eq(wordAnalysis.word_position, word.word_position)
        )
      );
      
      if (existingWord && existingWord.length > 0) {
        // Update existing word
        await db.update(wordAnalysis)
          .set({
            word_text: word.arabic,
            transliteration: word.transliteration,
          })
          .where(
            and(
              eq(wordAnalysis.verse_id, verseId),
              eq(wordAnalysis.word_position, word.word_position)
            )
          );
      } else {
        // Insert new word
        await db.insert(wordAnalysis).values({
          verse_id: verseId,
          word_position: word.word_position,
          word_text: word.arabic,
          transliteration: word.transliteration,
          translation: null,
          root: null,
          part_of_speech: null,
          created_at: new Date()
        });
      }
      
      successCount++;
    } catch (error) {
      console.error(`Error processing word: ${error.message}`);
      errorCount++;
    }
  }
  
  return { successCount, errorCount };
}

// Main import function
async function importWords() {
  try {
    console.log('Starting word import process...');
    
    // Break into batches of 100 words
    const batchSize = 100;
    const batches = [];
    
    for (let i = 0; i < wordData.length; i += batchSize) {
      batches.push(wordData.slice(i, i + batchSize));
    }
    
    console.log(`Separated ${wordData.length} words into ${batches.length} batches`);
    
    let totalSuccessCount = 0;
    let totalErrorCount = 0;
    
    // Process each batch
    for (let i = 0; i < batches.length; i++) {
      const { successCount, errorCount } = await importBatch(batches[i], i + 1, batches.length);
      totalSuccessCount += successCount;
      totalErrorCount += errorCount;
    }
    
    console.log(`Import completed. Success: ${totalSuccessCount}, Errors: ${totalErrorCount}`);
  } catch (error) {
    console.error('Import failed:', error);
  }
}

// Run the import
importWords();