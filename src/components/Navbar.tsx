import { useBooks } from '@/context/BookContext';
import { ReadingStatus } from '@/types/book';
import { BookOpen, CheckCircle, Clock, Pause, Settings } from 'lucide-react';
import { useState } from 'react';
import SettingsMenu from './SettingsMenu';

const tabs: { id: ReadingStatus; label: string; icon: React.ReactNode }[] = [
  { id: 'currently-reading', label: 'Currently Reading', icon: <BookOpen size={18} /> },
  { id: 'finished', label: 'Finished', icon: <CheckCircle size={18} /> },
  { id: 'for-later', label: 'For Later', icon: <Clock size={18} /> },
  { id: 'paused', label: 'Paused', icon: <Pause size={18} /> },
];

export default function Navbar() {
  const { activeTab, setActiveTab } = useBooks();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <nav
        className="sticky top-0 z-40 border-b shadow-sm theme-transition"
        style={{
          backgroundColor: 'var(--color-bg)',
          borderColor: 'var(--color-surface-dim)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div
                className="w-9 h-9 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                <BookOpen size={18} style={{ color: 'var(--color-on-primary)' }} />
              </div>
              <h1 className="text-xl font-semibold hidden sm:block" style={{ color: 'var(--color-on-surface)' }}>
                BookTracker
              </h1>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-full transition-colors"
              style={{ color: 'var(--color-on-surface-variant)' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-surface-variant)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              title="Settings"
            >
              <Settings size={22} />
            </button>
          </div>
        </div>
        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-2 overflow-x-auto scrollbar-hide">
          <div className="flex min-w-max">
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative flex items-center justify-center gap-2 px-4 sm:px-6 py-3 text-sm font-medium transition-colors flex-1 min-w-[120px]"
                  style={{
                    color: isActive ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) e.currentTarget.style.color = 'var(--color-primary)';
                  }}
                  onMouseLeave={e => {
                    if (!isActive) e.currentTarget.style.color = 'var(--color-on-surface-variant)';
                  }}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden text-xs">{tab.label.split(' ').slice(0, 2).join(' ')}</span>
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-[3px] rounded-t-full"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
      {showSettings && <SettingsMenu onClose={() => setShowSettings(false)} />}
    </>
  );
}
