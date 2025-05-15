#!/bin/bash

# Split the SQL file into chunks of 50 lines
split -l 50 tafsirnur12.sql tafsir_chunk_

# Process each chunk
for chunk in tafsir_chunk_*; do
    echo "Processing $chunk..."
    psql $DATABASE_URL -f $chunk
    echo "Completed $chunk"
    sleep 1 # Small delay to avoid overwhelming the database
done

# Clean up temporary files
rm tafsir_chunk_*

echo "Database update completed!"