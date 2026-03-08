import { useState, useEffect } from 'react';
import { OpenLibraryService } from '@/services/openlibrary';
import { GoogleBooksService } from '@/services/googlebooks'; // 👈 1. Added Google Books
import { SearchResult, ReadingStatus } from '@/types/book';
import { useBooks } from '@/context/BookContext';
import { X, Loader2, BookOpen, Save, ImagePlus } from 'lucide-react';

interface Props {
  searchResult: SearchResult;
  apiSource: 'google' | 'openlibrary'; // 👈 2. Added the new prop
  onClose: () => void;
  onSaved: () => void;
}

const statusOptions: { id: ReadingStatus; label: string }[] = [
  { id: 'currently-reading', label: 'Currently Reading' },
  { id: 'for-later', label: 'For Later' },
  { id: 'finished', label: 'Finished' },
  { id: 'paused', label: 'Paused' },
];

export default function CustomizeModal({ searchResult, apiSource, onClose, onSaved }: Props) {
  const { addBook, activeTab } = useBooks();
  
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState(searchResult.title);
  const [author, setAuthor] = useState(searchResult.author);
  const [coverUrl, setCoverUrl] = useState(searchResult.coverUrl);
  const [totalPages, setTotalPages] = useState(0);
  const [publishDate, setPublishDate] = useState('');
  const [description, setDescription] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<ReadingStatus>(activeTab);
  const [openLibraryKey, setOpenLibraryKey] = useState(searchResult.key);

  useEffect(() => {
    let cancelled = false;

    async function fetchDetails() {
      setLoading(true);
      try {
        // 👈 3. The Traffic Cop: Route the request to the correct API!
        const details = apiSource === 'google'
          ? await GoogleBooksService.getWorkDetails(searchResult.key)
          : await OpenLibraryService.getWorkDetails(searchResult.key);

        if (cancelled) return;
        setTitle(details.title);
        setAuthor(details.author);
        if (details.coverUrl) setCoverUrl(details.coverUrl);
        setTotalPages(details.totalPages);
        setPublishDate(details.publishDate);
        setDescription(details.description);
        setOpenLibraryKey(details.openLibraryKey);
      } catch {
        // Keep the search result data if the deep fetch fails
      }
      if (!cancelled) setLoading(false);
    }

    fetchDetails();
    return () => { cancelled = true; };
  }, [searchResult.key, apiSource]); // Don't forget to add apiSource to the dependency array!

  const handleSave = () => {
    addBook({
      title,
      author,
      coverUrl,
      totalPages,
      publishDate,
      description,
      note,
      status,
      openLibraryKey,
    });
    onSaved();
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-on-surface)',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 backdrop-blur-sm" style={{ backgroundColor: 'var(--color-overlay)' }} />
      <div
        className="relative rounded-[28px] shadow-2xl w-full max-w-lg z-10 max-h-[90vh] flex flex-col overflow-hidden animate-in"
        style={{ backgroundColor: 'var(--color-bg)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b" style={{ borderColor: 'var(--color-surface-dim)' }}>
          <h2 className="text-xl font-semibold" style={{ color: 'var(--color-on-surface)' }}>Preview & Customize</h2>
          <button onClick={onClose} className="p-2 rounded-full transition-colors"
            style={{ color: 'var(--color-on-surface-variant)' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-surface-variant)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={40} className="animate-spin mb-3" style={{ color: 'var(--color-primary)' }} />
            <p style={{ color: 'var(--color-on-surface-variant)' }}>Fetching book details...</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Cover + Cover URL input */}
            <div className="flex gap-4 items-start">
              <div className="w-24 h-36 rounded-[5px] overflow-hidden shrink-0 flex items-center justify-center shadow-md"
                style={{ backgroundColor: 'var(--color-surface-variant)' }}
              >
                {coverUrl ? (
                  <img src={coverUrl} alt={title} className="w-full h-full object-cover" />
                ) : (
                  <BookOpen size={28} style={{ color: 'var(--color-primary)' }} />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <label className="block text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-on-surface-variant)' }}>Cover Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={coverUrl}
                    onChange={e => setCoverUrl(e.target.value)}
                    placeholder="Paste image URL..."
                    className="flex-1 rounded-2xl px-4 py-2.5 text-sm outline-none focus:ring-2"
                    style={{ ...inputStyle, '--tw-ring-color': 'var(--color-primary)' } as React.CSSProperties}
                  />
                  <button className="p-2.5 rounded-2xl transition-colors"
                    style={{ backgroundColor: 'var(--color-surface)' }}
                    title="Paste URL"
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-surface-variant)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--color-surface)'}
                  >
                    <ImagePlus size={16} style={{ color: 'var(--color-primary)' }} />
                  </button>
                </div>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-on-surface-variant)' }}>Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full rounded-2xl px-4 py-3 outline-none focus:ring-2"
                style={{ ...inputStyle, '--tw-ring-color': 'var(--color-primary)' } as React.CSSProperties}
              />
            </div>

            {/* Author */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-on-surface-variant)' }}>Author</label>
              <input
                type="text"
                value={author}
                onChange={e => setAuthor(e.target.value)}
                className="w-full rounded-2xl px-4 py-3 outline-none focus:ring-2"
                style={{ ...inputStyle, '--tw-ring-color': 'var(--color-primary)' } as React.CSSProperties}
              />
            </div>

            {/* Pages + Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-on-surface-variant)' }}>Pages</label>
                <input
                  type="number"
                  value={totalPages || ''}
                  onChange={e => setTotalPages(parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full rounded-2xl px-4 py-3 outline-none focus:ring-2"
                  style={{ ...inputStyle, '--tw-ring-color': 'var(--color-primary)' } as React.CSSProperties}
                />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-on-surface-variant)' }}>Publish Date</label>
                <input
                  type="text"
                  value={publishDate}
                  onChange={e => setPublishDate(e.target.value)}
                  placeholder="e.g. 2020"
                  className="w-full rounded-2xl px-4 py-3 outline-none focus:ring-2"
                  style={{ ...inputStyle, '--tw-ring-color': 'var(--color-primary)' } as React.CSSProperties}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-on-surface-variant)' }}>Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                placeholder="Book description..."
                className="w-full rounded-2xl px-4 py-3 outline-none focus:ring-2 resize-none"
                style={{ ...inputStyle, '--tw-ring-color': 'var(--color-primary)' } as React.CSSProperties}
              />
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-on-surface-variant)' }}>Personal Note</label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={2}
                placeholder="Add a personal note..."
                className="w-full rounded-2xl px-4 py-3 outline-none focus:ring-2 resize-none"
                style={{ ...inputStyle, '--tw-ring-color': 'var(--color-primary)' } as React.CSSProperties}
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--color-on-surface-variant)' }}>Add to</label>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setStatus(opt.id)}
                    className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                    style={{
                      backgroundColor: status === opt.id ? 'var(--color-primary)' : 'var(--color-surface)',
                      color: status === opt.id ? 'var(--color-on-primary)' : 'var(--color-on-surface-variant)',
                      boxShadow: status === opt.id ? 'var(--shadow-card)' : 'none',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Save button */}
        {!loading && (
          <div className="p-6 pt-4 border-t" style={{ borderColor: 'var(--color-surface-dim)' }}>
            <button
              onClick={handleSave}
              disabled={!title.trim()}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
                boxShadow: 'var(--shadow-fab)',
              }}
            >
              <Save size={18} />
              Save to Library
            </button>
          </div>
        )}
      </div>
    </div>
  );
}