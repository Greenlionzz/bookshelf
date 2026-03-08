import { SearchResult, BookDetails } from '@/types/book';

const BASE_URL = 'https://www.googleapis.com/books/v1';

// 🧹 NEW: Helper function to strip HTML and preserve line breaks
function cleanHTML(html: string): string {
  if (!html) return '';
  
  // 1. Convert <br> and paragraph endings to actual text newlines
  let text = html.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n\n');
  
  // 2. Strip out all remaining HTML tags (like <b>, <i>, <p>)
  text = text.replace(/<[^>]*>?/gm, '');
  
  // 3. Decode weird HTML entities (like &quot; or &#39;)
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value.trim();
}

export const GoogleBooksService = {
  async search(query: string): Promise<SearchResult[]> {
    if (!query.trim()) return [];
    const res = await fetch(`${BASE_URL}/volumes?q=${encodeURIComponent(query)}&maxResults=20`);
    const data = await res.json();
    
    return (data.items || []).map((item: any) => {
      const info = item.volumeInfo;
      return {
        key: item.id,
        title: info.title || 'Unknown Title',
        author: info.authors ? info.authors[0] : 'Unknown Author',
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
      coverUrl: info.imageLinks?.thumbnail?.replace('http:', 'https:')?.replace('&edge=curl', '') || '',
      totalPages: info.pageCount || 0,
      publishDate: info.publishedDate || '',
      // 👇 Pass the description through our new cleaner function!
      description: cleanHTML(info.description || ''),
      openLibraryKey: volumeId, 
    };
  }
};