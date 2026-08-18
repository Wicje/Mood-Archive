import React, { useState } from 'react';
import { MoodItem, EmotionTag, AestheticTag } from '../types';
import { X, Upload, Link, Sparkles, Tag, Plus, Check } from 'lucide-react';
import { extractPaletteFromImage } from '../services/colorExtractor';

interface UploadModalProps {
  onClose: () => void;
  onSave: (item: MoodItem) => void;
  availableEmotions: EmotionTag[];
  availableAesthetics: AestheticTag[];
}

export const UploadModal: React.FC<UploadModalProps> = ({
  onClose,
  onSave,
  availableEmotions,
  availableAesthetics
}) => {
  const [tab, setTab] = useState<'url' | 'file'>('url');
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>(['Serene']);
  const [selectedAesthetics, setSelectedAesthetics] = useState<string[]>(['Cinematic']);
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState('');
  const [author, setAuthor] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedPalette, setExtractedPalette] = useState<string[]>(['#1e293b', '#475569', '#64748b', '#94a3b8', '#cbd5e1']);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const dataUrl = evt.target?.result as string;
        setImageUrl(dataUrl);
        if (!title) {
          setTitle(file.name.replace(/\.[^/.]+$/, ''));
        }
        triggerPaletteExtract(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerPaletteExtract = async (url: string) => {
    if (!url) return;
    setIsExtracting(true);
    const colors = await extractPaletteFromImage(url, 5);
    setExtractedPalette(colors);
    setIsExtracting(false);
  };

  const toggleEmotion = (e: string) => {
    setSelectedEmotions((prev) =>
      prev.includes(e) ? prev.filter((i) => i !== e) : [...prev, e]
    );
  };

  const toggleAesthetic = (a: string) => {
    setSelectedAesthetics((prev) =>
      prev.includes(a) ? prev.filter((i) => i !== a) : [...prev, a]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl || !title) return;

    const newItem: MoodItem = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      url: imageUrl,
      thumbnailUrl: imageUrl,
      source: tab === 'file' ? 'custom' : 'url',
      author: author.trim() || undefined,
      emotionTags: selectedEmotions.length > 0 ? selectedEmotions : ['Serene'],
      aestheticTags: selectedAesthetics.length > 0 ? selectedAesthetics : ['Cinematic'],
      palette: extractedPalette,
      dateAdded: Date.now(),
      isFavorite: false,
      notes: notes.trim() || undefined,
      location: location.trim() || undefined
    };

    onSave(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/90 backdrop-blur-xl overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl my-8 p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300">
              <Plus size={20} />
            </div>
            <div>
              <h2 className="font-serif text-lg font-medium text-stone-100">
                Archive New Aesthetic Vibe
              </h2>
              <p className="text-xs text-stone-400">
                Import image, extract palette, and tag by emotional vibe
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-stone-950/80 border border-stone-800 text-stone-400 hover:text-stone-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-stone-950 rounded-xl border border-stone-800">
          <button
            type="button"
            onClick={() => setTab('url')}
            className={`py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all ${
              tab === 'url' ? 'bg-stone-800 text-stone-100' : 'text-stone-400'
            }`}
          >
            <Link size={14} />
            Image URL
          </button>
          <button
            type="button"
            onClick={() => setTab('file')}
            className={`py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all ${
              tab === 'file' ? 'bg-stone-800 text-stone-100' : 'text-stone-400'
            }`}
          >
            <Upload size={14} />
            Upload File
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'url' ? (
            <div className="space-y-2">
              <label className="text-xs font-sans font-medium text-stone-400 uppercase tracking-wider block">
                Direct Image URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    triggerPaletteExtract(e.target.value);
                  }}
                  required
                  className="flex-1 bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:border-amber-500/50 outline-none"
                />
                <button
                  type="button"
                  onClick={() => triggerPaletteExtract(imageUrl)}
                  className="px-3 py-2 bg-stone-800 text-xs text-stone-300 rounded-xl"
                >
                  Extract
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-sans font-medium text-stone-400 uppercase tracking-wider block">
                Upload Image File
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2 text-xs text-stone-300 outline-none"
              />
            </div>
          )}

          {/* Live Preview & Palette */}
          {imageUrl && (
            <div className="flex gap-4 items-center bg-stone-950/80 p-3 rounded-2xl border border-stone-800">
              <img
                src={imageUrl}
                alt="Preview"
                className="w-16 h-16 rounded-xl object-cover border border-stone-800"
              />
              <div className="flex-1 space-y-1">
                <span className="text-[11px] text-stone-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={12} className="text-amber-400" />
                  {isExtracting ? 'Extracting Palette...' : 'Extracted Palette:'}
                </span>
                <div className="flex gap-1.5">
                  {extractedPalette.map((hex, idx) => (
                    <div
                      key={idx}
                      className="w-6 h-6 rounded-md border border-stone-700/50"
                      style={{ backgroundColor: hex }}
                      title={hex}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Meta Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-sans font-medium text-stone-400 uppercase tracking-wider block mb-1">
                Title / Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Midnight Rain in Shinjuku"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:border-amber-500/50 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-sans font-medium text-stone-400 uppercase tracking-wider block mb-1">
                Location / City
              </label>
              <input
                type="text"
                placeholder="e.g. Kyoto, Japan"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:border-amber-500/50 outline-none"
              />
            </div>
          </div>

          {/* Tag Selectors */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-sans font-medium text-rose-300 uppercase tracking-wider block mb-1.5">
                Select Emotion Tags:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableEmotions.slice(0, 10).map((e) => {
                  const sel = selectedEmotions.includes(e);
                  return (
                    <button
                      type="button"
                      key={e}
                      onClick={() => toggleEmotion(e)}
                      className={`px-2.5 py-1 rounded-full text-xs border transition-all ${
                        sel
                          ? 'bg-rose-900/50 border-rose-600 text-rose-200'
                          : 'bg-stone-950 border-stone-800 text-stone-400'
                      }`}
                    >
                      {e}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-sans font-medium text-amber-300 uppercase tracking-wider block mb-1.5">
                Select Aesthetic Tags:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableAesthetics.slice(0, 10).map((a) => {
                  const sel = selectedAesthetics.includes(a);
                  return (
                    <button
                      type="button"
                      key={a}
                      onClick={() => toggleAesthetic(a)}
                      className={`px-2.5 py-1 rounded-full text-xs border transition-all ${
                        sel
                          ? 'bg-amber-900/50 border-amber-600 text-amber-200'
                          : 'bg-stone-950 border-stone-800 text-stone-400'
                      }`}
                    >
                      {a}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-sans font-medium text-stone-400 uppercase tracking-wider block mb-1">
              Personal Aesthetic Notes
            </label>
            <textarea
              placeholder="Notes on lighting, reference detail, camera lens..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-xs text-stone-200 focus:border-amber-500/50 outline-none h-16 resize-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-stone-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-stone-800 text-stone-300 rounded-xl text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!imageUrl || !title}
              className="px-5 py-2 bg-stone-100 hover:bg-white text-stone-950 font-medium rounded-xl text-xs disabled:opacity-50 transition-all shadow-md"
            >
              Archive Image
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
