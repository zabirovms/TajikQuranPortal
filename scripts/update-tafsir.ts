import fs from 'fs';
import path from 'path';
import { db } from '../server/db';
import { verses } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function updateTafsir() {
  console.log('Starting tafsir update process...');
  
  // Read the SQL file
  const filePath = path.join(process.cwd(), 'tafsirnur12.sql');
  const sqlContent = fs.readFileSync(filePath, 'utf8');
  
  // Parse the SQL file to extract verse keys and tafsir text
  const updates = sqlContent.split('\n').filter(line => line.trim().length > 0);
  
  console.log(`Found ${updates.length} tafsir entries to process`);
  
  // Process updates in batches
  const batchSize = 50;
  const totalBatches = Math.ceil(updates.length / batchSize);
  
  for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
    const start = batchIndex * batchSize;
    const end = Math.min(start + batchSize, updates.length);
    const batch = updates.slice(start, end);
    
    console.log(`Processing batch ${batchIndex + 1}/${totalBatches} (${start + 1}-${end})`);
    
    for (const updateStatement of batch) {
      try {
        // Extract verse key and tafsir text using regex
        const keyMatch = updateStatement.match(/unique_key = '([^']+)'/);
        const tafsirMatch = updateStatement.match(/SET tafsir = '([^']+)'/);
        
        if (keyMatch && tafsirMatch) {
          const uniqueKey = keyMatch[1];
          const tafsirText = tafsirMatch[1].replace(/''/, "'"); // Handle escaped quotes
          
          // Update the verse in the database
          await db.update(verses)
            .set({ tafsir: tafsirText })
            .where(eq(verses.unique_key, uniqueKey));
            
          process.stdout.write('.');
        }
      } catch (error) {
        console.error(`Error processing update: ${error}`);
      }
    }
    console.log(`\nCompleted batch ${batchIndex + 1}/${totalBatches}`);
    
    // Small delay to avoid overwhelming the database
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('Tafsir update completed!');
}

// Run the update function
updateTafsir().catch(error => {
  console.error('Failed to update tafsir:', error);
  process.exit(1);
});