import org.jqurantree.orthography.Document;
import org.jqurantree.orthography.Verse;
import org.jqurantree.orthography.Token;
import org.jqurantree.arabic.encoding.buckwalter.BuckwalterEncoder;
import java.util.ArrayList;
import java.util.List;

/**
 * Extracts word-by-word data from JQuranTree and outputs it as JSON
 */
public class WordDataExtractor {
    
    public static void main(String[] args) {
        // Check arguments
        if (args.length < 2) {
            System.out.println("Usage: java WordDataExtractor <surah_number> <verse_number>");
            System.exit(1);
        }
        
        try {
            // Parse surah and verse numbers
            int surahNumber = Integer.parseInt(args[0]);
            int verseNumber = Integer.parseInt(args[1]);
            
            // Get the verse
            Verse verse = Document.getVerse(surahNumber, verseNumber);
            if (verse == null) {
                System.err.println("Error: Verse not found: " + surahNumber + ":" + verseNumber);
                System.exit(1);
            }
            
            // Create a list to store word data
            List<WordData> wordDataList = new ArrayList<>();
            
            // Process each token (word) in the verse
            for (Token token : verse.getTokens()) {
                WordData wordData = new WordData();
                wordData.position = token.getTokenNumber();
                wordData.arabic = token.toString();
                wordData.transliteration = token.toBuckwalter();
                wordDataList.add(wordData);
            }
            
            // Output as JSON
            System.out.print("[");
            for (int i = 0; i < wordDataList.size(); i++) {
                WordData wd = wordDataList.get(i);
                System.out.print(String.format(
                    "{\"position\": %d, \"arabic\": \"%s\", \"transliteration\": \"%s\"}",
                    wd.position, wd.arabic, wd.transliteration
                ));
                if (i < wordDataList.size() - 1) {
                    System.out.print(", ");
                }
            }
            System.out.println("]");
            
        } catch (NumberFormatException e) {
            System.err.println("Error: Invalid surah or verse number format");
            System.exit(1);
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }
    
    /**
     * Class to store word data
     */
    static class WordData {
        int position;
        String arabic;
        String transliteration;
    }
}