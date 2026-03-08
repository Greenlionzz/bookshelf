import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Book, ReadingStatus, CoverSize, ProgressInputMode, ThemeColor } from '@/types/book';
import { StorageService } from '@/services/storage';
import { THEME_PALETTES } from '@/themes/palettes';
import { v4 as uuidv4 } from 'uuid';

interface BookContextType {
  books: Book[];
  isLoading: boolean; // Added so you can show a spinner if you want!
  activeTab: ReadingStatus;
  coverSize: CoverSize;
  darkMode: boolean;
  progressInputMode: ProgressInputMode;
  themeColor: ThemeColor;
  setActiveTab: (tab: ReadingStatus) => void;
  setCoverSize: (size: CoverSize) => void;
  setDarkMode: (dark: boolean) => void;
  setProgressInputMode: (mode: ProgressInputMode) => void;
  setThemeColor: (color: ThemeColor) => void;
  addBook: (bookData: Omit < Book, 'id' | 'createdAt' | 'updatedAt' | 'pagesRead' > ) => Promise < void > ;
  updateBook: (book: Book) => Promise < void > ;
  deleteBook: (id: string) => Promise < void > ;
  getFilteredBooks: () => Book[];
}

const BookContext = createContext < BookContextType | null > (null);

export function BookProvider({ children }: { children: React.ReactNode }) {
  // Start with empty books array
  const [books, setBooks] = useState < Book[] > ([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState < ReadingStatus > ('currently-reading');
  const [coverSize, setCoverSizeState] = useState < CoverSize > (() => StorageService.getCoverSize());
  const [darkMode, setDarkModeState] = useState < boolean > (() => StorageService.getDarkMode());
  const [progressInputMode, setProgressInputModeState] = useState < ProgressInputMode > (() => StorageService.getProgressInputMode());
  const [themeColor, setThemeColorState] = useState < ThemeColor > (() => StorageService.getThemeColor());
  
  // Initial Fetch from Supabase
  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true);
      try {
        const fetchedBooks = await StorageService.getBooks();
        setBooks(fetchedBooks);
      } catch (error) {
        console.error("Error loading books:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBooks();
  }, []);
  
  // Apply dark class to <html> element
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);
  
  // Apply theme CSS variables dynamically
  useEffect(() => {
    const palette = THEME_PALETTES[themeColor];
    if (!palette) return;
    const root = document.documentElement;
    const vars = darkMode ? palette.dark : palette.light;
    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, [themeColor, darkMode]);
  
  const setCoverSize = useCallback((size: CoverSize) => {
    setCoverSizeState(size);
    StorageService.setCoverSize(size);
  }, []);
  
  const setDarkMode = useCallback((dark: boolean) => {
    setDarkModeState(dark);
    StorageService.setDarkMode(dark);
  }, []);
  
  const setProgressInputMode = useCallback((mode: ProgressInputMode) => {
    setProgressInputModeState(mode);
    StorageService.setProgressInputMode(mode);
  }, []);
  
  const setThemeColor = useCallback((color: ThemeColor) => {
    setThemeColorState(color);
    StorageService.setThemeColor(color);
  }, []);
  
  const addBook = useCallback(async (bookData: Omit < Book, 'id' | 'createdAt' | 'updatedAt' | 'pagesRead' > ) => {
    const now = new Date().toISOString();
    const newBook: Book = {
      ...bookData,
      id: uuidv4(),
      pagesRead: 0,
      createdAt: now,
      updatedAt: now,
    };
    
    // Optimistic UI Update (feels instant)
    setBooks(prev => [newBook, ...prev]);
    
    try {
      // Background Sync
      await StorageService.addBook(newBook);
    } catch (error) {
      console.error("Failed to sync new book to cloud:", error);
      // Rollback if DB fails
      setBooks(prev => prev.filter(b => b.id !== newBook.id));
    }
  }, []);
  
  const updateBook = useCallback(async (updated: Book) => {
    const bookToUpdate = { ...updated, updatedAt: new Date().toISOString() };
    
    // Optimistic UI Update
    setBooks(prev => prev.map(b => b.id === updated.id ? bookToUpdate : b));
    
    try {
      // Background Sync
      await StorageService.updateBook(bookToUpdate);
    } catch (error) {
      console.error("Failed to sync book update to cloud:", error);
    }
  }, []);
  
  const deleteBook = useCallback(async (id: string) => {
    // Optimistic UI Update
    setBooks(prev => prev.filter(b => b.id !== id));
    
    try {
      // Background Sync
      await StorageService.deleteBook(id);
    } catch (error) {
      console.error("Failed to sync book deletion to cloud:", error);
    }
  }, []);
  
  const getFilteredBooks = useCallback(() => {
    return books.filter(b => b.status === activeTab);
  }, [books, activeTab]);
  
  return (
    <BookContext.Provider value={{
      books, isLoading, activeTab, coverSize, darkMode, progressInputMode, themeColor,
      setActiveTab, setCoverSize, setDarkMode, setProgressInputMode, setThemeColor,
      addBook, updateBook, deleteBook, getFilteredBooks,
    }}>
      {children}
    </BookContext.Provider>
  );
}

export function useBooks() {
  const ctx = useContext(BookContext);
  if (!ctx) throw new Error('useBooks must be used within BookProvider');
  return ctx;
}