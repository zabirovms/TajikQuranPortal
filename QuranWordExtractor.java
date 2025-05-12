import org.jqurantree.orthography.Document;
import org.jqurantree.orthography.Chapter;
import org.jqurantree.orthography.Verse;
import org.jqurantree.orthography.Token;
import java.io.FileWriter;
import java.io.IOException;

/**
 * Extracts word-by-word data from the Quran using JQuranTree
 * Outputs JSON data for word analysis
 */
public class QuranWordExtractor {
    
    public static void main(String[] args) {
        try {
            // Check arguments
            if (args.length < 1) {
                System.out.println("Usage: java QuranWordExtractor <max_surah_number>");
                System.exit(1);
            }
            
            // Parse max surah number argument (how many surahs to process)
            int maxSurahNumber = Integer.parseInt(args[0]);
            if (maxSurahNumber < 1 || maxSurahNumber > 114) {
                System.out.println("Invalid surah number. Must be between 1 and 114.");
                System.exit(1);
            }
            
            // Create file writer for JSON output
            FileWriter writer = new FileWriter("quran_words.json");
            
            // Start JSON array
            writer.write("[\n");
            
            boolean firstWord = true;
            
            // Process each chapter up to maxSurahNumber
            for (int surahNum = 1; surahNum <= maxSurahNumber; surahNum++) {
                Chapter chapter = Document.getChapter(surahNum);
                System.out.println("Processing Surah " + surahNum + ": " + chapter.getChapterNumber());
                
                // Process each verse in the chapter
                for (Verse verse : chapter) {
                    int verseNum = verse.getVerseNumber();
                    
                    // Process each token (word) in the verse
                    for (Token token : verse.getTokens()) {
                        // Get position in verse
                        int position = token.getTokenNumber();
                        
                        // Get Arabic text
                        String arabic = token.toString();
                        
                        // Get transliteration
                        String transliteration = token.toBuckwalter();
                        
                        // Create JSON object for this word
                        if (!firstWord) {
                            writer.write(",\n");
                        }
                        
                        writer.write("  {\n");
                        writer.write("    \"surah_number\": " + surahNum + ",\n");
                        writer.write("    \"verse_number\": " + verseNum + ",\n");
                        writer.write("    \"word_position\": " + position + ",\n");
                        writer.write("    \"arabic\": \"" + escape(arabic) + "\",\n");
                        writer.write("    \"transliteration\": \"" + escape(transliteration) + "\"\n");
                        writer.write("  }");
                        
                        firstWord = false;
                    }
                }
            }
            
            // End JSON array
            writer.write("\n]\n");
            writer.close();
            
            System.out.println("Extraction complete. Data saved to quran_words.json");
            
        } catch (NumberFormatException e) {
            System.err.println("Error: Invalid number format: " + e.getMessage());
        } catch (IOException e) {
            System.err.println("Error writing to file: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * Escape special characters in JSON strings
     */
    private static String escape(String input) {
        return input.replace("\\", "\\\\")
                   .replace("\"", "\\\"")
                   .replace("\b", "\\b")
                   .replace("\f", "\\f")
                   .replace("\n", "\\n")
                   .replace("\r", "\\r")
                   .replace("\t", "\\t");
    }
}