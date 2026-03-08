import { useState } from 'react';
import { ReadingStatus } from '@/types/book';
import { useBooks } from '@/context/BookContext';
import { X, BookOpen, Save, ImagePlus, BookPlus } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSaved: () => void;
}

export default function ManualAddModal({ onClose, onSaved }: Props) {
  const { addBook, activeTab } = useBooks();
  
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [totalPages, setTotalPages] = useState(0);
  const [publishDate, setPublishDate] = useState('');
  const [description, setDescription] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<ReadingStatus>(activeTab);

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

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      // Ensure we trim whitespace which often breaks URLs
      setCoverUrl(text.trim());
    } catch (err) {
      console.error("Clipboard access denied");
    }
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
          <h2 className="text-xl font-semibold" style={{ color: 'var(--color-on-surface)' }}>Add Book</h2>
          <button onClick={onClose} style={{ color: 'var(--color-on-surface-variant)' }}><X /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex gap-4">
            {/* 🖼️ DIRECT PREVIEW BOX */}
            <div className="w-24 h-36 rounded-lg bg-slate-200 shrink-0 flex items-center justify-center overflow-hidden border border-slate-300">
              {coverUrl ? (
                <img 
                  src={coverUrl} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // If the image fails, show a broken placeholder
                    e.currentTarget.src = "https://via.placeholder.com/150?text=Invalid+URL";
                  }}
                />
              ) : (
                <BookOpen className="opacity-20" size={32} />
              )}
            </div>

            <div className="flex-1">
              <label className="text-xs font-bold uppercase mb-2 block opacity-60">Cover URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={coverUrl}
                  onChange={e => setCoverUrl(e.target.value)}
                  placeholder="Paste https:// image link..."
                  className="flex-1 p-3 rounded-xl outline-none"
                  style={inputStyle}
                />
                <button onClick={handlePaste} className="p-3 bg-blue-500 rounded-xl text-white">
                  <ImagePlus size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <input placeholder="Title *" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-4 rounded-2xl outline-none" style={inputStyle} />
            <input placeholder="Author" value={author} onChange={e => setAuthor(e.target.value)} className="w-full p-4 rounded-2xl outline-none" style={inputStyle} />
          </div>
        </div>

        <div className="p-6 border-t" style={{ borderColor: 'var(--color-surface-dim)' }}>
          <button onClick={handleSave} className="w-full p-4 bg-blue-600 text-white rounded-full font-bold shadow-lg">
            Save to Library
          </button>
        </div>
      </div>
    </div>
  );
}