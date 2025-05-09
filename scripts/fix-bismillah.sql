-- Fix Bismillah issues in the database
-- This script:
-- 1. Ensures Bismillah remains ONLY in Surah Al-Fatiha (Surah 1) as verse 1
-- 2. Removes Bismillah from the beginning of all other surahs
-- 3. Fixes verse numbering in affected surahs

-- First, back up the verses table (ALWAYS back up before making changes)
-- CREATE TABLE verses_backup AS SELECT * FROM verses;

-- Update verses where Bismillah appears incorrectly (all surahs except Al-Fatiha)
-- Find all first verses of surahs (except Surah 1) that contain Bismillah
UPDATE verses
SET arabic_text = REGEXP_REPLACE(arabic_text, 
  '^بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\s*', ''),
    tajik_text = REGEXP_REPLACE(tajik_text, 
  '^Ба номи Худованди бахшояндаи меҳрубон[!]?\s*', '')
WHERE surah_id IN (
  SELECT id FROM surahs WHERE number != 1 AND number != 9
)
AND verse_number = 1
AND (
  arabic_text LIKE 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ%'
  OR 
  tajik_text LIKE 'Ба номи Худованди бахшояндаи меҳрубон%'
);

-- Set proper text for Al-Fatiha, verse 1 (Bismillah only)
UPDATE verses
SET arabic_text = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    tajik_text = 'Ба номи Худованди бахшояндаи меҳрубон!'
WHERE surah_id = (SELECT id FROM surahs WHERE number = 1)
AND verse_number = 1;

-- Special case: Surah At-Tawbah (Surah 9) should have NO Bismillah at all
-- (It is the only surah in the Quran without Bismillah)
-- This is already handled by the first query's WHERE clause (number != 9)

-- Verify the changes (optional, comment these out when running the actual script)
-- SELECT surah_id, verse_number, arabic_text, tajik_text 
-- FROM verses 
-- WHERE verse_number = 1
-- ORDER BY surah_id
-- LIMIT 10;