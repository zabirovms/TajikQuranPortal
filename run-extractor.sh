#!/bin/bash

# Compile the WordDataExtractor
javac -cp jqurantree-1.0.0.jar WordDataExtractor.java

# Run the extractor for the requested surah and verse, and save the output to a file
java -cp .:jqurantree-1.0.0.jar WordDataExtractor $1 $2 > word_data_output.json

# Show the result
cat word_data_output.json