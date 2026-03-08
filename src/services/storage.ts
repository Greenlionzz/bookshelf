import { Book, CoverSize, ProgressInputMode, ThemeColor } from '@/types/book';
import { supabase } from './supabase'; // Importing the client we created

const COVER_SIZE_KEY = 'booktracker_cover_size';
const DARK_MODE_KEY = 'booktracker_dark_mode';
const PROGRESS_INPUT_MODE_KEY = 'booktracker_progress_input_mode';
const THEME_COLOR_KEY = 'booktracker_theme_color';

export const StorageService = {
  // ==========================================
  // ☁️ CLOUD SYNC (SUPABASE) - FOR BOOK DATA
  // ==========================================
  
  async getBooks(): Promise < Book[] > {
    const { data, error } = await supabase
    .from('books')
    .select('*')
    .order('createdAt', { ascending: false }); // Sorts newest first
    
    if (error) {
      console.error('Error fetching books from Supabase:', error);
      return [];
    }
    return data as Book[];
  },
  
  async addBook(book: Book): Promise < Book > {
    const { data, error } = await supabase
    .from('books')
    .insert([book])
    .select()
    .single();
    
    if (error) throw error;
    return data as Book;
  },
  
  async updateBook(updated: Book): Promise < Book > {
    // We add the updatedAt timestamp just like the original code did
    const bookToUpdate = { ...updated, updatedAt: new Date().toISOString() };
    
    const { data, error } = await supabase
    .from('books')
    .update(bookToUpdate)
    .eq('id', updated.id)
    .select()
    .single();
    
    if (error) throw error;
    return data as Book;
  },
  
  async deleteBook(id: string): Promise < void > {
    const { error } = await supabase
    .from('books')
    .delete()
    .eq('id', id);
    
    if (error) throw error;
  },
  
  // ==========================================
  // 📱 LOCAL STORAGE - FOR DEVICE PREFERENCES
  // ==========================================
  
  getCoverSize(): CoverSize {
    return (localStorage.getItem(COVER_SIZE_KEY) as CoverSize) || 'medium';
  },
  setCoverSize(size: CoverSize): void {
    localStorage.setItem(COVER_SIZE_KEY, size);
  },
  
  getDarkMode(): boolean {
    const stored = localStorage.getItem(DARK_MODE_KEY);
    if (stored !== null) {
      return stored === 'true';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  },
  setDarkMode(dark: boolean): void {
    localStorage.setItem(DARK_MODE_KEY, String(dark));
  },
  
  getProgressInputMode(): ProgressInputMode {
    return (localStorage.getItem(PROGRESS_INPUT_MODE_KEY) as ProgressInputMode) || 'slider';
  },
  setProgressInputMode(mode: ProgressInputMode): void {
    localStorage.setItem(PROGRESS_INPUT_MODE_KEY, mode);
  },
  
  getThemeColor(): ThemeColor {
    return (localStorage.getItem(THEME_COLOR_KEY) as ThemeColor) || 'purple';
  },
  setThemeColor(color: ThemeColor): void {
    localStorage.setItem(THEME_COLOR_KEY, color);
  },
};