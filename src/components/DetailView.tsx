import { useState, useEffect, useRef } from 'react';
import { Book, ReadingStatus } from '@/types/book';
import { useBooks } from '@/context/BookContext';
import { X, BookOpen, Trash2, Edit3, Check, Minus, Plus, Settings2 } from 'lucide-react';
import { useImageColor, parseRgba } from '@/hooks/useImageColor';

interface Props {
  book: Book;
  onClose: () => void;
  onEdit: (book: Book) => void; // 👈 Wired up
}

const statusOptions: { id: ReadingStatus; label: string; activeColor: string }[] = [
  { id: 'currently-reading', label: 'Currently Reading', activeColor: 'var(--color-primary)' },
  { id: 'finished', label: 'Finished', activeColor: 'var(--color-success)' },
  { id: 'for-later', label: 'For Later', activeColor: 'var(--color-warning)' },
  { id: 'paused', label: 'Paused', activeColor: 'var(--color-muted)' },
];

export default function DetailView({ book: initialBook, onClose, onEdit }: Props) {
  const { updateBook, deleteBook, books, progressInputMode, darkMode } = useBooks();
  const [visible, setVisible] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingNote, setEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(initialBook.note);
  const [manualPageInput, setManualPageInput] = useState(String(initialBook.pagesRead));
  const [isManualInputFocused, setIsManualInputFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { colors, loading: colorsLoading } = useImageColor(initialBook.coverUrl);
  const book = books.find(b => b.id === initialBook.id) || initialBook;

  useEffect(() => {
    if (!isManualInputFocused) {
      setManualPageInput(String(book.pagesRead));
    }
  }, [book.pagesRead, isManualInputFocused]);

  useEffect(() => {
    const id1 = requestAnimationFrame(() => {
      const id2 = requestAnimationFrame(() => {
        setAnimateIn(true);
      });
      return () => cancelAnimationFrame(id2);
    });
    setVisible(true);
    return () => cancelAnimationFrame(id1);
  }, []);

  const handleClose = () => {
    setAnimateIn(false);
    setTimeout(() => {
      setVisible(false);
      onClose();
    }, 350);
  };

  const handleStatusChange = (status: ReadingStatus) => {
    updateBook(book.id, { ...book, status });
  };

  const handlePagesChange = (val: number) => {
    updateBook(book.id, { ...book, pagesRead: val });
  };

  const handleSaveNote = () => {
    updateBook(book.id, { ...book, note: noteText });
    setEditingNote(false);
  };

  const handleDelete = () => {
    deleteBook(book.id);
    handleClose();
  };

  const progressPercent = book.totalPages > 0 ? Math.round((book.pagesRead / book.totalPages) * 100) : 0;

  // Dynamic colors logic
  const { r: dr, g: dg, b: db } = parseRgba(colors.dominant);
  const { r: vr, g: vg, b: vb } = parseRgba(colors.vibrant);
  const { r: mr, g: mg, b: mb } = parseRgba(colors.muted);
  const { r: dmr, g: dmg, b: dmb } = parseRgba(colors.darkMuted);
  const { r: lvr, g: lvg, b: lvb } = parseRgba(colors.lightVibrant);

  const heroGradient = darkMode
    ? `linear-gradient(180deg, rgba(${dmr}, ${dmg}, ${dmb}, 0.7) 0%, rgba(${dr}, ${dg}, ${db}, 0.4) 40%, rgba(${mr}, ${mg}, ${mb}, 0.15) 75%, var(--color-bg) 100%)`
    : `linear-gradient(180deg, rgba(${vr}, ${vg}, ${vb}, 0.35) 0%, rgba(${dr}, ${dg}, ${db}, 0.2) 40%, rgba(${lvr}, ${lvg}, ${lvb}, 0.1) 75%, var(--color-bg) 100%)`;

  const panelBg = darkMode
    ? `linear-gradient(180deg, rgba(${dmr}, ${dmg}, ${dmb}, 0.12) 0%, var(--color-bg) 100%)`
    : `linear-gradient(180deg, rgba(${mr}, ${mg}, ${mb}, 0.08) 0%, var(--color-bg) 100%)`;

  const coverGlow = darkMode
    ? `0 0 60px 20px rgba(${vr}, ${vg}, ${vb}, 0.3), 0 0 120px 40px rgba(${dr}, ${dg}, ${db}, 0.15)`
    : `0 0 60px 20px rgba(${vr}, ${vg}, ${vb}, 0.25), 0 0 120px 40px rgba(${dr}, ${dg}, ${db}, 0.1)`;

  const accentColor = darkMode
    ? `rgba(${Math.min(lvr + 40, 255)}, ${Math.min(lvg + 40, 255)}, ${Math.min(lvb + 40, 255)}, 1)`
    : `rgba(${Math.max(dr - 20, 0)}, ${Math.max(dg - 20, 0)}, ${Math.max(db - 20, 0)}, 1)`;

  const tintedSurface = darkMode ? `rgba(${dmr}, ${dmg}, ${dmb}, 0.18)` : `rgba(${dr}, ${dg}, ${db}, 0.07)`;
  const tintedSurfaceStrong = darkMode ? `rgba(${dmr}, ${dmg}, ${dmb}, 0.28)` : `rgba(${dr}, ${dg}, ${db}, 0.12)`;

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={handleClose}>
      <div className="fixed inset-0 backdrop-blur-sm" style={{ backgroundColor: 'var(--color-overlay)', opacity: animateIn ? 1 : 0, transition: 'opacity 0.35s ease' }} />
      <div
        className="relative w-full max-w-lg h-full shadow-2xl z-10 flex flex-col"
        style={{ 
          backgroundColor: 'var(--color-bg)',
          transform: animateIn ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.35s cubic-bezier(0.4, 0.0, 0.2, 1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b relative z-10" style={{ borderColor: tintedSurfaceStrong }}>
          <h2 className="text-lg font-semibold truncate pr-2" style={{ color: 'var(--color-on-surface)' }}>Book Details</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(book)} // 👈 Triggers Edit Mode
              className="p-2 rounded-full transition-colors"
              style={{ color: accentColor }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = tintedSurfaceStrong}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Edit3 size={18} />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 rounded-full transition-colors"
              style={{ color: 'var(--color-error)' }}
            >
              <Trash2 size={18} />
            </button>
            <button onClick={handleClose} className="p-2 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="relative flex justify-center px-6 pt-8 pb-6" style={{ background: colorsLoading ? `var(--color-surface)` : heroGradient }}>
            <div className="relative z-10">
              <div className="w-44 h-64 rounded-[5px] overflow-hidden flex items-center justify-center" style={{ backgroundColor: 'var(--color-surface-variant)', boxShadow: coverGlow }}>
                {book.coverUrl ? (
                  <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                ) : (
                  <BookOpen size={40} style={{ color: 'var(--color-primary)' }} />
                )}
              </div>
            </div>
          </div>

          <div className="px-6 pb-6 space-y-5" style={{ background: panelBg }}>
            <div className="text-center pt-4">
              <h3 className="text-2xl font-bold" style={{ color: 'var(--color-on-surface)' }}>{book.title}</h3>
              <p className="mt-1" style={{ color: 'var(--color-on-surface-variant)' }}>{book.author}</p>
            </div>

            {/* Reading Progress Logic */}
            {book.status === 'currently-reading' && (
              book.totalPages > 0 ? (
                <div className="rounded-[20px] p-5" style={{ backgroundColor: tintedSurface }}>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-medium uppercase">Progress</label>
                    <span className="text-sm font-semibold" style={{ color: accentColor }}>{progressPercent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full mb-4 bg-black/10 overflow-hidden">
                    <div className="h-full transition-all" style={{ width: `${progressPercent}%`, backgroundColor: accentColor }} />
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={book.totalPages}
                    value={book.pagesRead}
                    onChange={e => handlePagesChange(parseInt(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between mt-2 text-xs opacity-60">
                    <span>Page {book.pagesRead}</span>
                    <span>of {book.totalPages}</span>
                  </div>
                </div>
              ) : (
                /* Fallback for books with 0 pages */
                <button 
                  onClick={() => onEdit(book)}
                  className="w-full p-6 rounded-[20px] border-2 border-dashed flex flex-col items-center gap-2"
                  style={{ borderColor: tintedSurfaceStrong, color: accentColor }}
                >
                  <Settings2 size={24} />
                  <span className="font-medium">Add total pages to track progress</span>
                </button>
              )
            )}

            {/* Description & Notes */}
            {book.description && (
              <div className="rounded-2xl p-4" style={{ backgroundColor: tintedSurface }}>
                <label className="block text-xs font-bold uppercase mb-2 opacity-50">Description</label>
                <p className="text-sm leading-relaxed">{book.description}</p>
              </div>
            )}

            <div className="rounded-2xl p-4" style={{ backgroundColor: tintedSurface }}>
               <div className="flex justify-between items-center mb-2">
                 <label className="text-xs font-bold uppercase opacity-50">Personal Note</label>
                 <button onClick={() => setEditingNote(true)}><Edit3 size={14} /></button>
               </div>
               {editingNote ? (
                 <textarea 
                    value={noteText} 
                    onChange={e => setNoteText(e.target.value)}
                    onBlur={handleSaveNote}
                    autoFocus
                    className="w-full bg-transparent outline-none text-sm resize-none"
                 />
               ) : (
                 <p className="text-sm italic opacity-80">{book.note || 'No notes yet...'}</p>
               )}
            </div>
          </div>
        </div>

        {/* Delete Confirmation Overlay */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 z-30 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-900 rounded-[28px] p-6 w-full max-w-xs shadow-2xl">
              <h3 className="text-lg font-bold mb-2">Delete Book?</h3>
              <p className="text-sm opacity-70 mb-6">This will permanently remove the book from your library.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2 rounded-full font-medium bg-zinc-100 dark:bg-zinc-800">Cancel</button>
                <button onClick={handleDelete} className="flex-1 py-2 rounded-full font-medium bg-red-500 text-white">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}