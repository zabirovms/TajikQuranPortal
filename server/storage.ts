import {
  users, type User, type InsertUser,
  surahs, type Surah, type InsertSurah,
  verses, type Verse, type InsertVerse,
  bookmarks, type Bookmark, type InsertBookmark,
  searchHistory, type SearchHistory, type InsertSearchHistory
} from "@shared/schema";
import { db } from "./db";
import { eq, like, and, or, desc, sql } from "drizzle-orm";

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Surah operations
  getAllSurahs(): Promise<Surah[]>;
  getSurah(id: number): Promise<Surah | undefined>;
  getSurahByNumber(number: number): Promise<Surah | undefined>;
  
  // Verse operations
  getVersesBySurah(surahId: number): Promise<Verse[]>;
  getVerseByKey(key: string): Promise<Verse | undefined>;
  searchVerses(query: string, language?: 'arabic' | 'tajik' | 'both', surahId?: number): Promise<Verse[]>;
  
  // Bookmark operations
  getBookmarksByUser(userId: number): Promise<{bookmark: Bookmark, verse: Verse}[]>;
  createBookmark(bookmark: InsertBookmark): Promise<Bookmark>;
  deleteBookmark(id: number): Promise<boolean>;
  
  // Search history operations
  addSearchHistory(searchQuery: InsertSearchHistory): Promise<SearchHistory>;
  getSearchHistoryByUser(userId: number): Promise<SearchHistory[]>;
}

// In-memory implementation of the storage interface
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private surahs: Map<number, Surah>;
  private verses: Map<number, Verse>;
  private bookmarks: Map<number, Bookmark>;
  private searchQueries: Map<number, SearchHistory>;

  private currentUserId: number;
  private currentSurahId: number;
  private currentVerseId: number;
  private currentBookmarkId: number;
  private currentSearchId: number;

  constructor() {
    this.users = new Map();
    this.surahs = new Map();
    this.verses = new Map();
    this.bookmarks = new Map();
    this.searchQueries = new Map();

    this.currentUserId = 1;
    this.currentSurahId = 1;
    this.currentVerseId = 1;
    this.currentBookmarkId = 1;
    this.currentSearchId = 1;

    // Initialize with some sample data
    this.initializeData();
  }

  private initializeData() {
    // Add first surah (Al-Fatihah) as example
    const surah: Surah = {
      id: this.currentSurahId++,
      number: 1,
      name_arabic: "الفاتحة",
      name_tajik: "Фотиҳа",
      name_english: "Al-Fatihah",
      revelation_type: "Meccan",
      verses_count: 7
    };
    this.surahs.set(surah.id, surah);

    // Add second surah (Al-Baqarah) as example
    const surah2: Surah = {
      id: this.currentSurahId++,
      number: 2,
      name_arabic: "البقرة",
      name_tajik: "Бақара",
      name_english: "Al-Baqarah",
      revelation_type: "Medinan",
      verses_count: 286
    };
    this.surahs.set(surah2.id, surah2);

    // Add a few verses for Al-Baqarah
    const verse1: Verse = {
      id: this.currentVerseId++,
      surah_id: surah2.id,
      verse_number: 1,
      arabic_text: "الٓمٓ",
      tajik_text: "Алиф. Лом. Мим.",
      page: 1,
      juz: 1,
      audio_url: "https://verse.audio/2_1.mp3",
      unique_key: "2:1"
    };
    this.verses.set(verse1.id, verse1);

    const verse2: Verse = {
      id: this.currentVerseId++,
      surah_id: surah2.id,
      verse_number: 2,
      arabic_text: "ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ",
      tajik_text: "Ин китоб, ки дар он ҳеҷ шакке нест, роҳнамои парҳезгорон аст.",
      page: 1,
      juz: 1,
      audio_url: "https://verse.audio/2_2.mp3",
      unique_key: "2:2"
    };
    this.verses.set(verse2.id, verse2);

    const verse3: Verse = {
      id: this.currentVerseId++,
      surah_id: surah2.id,
      verse_number: 3,
      arabic_text: "الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنفِقُونَ",
      tajik_text: "Касоне, ки ба ғайб имон меоваранд ва намоз мехонанд ва аз он чи рӯзияшон додаем, инфоқ мекунанд.",
      page: 1,
      juz: 1,
      audio_url: "https://verse.audio/2_3.mp3",
      unique_key: "2:3"
    };
    this.verses.set(verse3.id, verse3);

    const verse4: Verse = {
      id: this.currentVerseId++,
      surah_id: surah2.id,
      verse_number: 4,
      arabic_text: "وَالَّذِينَ يُؤْمِنُونَ بِمَا أُنزِلَ إِلَيْكَ وَمَا أُنزِلَ مِن قَبْلِكَ وَبِالْآخِرَةِ هُمْ يُوقِنُونَ",
      tajik_text: "Ва касоне, ки ба он чи бар ту нозил шуда ва ба он чи пеш аз ту нозил шуда имон меоваранд ва ба охират яқин доранд.",
      page: 1,
      juz: 1,
      audio_url: "https://verse.audio/2_4.mp3",
      unique_key: "2:4"
    };
    this.verses.set(verse4.id, verse4);

    const verse5: Verse = {
      id: this.currentVerseId++,
      surah_id: surah2.id,
      verse_number: 5,
      arabic_text: "أُولَٰئِكَ عَلَىٰ هُدًى مِّن رَّبِّهِمْ ۖ وَأُولَٰئِكَ هُمُ الْمُفْلِحُونَ",
      tajik_text: "Онҳо бар ҳидояте аз парвардигорашон ҳастанд ва онҳо растагоронанд.",
      page: 1,
      juz: 1,
      audio_url: "https://verse.audio/2_5.mp3",
      unique_key: "2:5"
    };
    this.verses.set(verse5.id, verse5);

    // Create a sample user
    const user: User = {
      id: this.currentUserId++,
      username: "user123",
      password: "password123"
    };
    this.users.set(user.id, user);

    // Add a bookmark for the user
    const bookmark: Bookmark = {
      id: this.currentBookmarkId++,
      user_id: user.id,
      verse_id: verse4.id,
      created_at: new Date()
    };
    this.bookmarks.set(bookmark.id, bookmark);
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Surah operations
  async getAllSurahs(): Promise<Surah[]> {
    return Array.from(this.surahs.values()).sort((a, b) => a.number - b.number);
  }

  async getSurah(id: number): Promise<Surah | undefined> {
    return this.surahs.get(id);
  }

  async getSurahByNumber(number: number): Promise<Surah | undefined> {
    return Array.from(this.surahs.values()).find(surah => surah.number === number);
  }

  // Verse operations
  async getVersesBySurah(surahId: number): Promise<Verse[]> {
    return Array.from(this.verses.values())
      .filter(verse => verse.surah_id === surahId)
      .sort((a, b) => a.verse_number - b.verse_number);
  }

  async getVerseByKey(key: string): Promise<Verse | undefined> {
    return Array.from(this.verses.values()).find(verse => verse.unique_key === key);
  }

  async searchVerses(query: string, language: 'arabic' | 'tajik' | 'both' = 'both', surahId?: number): Promise<Verse[]> {
    const verses = Array.from(this.verses.values());
    
    return verses.filter(verse => {
      if (surahId && verse.surah_id !== surahId) {
        return false;
      }

      // Check if query is a verse reference (e.g., "2:255")
      if (/^\d+:\d+$/.test(query)) {
        return verse.unique_key === query;
      }

      // Search in the specified language
      if (language === 'arabic' || language === 'both') {
        if (verse.arabic_text.includes(query)) {
          return true;
        }
      }

      if (language === 'tajik' || language === 'both') {
        if (verse.tajik_text.toLowerCase().includes(query.toLowerCase())) {
          return true;
        }
      }

      return false;
    });
  }

  // Bookmark operations
  async getBookmarksByUser(userId: number): Promise<{bookmark: Bookmark, verse: Verse}[]> {
    const userBookmarks = Array.from(this.bookmarks.values())
      .filter(bookmark => bookmark.user_id === userId);
    
    return userBookmarks.map(bookmark => {
      const verse = this.verses.get(bookmark.verse_id)!;
      return { bookmark, verse };
    });
  }

  async createBookmark(insertBookmark: InsertBookmark): Promise<Bookmark> {
    const id = this.currentBookmarkId++;
    const bookmark: Bookmark = { ...insertBookmark, id, created_at: new Date() };
    this.bookmarks.set(id, bookmark);
    return bookmark;
  }

  async deleteBookmark(id: number): Promise<boolean> {
    return this.bookmarks.delete(id);
  }

  // Search history operations
  async addSearchHistory(insertSearchHistory: InsertSearchHistory): Promise<SearchHistory> {
    const id = this.currentSearchId++;
    const searchHistory: SearchHistory = { ...insertSearchHistory, id, created_at: new Date() };
    this.searchQueries.set(id, searchHistory);
    return searchHistory;
  }

  async getSearchHistoryByUser(userId: number): Promise<SearchHistory[]> {
    return Array.from(this.searchQueries.values())
      .filter(search => search.user_id === userId)
      .sort((a, b) => {
        if (!a.created_at || !b.created_at) return 0;
        return b.created_at.getTime() - a.created_at.getTime();
      });
  }
}

// Create a PostgreSQL storage implementation
export class PostgresStorage implements IStorage {
  constructor() {}

  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async getAllSurahs(): Promise<Surah[]> {
    return await db.select().from(surahs).orderBy(surahs.number);
  }

  async getSurah(id: number): Promise<Surah | undefined> {
    const result = await db.select().from(surahs).where(eq(surahs.id, id)).limit(1);
    return result[0];
  }

  async getSurahByNumber(number: number): Promise<Surah | undefined> {
    const result = await db.select().from(surahs).where(eq(surahs.number, number)).limit(1);
    return result[0];
  }

  async getVersesBySurah(surahId: number): Promise<Verse[]> {
    return await db.select().from(verses).where(eq(verses.surah_id, surahId)).orderBy(verses.verse_number);
  }

  async getVerseByKey(key: string): Promise<Verse | undefined> {
    const result = await db.select().from(verses).where(eq(verses.unique_key, key)).limit(1);
    return result[0];
  }

  async searchVerses(query: string, language: 'arabic' | 'tajik' | 'both' = 'both', surahId?: number): Promise<Verse[]> {
    // Check if the query is a verse reference (e.g., "2:255")
    if (/^\d+:\d+$/.test(query)) {
      const result = await db.select().from(verses).where(eq(verses.unique_key, query)).limit(1);
      return result.length > 0 ? result : [];
    }
    
    console.log(`Executing search for '${query}' in ${language} languages${surahId ? ` for surah ${surahId}` : ''}`);
    
    // First, try to use advanced search function if available
    try {
      // Check if the search_verses function exists in Supabase
      const checkResult = await db.execute(sql`
        SELECT EXISTS (
          SELECT 1 FROM pg_proc WHERE proname = 'search_verses'
        ) AS function_exists
      `);
      
      // Extract boolean value from result
      const functionExists = (checkResult[0] as any)?.function_exists === true;
      
      if (functionExists) {
        console.log("Using advanced search function");
        
        // Execute advanced search using the SQL function
        const advancedResults = await db.execute(sql`
          SELECT * FROM search_verses(${query}, ${language}, ${surahId || null})
        `);
        
        // Convert raw results to Verse objects
        const results: Verse[] = [];
        for (const row of advancedResults) {
          const verse: Verse = {
            id: (row as any).id,
            surah_id: (row as any).surah_id,
            verse_number: (row as any).verse_number,
            arabic_text: (row as any).arabic_text,
            tajik_text: (row as any).tajik_text,
            page: (row as any).page,
            juz: (row as any).juz,
            audio_url: (row as any).audio_url,
            unique_key: (row as any).unique_key
          };
          results.push(verse);
        }
        
        console.log(`Found ${results.length} results using advanced search`);
        return results;
      }
    } catch (error) {
      console.warn("Advanced search function not available or failed:", error);
      // Continue with basic search
    }
    
    // Fallback to basic search
    console.log("Using basic search");
    
    // Build search conditions based on language preference
    const searchConditions = [];
    
    if (language === 'arabic' || language === 'both') {
      searchConditions.push(like(verses.arabic_text, `%${query}%`));
    }
    
    if (language === 'tajik' || language === 'both') {
      // Basic search
      searchConditions.push(like(verses.tajik_text, `%${query}%`));
      
      // Add word boundary search for whole words
      if (/^\w+$/.test(query)) {
        searchConditions.push(like(verses.tajik_text, `% ${query} %`));
        searchConditions.push(like(verses.tajik_text, `% ${query}.`));
        searchConditions.push(like(verses.tajik_text, `% ${query},`));
        searchConditions.push(like(verses.tajik_text, `% ${query}!`));
        searchConditions.push(like(verses.tajik_text, `% ${query}?`));
      }
    }
    
    if (searchConditions.length === 0) {
      return [];
    }
    
    // Combine conditions with OR
    let whereClause = searchConditions.length === 1 
      ? searchConditions[0] 
      : or(...searchConditions);
    
    // Add surah filter if provided
    if (surahId) {
      whereClause = and(whereClause, eq(verses.surah_id, surahId));
    }
    
    try {
      const results = await db.select().from(verses).where(whereClause).limit(100);
      console.log(`Found ${results.length} results using basic search`);
      return results;
    } catch (error) {
      console.error("Error executing search query:", error);
      return [];
    }
  }

  async getBookmarksByUser(userId: number): Promise<{bookmark: Bookmark, verse: Verse}[]> {
    const result = await db
      .select({
        bookmark: bookmarks,
        verse: verses
      })
      .from(bookmarks)
      .innerJoin(verses, eq(bookmarks.verse_id, verses.id))
      .where(eq(bookmarks.user_id, userId))
      .orderBy(desc(bookmarks.created_at));
    
    return result;
  }

  async createBookmark(bookmark: InsertBookmark): Promise<Bookmark> {
    const result = await db.insert(bookmarks).values(bookmark).returning();
    return result[0];
  }

  async deleteBookmark(id: number): Promise<boolean> {
    const result = await db.delete(bookmarks).where(eq(bookmarks.id, id)).returning();
    return result.length > 0;
  }

  async addSearchHistory(searchQuery: InsertSearchHistory): Promise<SearchHistory> {
    const result = await db.insert(searchHistory).values(searchQuery).returning();
    return result[0];
  }

  async getSearchHistoryByUser(userId: number): Promise<SearchHistory[]> {
    return await db
      .select()
      .from(searchHistory)
      .where(eq(searchHistory.user_id, userId))
      .orderBy(desc(searchHistory.created_at))
      .limit(10);
  }
}

// Use PostgreSQL storage implementation
export const storage = new PostgresStorage();