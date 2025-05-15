// Script to process tafsir updates in small batches
import fs from 'fs';
import { execSync } from 'child_process';

// Get batch number from command line arguments
const batchNumber = process.argv[2] || 1;
const batchSize = 20; // Number of updates per batch
const startIdx = (parseInt(batchNumber) - 1) * batchSize;
const endIdx = startIdx + batchSize;

console.log(`Processing tafsir batch ${batchNumber} (updates ${startIdx + 1} to ${endIdx})`);

// Read the tafsir file
const tafsirFile = 'tafsirnur12.sql';
const tafsirContent = fs.readFileSync(tafsirFile, 'utf8');

// Split the content into individual update statements
const updates = tafsirContent.split('\n').filter(line => line.trim());

// Get the specified batch
const batch = updates.slice(startIdx, endIdx);

if (batch.length === 0) {
  console.log('No more updates to process');
  process.exit(0);
}

// Create a temporary SQL file with the batch updates
const batchFile = `tafsir_batch_${batchNumber}.sql`;
fs.writeFileSync(batchFile, batch.join('\n'));

try {
  // Execute the batch using psql
  console.log(`Executing batch ${batchNumber} with ${batch.length} updates...`);
  execSync(`psql $DATABASE_URL -f ${batchFile}`);
  console.log(`Successfully processed batch ${batchNumber}`);
  
  // Clean up the temporary file
  fs.unlinkSync(batchFile);
  
  // Calculate percentage progress
  const totalUpdates = updates.length;
  const processedUpdates = Math.min(endIdx, totalUpdates);
  const percentage = ((processedUpdates / totalUpdates) * 100).toFixed(2);
  console.log(`Progress: ${processedUpdates}/${totalUpdates} (${percentage}%)`);
  
  console.log(`To process the next batch, run: node scripts/process-tafsir-batch.js ${parseInt(batchNumber) + 1}`);
} catch (error) {
  console.error('Error processing batch:', error.message);
  process.exit(1);
}