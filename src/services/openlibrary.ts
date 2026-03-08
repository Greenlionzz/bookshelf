import { SearchResult, BookDetails } from '@/types/book';

const BASE_URL = 'https://openlibrary.org';

export const OpenLibraryService = {
  async search(query: string): Promise<SearchResult[]> {
    if (!query.trim()) return [];
    const encoded = encodeURIComponent(query.trim());
    const res = await fetch(`${BASE_URL}/search.json?q=${encoded}&limit=20&fields=key,title,author_name,first_publish_year,cover_i,edition_count`);
    const data = await res.json();

    return (data.docs || []).map((doc: any) => ({
      key: doc.key, // e.g. "/works/OL12345W"
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
    // workKey is like "/works/OL12345W"
    const workRes = await fetch(`${BASE_URL}${workKey}.json`);
    const workData = await workRes.json();

    // Try to get editions for page count and publish date
    let totalPages = 0;
    let publishDate = '';
    let coverUrl = '';

    try {
      const editionsRes = await fetch(`${BASE_URL}${workKey}/editions.json?limit=5`);
      const editionsData = await editionsRes.json();
      const editions = editionsData.entries || [];

      for (const edition of editions) {
        if (!totalPages && edition.number_of_pages) {
          totalPages = edition.number_of_pages;
        }
        if (!publishDate && edition.publish_date) {
          publishDate = edition.publish_date;
        }
        if (!coverUrl && edition.covers && edition.covers.length > 0) {
          coverUrl = `https://covers.openlibrary.org/b/id/${edition.covers[0]}-L.jpg`;
        }
        if (totalPages && publishDate && coverUrl) break;
      }
    } catch {
      // Editions fetch failed, continue with what we have
    }

    // Fallback cover from work
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

    // Extract author
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
