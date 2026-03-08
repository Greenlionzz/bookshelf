import { useBooks } from '@/context/BookContext';
import { Book } from '@/types/book';
import { BookOpen, CheckCircle, Clock, Pause } from 'lucide-react';
import { useRef, useEffect, useState, useMemo } from 'react';

interface Props {
  onBookClick: (book: Book) => void;
}

const emptyMessages: Record<string, { icon: React.ReactNode; title: string; subtitle: string }> = {
  'currently-reading': {
    icon: <BookOpen size={48} />,
    title: 'No books being read',
    subtitle: 'Tap the + button to add a book you\'re currently reading',
  },
  'finished': {
    icon: <CheckCircle size={48} />,
    title: 'No finished books yet',
    subtitle: 'Books you complete will appear here',
  },
  'for-later': {
    icon: <Clock size={48} />,
    title: 'Your reading list is empty',
    subtitle: 'Save books to read later',
  },
  'paused': {
    icon: <Pause size={48} />,
    title: 'No paused books',
    subtitle: 'Paused books will show up here',
  },
};

// Shelf plank height and configuration per cover size
const shelfConfig: Record<string, { shelfHeight: number; shelfShadow: number; gap: number }> = {
  small: { shelfHeight: 14, shelfShadow: 8, gap: 12 },
  medium: { shelfHeight: 16, shelfShadow: 10, gap: 16 },
  large: { shelfHeight: 18, shelfShadow: 12, gap: 20 },
};

export default function BookGrid({ onBookClick }: Props) {
  const { getFilteredBooks, coverSize, activeTab, darkMode } = useBooks();
  const books = getFilteredBooks();
  const gridRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(4);

  // Grid column counts per breakpoint per cover size
  const columnBreakpoints: Record<string, number[]> = {
    small:  [4, 5, 6, 8, 10],   // base, sm, md, lg, xl
    medium: [3, 4, 5, 6, 7],
    large:  [2, 3, 4, 5, 6],
  };

  const gridClasses: Record<string, string> = {
    small: 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10',
    medium: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7',
    large: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
  };

  // Detect the actual number of columns in the grid
  useEffect(() => {
    const detectColumns = () => {
      const width = window.innerWidth;
      const bp = columnBreakpoints[coverSize];
      if (width >= 1280) setColumns(bp[4]);
      else if (width >= 1024) setColumns(bp[3]);
      else if (width >= 768) setColumns(bp[2]);
      else if (width >= 640) setColumns(bp[1]);
      else setColumns(bp[0]);
    };
    detectColumns();
    window.addEventListener('resize', detectColumns);
    return () => window.removeEventListener('resize', detectColumns);
  }, [coverSize]);

  // Organize books into rows for shelf rendering
  const rows = useMemo(() => {
    const result: Book[][] = [];
    for (let i = 0; i < books.length; i += columns) {
      result.push(books.slice(i, i + columns));
    }
    return result;
  }, [books, columns]);

  const config = shelfConfig[coverSize];

  if (books.length === 0) {
    const empty = emptyMessages[activeTab];
    return (
      <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
        <div style={{ color: 'var(--color-primary)', opacity: 0.4 }}>{empty.icon}</div>
        <h3 className="mt-4 text-lg font-medium" style={{ color: 'var(--color-on-surface)' }}>{empty.title}</h3>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{empty.subtitle}</p>
      </div>
    );
  }

  // Wood colors
  const woodLight1 = darkMode ? '#3E3028' : '#C4956A';
  const woodLight2 = darkMode ? '#4A3830' : '#D4A574';
  const woodLight3 = darkMode ? '#352820' : '#B8885C';
  const woodDark1 = darkMode ? '#2E2218' : '#A07850';
  const woodEdge = darkMode ? '#5A4838' : '#D9AD80';
  const woodFront = darkMode ? '#4A3A2C' : '#C49A6C';
  const woodFrontLight = darkMode ? '#5C4A38' : '#D4A87A';
  const shelfShadowColor = darkMode ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.25)';
  const shelfTopHighlight = darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.4)';

  return (
    <div className="max-w-7xl mx-auto px-4 py-6" ref={gridRef}>
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="relative mb-0">
          {/* Books Row */}
          <div
            className={`grid ${gridClasses[coverSize]}`}
            style={{
              gap: `${config.gap}px`,
              paddingBottom: `${config.shelfHeight + 4}px`,
              position: 'relative',
              zIndex: 2,
            }}
          >
            {row.map(book => (
              <button
                key={book.id}
                onClick={() => onBookClick(book)}
                className="group relative aspect-[2/3] rounded-[5px] overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{
                  backgroundColor: 'var(--color-surface-variant)',
                  boxShadow: `0 4px 8px ${shelfShadowColor}`,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = `0 8px 20px ${shelfShadowColor}`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = `0 4px 8px ${shelfShadowColor}`;
                }}
              >
                {book.coverUrl ? (
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      const parent = (e.target as HTMLImageElement).parentElement;
                      if (parent) {
                        const fallback = parent.querySelector('.cover-fallback');
                        if (fallback) (fallback as HTMLElement).style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div
                  className={`cover-fallback absolute inset-0 ${book.coverUrl ? 'hidden' : 'flex'} flex-col items-center justify-center p-3`}
                  style={{
                    background: `linear-gradient(135deg, var(--color-surface-variant), var(--color-primary-container))`,
                  }}
                >
                  <BookOpen size={24} style={{ color: 'var(--color-primary)' }} className="mb-2" />
                  <p className="text-xs font-medium text-center line-clamp-3" style={{ color: 'var(--color-primary)' }}>{book.title}</p>
                </div>
                {/* Progress bar for currently reading */}
                {activeTab === 'currently-reading' && book.totalPages > 0 && (() => {
                  const progress = Math.round((book.pagesRead / book.totalPages) * 100);
                  const isComplete = progress >= 100;
                  return (
                    <div className="absolute bottom-0 left-0 right-0" style={{ pointerEvents: 'none' }}>
                      {/* Gradient overlay at bottom for readability */}
                      <div
                        className="absolute bottom-0 left-0 right-0"
                        style={{
                          height: '32px',
                          background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 60%, transparent 100%)',
                          borderRadius: '0 0 5px 5px',
                        }}
                      />
                      {/* Percentage text */}
                      <div
                        className="absolute bottom-[10px] left-0 right-0 flex items-center justify-center"
                        style={{ zIndex: 2 }}
                      >
                        <span
                          className="font-bold drop-shadow-md"
                          style={{
                            fontSize: coverSize === 'small' ? '8px' : coverSize === 'medium' ? '10px' : '12px',
                            color: '#FFFFFF',
                            letterSpacing: '0.5px',
                            textShadow: '0 1px 3px rgba(0,0,0,0.6)',
                          }}
                        >
                          {progress}%
                        </span>
                      </div>
                      {/* Track */}
                      <div
                        className="relative"
                        style={{
                          height: coverSize === 'small' ? '4px' : coverSize === 'medium' ? '5px' : '6px',
                          backgroundColor: 'rgba(255,255,255,0.25)',
                          borderRadius: '0 0 5px 5px',
                          overflow: 'hidden',
                        }}
                      >
                        {/* Filled bar */}
                        <div
                          className="absolute top-0 left-0 h-full transition-all duration-500 ease-out"
                          style={{
                            width: `${progress}%`,
                            background: isComplete
                              ? 'linear-gradient(90deg, #43A047, #66BB6A, #81C784)'
                              : 'linear-gradient(90deg, #7C4DFF, #B388FF, #D0BCFF)',
                            borderRadius: progress >= 100 ? '0 0 5px 5px' : '0 0 0 5px',
                            boxShadow: isComplete
                              ? '0 0 8px rgba(76, 175, 80, 0.6)'
                              : '0 0 8px rgba(124, 77, 255, 0.5)',
                          }}
                        />
                        {/* Shimmer effect */}
                        {progress > 0 && progress < 100 && (
                          <div
                            className="absolute top-0 left-0 h-full"
                            style={{
                              width: `${progress}%`,
                              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                              backgroundSize: '200% 100%',
                              animation: 'shimmer 2s infinite linear',
                            }}
                          />
                        )}
                      </div>
                    </div>
                  );
                })()}
              </button>
            ))}
            {/* Invisible placeholders for incomplete rows */}
            {row.length < columns && Array.from({ length: columns - row.length }).map((_, i) => (
              <div key={`placeholder-${i}`} className="aspect-[2/3] invisible" />
            ))}
          </div>

          {/* Shelf Plank — positioned at bottom of books */}
          <div
            className="relative"
            style={{
              marginTop: `-${config.shelfHeight + 4}px`,
              zIndex: 1,
            }}
          >
            {/* Shelf top surface */}
            <div
              style={{
                height: `${config.shelfHeight}px`,
                background: `linear-gradient(180deg, ${woodEdge} 0%, ${woodLight2} 30%, ${woodLight1} 60%, ${woodLight3} 100%)`,
                borderRadius: '0 0 3px 3px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Wood grain lines */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `
                    repeating-linear-gradient(
                      90deg,
                      transparent,
                      transparent 40px,
                      ${shelfTopHighlight} 40px,
                      ${shelfTopHighlight} 41px,
                      transparent 41px,
                      transparent 80px
                    ),
                    repeating-linear-gradient(
                      90deg,
                      transparent,
                      transparent 120px,
                      ${darkMode ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.05)'} 120px,
                      ${darkMode ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.05)'} 121px,
                      transparent 121px,
                      transparent 200px
                    )
                  `,
                  opacity: 0.7,
                }}
              />
              {/* Top highlight */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: shelfTopHighlight,
                }}
              />
            </div>

            {/* Shelf front face (3D depth) */}
            <div
              style={{
                height: `${Math.floor(config.shelfHeight * 0.6)}px`,
                background: `linear-gradient(180deg, ${woodFront} 0%, ${woodFrontLight} 40%, ${woodDark1} 100%)`,
                borderRadius: '0 0 4px 4px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Wood grain */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `
                    repeating-linear-gradient(
                      90deg,
                      transparent,
                      transparent 60px,
                      ${darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.1)'} 60px,
                      ${darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.1)'} 61px,
                      transparent 61px,
                      transparent 150px
                    )
                  `,
                }}
              />
            </div>

            {/* Shadow under shelf */}
            <div
              style={{
                height: `${config.shelfShadow}px`,
                background: `linear-gradient(180deg, ${shelfShadowColor} 0%, transparent 100%)`,
                borderRadius: '0 0 8px 8px',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
