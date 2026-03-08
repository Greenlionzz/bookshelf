import { useState, useRef, useEffect } from 'react';
import { Plus, Search, PenLine } from 'lucide-react';

interface Props {
  onSearchClick: () => void;
  onManualClick: () => void;
}

export default function FAB({ onSearchClick, onManualClick }: Props) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-3">
      {/* Popup menu */}
      <div
        className={`flex flex-col gap-2 transition-all duration-200 origin-bottom-right ${
          open
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-90 translate-y-2 pointer-events-none'
        }`}
      >
        {/* Search OpenLibrary option */}
        <button
          onClick={() => {
            setOpen(false);
            onSearchClick();
          }}
          className="flex items-center gap-3 pl-4 pr-5 py-3 rounded-2xl border transition-all duration-150 group whitespace-nowrap"
          style={{
            backgroundColor: 'var(--color-bg)',
            borderColor: 'var(--color-surface-dim)',
            boxShadow: 'var(--shadow-elevated)',
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-surface)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--color-bg)'}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
            style={{ backgroundColor: 'var(--color-surface-variant)' }}
          >
            <Search size={18} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold" style={{ color: 'var(--color-on-surface)' }}>Search OpenLibrary</p>
            <p className="text-[11px]" style={{ color: 'var(--color-outline)' }}>Find and import book details</p>
          </div>
        </button>

        {/* Add Manually option */}
        <button
          onClick={() => {
            setOpen(false);
            onManualClick();
          }}
          className="flex items-center gap-3 pl-4 pr-5 py-3 rounded-2xl border transition-all duration-150 group whitespace-nowrap"
          style={{
            backgroundColor: 'var(--color-bg)',
            borderColor: 'var(--color-surface-dim)',
            boxShadow: 'var(--shadow-elevated)',
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-surface)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--color-bg)'}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
            style={{ backgroundColor: 'var(--color-surface-variant)' }}
          >
            <PenLine size={18} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold" style={{ color: 'var(--color-on-surface)' }}>Add Manually</p>
            <p className="text-[11px]" style={{ color: 'var(--color-outline)' }}>Enter book details yourself</p>
          </div>
        </button>
      </div>

      {/* Main FAB button */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className={`w-14 h-14 rounded-2xl transition-all duration-200 flex items-center justify-center active:scale-95 sm:w-16 sm:h-16 sm:rounded-[20px] ${
          open ? 'rotate-45' : 'rotate-0'
        }`}
        style={{
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-on-primary)',
          boxShadow: 'var(--shadow-fab)',
        }}
        title="Add a book"
      >
        <Plus size={28} />
      </button>
    </div>
  );
}
