-- Enable the required extensions for better text search in Tajik
-- Note: These need to be enabled by a superuser in Supabase

-- Enable the unaccent extension for accent-insensitive search
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Enable pg_trgm for trigram-based search (similarity matching)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create a search index on arabic_text column
CREATE INDEX IF NOT EXISTS verses_arabic_text_idx ON verses USING GIN (arabic_text gin_trgm_ops);

-- Create a search index on tajik_text column
CREATE INDEX IF NOT EXISTS verses_tajik_text_idx ON verses USING GIN (tajik_text gin_trgm_ops);

-- Create a function to perform unaccented trigram search
CREATE OR REPLACE FUNCTION search_verses(
  search_query TEXT,
  search_lang TEXT DEFAULT 'both',
  surah_id INTEGER DEFAULT NULL
) RETURNS SETOF verses AS $$
BEGIN
  IF search_lang = 'arabic' THEN
    RETURN QUERY
      SELECT v.*
      FROM verses v
      WHERE 
        (v.arabic_text ILIKE '%' || search_query || '%' OR
         similarity(v.arabic_text, search_query) > 0.3)
        AND (surah_id IS NULL OR v.surah_id = surah_id)
      ORDER BY similarity(v.arabic_text, search_query) DESC
      LIMIT 100;
  ELSIF search_lang = 'tajik' THEN
    RETURN QUERY
      SELECT v.*
      FROM verses v
      WHERE 
        (v.tajik_text ILIKE '%' || search_query || '%' OR
         similarity(v.tajik_text, search_query) > 0.3 OR
         v.tajik_text ILIKE '%' || unaccent(search_query) || '%')
        AND (surah_id IS NULL OR v.surah_id = surah_id)
      ORDER BY similarity(v.tajik_text, search_query) DESC
      LIMIT 100;
  ELSE -- 'both'
    RETURN QUERY
      SELECT v.*
      FROM verses v
      WHERE 
        (v.arabic_text ILIKE '%' || search_query || '%' OR
         v.tajik_text ILIKE '%' || search_query || '%' OR
         similarity(v.arabic_text, search_query) > 0.3 OR
         similarity(v.tajik_text, search_query) > 0.3 OR
         v.tajik_text ILIKE '%' || unaccent(search_query) || '%')
        AND (surah_id IS NULL OR v.surah_id = surah_id)
      ORDER BY 
        GREATEST(
          similarity(v.arabic_text, search_query),
          similarity(v.tajik_text, search_query)
        ) DESC
      LIMIT 100;
  END IF;
END;
$$ LANGUAGE plpgsql;