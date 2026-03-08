import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Book, ReadingStatus } from '@/types/book';
import { useBooks } from '@/context/BookContext';
import { X, BookOpen, Save, ImagePlus, Loader2, BookPlus, UploadCloud } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSaved: () => void;
  initialBook?: Book; // 👈 If this is passed, we are in "Edit Mode"
}

const statusOptions: { id: ReadingStatus; label: string }[] = [
  { id: 'currently-reading', label: 'Currently Reading' },
  { id: 'for-later', label: 'For Later' },
  { id: 'finished', label: 'Finished' },
  { id: 'paused', label: 'Paused' },
];

export default function ManualAddModal({ onClose, onSaved, initialBook }: Props) {
  const { addBook, updateBook, activeTab } = useBooks();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form States - Prefilled if initialBook exists
  const [title, setTitle] = useState(initialBook?.title || '');
  const [author, setAuthor] = useState(initialBook?.author || '');
  const [coverUrl, setCoverUrl] = useState(initialBook?.coverUrl || '');
  const [totalPages, setTotalPages] = useState(initialBook?.totalPages || 0);
  const [publishDate, setPublishDate] = useState(initialBook?.publishDate || '');
  const [description, setDescription] = useState(initialBook?.description || '');
  const [note, setNote] = useState(initialBook?.note || '');
  const [status, setStatus] = useState<ReadingStatus>(initialBook?.status || activeTab);
  
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('book-covers').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('book-covers').getPublicUrl(fileName);
      setCoverUrl(data.publicUrl);
    } catch (error: any) {
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    if (!title.trim()) return;

    const bookData = {
      title: title.trim(),
      author: author.trim() || 'Unknown Author',
      coverUrl: coverUrl.trim(),
      totalPages: Number(totalPages), // 👈 Force this to be a number
      publishDate: publishDate.trim(),
      description: description.trim(),
      note: note.trim(),
      status,
    };

    if (initialBook) {
      // 📝 EDIT MODE
      updateBook(initialBook.id, bookData);
    } else {
      // ➕ ADD MODE
      addBook({ ...bookData, pagesRead: 0 });
    }
    onSaved();
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-on-surface)',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 backdrop-blur-sm" style={{ backgroundColor: 'var(--color-overlay)' }} />
      <div className="relative rounded-[28px] shadow-2xl w-full max-w-lg z-10 max-h-[90vh] flex flex-col overflow-hidden animate-in"
        style={{ backgroundColor: 'var(--color-bg)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b flex justify-between items-center" style={{ borderColor: 'var(--color-surface-dim)' }}>
          <h2 className="text-xl font-semibold" style={{ color: 'var(--color-on-surface)' }}>
            {initialBook ? 'Edit Book' : 'Add Book'}
          </h2>
          <button onClick={onClose} style={{ color: 'var(--color-on-surface-variant)' }}><X /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex gap-4 items-start">
            <div className="w-24 h-36 rounded-xl bg-slate-100 shrink-0 flex items-center justify-center overflow-hidden border relative"
                 style={{ backgroundColor: 'var(--color-surface-variant)', borderColor: 'var(--color-surface-dim)' }}>
              {uploading ? <Loader2 className="animate-spin" /> : coverUrl ? <img src={coverUrl} className="w-full h-full object-cover" /> : <BookOpen className="opacity-20" size={32} />}
            </div>

            <div className="flex-1 space-y-3">
              <label className="text-xs font-bold uppercase opacity-60">Cover Image</label>
              <button onClick={() => fileInputRef.current?.click()} className="w-full py-2.5 rounded-xl border-2 border-dashed text-sm" style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}>
                {uploading ? 'Uploading...' : 'Upload Local Image'}
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
              <input placeholder="Or paste Image URL..." value={coverUrl} onChange={e => setCoverUrl(e.target.value)} className="w-full p-2.5 rounded-xl text-xs" style={inputStyle} />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase mb-1 block opacity-60">Title *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} className="w-full p-4 rounded-2xl outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="text-xs font-bold uppercase mb-1 block opacity-60">Author</label>
              <input value={author} onChange={e => setAuthor(e.target.value)} className="w-full p-4 rounded-2xl outline-none" style={inputStyle} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase mb-1 block opacity-60">Total Pages</label>
                <input type="number" value={totalPages || ''} onChange={e => setTotalPages(parseInt(e.target.value) || 0)} className="w-full p-4 rounded-2xl outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="text-xs font-bold uppercase mb-1 block opacity-60">Publish Year</label>
                <input value={publishDate} onChange={e => setPublishDate(e.target.value)} className="w-full p-4 rounded-2xl outline-none" style={inputStyle} />
              </div>
            </div>
          </div>

          <div>
             <label className="text-xs font-bold uppercase mb-2 block opacity-60">Status</label>
             <div className="flex flex-wrap gap-2">
               {statusOptions.map(opt => (
                 <button key={opt.id} onClick={() => setStatus(opt.id)} className="px-4 py-2 rounded-full text-xs font-bold"
                   style={{ backgroundColor: status === opt.id ? 'var(--color-primary)' : 'var(--color-surface)', color: status === opt.id ? 'var(--color-on-primary)' : 'var(--color-on-surface-variant)' }}>
                   {opt.label}
                 </button>
               ))}
             </div>
          </div>
        </div>

        <div className="p-6 border-t" style={{ borderColor: 'var(--color-surface-dim)' }}>
          <button onClick={handleSave} disabled={!title.trim() || uploading} className="w-full p-4 rounded-full font-bold shadow-lg"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}>
            {initialBook ? 'Update Book' : 'Save to Library'}
          </button>
        </div>
      </div>
    </div>
  );
}