import { SearchResult, BookDetails } from '@/types/book';

const BASE_URL = 'https://www.googleapis.com/books/v1';

export const GoogleBooksService = {
  async search(query: string): Promise<SearchResult[]> {
    if (!query.trim()) return [];
    const res = await fetch(`${BASE_URL}/volumes?q=${encodeURIComponent(query)}&maxResults=20`);
    const data = await res.json();
    
    return (data.items || []).map((item: any) => {
      const info = item.volumeInfo;
      return {
        key: item.id, // We use the Google Volume ID as the key
        title: info.title || 'Unknown Title',
        author: info.authors ? info.authors[0] : 'Unknown Author',
        // Force HTTPS to prevent browser security blocks
        coverUrl: info.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
        firstPublishYear: info.publishedDate ? parseInt(info.publishedDate.substring(0, 4)) : undefined,
        editionCount: 1,
      };
    });
  },

  async getWorkDetails(volumeId: string): Promise<BookDetails> {
    const res = await fetch(`${BASE_URL}/volumes/${volumeId}`);
    const data = await res.json();
    const info = data.volumeInfo;

    return {
      title: info.title || 'Unknown Title',
      author: info.authors ? info.authors.join(', ') : 'Unknown Author',
      // Get a slightly higher-res image by removing the curl edge parameter
      coverUrl: info.imageLinks?.thumbnail?.replace('http:', 'https:')?.replace('&edge=curl', '') || '',
      totalPages: info.pageCount || 0,
      publishDate: info.publishedDate || '',
      description: info.description || '',
      // We will just store the Google ID in this same database column to save time!
      openLibraryKey: volumeId, 
    };
  }
};