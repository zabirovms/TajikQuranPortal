# Tajik Quran Search Extensions for Supabase

This document explains how to set up advanced search capabilities for the Tajik Quran application using Supabase database extensions.

## Overview

For better search functionality in Tajik and Arabic languages, this application can leverage PostgreSQL extensions like:

1. **pg_trgm** - For trigram-based similarity search
2. **unaccent** - For accent-insensitive search
3. **pgroonga** (optional) - For full-text search with non-Latin languages support

These extensions enhance search capabilities beyond basic `LIKE` queries, particularly for the Tajik language which uses Cyrillic script.

## Setup Instructions

### 1. Connect to your Supabase Project

1. Go to the [Supabase dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click on "SQL Editor" in the left sidebar

### 2. Enable Required Extensions

Run this SQL query to enable the necessary extensions:

```sql
-- Enable extensions (requires superuser privileges)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
```

### 3. Create Search Indexes

Run this SQL to create trigram indexes on the text columns:

```sql
-- Create search indexes for better performance
CREATE INDEX IF NOT EXISTS verses_arabic_text_trgm_idx 
ON verses USING GIN (arabic_text gin_trgm_ops);

CREATE INDEX IF NOT EXISTS verses_tajik_text_trgm_idx 
ON verses USING GIN (tajik_text gin_trgm_ops);
```

### 4. Create the Search Function

Copy and paste the following SQL code to create the advanced search function:

```sql
-- Create a function to perform advanced search
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
```

### 5. Test the Function

Test the search function with a Tajik word:

```sql
-- Test with a Tajik word
SELECT * FROM search_verses('номи', 'tajik') LIMIT 5;

-- Test with an Arabic word
SELECT * FROM search_verses('الله', 'arabic') LIMIT 5;

-- Test searching in both languages
SELECT * FROM search_verses('رحمن', 'both') LIMIT 5;
```

## How It Works

1. The application automatically detects if the `search_verses` function exists in the database
2. If available, it uses this advanced function for searching
3. If not available, it falls back to basic LIKE-based search

The function provides:
- Trigram similarity matching (finding words even with typos)
- Accent-insensitive search for Tajik text
- Intelligent ranking of results by relevance
- Filtering by surah when needed

## Advanced Configuration (Optional)

For even better search capabilities, consider:

### Add pgroonga Extension for Full-Text Search

```sql
-- Enable pgroonga (if available in your Supabase plan)
CREATE EXTENSION IF NOT EXISTS pgroonga;

-- Create pgroonga index for full-text search
CREATE INDEX pgroonga_arabic_text_index ON verses USING pgroonga (arabic_text);
CREATE INDEX pgroonga_tajik_text_index ON verses USING pgroonga (tajik_text);
```

### Create a Combined Search Vector (Advanced)

```sql
-- Add a search vector column
ALTER TABLE verses ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Update the search vector
UPDATE verses SET search_vector = 
  setweight(to_tsvector('arabic_text'), 'A') || 
  setweight(to_tsvector('tajik_text'), 'B');

-- Create an index on the search vector
CREATE INDEX verses_search_idx ON verses USING GIN (search_vector);
```

## Troubleshooting

- If you encounter permissions errors when creating extensions, contact Supabase support
- For large databases, creating the GIN indexes might take some time
- The similarity threshold (0.3) can be adjusted if search results are too broad or too narrow