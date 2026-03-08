import { useState } from 'react';
import { BookProvider } from '@/context/BookContext';
import { Book, SearchResult } from '@/types/book';
import Navbar from '@/components/Navbar';
import BookGrid from '@/components/BookGrid';
import FAB from '@/components/FAB';
import SearchModal from '@/components/SearchModal';
import CustomizeModal from '@/components/CustomizeModal';
import ManualAddModal from '@/components/ManualAddModal';
import DetailView from '@/components/DetailView';

function AppContent() {
  const [showSearch, setShowSearch] = useState(false);
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [selectedSearchResult, setSelectedSearchResult] = useState<SearchResult | null>(null);
  
  // 👇 New state to remember which API was used!
  const [selectedApiSource, setSelectedApiSource] = useState<'google' | 'openlibrary'>('google');
  
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // 👇 Updated to catch both the result AND the source from SearchModal
  const handleSearchSelect = (result: SearchResult, source: 'google' | 'openlibrary') => {
    setShowSearch(false);
    setSelectedSearchResult(result);
    setSelectedApiSource(source);
  };

  const handleCustomizeSaved = () => {
    setSelectedSearchResult(null);
  };

  const handleManualSaved = () => {
    setShowManualAdd(false);
  };

  return (
    <div className="min-h-screen theme-transition bookshelf-wall" style={{ backgroundColor: 'var(--color-bg)' }}>
      <Navbar />
      <BookGrid onBookClick={setSelectedBook} />
      <FAB
        onSearchClick={() => setShowSearch(true)}
        onManualClick={() => setShowManualAdd(true)}
      />

      {showSearch && (
        <SearchModal
          onClose={() => setShowSearch(false)}
          onSelectResult={handleSearchSelect}
        />
      )}

      {selectedSearchResult && (
        <CustomizeModal
          searchResult={selectedSearchResult}
          apiSource={selectedApiSource} // 👈 Passing the chosen API down to the modal!
          onClose={() => setSelectedSearchResult(null)}
          onSaved={handleCustomizeSaved}
        />
      )}

      {showManualAdd && (
        <ManualAddModal
          onClose={() => setShowManualAdd(false)}
          onSaved={handleManualSaved}
        />
      )}

      {selectedBook && (
        <DetailView
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <BookProvider>
      <AppContent />
    </BookProvider>
  );
}