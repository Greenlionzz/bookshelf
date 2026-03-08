import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/services/supabase';
import { OpenLibraryService } from '@/services/openlibrary';
import { GoogleBooksService } from '@/services/googlebooks';
import { SearchResult, ReadingStatus } from '@/types/book';
import { useBooks } from '@/context/BookContext';
import { X, Loader2, BookOpen, Save, ImagePlus, UploadCloud } from 'lucide-react';

interface Props {
  searchResult: SearchResult;
  apiSource: 'google' | 'openlibrary';
  onClose: () => void;
  onSaved: () => void;
}

const statusOptions: { id: ReadingStatus; label: string }[] = [
  { id: 'currently-reading', label: 'Currently Reading' },
  { id: 'for-later', label: 'For Later' },
  { id: 'finished', label: 'Finished' },
  { id: 'paused', label: 'Paused' },
];

export default function CustomizeModal({ searchResult, apiSource, onClose, onSaved }: Props) {
  const { addBook, activeTab } = useBooks();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Form States
  const [title, setTitle] = useState(searchResult.title);
  const [author, setAuthor] = useState(searchResult.author);
  const [coverUrl, setCoverUrl] = useState(searchResult.coverUrl);
  const [totalPages, setTotalPages] = useState(0);
  const [publishDate, setPublishDate] = useState('');
  const [description, setDescription] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<ReadingStatus>(activeTab);
  const [openLibraryKey, setOpenLibraryKey] = useState(searchResult.key);

  useEffect(() => {
    let cancelled = false;
    async function fetchDetails() {
      setLoading(true);
      try {
        const details = apiSource === 'google'
          ? await GoogleBooksService.getWorkDetails(searchResult.key)
          : await OpenLibraryService.getWorkDetails(searchResult.key);
        
        if (cancelled) return;
        
        setTitle(details.title);
        setAuthor(details.author);
        if (details.coverUrl) setCoverUrl(details.coverUrl);
        setTotalPages(details.totalPages);
        setPublishDate(details.publishDate);
        setDescription(details.description);
        setOpenLibraryKey(details.openLibraryKey);
      } catch {
        // Fallback to basic search result info
      }
      if (!cancelled) setLoading(false);
    }
    fetchDetails();
    return () => { cancelled = true; };
  }, [searchResult.key, apiSource]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('book-covers')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('book-covers')
        .getPublicUrl(fileName);

      setCoverUrl(data.publicUrl);
    } catch (error: any) {
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    if (!title.trim()) return;
    addBook({
      title: title.trim(),
      author: author.trim(),
      coverUrl: coverUrl.trim(),
      totalPages: Number(totalPages), // Ensure numeric value
      publishDate: publishDate.trim(),
      description: description.trim(),
      note: note.trim(),
      status,
      openLibraryKey,
      pagesRead: 0
    });
    onSaved();
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-on-surface)',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 backdrop-blur-sm" style={{ backgroundColor: 'var(--color-overlay)' }} />
      <div
        className="relative rounded-[28px] shadow-2xl w-full max-w-lg z-10 max-h-[90vh] flex flex-col overflow-hidden animate-in"
        style={{ backgroundColor: 'var(--color-bg)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b" style={{ borderColor: 'var(--color-surface-dim)' }}>
          <h2 className="text-xl font-semibold" style={{ color: 'var(--color-on-surface)' }}>Preview & Customize</h2>
          <button onClick={onClose} className="p-2 rounded-full transition-colors" style={{ color: 'var(--color-on-surface-variant)' }}>
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={40} className="animate-spin mb-3" style={{ color: 'var(--color-primary)' }} />
            <p style={{ color: 'var(--color-on-surface-variant)' }}>Fetching book details...</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Cover Selection Section */}
            <div className="flex gap-4 items-start">
              <div className="w-24 h-36 rounded-xl overflow-hidden shrink-0 flex items-center justify-center shadow-md border"
                style={{ backgroundColor: 'var(--color-surface-variant)', borderColor: 'var(--color-surface-dim)' }}>
                {uploading ? (
                  <Loader2 className="animate-spin" style={{ color: 'var(--color-primary)' }} />
                ) : coverUrl.length > 5 ? (
                  <img src={coverUrl} alt={title} className="w-full h-full object-cover" />
                ) : (
                  <BookOpen size={28} style={{ color: 'var(--color-primary)', opacity: 0.3 }} />
                )}
              </div>
              <div className="flex-1 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider opacity-60">Cover Image</label>
                
                {/* Local Upload Button */}
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full py-2.5 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 text-sm transition-colors"
                  style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
                >
                  <UploadCloud size={16} />
                  {uploading ? 'Uploading...' : 'Upload Local Cover'}
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />

                {/* URL Input as alternative */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={coverUrl}
                    onChange={e => setCoverUrl(e.target.value)}
                    placeholder="Or paste URL..."
                    className="flex-1 rounded-xl px-3 py-2 text-xs outline-none"
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            {/* Title & Author */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-60">Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full rounded-2xl px-4 py-3 outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-60">Author</label>
                <input type="text" value={author} onChange={e => setAuthor(e.target.value)} className="w-full rounded-2xl px-4 py-3 outline-none" style={inputStyle} />
              </div>
            </div>

            {/* Pages & Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-60">Pages</label>
                <input type="number" value={totalPages || ''} onChange={e => setTotalPages(parseInt(e.target.value) || 0)} className="w-full rounded-2xl px-4 py-3 outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-60">Year</label>
                <input type="text" value={publishDate} onChange={e => setPublishDate(e.target.value)} className="w-full rounded-2xl px-4 py-3 outline-none" style={inputStyle} />
              </div>
            </div>

            {/* Description & Notes */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-60">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full rounded-2xl px-4 py-3 text-sm outline-none resize-none" style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-60">Personal Note</label>
                <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} className="w-full rounded-2xl px-4 py-3 text-sm outline-none resize-none" style={inputStyle} />
              </div>
            </div>

            {/* Status Pills */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-60">Add to</label>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setStatus(opt.id)}
                    className="px-4 py-2 rounded-full text-xs font-bold transition-all"
                    style={{
                      backgroundColor: status === opt.id ? 'var(--color-primary)' : 'var(--color-surface)',
                      color: status === opt.id ? 'var(--color-on-primary)' : 'var(--color-on-surface-variant)',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Save button */}
        {!loading && (
          <div className="p-6 pt-4 border-t" style={{ borderColor: 'var(--color-surface-dim)' }}>
            <button
              onClick={handleSave}
              disabled={!title.trim() || uploading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full font-bold shadow-lg transition-transform active:scale-95 disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
            >
              <Save size={18} />
              {uploading ? 'Finalizing Upload...' : 'Add to Library'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}