import { useBooks } from '@/context/BookContext';
import { CoverSize, ProgressInputMode, ThemeColor } from '@/types/book';
import { THEME_PALETTES, THEME_KEYS } from '@/themes/palettes';
import { X, Sun, Moon, SlidersHorizontal, Hash, Check, Palette } from 'lucide-react';

const sizes: { id: CoverSize; label: string; desc: string }[] = [
  { id: 'small', label: 'Small', desc: 'More books per row' },
  { id: 'medium', label: 'Medium', desc: 'Balanced view' },
  { id: 'large', label: 'Large', desc: 'Detailed covers' },
];

const progressModes: { id: ProgressInputMode; label: string; desc: string; icon: typeof SlidersHorizontal }[] = [
  { id: 'slider', label: 'Slider', desc: 'Drag to set progress', icon: SlidersHorizontal },
  { id: 'manual', label: 'Manual Entry', desc: 'Type page number directly', icon: Hash },
];

interface Props {
  onClose: () => void;
}

export default function SettingsMenu({ onClose }: Props) {
  const { coverSize, setCoverSize, darkMode, setDarkMode, progressInputMode, setProgressInputMode, themeColor, setThemeColor } = useBooks();

  const currentPalette = THEME_PALETTES[themeColor];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 backdrop-blur-sm" style={{ backgroundColor: 'var(--color-overlay)' }} />
      <div
        className="relative rounded-[28px] shadow-2xl w-full max-w-sm z-10 animate-in max-h-[90vh] flex flex-col"
        style={{ backgroundColor: 'var(--color-bg)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 flex-shrink-0">
          <h2 className="text-2xl font-semibold" style={{ color: 'var(--color-on-surface)' }}>Settings</h2>
          <button onClick={onClose} className="p-2 rounded-full transition-colors" style={{ color: 'var(--color-on-surface-variant)' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-surface-variant)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto px-6 pb-6 flex-1">

          {/* Dark Mode Toggle */}
          <div className="mb-6">
            <h3 className="text-sm font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--color-on-surface-variant)' }}>Appearance</h3>
            <div
              className="flex items-center justify-between p-4 rounded-2xl transition-all cursor-pointer"
              style={{ backgroundColor: 'var(--color-surface)' }}
              onClick={() => setDarkMode(!darkMode)}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                  style={{ backgroundColor: 'var(--color-surface-variant)' }}
                >
                  {darkMode ? (
                    <Moon size={20} style={{ color: 'var(--color-primary)' }} />
                  ) : (
                    <Sun size={20} style={{ color: 'var(--color-primary)' }} />
                  )}
                </div>
                <div>
                  <p className="font-medium" style={{ color: 'var(--color-on-surface)' }}>Dark Mode</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-on-surface-variant)' }}>
                    {darkMode ? 'Dark theme active' : 'Light theme active'}
                  </p>
                </div>
              </div>
              {/* Toggle switch */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDarkMode(!darkMode);
                }}
                className="relative w-[52px] h-[32px] rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 flex-shrink-0"
                style={{
                  backgroundColor: darkMode ? 'var(--color-primary)' : 'var(--color-surface-dim)',
                }}
                aria-label="Toggle dark mode"
                role="switch"
                aria-checked={darkMode}
              >
                <span
                  className="absolute top-[4px] left-[4px] w-[24px] h-[24px] rounded-full shadow-md transition-all duration-300 flex items-center justify-center"
                  style={{
                    backgroundColor: darkMode ? 'var(--color-on-primary)' : 'var(--color-bg)',
                    transform: darkMode ? 'translateX(20px)' : 'translateX(0px)',
                  }}
                >
                  {darkMode ? (
                    <Moon size={14} style={{ color: 'var(--color-primary)' }} />
                  ) : (
                    <Sun size={14} style={{ color: 'var(--color-outline)' }} />
                  )}
                </span>
              </button>
            </div>
          </div>

          {/* Color Theme */}
          <div className="mb-6">
            <h3 className="text-sm font-medium uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: 'var(--color-on-surface-variant)' }}>
              <Palette size={14} />
              Color Theme
            </h3>

            {/* Current theme banner */}
            <div
              className="rounded-2xl p-3 mb-3 flex items-center gap-3 border"
              style={{
                backgroundColor: 'var(--color-primary-container)',
                borderColor: 'var(--color-primary)',
              }}
            >
              <div
                className="w-8 h-8 rounded-full flex-shrink-0 shadow-md"
                style={{ backgroundColor: currentPalette.swatch }}
              />
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-on-primary-container)' }}>
                  {currentPalette.label}
                </p>
                <p className="text-xs" style={{ color: 'var(--color-on-primary-container)', opacity: 0.7 }}>
                  Current theme
                </p>
              </div>
            </div>

            {/* Color swatches grid */}
            <div className="grid grid-cols-4 gap-3">
              {THEME_KEYS.map((key: ThemeColor) => {
                const palette = THEME_PALETTES[key];
                const isActive = themeColor === key;

                return (
                  <button
                    key={key}
                    onClick={() => setThemeColor(key)}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all duration-200 group"
                    style={{
                      backgroundColor: isActive ? 'var(--color-surface-variant)' : 'transparent',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                    }}
                    onMouseLeave={e => {
                      if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div
                      className="relative w-10 h-10 rounded-full transition-all duration-200 flex items-center justify-center"
                      style={{
                        backgroundColor: palette.swatch,
                        boxShadow: isActive
                          ? `0 0 0 3px var(--color-bg), 0 0 0 5px ${palette.swatch}`
                          : 'none',
                        transform: isActive ? 'scale(1.1)' : 'scale(1)',
                      }}
                    >
                      {isActive && (
                        <Check size={18} color="#FFFFFF" strokeWidth={3} />
                      )}
                    </div>
                    <span
                      className="text-[10px] font-medium leading-tight text-center"
                      style={{
                        color: isActive ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
                      }}
                    >
                      {palette.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Progress Tracking Mode */}
          <div className="mb-6">
            <h3 className="text-sm font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--color-on-surface-variant)' }}>Progress Tracking</h3>
            <div className="space-y-2">
              {progressModes.map(mode => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setProgressInputMode(mode.id)}
                    className="w-full flex items-center gap-3 p-4 rounded-2xl transition-all border-2"
                    style={{
                      backgroundColor: progressInputMode === mode.id ? 'var(--color-surface-variant)' : 'var(--color-surface)',
                      borderColor: progressInputMode === mode.id ? 'var(--color-primary)' : 'transparent',
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
                      style={{
                        backgroundColor: progressInputMode === mode.id ? 'var(--color-primary)' : 'var(--color-surface-dim)',
                      }}
                    >
                      <Icon size={20} style={{ color: progressInputMode === mode.id ? 'var(--color-on-primary)' : 'var(--color-on-surface-variant)' }} />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-medium" style={{ color: progressInputMode === mode.id ? 'var(--color-primary)' : 'var(--color-on-surface)' }}>
                        {mode.label}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-on-surface-variant)' }}>{mode.desc}</p>
                    </div>
                    <div
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                      style={{ borderColor: progressInputMode === mode.id ? 'var(--color-primary)' : 'var(--color-outline)' }}
                    >
                      {progressInputMode === mode.id && (
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cover Size */}
          <div>
            <h3 className="text-sm font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--color-on-surface-variant)' }}>Cover Size</h3>
            <div className="space-y-2">
              {sizes.map(size => (
                <button
                  key={size.id}
                  onClick={() => setCoverSize(size.id)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl transition-all border-2"
                  style={{
                    backgroundColor: coverSize === size.id ? 'var(--color-surface-variant)' : 'var(--color-surface)',
                    borderColor: coverSize === size.id ? 'var(--color-primary)' : 'transparent',
                  }}
                >
                  <div className="text-left">
                    <p className="font-medium" style={{ color: coverSize === size.id ? 'var(--color-primary)' : 'var(--color-on-surface)' }}>
                      {size.label}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-on-surface-variant)' }}>{size.desc}</p>
                  </div>
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                    style={{ borderColor: coverSize === size.id ? 'var(--color-primary)' : 'var(--color-outline)' }}
                  >
                    {coverSize === size.id && (
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }} />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
