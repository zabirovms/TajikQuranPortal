#!/bin/bash

# Compile the extractor
javac -cp jqurantree-1.0.0.jar QuranWordExtractor.java

if [ $? -ne 0 ]; then
  echo "Compilation failed."
  exit 1
fi

# Get the number of surahs to extract (default is 3)
SURAH_COUNT=${1:-3}

# Run the extractor
java -cp .:jqurantree-1.0.0.jar QuranWordExtractor $SURAH_COUNT

# Check if the extraction was successful
if [ $? -ne 0 ]; then
  echo "Extraction failed."
  exit 1
fi

# Count the number of words extracted
WORD_COUNT=$(grep -c "word_position" quran_words.json)
echo "Successfully extracted $WORD_COUNT words from $SURAH_COUNT surahs."