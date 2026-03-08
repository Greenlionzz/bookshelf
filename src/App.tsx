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
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const handleSearchSelect = (result: SearchResult) => {
    setShowSearch(false);
    setSelectedSearchResult(result);
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
