import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { 
  users, surahs, verses, insertSurahSchema, insertVerseSchema
} from '../shared/schema';

// Helper to get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Surah metadata (available from various APIs like api.quran.com)
const surahsMetadata = [
  { number: 1, name_arabic: "الفاتحة", name_tajik: "Фотиҳа", name_english: "Al-Fatihah", revelation_type: "Meccan", verses_count: 7 },
  { number: 2, name_arabic: "البقرة", name_tajik: "Бақара", name_english: "Al-Baqarah", revelation_type: "Medinan", verses_count: 286 },
  { number: 3, name_arabic: "آل عمران", name_tajik: "Оли Имрон", name_english: "Aal-Imran", revelation_type: "Medinan", verses_count: 200 },
  { number: 4, name_arabic: "النساء", name_tajik: "Нисо", name_english: "An-Nisa", revelation_type: "Medinan", verses_count: 176 },
  { number: 5, name_arabic: "المائدة", name_tajik: "Моида", name_english: "Al-Ma'idah", revelation_type: "Medinan", verses_count: 120 },
  { number: 6, name_arabic: "الأنعام", name_tajik: "Анъом", name_english: "Al-An'am", revelation_type: "Meccan", verses_count: 165 },
  { number: 7, name_arabic: "الأعراف", name_tajik: "Аъроф", name_english: "Al-A'raf", revelation_type: "Meccan", verses_count: 206 },
  { number: 8, name_arabic: "الأنفال", name_tajik: "Анфол", name_english: "Al-Anfal", revelation_type: "Medinan", verses_count: 75 },
  { number: 9, name_arabic: "التوبة", name_tajik: "Тавба", name_english: "At-Tawbah", revelation_type: "Medinan", verses_count: 129 },
  { number: 10, name_arabic: "يونس", name_tajik: "Юнус", name_english: "Yunus", revelation_type: "Meccan", verses_count: 109 },
  { number: 11, name_arabic: "هود", name_tajik: "Ҳуд", name_english: "Hud", revelation_type: "Meccan", verses_count: 123 },
  { number: 12, name_arabic: "يوسف", name_tajik: "Юсуф", name_english: "Yusuf", revelation_type: "Meccan", verses_count: 111 },
  { number: 13, name_arabic: "الرعد", name_tajik: "Раъд", name_english: "Ar-Ra'd", revelation_type: "Medinan", verses_count: 43 },
  { number: 14, name_arabic: "ابراهيم", name_tajik: "Иброҳим", name_english: "Ibrahim", revelation_type: "Meccan", verses_count: 52 },
  { number: 15, name_arabic: "الحجر", name_tajik: "Ҳиҷр", name_english: "Al-Hijr", revelation_type: "Meccan", verses_count: 99 },
  { number: 16, name_arabic: "النحل", name_tajik: "Наҳл", name_english: "An-Nahl", revelation_type: "Meccan", verses_count: 128 },
  { number: 17, name_arabic: "الإسراء", name_tajik: "Исро", name_english: "Al-Isra", revelation_type: "Meccan", verses_count: 111 },
  { number: 18, name_arabic: "الكهف", name_tajik: "Каҳф", name_english: "Al-Kahf", revelation_type: "Meccan", verses_count: 110 },
  { number: 19, name_arabic: "مريم", name_tajik: "Марям", name_english: "Maryam", revelation_type: "Meccan", verses_count: 98 },
  { number: 20, name_arabic: "طه", name_tajik: "Тоҳо", name_english: "Taha", revelation_type: "Meccan", verses_count: 135 },
  { number: 21, name_arabic: "الأنبياء", name_tajik: "Анбиё", name_english: "Al-Anbya", revelation_type: "Meccan", verses_count: 112 },
  { number: 22, name_arabic: "الحج", name_tajik: "Ҳаҷ", name_english: "Al-Hajj", revelation_type: "Medinan", verses_count: 78 },
  { number: 23, name_arabic: "المؤمنون", name_tajik: "Мӯъминун", name_english: "Al-Mu'minun", revelation_type: "Meccan", verses_count: 118 },
  { number: 24, name_arabic: "النور", name_tajik: "Нур", name_english: "An-Nur", revelation_type: "Medinan", verses_count: 64 },
  { number: 25, name_arabic: "الفرقان", name_tajik: "Фурқон", name_english: "Al-Furqan", revelation_type: "Meccan", verses_count: 77 },
  { number: 26, name_arabic: "الشعراء", name_tajik: "Шуаро", name_english: "Ash-Shu'ara", revelation_type: "Meccan", verses_count: 227 },
  { number: 27, name_arabic: "النمل", name_tajik: "Намл", name_english: "An-Naml", revelation_type: "Meccan", verses_count: 93 },
  { number: 28, name_arabic: "القصص", name_tajik: "Қасас", name_english: "Al-Qasas", revelation_type: "Meccan", verses_count: 88 },
  { number: 29, name_arabic: "العنكبوت", name_tajik: "Анкабут", name_english: "Al-Ankabut", revelation_type: "Meccan", verses_count: 69 },
  { number: 30, name_arabic: "الروم", name_tajik: "Рум", name_english: "Ar-Rum", revelation_type: "Meccan", verses_count: 60 },
  { number: 31, name_arabic: "لقمان", name_tajik: "Луқмон", name_english: "Luqman", revelation_type: "Meccan", verses_count: 34 },
  { number: 32, name_arabic: "السجدة", name_tajik: "Саҷда", name_english: "As-Sajdah", revelation_type: "Meccan", verses_count: 30 },
  { number: 33, name_arabic: "الأحزاب", name_tajik: "Аҳзоб", name_english: "Al-Ahzab", revelation_type: "Medinan", verses_count: 73 },
  { number: 34, name_arabic: "سبإ", name_tajik: "Сабаъ", name_english: "Saba", revelation_type: "Meccan", verses_count: 54 },
  { number: 35, name_arabic: "فاطر", name_tajik: "Фотир", name_english: "Fatir", revelation_type: "Meccan", verses_count: 45 },
  { number: 36, name_arabic: "يس", name_tajik: "Ёсин", name_english: "Ya-Sin", revelation_type: "Meccan", verses_count: 83 },
  { number: 37, name_arabic: "الصافات", name_tajik: "Соффот", name_english: "As-Saffat", revelation_type: "Meccan", verses_count: 182 },
  { number: 38, name_arabic: "ص", name_tajik: "Сод", name_english: "Sad", revelation_type: "Meccan", verses_count: 88 },
  { number: 39, name_arabic: "الزمر", name_tajik: "Зумар", name_english: "Az-Zumar", revelation_type: "Meccan", verses_count: 75 },
  { number: 40, name_arabic: "غافر", name_tajik: "Ғофир", name_english: "Ghafir", revelation_type: "Meccan", verses_count: 85 },
  { number: 41, name_arabic: "فصلت", name_tajik: "Фуссилат", name_english: "Fussilat", revelation_type: "Meccan", verses_count: 54 },
  { number: 42, name_arabic: "الشورى", name_tajik: "Шӯро", name_english: "Ash-Shura", revelation_type: "Meccan", verses_count: 53 },
  { number: 43, name_arabic: "الزخرف", name_tajik: "Зухруф", name_english: "Az-Zukhruf", revelation_type: "Meccan", verses_count: 89 },
  { number: 44, name_arabic: "الدخان", name_tajik: "Духон", name_english: "Ad-Dukhan", revelation_type: "Meccan", verses_count: 59 },
  { number: 45, name_arabic: "الجاثية", name_tajik: "Ҷосия", name_english: "Al-Jathiyah", revelation_type: "Meccan", verses_count: 37 },
  { number: 46, name_arabic: "الأحقاف", name_tajik: "Аҳқоф", name_english: "Al-Ahqaf", revelation_type: "Meccan", verses_count: 35 },
  { number: 47, name_arabic: "محمد", name_tajik: "Муҳаммад", name_english: "Muhammad", revelation_type: "Medinan", verses_count: 38 },
  { number: 48, name_arabic: "الفتح", name_tajik: "Фатҳ", name_english: "Al-Fath", revelation_type: "Medinan", verses_count: 29 },
  { number: 49, name_arabic: "الحجرات", name_tajik: "Ҳуҷурот", name_english: "Al-Hujurat", revelation_type: "Medinan", verses_count: 18 },
  { number: 50, name_arabic: "ق", name_tajik: "Қоф", name_english: "Qaf", revelation_type: "Meccan", verses_count: 45 },
  { number: 51, name_arabic: "الذاريات", name_tajik: "Зориёт", name_english: "Adh-Dhariyat", revelation_type: "Meccan", verses_count: 60 },
  { number: 52, name_arabic: "الطور", name_tajik: "Тур", name_english: "At-Tur", revelation_type: "Meccan", verses_count: 49 },
  { number: 53, name_arabic: "النجم", name_tajik: "Наҷм", name_english: "An-Najm", revelation_type: "Meccan", verses_count: 62 },
  { number: 54, name_arabic: "القمر", name_tajik: "Қамар", name_english: "Al-Qamar", revelation_type: "Meccan", verses_count: 55 },
  { number: 55, name_arabic: "الرحمن", name_tajik: "Раҳмон", name_english: "Ar-Rahman", revelation_type: "Medinan", verses_count: 78 },
  { number: 56, name_arabic: "الواقعة", name_tajik: "Воқеа", name_english: "Al-Waqi'ah", revelation_type: "Meccan", verses_count: 96 },
  { number: 57, name_arabic: "الحديد", name_tajik: "Ҳадид", name_english: "Al-Hadid", revelation_type: "Medinan", verses_count: 29 },
  { number: 58, name_arabic: "المجادلة", name_tajik: "Муҷодала", name_english: "Al-Mujadila", revelation_type: "Medinan", verses_count: 22 },
  { number: 59, name_arabic: "الحشر", name_tajik: "Ҳашр", name_english: "Al-Hashr", revelation_type: "Medinan", verses_count: 24 },
  { number: 60, name_arabic: "الممتحنة", name_tajik: "Мумтаҳана", name_english: "Al-Mumtahanah", revelation_type: "Medinan", verses_count: 13 },
  { number: 61, name_arabic: "الصف", name_tajik: "Саф", name_english: "As-Saf", revelation_type: "Medinan", verses_count: 14 },
  { number: 62, name_arabic: "الجمعة", name_tajik: "Ҷумъа", name_english: "Al-Jumu'ah", revelation_type: "Medinan", verses_count: 11 },
  { number: 63, name_arabic: "المنافقون", name_tajik: "Мунофиқун", name_english: "Al-Munafiqun", revelation_type: "Medinan", verses_count: 11 },
  { number: 64, name_arabic: "التغابن", name_tajik: "Тағобун", name_english: "At-Taghabun", revelation_type: "Medinan", verses_count: 18 },
  { number: 65, name_arabic: "الطلاق", name_tajik: "Талоқ", name_english: "At-Talaq", revelation_type: "Medinan", verses_count: 12 },
  { number: 66, name_arabic: "التحريم", name_tajik: "Таҳрим", name_english: "At-Tahrim", revelation_type: "Medinan", verses_count: 12 },
  { number: 67, name_arabic: "الملك", name_tajik: "Мулк", name_english: "Al-Mulk", revelation_type: "Meccan", verses_count: 30 },
  { number: 68, name_arabic: "القلم", name_tajik: "Қалам", name_english: "Al-Qalam", revelation_type: "Meccan", verses_count: 52 },
  { number: 69, name_arabic: "الحاقة", name_tajik: "Ҳоққа", name_english: "Al-Haqqah", revelation_type: "Meccan", verses_count: 52 },
  { number: 70, name_arabic: "المعارج", name_tajik: "Маориҷ", name_english: "Al-Ma'arij", revelation_type: "Meccan", verses_count: 44 },
  { number: 71, name_arabic: "نوح", name_tajik: "Нӯҳ", name_english: "Nuh", revelation_type: "Meccan", verses_count: 28 },
  { number: 72, name_arabic: "الجن", name_tajik: "Ҷин", name_english: "Al-Jinn", revelation_type: "Meccan", verses_count: 28 },
  { number: 73, name_arabic: "المزمل", name_tajik: "Муззаммил", name_english: "Al-Muzzammil", revelation_type: "Meccan", verses_count: 20 },
  { number: 74, name_arabic: "المدثر", name_tajik: "Муддассир", name_english: "Al-Muddathir", revelation_type: "Meccan", verses_count: 56 },
  { number: 75, name_arabic: "القيامة", name_tajik: "Қиёмат", name_english: "Al-Qiyamah", revelation_type: "Meccan", verses_count: 40 },
  { number: 76, name_arabic: "الانسان", name_tajik: "Инсон", name_english: "Al-Insan", revelation_type: "Medinan", verses_count: 31 },
  { number: 77, name_arabic: "المرسلات", name_tajik: "Мурсалот", name_english: "Al-Mursalat", revelation_type: "Meccan", verses_count: 50 },
  { number: 78, name_arabic: "النبإ", name_tajik: "Набаъ", name_english: "An-Naba", revelation_type: "Meccan", verses_count: 40 },
  { number: 79, name_arabic: "النازعات", name_tajik: "Нозиот", name_english: "An-Nazi'at", revelation_type: "Meccan", verses_count: 46 },
  { number: 80, name_arabic: "عبس", name_tajik: "Абаса", name_english: "Abasa", revelation_type: "Meccan", verses_count: 42 },
  { number: 81, name_arabic: "التكوير", name_tajik: "Таквир", name_english: "At-Takwir", revelation_type: "Meccan", verses_count: 29 },
  { number: 82, name_arabic: "الإنفطار", name_tajik: "Инфитор", name_english: "Al-Infitar", revelation_type: "Meccan", verses_count: 19 },
  { number: 83, name_arabic: "المطففين", name_tajik: "Мутаффифин", name_english: "Al-Mutaffifin", revelation_type: "Meccan", verses_count: 36 },
  { number: 84, name_arabic: "الإنشقاق", name_tajik: "Иншиқоқ", name_english: "Al-Inshiqaq", revelation_type: "Meccan", verses_count: 25 },
  { number: 85, name_arabic: "البروج", name_tajik: "Буруҷ", name_english: "Al-Buruj", revelation_type: "Meccan", verses_count: 22 },
  { number: 86, name_arabic: "الطارق", name_tajik: "Ториқ", name_english: "At-Tariq", revelation_type: "Meccan", verses_count: 17 },
  { number: 87, name_arabic: "الأعلى", name_tajik: "Аъло", name_english: "Al-A'la", revelation_type: "Meccan", verses_count: 19 },
  { number: 88, name_arabic: "الغاشية", name_tajik: "Ғошия", name_english: "Al-Ghashiyah", revelation_type: "Meccan", verses_count: 26 },
  { number: 89, name_arabic: "الفجر", name_tajik: "Фаҷр", name_english: "Al-Fajr", revelation_type: "Meccan", verses_count: 30 },
  { number: 90, name_arabic: "البلد", name_tajik: "Балад", name_english: "Al-Balad", revelation_type: "Meccan", verses_count: 20 },
  { number: 91, name_arabic: "الشمس", name_tajik: "Шамс", name_english: "Ash-Shams", revelation_type: "Meccan", verses_count: 15 },
  { number: 92, name_arabic: "الليل", name_tajik: "Лайл", name_english: "Al-Layl", revelation_type: "Meccan", verses_count: 21 },
  { number: 93, name_arabic: "الضحى", name_tajik: "Зуҳо", name_english: "Ad-Duhaa", revelation_type: "Meccan", verses_count: 11 },
  { number: 94, name_arabic: "الشرح", name_tajik: "Шарҳ", name_english: "Ash-Sharh", revelation_type: "Meccan", verses_count: 8 },
  { number: 95, name_arabic: "التين", name_tajik: "Тин", name_english: "At-Tin", revelation_type: "Meccan", verses_count: 8 },
  { number: 96, name_arabic: "العلق", name_tajik: "Алақ", name_english: "Al-Alaq", revelation_type: "Meccan", verses_count: 19 },
  { number: 97, name_arabic: "القدر", name_tajik: "Қадр", name_english: "Al-Qadr", revelation_type: "Meccan", verses_count: 5 },
  { number: 98, name_arabic: "البينة", name_tajik: "Баййина", name_english: "Al-Bayyinah", revelation_type: "Medinan", verses_count: 8 },
  { number: 99, name_arabic: "الزلزلة", name_tajik: "Залзала", name_english: "Az-Zalzalah", revelation_type: "Medinan", verses_count: 8 },
  { number: 100, name_arabic: "العاديات", name_tajik: "Одиёт", name_english: "Al-Adiyat", revelation_type: "Meccan", verses_count: 11 },
  { number: 101, name_arabic: "القارعة", name_tajik: "Қориа", name_english: "Al-Qari'ah", revelation_type: "Meccan", verses_count: 11 },
  { number: 102, name_arabic: "التكاثر", name_tajik: "Такосур", name_english: "At-Takathur", revelation_type: "Meccan", verses_count: 8 },
  { number: 103, name_arabic: "العصر", name_tajik: "Аср", name_english: "Al-Asr", revelation_type: "Meccan", verses_count: 3 },
  { number: 104, name_arabic: "الهمزة", name_tajik: "Ҳумаза", name_english: "Al-Humazah", revelation_type: "Meccan", verses_count: 9 },
  { number: 105, name_arabic: "الفيل", name_tajik: "Фил", name_english: "Al-Fil", revelation_type: "Meccan", verses_count: 5 },
  { number: 106, name_arabic: "قريش", name_tajik: "Қурайш", name_english: "Quraysh", revelation_type: "Meccan", verses_count: 4 },
  { number: 107, name_arabic: "الماعون", name_tajik: "Моъун", name_english: "Al-Ma'un", revelation_type: "Meccan", verses_count: 7 },
  { number: 108, name_arabic: "الكوثر", name_tajik: "Кавсар", name_english: "Al-Kawthar", revelation_type: "Meccan", verses_count: 3 },
  { number: 109, name_arabic: "الكافرون", name_tajik: "Кофирун", name_english: "Al-Kafirun", revelation_type: "Meccan", verses_count: 6 },
  { number: 110, name_arabic: "النصر", name_tajik: "Наср", name_english: "An-Nasr", revelation_type: "Medinan", verses_count: 3 },
  { number: 111, name_arabic: "المسد", name_tajik: "Масад", name_english: "Al-Masad", revelation_type: "Meccan", verses_count: 5 },
  { number: 112, name_arabic: "الإخلاص", name_tajik: "Ихлос", name_english: "Al-Ikhlas", revelation_type: "Meccan", verses_count: 4 },
  { number: 113, name_arabic: "الفلق", name_tajik: "Фалақ", name_english: "Al-Falaq", revelation_type: "Meccan", verses_count: 5 },
  { number: 114, name_arabic: "الناس", name_tajik: "Нос", name_english: "An-Nas", revelation_type: "Meccan", verses_count: 6 }
];

async function setupDatabase() {
  // Check if database URL is provided
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  // Create connection
  const sql = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(sql);

  try {
    console.log('Setting up database schema...');
    
    // Push schema to database
    // Note: In a production environment, you should use migrations
    await db.execute(/* sql */`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS surahs (
        id SERIAL PRIMARY KEY,
        number INTEGER NOT NULL UNIQUE,
        name_arabic TEXT NOT NULL,
        name_tajik TEXT NOT NULL,
        name_english TEXT NOT NULL,
        revelation_type TEXT NOT NULL,
        verses_count INTEGER NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS verses (
        id SERIAL PRIMARY KEY,
        surah_id INTEGER NOT NULL,
        verse_number INTEGER NOT NULL,
        arabic_text TEXT NOT NULL,
        tajik_text TEXT NOT NULL,
        page INTEGER,
        juz INTEGER,
        audio_url TEXT,
        unique_key TEXT NOT NULL UNIQUE
      );
      
      CREATE TABLE IF NOT EXISTS bookmarks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        verse_id INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS search_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        query TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('Database schema created successfully');

    // Insert surahs in batches
    console.log('Importing surahs metadata...');
    const surahBatchSize = 20;
    for (let i = 0; i < surahsMetadata.length; i += surahBatchSize) {
      const batch = surahsMetadata.slice(i, i + surahBatchSize).map(surahData => ({
        number: surahData.number,
        name_arabic: surahData.name_arabic,
        name_tajik: surahData.name_tajik,
        name_english: surahData.name_english,
        revelation_type: surahData.revelation_type,
        verses_count: surahData.verses_count
      }));
      
      try {
        await db.insert(surahs).values(batch).onConflictDoNothing();
        console.log(`Imported surahs ${i+1} to ${Math.min(i + surahBatchSize, surahsMetadata.length)}`);
      } catch (error) {
        console.error(`Error inserting batch of surahs:`, error);
      }
    }
    
    console.log('Surahs imported successfully');

    // We need to read the SQL files and extract data for verses
    console.log('Preparing to import Quran verses...');
    
    // Get a mapping of surah numbers to IDs from the database
    const surahsFromDb = await db.select().from(surahs);
    const surahMapping = new Map(surahsFromDb.map(s => [s.number, s.id]));
    
    if (surahMapping.size === 0) {
      console.error('No surahs found in database');
      process.exit(1);
    }
    
    // Read Arabic text file
    const arabicFilePath = path.join(__dirname, '..', 'quran-simple.sql');
    const arabicData = fs.readFileSync(arabicFilePath, 'utf8');
    
    // Read Tajik translation file
    const tajikFilePath = path.join(__dirname, '..', 'tg.ayati.sql');
    const tajikData = fs.readFileSync(tajikFilePath, 'utf8');
    
    // Extract Arabic verses
    console.log('Extracting Arabic verses...');
    const arabicVerses = new Map();
    // This regex matches individual rows, not the entire INSERT statement
    const arabicRegex = /\((\d+), (\d+), (\d+), '([^']+)'\)/g;
    
    let arabicMatch;
    while ((arabicMatch = arabicRegex.exec(arabicData))) {
      const [_, index, sura, aya, text] = arabicMatch;
      const key = `${sura}:${aya}`;
      arabicVerses.set(key, text);
    }
    
    console.log(`Extracted ${arabicVerses.size} Arabic verses`);
    
    // Extract Tajik verses
    console.log('Extracting Tajik verses...');
    const tajikVerses = new Map();
    // This regex matches individual rows, not the entire INSERT statement
    const tajikRegex = /\((\d+), (\d+), (\d+), '([^']+)'\)/g;
    
    let tajikMatch;
    while ((tajikMatch = tajikRegex.exec(tajikData))) {
      const [_, index, sura, aya, text] = tajikMatch;
      const key = `${sura}:${aya}`;
      tajikVerses.set(key, text);
    }
    
    console.log(`Extracted ${tajikVerses.size} Tajik verses`);
    
    // Insert verses (batch processing to avoid memory issues)
    console.log('Importing verses...');
    
    // Check existing verses
    console.log('Checking existing verses...');
    const existingVerses = await db.select({ key: verses.unique_key }).from(verses);
    const existingKeys = new Set(existingVerses.map(v => v.key));
    console.log(`Found ${existingKeys.size} existing verses in database`);
    
    let currentSura = 1;
    const totalVerses = arabicVerses.size;
    console.log(`Total verses to import: ${totalVerses}`);
    let processedVerses = 0;
    const batchSize = 200; // Increased batch size for faster import
    let batch = [];

    for (const [key, arabicText] of arabicVerses.entries()) {
      // Skip verses that are already in the database
      if (existingKeys.has(key)) {
        continue;
      }
      
      const [suraStr, ayaStr] = key.split(':');
      const sura = parseInt(suraStr);
      const aya = parseInt(ayaStr);
      
      // Get surah ID
      const surahId = surahMapping.get(sura);
      if (!surahId) {
        console.warn(`Surah ${sura} not found in database, skipping verse ${key}`);
        continue;
      }
      
      // Skip if no Tajik translation
      if (!tajikVerses.has(key)) {
        console.warn(`No Tajik translation for verse ${key}, skipping`);
        continue;
      }
      
      // Log progress for a new surah
      if (sura !== currentSura) {
        console.log(`Processing Surah ${sura}...`);
        currentSura = sura;
      }
      
      // Create verse object
      const verse = {
        surah_id: surahId,
        verse_number: aya,
        arabic_text: arabicText,
        tajik_text: tajikVerses.get(key),
        page: null,  // We don't have this data
        juz: null,   // We don't have this data
        audio_url: `https://verse.audio/${sura}_${aya}.mp3`, // Placeholder URL
        unique_key: key
      };
      
      batch.push(verse);
      
      // Process batch when it reaches the batch size
      if (batch.length >= batchSize) {
        try {
          // Just use regular insert without transaction
          await db.insert(verses).values(batch).onConflictDoNothing();
          processedVerses += batch.length;
          console.log(`Imported ${processedVerses}/${totalVerses} verses`);
        } catch (error) {
          console.error(`Error inserting batch of verses:`, error);
        }
        batch = [];
      }
    }
    
    // Process remaining verses
    if (batch.length > 0) {
      try {
        // Just use regular insert without transaction
        await db.insert(verses).values(batch).onConflictDoNothing();
        processedVerses += batch.length;
        console.log(`Imported final ${batch.length} verses`);
      } catch (error) {
        console.error(`Error inserting batch of verses:`, error);
      }
    }
    
    console.log(`Verses import completed. Imported ${processedVerses}/${totalVerses} verses.`);
    
    // Insert a default user
    await db.insert(users).values({
      username: 'user123',
      password: 'password123'
    }).onConflictDoNothing();
    
    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await sql.end();
  }
}

setupDatabase().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});