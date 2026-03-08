import { useState, useRef, useEffect } from 'react';
import { OpenLibraryService } from '@/services/openlibrary';
import { SearchResult } from '@/types/book';
import { Search, X, Loader2, BookOpen } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSelectResult: (result: SearchResult) => void;
}

export default function SearchModal({ onClose, onSelectResult }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    timeoutRef.current = setTimeout(async () => {
      setLoading(true);
      setSearched(true);
      try {
        const data = await OpenLibraryService.search(query);
        setResults(data);
      } catch {
        setResults([]);
      }
      setLoading(false);
    }, 500);

    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [query]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-16 p-4" onClick={onClose}>
      <div className="fixed inset-0 backdrop-blur-sm" style={{ backgroundColor: 'var(--color-overlay)' }} />
      <div
        className="relative rounded-[28px] shadow-2xl w-full max-w-2xl z-10 max-h-[80vh] flex flex-col overflow-hidden animate-in"
        style={{ backgroundColor: 'var(--color-bg)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search bar */}
        <div className="p-4 border-b" style={{ borderColor: 'var(--color-surface-dim)' }}>
          <div className="flex items-center gap-3 rounded-full px-5 py-3" style={{ backgroundColor: 'var(--color-surface)' }}>
            <Search size={20} className="shrink-0" style={{ color: 'var(--color-on-surface-variant)' }} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search for a book..."
              className="flex-1 bg-transparent outline-none"
              style={{ color: 'var(--color-on-surface)' }}
            />
            {query && (
              <button onClick={() => setQuery('')} className="p-1 rounded-full"
                style={{ color: 'var(--color-on-surface-variant)' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-surface-variant)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
            </div>
          )}

          {!loading && searched && results.length === 0 && (
            <div className="flex flex-col items-center py-12 text-center">
              <BookOpen size={40} style={{ color: 'var(--color-primary)', opacity: 0.3 }} className="mb-3" />
              <p style={{ color: 'var(--color-on-surface-variant)' }}>No books found for "{query}"</p>
              <p className="text-sm mt-1" style={{ color: 'var(--color-outline)' }}>Try a different search term</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-2">
              {results.map((result, idx) => (
                <button
                  key={`${result.key}-${idx}`}
                  onClick={() => onSelectResult(result)}
                  className="w-full flex items-center gap-4 p-3 rounded-2xl transition-colors text-left"
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-surface)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div className="w-12 h-16 rounded-[5px] overflow-hidden shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: 'var(--color-surface-variant)' }}
                  >
                    {result.coverUrl ? (
                      <img src={result.coverUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <BookOpen size={16} style={{ color: 'var(--color-primary)' }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate" style={{ color: 'var(--color-on-surface)' }}>{result.title}</p>
                    <p className="text-sm truncate" style={{ color: 'var(--color-on-surface-variant)' }}>{result.author}</p>
                    {result.firstPublishYear && (
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-outline)' }}>{result.firstPublishYear}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {!loading && !searched && (
            <div className="flex flex-col items-center py-12 text-center">
              <Search size={40} style={{ color: 'var(--color-primary)', opacity: 0.3 }} className="mb-3" />
              <p style={{ color: 'var(--color-on-surface-variant)' }}>Search for a book by title or author</p>
            </div>
          )}
        </div>

        {/* Close button */}
        <div className="p-4 border-t" style={{ borderColor: 'var(--color-surface-dim)' }}>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-full font-medium transition-colors"
            style={{
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-primary)',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-surface-variant)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--color-surface)'}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
