-- Bismillah Correction Script for Tajik Quran
-- This script ensures that Bismillah appears only in the correct places according to Islamic standards:
-- 1. Al-Fatiha (Surah 1) should have Bismillah as its first verse
-- 2. At-Tawbah (Surah 9) should NOT have Bismillah at all
-- 3. All other surahs should NOT have Bismillah as part of verse 1
--
-- Created: May 9, 2025

-- Create backup of affected verses
CREATE TEMPORARY TABLE verses_backup AS
SELECT * FROM verses 
WHERE verse_number = 1;

-- 1. Ensure Al-Fatiha (Surah 1) has correct Bismillah as verse 1
UPDATE verses
SET arabic_text = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    tajik_text = 'Ба номи Худованди бахшояндаи меҳрубон!'
WHERE surah_id = (SELECT id FROM surahs WHERE number = 1)
AND verse_number = 1;

-- 2. Fix Surah Al-A'raf (Surah 7)
UPDATE verses
SET arabic_text = 'المص',
    tajik_text = 'Алиф, лом, мим, сод.'
WHERE surah_id = (SELECT id FROM surahs WHERE number = 7)
AND verse_number = 1;

-- 3. Fix Surah Ar-Ra'd (Surah 13)
UPDATE verses
SET arabic_text = 'المر ۚ تِلْكَ آيَاتُ الْكِتَابِ ۗ وَالَّذِي',
    tajik_text = 'Алиф, лом, мим, ро. Инҳо оёти ин китоб аст ва он чӣ аз Парвардигорат ба ту нозил шуда, ҳақ аст, вале бештари мардум имон намеоваранд.'
WHERE surah_id = (SELECT id FROM surahs WHERE number = 13)
AND verse_number = 1;

-- 4. Fix Surah Ya-Sin (Surah 36)
UPDATE verses
SET arabic_text = 'يس',
    tajik_text = 'Ё, син.'
WHERE surah_id = (SELECT id FROM surahs WHERE number = 36)
AND verse_number = 1;

-- 5. Fix Surah Ar-Rahman (Surah 55)
UPDATE verses
SET arabic_text = 'الرَّحْمَٰنُ',
    tajik_text = 'Худои раҳмон'
WHERE surah_id = (SELECT id FROM surahs WHERE number = 55)
AND verse_number = 1;

-- 6. Fix Surah An-Naba (Surah 78)
UPDATE verses
SET arabic_text = 'عَمَّ يَتَسَاءَلُونَ',
    tajik_text = 'Аз чӣ чиз (ҳамдигарро) мепурсанд?'
WHERE surah_id = (SELECT id FROM surahs WHERE number = 78)
AND verse_number = 1;

-- 7. Fix Surah Al-Alaq (Surah 96)
UPDATE verses
SET arabic_text = 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ',
    tajik_text = 'Бихон ба номи Парвардигорат, ки биёфарид,'
WHERE surah_id = (SELECT id FROM surahs WHERE number = 96)
AND verse_number = 1;

-- 8. Fix Surah Al-Ikhlas (Surah 112)
UPDATE verses
SET arabic_text = 'قُلْ هُوَ اللَّهُ أَحَدٌ',
    tajik_text = 'Бигӯ: «Ӯст Худои якто,'
WHERE surah_id = (SELECT id FROM surahs WHERE number = 112)
AND verse_number = 1;

-- 9. Fix Surah Al-Falaq (Surah 113)
UPDATE verses
SET arabic_text = 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ',
    tajik_text = 'Бигӯ: «Ба Парвардигори субҳгоҳ паноҳ мебарам,'
WHERE surah_id = (SELECT id FROM surahs WHERE number = 113)
AND verse_number = 1;

-- 10. Fix Surah An-Nas (Surah 114)
UPDATE verses
SET arabic_text = 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ',
    tajik_text = 'Бигӯ: «Ба Парвардигори мардум паноҳ мебарам,'
WHERE surah_id = (SELECT id FROM surahs WHERE number = 114)
AND verse_number = 1;

-- 11. Fix any other surahs that might have Bismillah incorrectly (safety check)
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

-- Verification query:
-- SELECT s.number AS surah_number, s.name_english, v.verse_number, 
--   LEFT(v.arabic_text, 40) AS arabic_preview, 
--   LEFT(v.tajik_text, 60) AS tajik_preview
-- FROM verses v
-- JOIN surahs s ON v.surah_id = s.id
-- WHERE v.verse_number = 1
-- AND s.number IN (1, 2, 7, 9, 13, 36, 55, 78, 96, 112, 113, 114)
-- ORDER BY s.number;