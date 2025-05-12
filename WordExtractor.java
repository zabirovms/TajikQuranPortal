import org.jqurantree.orthography.Document;
import org.jqurantree.orthography.Chapter;
import org.jqurantree.orthography.Verse;
import org.jqurantree.orthography.Token;
import org.jqurantree.analysis.AnalysisText;
import org.jqurantree.analysis.WordAnalysis;
import org.jqurantree.arabic.ArabicText;
import org.jqurantree.analysis.WordType;

import java.util.List;
import java.io.FileWriter;
import java.io.PrintWriter;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

/**
 * Extracts word-by-word analysis from JQuranTree and exports it as JSON
 * Takes surah and verse numbers as parameters
 */
public class WordExtractor {
    public static void main(String[] args) {
        if (args.length < 2) {
            System.err.println("Usage: java WordExtractor <surahNumber> <verseNumber>");
            System.exit(1);
        }

        try {
            int surahNumber = Integer.parseInt(args[0]);
            int verseNumber = Integer.parseInt(args[1]);
            
            // Get document, chapter and verse from JQuranTree
            Document document = Document.getDocument();
            Chapter chapter = document.getChapter(surahNumber);
            Verse verse = chapter.getVerse(verseNumber);
            
            // Get analysis text for the verse
            AnalysisText analysisText = new AnalysisText(verse);
            
            JSONArray wordsArray = new JSONArray();
            
            // Process each token in the verse
            for (int i = 0; i < analysisText.getTokenCount(); i++) {
                Token token = analysisText.getToken(i);
                
                // Skip non-word tokens
                if (token.getWordType() != WordType.NONE) {
                    // Create word analysis object
                    WordAnalysis wordAnalysis = analysisText.getWordAnalysis(i);
                    
                    JSONObject wordObject = new JSONObject();
                    wordObject.put("position", i + 1);
                    wordObject.put("arabic", token.getArabicText().toString());
                    
                    // Get translation and root if available
                    if (wordAnalysis != null) {
                        String lemma = wordAnalysis.getLemma() != null ? 
                            wordAnalysis.getLemma().toString() : null;
                        String root = wordAnalysis.getRoot() != null ? 
                            wordAnalysis.getRoot().toString() : null;
                        String partOfSpeech = wordAnalysis.getPartOfSpeech() != null ?
                            wordAnalysis.getPartOfSpeech().toString() : null;
                        
                        wordObject.put("lemma", lemma);
                        wordObject.put("root", root);
                        wordObject.put("partOfSpeech", partOfSpeech);
                        wordObject.put("translation", lemma); // Use lemma as translation 
                    }
                    
                    wordsArray.add(wordObject);
                }
            }
            
            // Create final JSON object
            JSONObject resultObject = new JSONObject();
            resultObject.put("surah", surahNumber);
            resultObject.put("verse", verseNumber);
            resultObject.put("words", wordsArray);
            
            // Output as JSON
            System.out.println(resultObject.toJSONString());
            
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }
}