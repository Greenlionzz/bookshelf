import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase'; // 👈 Ensure this path is correct for your project
import { ReadingStatus } from '@/types/book';
import { useBooks } from '@/context/BookContext';
import { X, BookOpen, Save, ImagePlus, Loader2, BookPlus, UploadCloud } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSaved: () => void;
}

const statusOptions: { id: ReadingStatus; label: string }[] = [
  { id: 'currently-reading', label: 'Currently Reading' },
  { id: 'for-later', label: 'For Later' },
  { id: 'finished', label: 'Finished' },
  { id: 'paused', label: 'Paused' },
];

export default function ManualAddModal({ onClose, onSaved }: Props) {
  const { addBook, activeTab } = useBooks();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form States
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [totalPages, setTotalPages] = useState(0);
  const [publishDate, setPublishDate] = useState('');
  const [description, setDescription] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<ReadingStatus>(activeTab);
  
  // Upload State
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
      if (!file) return;

      // 1. Create a unique filename to avoid overwriting
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      // 2. Upload the actual file to your 'book-covers' bucket
      const { error: uploadError } = await supabase.storage
        .from('book-covers')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 3. Generate the Public URL so the app can see it
      const { data } = supabase.storage
        .from('book-covers')
        .getPublicUrl(filePath);

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
      author: author.trim() || 'Unknown Author',
      coverUrl: coverUrl.trim(),
      totalPages,
      publishDate: publishDate.trim(),
      description: description.trim(),
      note: note.trim(),
      status,
      openLibraryKey: undefined,
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
      <div className="relative rounded-[28px] shadow-2xl w-full max-w-lg z-10 max-h-[90vh] flex flex-col overflow-hidden animate-in"
        style={{ backgroundColor: 'var(--color-bg)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center" style={{ borderColor: 'var(--color-surface-dim)' }}>
          <div className="flex items-center gap-3">
            <BookPlus style={{ color: 'var(--color-primary)' }} />
            <h2 className="text-xl font-semibold" style={{ color: 'var(--color-on-surface)' }}>Add Manually</h2>
          </div>
          <button onClick={onClose} style={{ color: 'var(--color-on-surface-variant)' }}><X /></button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex gap-4 items-start">
            {/* 🖼️ Preview Box */}
            <div className="w-24 h-36 rounded-xl shrink-0 flex items-center justify-center overflow-hidden border relative"
                 style={{ backgroundColor: 'var(--color-surface-variant)', borderColor: 'var(--color-surface-dim)' }}>
              {uploading ? (
                <Loader2 className="animate-spin" style={{ color: 'var(--color-primary)' }} />
              ) : coverUrl ? (
                <img src={coverUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <BookOpen className="opacity-20" size={32} />
              )}
            </div>

            <div className="flex-1 space-y-3">
              <label className="text-xs font-bold uppercase opacity-60">Book Cover</label>
              
              {/* URL Input */}
              <input
                type="text"
                value={coverUrl}
                onChange={e => setCoverUrl(e.target.value)}
                placeholder="Paste Image URL..."
                className="w-full p-3 rounded-xl outline-none text-sm"
                style={inputStyle}
              />
              
              <div className="flex items-center gap-2">
                <div className="h-[1px] flex-1 opacity-10" style={{ backgroundColor: 'var(--color-on-surface)' }}></div>
                <span className="text-[10px] uppercase font-bold opacity-30">OR</span>
                <div className="h-[1px] flex-1 opacity-10" style={{ backgroundColor: 'var(--color-on-surface)' }}></div>
              </div>

              {/* 📂 Local Upload Button */}
              <button 
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 text-sm transition-colors"
                style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-surface-variant)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <UploadCloud size={16} />
                {uploading ? 'Uploading...' : 'Upload from Device'}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
          </div>

          {/* Title & Author */}
          <div className="space-y-4">
            <input placeholder="Title *" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-4 rounded-2xl outline-none" style={inputStyle} />
            <input placeholder="Author" value={author} onChange={e => setAuthor(e.target.value)} className="w-full p-4 rounded-2xl outline-none" style={inputStyle} />
          </div>

          {/* Status Selection */}
          <div className="flex flex-wrap gap-2 pt-2">
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

        {/* Action Footer */}
        <div className="p-6 border-t" style={{ borderColor: 'var(--color-surface-dim)' }}>
          <button 
            onClick={handleSave} 
            disabled={!title.trim() || uploading}
            className="w-full p-4 rounded-full font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
          >
            {uploading ? 'Wait for upload...' : 'Save to Library'}
          </button>
        </div>
      </div>
    </div>
  );
}