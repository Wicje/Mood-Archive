import React, { useState } from 'react';
import { MoodItem } from '../types';
import { X, Download, Sparkles, Check, Layers } from 'lucide-react';
import { extractPaletteFromImage } from '../services/colorExtractor';
import { analyzeVisualFeatures } from '../services/visualAI';
import { TranslationDict } from '../services/i18n';

interface PinterestImporterModalProps {
  onClose: () => void;
  onBulkSave: (newItems: MoodItem[]) => void;
  t: TranslationDict;
}

export const PinterestImporterModal: React.FC<PinterestImporterModalProps> = ({
  onClose,
  onBulkSave,
  t
}) => {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [importedCount, setImportedCount] = useState<number | null>(null);

  const sampleUrls = [
    'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'
  ];

  const handleFillSample = () => {
    setInputText(sampleUrls.join('\n'));
  };

  const parseTitleFromUrl = (url: string, index: number): string => {
    try {
      const parsed = new URL(url);
      const pathname = parsed.pathname;
      const lastSegment = pathname.split('/').pop() || '';
      if (lastSegment && lastSegment.length > 3) {
        const cleanName = lastSegment
          .replace(/[-_]/g, ' ')
          .replace(/\.[^/.]+$/, '')
          .replace(/photo \d+/i, 'Photo Reference');
        if (cleanName.trim().length > 3) {
          return cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
        }
      }
      return `${parsed.hostname.replace('www.', '')} Reference #${index + 1}`;
    } catch {
      return `Visual Reference #${index + 1}`;
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setIsProcessing(true);
    const urls = inputText
      .split('\n')
      .map((u) => u.trim())
      .filter((u) => u.startsWith('http'));

    const newItems: MoodItem[] = [];

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const palette = await extractPaletteFromImage(url, 5);
      const title = parseTitleFromUrl(url, i);
      const aiFeatures = analyzeVisualFeatures(palette, title);

      newItems.push({
        id: `import-${Date.now()}-${i}`,
        title,
        url,
        thumbnailUrl: url,
        source: 'url',
        emotionTags: aiFeatures.suggestedEmotions.length > 0 ? aiFeatures.suggestedEmotions : ['Serene'],
        aestheticTags: aiFeatures.suggestedAesthetics.length > 0 ? aiFeatures.suggestedAesthetics : ['Cinematic'],
        palette,
        dateAdded: Date.now() - i * 1000,
        isFavorite: false,
        notes: `Imported directly from URL. Extracted lighting warmth vector: ${aiFeatures.warmth}%`
      });
    }

    onBulkSave(newItems);
    setIsProcessing(false);
    setImportedCount(newItems.length);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/90 backdrop-blur-xl overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-xl bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-stone-950/80 border border-stone-800 text-stone-400 hover:text-stone-100"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
            <Layers size={20} />
          </div>
          <div>
            <h2 className="font-serif text-xl font-medium text-stone-100">
              {t.importTitle}
            </h2>
            <p className="text-xs text-stone-400">{t.importDesc}</p>
          </div>
        </div>

        <form onSubmit={handleImport} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-sans font-medium text-stone-300 uppercase tracking-wider">
                Paste Image URLs (One per line)
              </label>
              <button
                type="button"
                onClick={handleFillSample}
                className="text-[11px] text-amber-400 hover:underline"
              >
                + Insert Sample Board URLs
              </button>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="https://images.unsplash.com/photo-1...\nhttps://images.unsplash.com/photo-2..."
              className="w-full h-36 bg-stone-950 border border-stone-800 rounded-2xl p-3 text-xs text-stone-200 focus:border-cyan-500/50 outline-none resize-none font-mono"
            />
          </div>

          <div className="bg-stone-950/80 p-3.5 rounded-2xl border border-stone-800 flex items-center gap-2.5 text-xs text-stone-400">
            <Sparkles size={16} className="text-amber-400 flex-shrink-0" />
            <span>
              Direct HTML5 Canvas pixel quantization extracts authentic 5-color palettes, lighting warmth vectors, and visual similarity scores for all imported pins!
            </span>
          </div>

          <div className="pt-2 flex items-center justify-between">
            {importedCount !== null && (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <Check size={14} /> Imported {importedCount} images successfully!
              </span>
            )}
            <div className="flex gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-stone-800 text-stone-300 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing || !inputText.trim()}
                className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-stone-950 font-medium rounded-xl text-xs disabled:opacity-50 transition-all shadow-md flex items-center gap-1.5"
              >
                {isProcessing ? (
                  <>
                    <Sparkles size={14} className="animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <Download size={14} /> {t.importButton}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
