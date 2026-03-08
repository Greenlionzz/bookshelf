import { SearchResult, BookDetails } from '@/types/book';

const BASE_URL = 'https://openlibrary.org';

export const OpenLibraryService = {
  async search(query: string): Promise<SearchResult[]> {
    if (!query.trim()) return [];
    const encoded = encodeURIComponent(query.trim());
    const res = await fetch(`${BASE_URL}/search.json?q=${encoded}&limit=20&fields=key,title,author_name,first_publish_year,cover_i,edition_count`);
    const data = await res.json();
    return (data.docs || []).map((doc: any) => ({
      key: doc.key,
      title: doc.title || 'Unknown Title',
      author: doc.author_name ? doc.author_name[0] : 'Unknown Author',
      coverUrl: doc.cover_i
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
        : '',
      firstPublishYear: doc.first_publish_year,
      editionCount: doc.edition_count,
    }));
  },

  async getWorkDetails(workKey: string): Promise<BookDetails> {
    // 🚀 THE FIX: Fire Work and Editions requests at the exact same time!
    const [workRes, editionsRes] = await Promise.allSettled([
      fetch(`${BASE_URL}${workKey}.json`),
      fetch(`${BASE_URL}${workKey}/editions.json?limit=5`)
    ]);

    // If the main work fetch fails, we can't proceed
    if (workRes.status === 'rejected') {
      throw new Error('Failed to fetch main work details');
    }
    
    const workData = await workRes.value.json();

    let totalPages = 0;
    let publishDate = '';
    let coverUrl = '';

    // Process editions if they successfully loaded in parallel
    if (editionsRes.status === 'fulfilled' && editionsRes.value.ok) {
      try {
        const editionsData = await editionsRes.value.json();
        const editions = editionsData.entries || [];
        for (const edition of editions) {
          if (!totalPages && edition.number_of_pages) totalPages = edition.number_of_pages;
          if (!publishDate && edition.publish_date) publishDate = edition.publish_date;
          if (!coverUrl && edition.covers && edition.covers.length > 0) {
            coverUrl = `https://covers.openlibrary.org/b/id/${edition.covers[0]}-L.jpg`;
          }
          if (totalPages && publishDate && coverUrl) break;
        }
      } catch {
        // Editions parsing failed, but we won't let it crash the app
      }
    }

    // Fallback cover from main work
    if (!coverUrl && workData.covers && workData.covers.length > 0) {
      coverUrl = `https://covers.openlibrary.org/b/id/${workData.covers[0]}-L.jpg`;
    }

    // Extract description
    let description = '';
    if (workData.description) {
      description = typeof workData.description === 'string'
        ? workData.description
        : workData.description.value || '';
    }

    // ⏳ We still fetch the author sequentially here because we need the authorKey from the Work data first.
    let author = 'Unknown Author';
    if (workData.authors && workData.authors.length > 0) {
      const authorRef = workData.authors[0].author?.key || workData.authors[0].key;
      if (authorRef) {
        try {
          const authorRes = await fetch(`${BASE_URL}${authorRef}.json`);
          const authorData = await authorRes.json();
          author = authorData.name || 'Unknown Author';
        } catch {
          // Author fetch failed
        }
      }
    }

    return {
      title: workData.title || 'Unknown Title',
      author,
      coverUrl,
      totalPages,
      publishDate: publishDate || (workData.first_publish_date || ''),
      description,
      openLibraryKey: workKey,
    };
  },
};