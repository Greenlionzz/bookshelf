import { useState, useEffect } from 'react';
import { ReadingStatus } from '@/types/book';
import { useBooks } from '@/context/BookContext';
import { X, BookOpen, Save, ImagePlus, BookPlus } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSaved: () => void;
}

const statusOptions: { id: ReadingStatus; label: string }[] = [
  { id: 'currently-reading', label: 'Currently Reading' },
  { id: 'for-later', label: 'For Later' },
  { id: 'finished', label: 'Finished' },
  { id: 'paused', label: 'Paused' },
];

export default function ManualAddModal({ onClose, onSaved }: Props) {
  const { addBook, activeTab } = useBooks();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [totalPages, setTotalPages] = useState(0);
  const [publishDate, setPublishDate] = useState('');
  const [description, setDescription] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<ReadingStatus>(activeTab);
  
  // 👈 We removed the 'error' state and replaced it with a 'isValidating' check
  const [imgKey, setImgKey] = useState(0); 

  const handleSave = () => {
    if (!title.trim()) return;
    addBook({
      title: title.trim(),
      author: author.trim() || 'Unknown Author',
      coverUrl: coverUrl.trim(),
      totalPages,
      publishDate: publishDate.trim(),
      description: description.trim(),
      note: note.trim(),
      status,
      openLibraryKey: undefined,
    });
    onSaved();
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setCoverUrl(text);
      setImgKey(prev => prev + 1); // Force image refresh
    } catch (err) {
      console.error("Failed to read clipboard");
    }
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
        <div className="flex items-center justify-between p-6 pb-4 border-b" style={{ borderColor: 'var(--color-surface-dim)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-surface-variant)' }}>
              <BookPlus size={18} style={{ color: 'var(--color-primary)' }} />
            </div>
            <h2 className="text-xl font-semibold" style={{ color: 'var(--color-on-surface)' }}>Add Book Manually</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full transition-colors" style={{ color: 'var(--color-on-surface-variant)' }}>
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="flex gap-4 items-start">
            <div className="w-24 h-36 rounded-[5px] overflow-hidden shrink-0 flex items-center justify-center shadow-md" style={{ backgroundColor: 'var(--color-surface-variant)' }}>
              {/* 👈 Improved Logic: Only show icon if URL is tiny/empty */}
              {coverUrl.length > 5 ? (
                <img
                  key={imgKey}
                  src={coverUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // If it fails, we just hide the broken image nicely
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <BookOpen size={28} style={{ color: 'var(--color-primary)' }} />
                  <span className="text-[10px] font-medium" style={{ color: 'var(--color-primary)' }}>No Cover</span>
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <label className="block text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-on-surface-variant)' }}>Cover Image URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={coverUrl}
                  onChange={e => setCoverUrl(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 rounded-2xl px-4 py-2.5 text-sm outline-none focus:ring-2"
                  style={{ ...inputStyle, '--tw-ring-color': 'var(--color-primary)' } as React.CSSProperties}
                />
                <button
                  onClick={handlePaste}
                  className="p-2.5 rounded-2xl transition-colors"
                  style={{ backgroundColor: 'var(--color-surface)' }}
                >
                  <ImagePlus size={16} style={{ color: 'var(--color-primary)' }} />
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-on-surface-variant)' }}>Title *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full rounded-2xl px-4 py-3 outline-none focus:ring-2"
              style={{ ...inputStyle, '--tw-ring-color': 'var(--color-primary)' } as React.CSSProperties}
            />
          </div>

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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-on-surface-variant)' }}>Pages</label>
              <input
                type="number"
                value={totalPages || ''}
                onChange={e => setTotalPages(parseInt(e.target.value) || 0)}
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
                className="w-full rounded-2xl px-4 py-3 outline-none focus:ring-2"
                style={{ ...inputStyle, '--tw-ring-color': 'var(--color-primary)' } as React.CSSProperties}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-on-surface-variant)' }}>Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-2xl px-4 py-3 outline-none focus:ring-2 resize-none"
              style={{ ...inputStyle, '--tw-ring-color': 'var(--color-primary)' } as React.CSSProperties}
            />
          </div>

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
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 pt-4 border-t" style={{ borderColor: 'var(--color-surface-dim)' }}>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full font-medium transition-colors disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)', boxShadow: 'var(--shadow-fab)' }}
          >
            <Save size={18} />
            Save to Library
          </button>
        </div>
      </div>
    </div>
  );
}