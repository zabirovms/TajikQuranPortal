// Process missing tafsir entries (ones that don't currently exist in the database)
import fs from 'fs';
import { execSync } from 'child_process';

// Configuration
const batchSize = 50; // Number of updates to process at once
const tafsirFile = 'tafsirnur12.sql';

// Get missing tafsir entries
console.log('Finding verses without tafsir...');
const result = execSync('psql $DATABASE_URL -t -c "SELECT unique_key FROM verses WHERE tafsir IS NULL LIMIT 5000"').toString();
const missingKeys = result.trim().split('\n').map(line => line.trim()).filter(key => key);

console.log(`Found ${missingKeys.length} verses without tafsir data`);

// Read the tafsir file
console.log('Reading tafsir file...');
const tafsirContent = fs.readFileSync(tafsirFile, 'utf8');
const updates = tafsirContent.split('\n').filter(line => line.trim());

// Filter updates for missing verses only
console.log('Filtering relevant updates...');
const relevantUpdates = updates.filter(update => {
  for (const key of missingKeys) {
    if (update.includes(`unique_key = '${key}'`)) {
      return true;
    }
  }
  return false;
});

console.log(`Found ${relevantUpdates.length} tafsir entries for verses that currently don't have tafsir`);

// Process updates in batches
const totalBatches = Math.ceil(relevantUpdates.length / batchSize);
console.log(`Will process updates in ${totalBatches} batches of ${batchSize} entries each`);

for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
  const start = batchIndex * batchSize;
  const end = Math.min(start + batchSize, relevantUpdates.length);
  const batch = relevantUpdates.slice(start, end);
  
  console.log(`Processing batch ${batchIndex + 1}/${totalBatches} (${start + 1}-${end})`);
  
  // Write batch to temp file
  const batchFile = `tafsir_batch_${batchIndex + 1}.sql`;
  fs.writeFileSync(batchFile, batch.join('\n'));
  
  try {
    // Execute the batch
    execSync(`psql $DATABASE_URL -f ${batchFile}`);
    console.log(`Successfully processed batch ${batchIndex + 1}`);
    
    // Clean up temp file
    fs.unlinkSync(batchFile);
    
    // Display progress
    const progress = ((end / relevantUpdates.length) * 100).toFixed(2);
    console.log(`Progress: ${end}/${relevantUpdates.length} (${progress}%)`);
  } catch (error) {
    console.error(`Error processing batch ${batchIndex + 1}:`, error.message);
    // Don't delete the batch file so it can be examined
    break;
  }
  
  // Small delay to avoid overwhelming the database
  if (batchIndex < totalBatches - 1) {
    console.log('Waiting 1 second before next batch...');
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Count the total tafsir entries after update
try {
  const countResult = execSync('psql $DATABASE_URL -t -c "SELECT COUNT(*) FROM verses WHERE tafsir IS NOT NULL"').toString();
  const tafsirCount = parseInt(countResult.trim());
  console.log(`Total verses with tafsir after update: ${tafsirCount}`);
} catch (error) {
  console.error('Error getting updated tafsir count:', error.message);
}

console.log('Tafsir update process completed');