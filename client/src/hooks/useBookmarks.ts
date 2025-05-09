import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Bookmark, Verse } from '@shared/schema';

// Mock user ID for now - in a real app, this would come from authentication
const MOCK_USER_ID = 1;

interface BookmarkWithVerse {
  bookmark: Bookmark;
  verse: Verse;
}

export function useBookmarks() {
  return useQuery<BookmarkWithVerse[]>({
    queryKey: [`/api/bookmarks?userId=${MOCK_USER_ID}`],
  });
}

export function useAddBookmark() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (verseId: number) => {
      const response = await apiRequest('POST', '/api/bookmarks', {
        user_id: MOCK_USER_ID,
        verse_id: verseId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/bookmarks`] });
    },
  });
}

export function useRemoveBookmark() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (bookmarkId: number) => {
      await apiRequest('DELETE', `/api/bookmarks/${bookmarkId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/bookmarks`] });
    },
  });
}

export function useIsVerseBookmarked(verseId: number) {
  const { data: bookmarks, isLoading } = useBookmarks();
  
  if (isLoading || !bookmarks) {
    return { isBookmarked: false, bookmarkId: null, isLoading };
  }
  
  const bookmark = bookmarks.find(b => b.verse.id === verseId);
  
  return {
    isBookmarked: !!bookmark,
    bookmarkId: bookmark?.bookmark.id || null,
    isLoading
  };
}
