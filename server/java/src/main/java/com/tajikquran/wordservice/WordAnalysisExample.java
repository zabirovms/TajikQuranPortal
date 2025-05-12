package com.tajikquran.wordservice;

import org.jqurantree.arabic.ArabicText;
import org.jqurantree.orthography.Document;
import org.jqurantree.orthography.Token;
import org.jqurantree.orthography.Verse;

/**
 * Example class demonstrating JQuranTree capabilities
 * for word-by-word Quran analysis.
 */
public class WordAnalysisExample {

    public static void main(String[] args) {
        // Load the Quran document
        Document quran = Document.loadResource();
        
        // Get a specific verse (e.g., Al-Fatiha 1:1)
        int chapterNumber = 1;
        int verseNumber = 1;
        Verse verse = quran.getVerse(chapterNumber, verseNumber);
        
        // Print the verse text
        System.out.println("Verse " + chapterNumber + ":" + verseNumber);
        System.out.println("Full verse: " + verse.toString());
        System.out.println();
        
        // Print each word/token in the verse
        System.out.println("Words in this verse:");
        for (Token token : verse.getTokens()) {
            System.out.println("Word " + token.getTokenNumber() + ": " + token.toString());
        }
    }
}