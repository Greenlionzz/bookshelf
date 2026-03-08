import { useState, useEffect, useRef } from 'react';
import { Book, ReadingStatus } from '@/types/book';
import { useBooks } from '@/context/BookContext';
import { X, BookOpen, Trash2, Edit3, Check, Minus, Plus, Settings2 } from 'lucide-react';
import { useImageColor, parseRgba } from '@/hooks/useImageColor';

interface Props {
  book: Book;
  onClose: () => void;
  onEdit: (book: Book) => void; // 👈 Wired up properly
}

const statusOptions: { id: ReadingStatus; label: string; activeColor: string }[] = [
  { id: 'currently-reading', label: 'Currently Reading', activeColor: 'var(--color-primary)' },
  { id: 'finished', label: 'Finished', activeColor: 'var(--color-success)' },
  { id: 'for-later', label: 'For Later', activeColor: 'var(--color-warning)' },
  { id: 'paused', label: 'Paused', activeColor: 'var(--color-muted)' },
];

// Destructure onEdit here so we can actually use it!
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
  
  // 👈 The magic state to handle stubborn images
  const [corsError, setCorsError] = useState(false);

  // Keep in sync with store
  const book = books.find(b => b.id === initialBook.id) || initialBook;

  // Extract colors from the book cover
  const { colors, loading: colorsLoading } = useImageColor(book.coverUrl);

  // Keep manual input in sync when book updates externally
  useEffect(() => {
    if (!isManualInputFocused) {
      setManualPageInput(String(book.pagesRead));
    }
  }, [book.pagesRead, isManualInputFocused]);

  // Two-phase mount animation
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
    updateBook({ ...book, status });
  };

  const handlePagesChange = (val: number) => {
    updateBook({ ...book, pagesRead: val });
  };

  const handleSaveNote = () => {
    updateBook({ ...book, note: noteText });
    setEditingNote(false);
  };

  const handleDelete = () => {
    deleteBook(book.id);
    handleClose();
  };

  const progressPercent = book.totalPages > 0 ? Math.round((book.pagesRead / book.totalPages) * 100) : 0;

  // Generate dynamic gradient colors based on extracted cover colors
  const { r: dr, g: dg, b: db } = parseRgba(colors.dominant || 'rgba(0,0,0,0.1)');
  const { r: vr, g: vg, b: vb } = parseRgba(colors.vibrant || 'rgba(0,0,0,0.1)');
  const { r: mr, g: mg, b: mb } = parseRgba(colors.muted || 'rgba(0,0,0,0.1)');
  const { r: dmr, g: dmg, b: dmb } = parseRgba(colors.darkMuted || 'rgba(0,0,0,0.1)');
  const { r: lvr, g: lvg, b: lvb } = parseRgba(colors.lightVibrant || 'rgba(0,0,0,0.1)');

  // Build gradient backgrounds with safety fallback
  const heroGradient = colorsLoading || !colors.dominant
    ? `var(--color-surface-variant)`
    : darkMode
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
      <div
        className="fixed inset-0 backdrop-blur-sm"
        style={{
          backgroundColor: 'var(--color-overlay)',
          opacity: animateIn ? 1 : 0,
          transition: 'opacity 0.35s ease',
        }}
      />
      
      <div
        className="relative w-full max-w-lg h-full shadow-2xl z-10 flex flex-col"
        style={{ 
          backgroundColor: 'var(--color-bg)',
          transform: animateIn ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.35s cubic-bezier(0.4, 0.0, 0.2, 1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between p-4 border-b relative z-10"
          style={{
            borderColor: tintedSurfaceStrong,
            background: darkMode ? `rgba(${dmr}, ${dmg}, ${dmb}, 0.25)` : `rgba(${dr}, ${dg}, ${db}, 0.06)`,
          }}
        >
          <h2 className="text-lg font-semibold truncate pr-2" style={{ color: 'var(--color-on-surface)' }}>Book Details</h2>
          <div className="flex items-center gap-1">
            {/* The Edit Button */}
            <button
              onClick={() => onEdit(book)}
              className="p-2 rounded-full transition-colors"
              style={{ color: accentColor }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = tintedSurfaceStrong}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              title="Edit book info"
            >
              <Edit3 size={18} />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 rounded-full transition-colors"
              style={{ color: 'var(--color-error)' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-error-bg)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              title="Delete book"
            >
              <Trash2 size={18} />
            </button>
            <button onClick={handleClose} className="p-2 rounded-full transition-colors"
              style={{ color: 'var(--color-on-surface-variant)' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = tintedSurfaceStrong}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div
            className="relative flex justify-center px-6 pt-8 pb-6 transition-all duration-700"
            style={{
              background: colorsLoading
                ? `linear-gradient(to bottom, var(--color-gradient-from), var(--color-gradient-to))`
                : heroGradient,
            }}
          >
            {!colorsLoading && (
              <>
                <div
                  className="absolute top-4 left-8 w-32 h-32 rounded-full blur-3xl opacity-40 transition-opacity duration-700"
                  style={{ backgroundColor: `rgba(${vr}, ${vg}, ${vb}, ${darkMode ? 0.3 : 0.2})` }}
                />
                <div
                  className="absolute bottom-8 right-6 w-40 h-40 rounded-full blur-3xl opacity-30 transition-opacity duration-700"
                  style={{ backgroundColor: `rgba(${mr}, ${mg}, ${mb}, ${darkMode ? 0.25 : 0.15})` }}
                />
                <div
                  className="absolute top-12 right-12 w-20 h-20 rounded-full blur-2xl opacity-25 transition-opacity duration-700"
                  style={{ backgroundColor: `rgba(${lvr}, ${lvg}, ${lvb}, ${darkMode ? 0.35 : 0.25})` }}
                />
              </>
            )}
            
            <div className="relative z-10">
              <div
                className="w-44 h-64 rounded-[5px] overflow-hidden flex items-center justify-center transition-shadow duration-700"
                style={{
                  backgroundColor: 'var(--color-surface-variant)',
                  boxShadow: colorsLoading
                    ? '0 8px 32px rgba(0,0,0,0.2)'
                    : `${coverGlow}, 0 8px 32px rgba(0,0,0,${darkMode ? 0.5 : 0.2})`,
                }}
              >
                {/* 👈 The Magic Fallback Image Tag */}
                {book.coverUrl ? (
                  <img 
                    key={corsError ? 'no-cors' : 'with-cors'}
                    src={book.coverUrl} 
                    alt={book.title} 
                    className="w-full h-full object-cover" 
                    crossOrigin={corsError ? undefined : "anonymous"}
                    onError={(e) => {
                      if (!corsError) {
                        setCorsError(true);
                      } else {
                        e.currentTarget.style.display = 'none';
                      }
                    }}
                  />
                ) : (
                  <BookOpen size={40} style={{ color: 'var(--color-primary)' }} />
                )}
              </div>
            </div>
          </div>

          <div
            className="px-6 pb-6 space-y-5 transition-all duration-700"
            style={{ background: panelBg }}
          >
            <div className="text-center pt-4">
              <h3 className="text-2xl font-bold" style={{ color: 'var(--color-on-surface)' }}>{book.title}</h3>
              <p className="mt-1" style={{ color: 'var(--color-on-surface-variant)' }}>{book.author}</p>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {book.totalPages > 0 && (
                <span className="px-4 py-1.5 rounded-full text-sm"
                  style={{ backgroundColor: tintedSurface, color: 'var(--color-on-surface-variant)' }}
                >
                  {book.totalPages} pages
                </span>
              )}
              {book.publishDate && (
                <span className="px-4 py-1.5 rounded-full text-sm"
                  style={{ backgroundColor: tintedSurface, color: 'var(--color-on-surface-variant)' }}
                >
                  {book.publishDate}
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider mb-2"
                style={{ color: 'var(--color-on-surface-variant)' }}
              >Status</label>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => handleStatusChange(opt.id)}
                    className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                    style={{
                      backgroundColor: book.status === opt.id ? opt.activeColor : tintedSurface,
                      color: book.status === opt.id ? '#FFFFFF' : 'var(--color-on-surface-variant)',
                      boxShadow: book.status === opt.id ? 'var(--shadow-card)' : 'none',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reading Progress */}
            {book.status === 'currently-reading' && (
              book.totalPages > 0 ? (
                <div className="rounded-[20px] p-5" style={{ backgroundColor: tintedSurface }}>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-medium uppercase tracking-wider"
                      style={{ color: 'var(--color-on-surface-variant)' }}
                    >Reading Progress</label>
                    <span className="text-sm font-semibold" style={{ color: accentColor }}>{progressPercent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full mb-4 overflow-hidden" style={{ backgroundColor: tintedSurfaceStrong }}>
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%`, backgroundColor: accentColor }}
                    />
                  </div>

                  {progressInputMode === 'slider' ? (
                    <>
                      <input
                        type="range"
                        min={0}
                        max={book.totalPages}
                        value={book.pagesRead}
                        onChange={e => {
                          const val = parseInt(e.target.value);
                          handlePagesChange(val);
                          setManualPageInput(String(val));
                        }}
                        className="w-full h-2 rounded-full appearance-none cursor-pointer
                          [&::-webkit-slider-thumb]:appearance-none
                          [&::-webkit-slider-thumb]:h-5
                          [&::-webkit-slider-thumb]:w-5
                          [&::-webkit-slider-thumb]:rounded-full
                          [&::-webkit-slider-thumb]:shadow-lg
                          [&::-webkit-slider-thumb]:cursor-pointer
                          [&::-moz-range-thumb]:h-5
                          [&::-moz-range-thumb]:w-5
                          [&::-moz-range-thumb]:rounded-full
                          [&::-moz-range-thumb]:border-0
                          [&::-moz-range-thumb]:cursor-pointer
                        "
                        style={{
                          background: `linear-gradient(to right, ${accentColor} ${progressPercent}%, ${tintedSurfaceStrong} ${progressPercent}%)`,
                        }}
                      />
                      <style>{`
                        input[type="range"]::-webkit-slider-thumb { background-color: ${accentColor} !important; }
                        input[type="range"]::-moz-range-thumb { background-color: ${accentColor} !important; }
                      `}</style>
                      <div className="flex justify-between mt-2">
                        <span className="text-xs" style={{ color: 'var(--color-outline)' }}>Page {book.pagesRead}</span>
                        <span className="text-xs" style={{ color: 'var(--color-outline)' }}>of {book.totalPages}</span>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            const newVal = Math.max(0, book.pagesRead - 1);
                            handlePagesChange(newVal);
                            setManualPageInput(String(newVal));
                          }}
                          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 flex-shrink-0"
                          style={{ backgroundColor: tintedSurfaceStrong, color: 'var(--color-on-surface)' }}
                          disabled={book.pagesRead <= 0}
                        >
                          <Minus size={18} />
                        </button>
                        <div className="flex-1 relative">
                          <input
                            ref={inputRef}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={isManualInputFocused ? manualPageInput : String(book.pagesRead)}
                            onFocus={() => {
                              setIsManualInputFocused(true);
                              setManualPageInput(String(book.pagesRead));
                            }}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/[^0-9]/g, '');
                              setManualPageInput(raw);
                            }}
                            onBlur={() => {
                              setIsManualInputFocused(false);
                              const parsed = parseInt(manualPageInput) || 0;
                              const clamped = Math.min(Math.max(0, parsed), book.totalPages);
                              handlePagesChange(clamped);
                              setManualPageInput(String(clamped));
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                (e.target as HTMLInputElement).blur();
                              }
                            }}
                            className="w-full text-center text-2xl font-bold py-2 px-3 rounded-2xl outline-none transition-all border-2"
                            style={{
                              backgroundColor: tintedSurfaceStrong,
                              color: 'var(--color-on-surface)',
                              borderColor: isManualInputFocused ? accentColor : 'transparent',
                            }}
                          />
                          <div className="absolute -bottom-5 left-0 right-0 text-center">
                            <span className="text-xs" style={{ color: 'var(--color-outline)' }}>of {book.totalPages} pages</span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const newVal = Math.min(book.totalPages, book.pagesRead + 1);
                            handlePagesChange(newVal);
                            setManualPageInput(String(newVal));
                          }}
                          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 flex-shrink-0"
                          style={{ backgroundColor: tintedSurfaceStrong, color: 'var(--color-on-surface)' }}
                          disabled={book.pagesRead >= book.totalPages}
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                      <div className="flex gap-2 mt-6 pt-1">
                        {[
                          { label: 'Start', value: 0 },
                          { label: '25%', value: Math.round(book.totalPages * 0.25) },
                          { label: '50%', value: Math.round(book.totalPages * 0.5) },
                          { label: '75%', value: Math.round(book.totalPages * 0.75) },
                          { label: 'Done', value: book.totalPages },
                        ].map((preset) => (
                          <button
                            key={preset.label}
                            onClick={() => {
                              handlePagesChange(preset.value);
                              setManualPageInput(String(preset.value));
                            }}
                            className="flex-1 py-1.5 rounded-xl text-xs font-medium transition-all active:scale-95"
                            style={{
                              backgroundColor: book.pagesRead === preset.value ? accentColor : tintedSurfaceStrong,
                              color: book.pagesRead === preset.value ? '#FFFFFF' : 'var(--color-on-surface-variant)',
                            }}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => onEdit(book)}
                  className="w-full p-6 rounded-[20px] border-2 border-dashed flex flex-col items-center gap-2 mt-4"
                  style={{ borderColor: tintedSurfaceStrong, color: accentColor }}
                >
                  <Settings2 size={24} />
                  <span className="font-medium">Add total pages to track progress</span>
                </button>
              )
            )}

            {book.description && (
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider mb-2"
                  style={{ color: 'var(--color-on-surface-variant)' }}
                >Description</label>
                <p className="text-sm leading-relaxed rounded-2xl p-4"
                  style={{ backgroundColor: tintedSurface, color: 'var(--color-on-surface)' }}
                >
                  {book.description}
                </p>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--color-on-surface-variant)' }}
                >Personal Note</label>
                {!editingNote && (
                  <button
                    onClick={() => { setNoteText(book.note); setEditingNote(true); }}
                    className="p-1 rounded-full transition-colors"
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = tintedSurfaceStrong}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Edit3 size={14} style={{ color: accentColor }} />
                  </button>
                )}
              </div>
              {editingNote ? (
                <div className="space-y-2">
                  <textarea
                    value={noteText}
                    onChange={e => setNoteText(e.target.value)}
                    rows={3}
                    autoFocus
                    placeholder="Write your thoughts..."
                    className="w-full rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 resize-none"
                    style={{
                      backgroundColor: tintedSurface,
                      color: 'var(--color-on-surface)',
                      '--tw-ring-color': accentColor,
                    } as React.CSSProperties}
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setEditingNote(false)}
                      className="px-4 py-2 rounded-full text-sm transition-colors"
                      style={{ color: 'var(--color-on-surface-variant)' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = tintedSurface}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveNote}
                      className="flex items-center gap-1 px-4 py-2 rounded-full text-sm transition-colors"
                      style={{
                        backgroundColor: accentColor,
                        color: '#FFFFFF',
                      }}
                    >
                      <Check size={14} />
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm leading-relaxed rounded-2xl p-4"
                  style={{
                    backgroundColor: tintedSurface,
                    color: book.note ? 'var(--color-on-surface)' : 'var(--color-outline)',
                    fontStyle: book.note ? 'normal' : 'italic',
                  }}
                >
                  {book.note || 'No note added yet. Tap the edit icon to add one.'}
                </p>
              )}
            </div>
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-6"
            style={{ backgroundColor: 'var(--color-overlay)' }}
            onClick={() => setShowDeleteConfirm(false)}
          >
            <div className="rounded-[28px] p-6 shadow-2xl max-w-sm w-full animate-in"
              style={{ backgroundColor: 'var(--color-bg)' }}
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-on-surface)' }}>Delete Book?</h3>
              <p className="text-sm mb-6" style={{ color: 'var(--color-on-surface-variant)' }}>
                Are you sure you want to remove "{book.title}" from your library? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-5 py-2.5 rounded-full text-sm font-medium transition-colors"
                  style={{ color: 'var(--color-on-surface-variant)' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-surface)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-5 py-2.5 rounded-full text-sm font-medium text-white transition-colors"
                  style={{ backgroundColor: 'var(--color-error)' }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}