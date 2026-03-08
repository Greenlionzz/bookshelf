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
  const [selectedApiSource, setSelectedApiSource] = useState<'google' | 'openlibrary'>('google');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  
  // 👈 1. New state to hold the book being edited
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  const handleSearchSelect = (result: SearchResult, source: 'google' | 'openlibrary') => {
    setShowSearch(false);
    setSelectedSearchResult(result);
    setSelectedApiSource(source);
  };

  const handleCustomizeSaved = () => {
    setSelectedSearchResult(null);
  };

  // 👈 2. Updated handler to clear both states
  const handleManualSaved = () => {
    setShowManualAdd(false);
    setEditingBook(null);
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
          apiSource={selectedApiSource}
          onClose={() => setSelectedSearchResult(null)}
          onSaved={handleCustomizeSaved}
        />
      )}

      {/* 👈 3. Now shows if manual button is clicked OR if editingBook exists */}
      {(showManualAdd || editingBook) && (
        <ManualAddModal
          initialBook={editingBook || undefined} // Passes the book data if we are editing
          onClose={handleManualSaved}
          onSaved={handleManualSaved}
        />
      )}

      {selectedBook && (
        <DetailView
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          // 👈 4. Triggered when you hit the edit pencil in DetailView
          onEdit={(book) => {
            setSelectedBook(null); // Close the detail view first
            setEditingBook(book);  // Open the manual modal with the book's data
          }}
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