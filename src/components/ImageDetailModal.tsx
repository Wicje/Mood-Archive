import React, { useState } from 'react';
import { MoodItem } from '../types';
import {
  X,
  Heart,
  Copy,
  Check,
  Sparkles,
  Layers,
  Trash2,
  Tag,
  Compass,
  MapPin,
  Camera,
  Activity
} from 'lucide-react';
import { exportPaletteAsCSS } from '../services/colorExtractor';
import { calculateVisualSimilarityScore, analyzeVisualFeatures } from '../services/visualAI';
import { TranslationDict } from '../services/i18n';

interface ImageDetailModalProps {
  item: MoodItem | null;
  allItems: MoodItem[];
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onUpdateItem: (item: MoodItem) => void;
  onDeleteItem: (id: string) => void;
  onPinToMoodboard: (item: MoodItem) => void;
  onSelectSimilar: (item: MoodItem) => void;
  t: TranslationDict;
}

export const ImageDetailModal: React.FC<ImageDetailModalProps> = ({
  item,
  allItems,
  onClose,
  onToggleFavorite,
  onUpdateItem,
  onDeleteItem,
  onPinToMoodboard,
  onSelectSimilar,
  t
}) => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedCSS, setCopiedCSS] = useState(false);
  const [newTagText, setNewTagText] = useState('');
  const [tagCategory, setTagCategory] = useState<'emotion' | 'aesthetic'>('emotion');
  const [notes, setNotes] = useState(item?.notes || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  if (!item) return null;

  const visualFeatures = analyzeVisualFeatures(item.palette, item.title);

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  const handleCopyCSS = () => {
    const css = exportPaletteAsCSS(item.title, item.palette);
    navigator.clipboard.writeText(css);
    setCopiedCSS(true);
    setTimeout(() => setCopiedCSS(false), 2000);
  };

  const generateAIPrompt = (): string => {
    const emotions = item.emotionTags.join(', ');
    const aesthetics = item.aestheticTags.join(', ');
    const colors = item.palette.slice(0, 4).join(', ');
    return `A hyper-aesthetic visual photograph, ${item.title}, emotional mood: ${emotions}, aesthetic vibe: ${aesthetics}, color palette tones: ${colors}, warmth vector: ${visualFeatures.warmth}%, fine grain, 35mm photography, volumetric lighting --ar 16:9 --v 6.0`;
  };

  const handleCopyAIPrompt = () => {
    const prompt = generateAIPrompt();
    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagText.trim()) return;
    const tag = newTagText.trim();
    if (tagCategory === 'emotion') {
      if (!item.emotionTags.includes(tag)) {
        onUpdateItem({ ...item, emotionTags: [...item.emotionTags, tag] });
      }
    } else {
      if (!item.aestheticTags.includes(tag)) {
        onUpdateItem({ ...item, aestheticTags: [...item.aestheticTags, tag] });
      }
    }
    setNewTagText('');
  };

  const handleRemoveEmotionTag = (tag: string) => {
    onUpdateItem({
      ...item,
      emotionTags: item.emotionTags.filter((t) => t !== tag)
    });
  };

  const handleRemoveAestheticTag = (tag: string) => {
    onUpdateItem({
      ...item,
      aestheticTags: item.aestheticTags.filter((t) => t !== tag)
    });
  };

  const handleSaveNotes = () => {
    onUpdateItem({ ...item, notes });
    setIsEditingNotes(false);
  };

  // Find visual AI similarity matches across the archive
  const similarItems = allItems
    .filter((i) => i.id !== item.id)
    .map((i) => ({
      item: i,
      score: calculateVisualSimilarityScore(item, i)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/90 backdrop-blur-xl overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-6xl bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl my-8 flex flex-col lg:flex-row max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-stone-950/80 border border-stone-800 text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-all"
        >
          <X size={18} />
        </button>

        {/* Left Side: Photo Display */}
        <div className="lg:w-7/12 bg-stone-950 flex flex-col items-center justify-center relative p-6 min-h-[380px] lg:min-h-[600px] border-b lg:border-b-0 lg:border-r border-stone-800">
          <img
            src={item.url}
            alt={item.title}
            referrerPolicy="no-referrer"
            className="max-h-[75vh] w-auto max-w-full object-contain rounded-xl shadow-2xl"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.dataset.triedProxy) {
                target.dataset.triedProxy = 'true';
                target.src = `https://images.weserv.nl/?url=${encodeURIComponent(item.url)}`;
              }
            }}
          />

          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
            {item.location && (
              <span className="text-xs text-stone-300 bg-stone-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-stone-800/80 flex items-center gap-1.5 pointer-events-auto">
                <MapPin size={13} className="text-amber-400" />
                {item.location}
              </span>
            )}
            {item.author && (
              <span className="text-xs text-stone-400 bg-stone-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-stone-800/80 flex items-center gap-1.5 pointer-events-auto ml-auto">
                <Camera size={13} className="text-stone-500" />
                Photo by {item.author}
              </span>
            )}
          </div>
        </div>

        {/* Right Side: Metadata, Color Swatches, AI Vector Match */}
        <div className="lg:w-5/12 p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between gap-3 mb-2">
                <h2 className="font-serif text-2xl font-medium tracking-tight text-stone-100">
                  {item.title}
                </h2>
                <button
                  onClick={() => onToggleFavorite(item.id)}
                  className="p-2 rounded-xl bg-stone-800/60 border border-stone-700/60 text-stone-300 hover:text-rose-400 transition-all"
                >
                  <Heart
                    size={20}
                    className={item.isFavorite ? 'fill-rose-500 text-rose-500' : ''}
                  />
                </button>
              </div>
              <p className="text-xs text-stone-400">
                Archived on {new Date(item.dateAdded).toLocaleDateString()}
              </p>
            </div>

            {/* Palette Inspector */}
            <div className="space-y-2.5 bg-stone-950/60 p-4 rounded-2xl border border-stone-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-sans font-medium uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-400" />
                  {t.extractedPalette}
                </h3>
                <button
                  onClick={handleCopyCSS}
                  className="text-[11px] text-stone-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                >
                  {copiedCSS ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  {copiedCSS ? 'Copied!' : t.copyCSS}
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2 pt-1">
                {item.palette.map((hex) => (
                  <button
                    key={hex}
                    onClick={() => handleCopyHex(hex)}
                    className="group/swatch flex flex-col items-center gap-1 focus:outline-none"
                  >
                    <div
                      className="w-full h-10 rounded-lg shadow-md transition-transform group-hover/swatch:scale-105 border border-stone-700/40 relative flex items-center justify-center"
                      style={{ backgroundColor: hex }}
                    >
                      {copiedHex === hex && (
                        <Check size={14} className="text-white drop-shadow-md" />
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-stone-400 group-hover/swatch:text-stone-200">
                      {hex}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Lighting Vector Indicator */}
            <div className="bg-stone-950/60 p-3.5 rounded-2xl border border-stone-800 flex items-center justify-between text-xs">
              <span className="text-stone-400 flex items-center gap-1.5">
                <Activity size={14} className="text-cyan-400" />
                Lighting Warmth Vector:
              </span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-amber-400 to-rose-500"
                    style={{ width: `${visualFeatures.warmth}%` }}
                  />
                </div>
                <span className="font-mono text-stone-200">{visualFeatures.warmth}%</span>
              </div>
            </div>

            {/* Tag Classification */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-sans font-medium uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
                  <Tag size={14} className="text-rose-400" />
                  Classification
                </h3>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-[10px] text-stone-400 uppercase tracking-widest block mb-1">
                    Emotions:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.emotionTags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-rose-950/50 border border-rose-800/80 text-rose-300 px-2.5 py-0.5 rounded-full flex items-center gap-1"
                      >
                        {tag}
                        <button
                          onClick={() => handleRemoveEmotionTag(tag)}
                          className="hover:text-white"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-stone-400 uppercase tracking-widest block mb-1">
                    Aesthetics:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.aestheticTags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-amber-950/50 border border-amber-800/80 text-amber-300 px-2.5 py-0.5 rounded-full flex items-center gap-1"
                      >
                        {tag}
                        <button
                          onClick={() => handleRemoveAestheticTag(tag)}
                          className="hover:text-white"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleAddTag} className="flex gap-2 pt-1">
                  <select
                    value={tagCategory}
                    onChange={(e) => setTagCategory(e.target.value as 'emotion' | 'aesthetic')}
                    className="bg-stone-950 border border-stone-800 text-[11px] text-stone-300 rounded-lg px-2"
                  >
                    <option value="emotion">Emotion</option>
                    <option value="aesthetic">Aesthetic</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Add tag..."
                    value={newTagText}
                    onChange={(e) => setNewTagText(e.target.value)}
                    className="flex-1 bg-stone-950 border border-stone-800 text-xs text-stone-200 rounded-lg px-3 py-1 focus:border-stone-600 outline-none"
                  />
                  <button
                    type="submit"
                    className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs"
                  >
                    Add
                  </button>
                </form>
              </div>
            </div>

            {/* AI Image Generation Prompt Synthesizer */}
            <div className="bg-stone-950/80 p-3.5 rounded-2xl border border-stone-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-stone-300 flex items-center gap-1.5">
                  <Compass size={14} className="text-cyan-400" />
                  {t.aiPromptGenerator}
                </span>
                <button
                  onClick={handleCopyAIPrompt}
                  className="text-xs text-stone-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  {copiedPrompt ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  {copiedPrompt ? 'Copied!' : t.copyPrompt}
                </button>
              </div>
              <p className="text-[11px] font-mono text-stone-400 bg-stone-900/90 p-2.5 rounded-xl border border-stone-800 leading-relaxed overflow-x-auto">
                {generateAIPrompt()}
              </p>
            </div>

            {/* Personal Vibe Notes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-stone-300 uppercase tracking-wider">
                  {t.personalNotes}
                </span>
                {!isEditingNotes && (
                  <button
                    onClick={() => setIsEditingNotes(true)}
                    className="text-xs text-stone-400 hover:text-stone-200"
                  >
                    Edit
                  </button>
                )}
              </div>
              {isEditingNotes ? (
                <div className="space-y-2">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Write lighting, atmospheric details, design inspiration..."
                    className="w-full h-20 bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-xs text-stone-200 focus:border-amber-500/50 outline-none resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsEditingNotes(false)}
                      className="px-3 py-1 bg-stone-800 text-stone-400 rounded-lg text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveNotes}
                      className="px-3 py-1 bg-amber-600 text-stone-950 font-medium rounded-lg text-xs"
                    >
                      Save Notes
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-stone-400 italic bg-stone-950/40 p-3 rounded-xl border border-stone-800/60">
                  {item.notes || 'No notes added yet for this vibe.'}
                </p>
              )}
            </div>

            {/* Visual AI Similarity Recommendations */}
            {similarItems.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-medium text-stone-300 uppercase tracking-wider block">
                  {t.moreLikeThis} (AI Vector Similarity)
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {similarItems.map(({ item: sim, score }) => (
                    <div
                      key={sim.id}
                      onClick={() => onSelectSimilar(sim)}
                      className="group/sim aspect-square rounded-xl overflow-hidden border border-stone-800 cursor-pointer hover:border-amber-500 transition-all relative"
                    >
                      <img
                        src={sim.thumbnailUrl || sim.url}
                        alt={sim.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 right-1 bg-stone-950/90 text-amber-300 text-[9px] px-1 rounded font-mono">
                        {score}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-stone-800 flex items-center justify-between gap-3">
            <button
              onClick={() => onDeleteItem(item.id)}
              className="px-3 py-1.5 rounded-xl border border-rose-900/60 text-rose-400 hover:bg-rose-950/40 text-xs flex items-center gap-1.5 transition-colors"
            >
              <Trash2 size={14} />
              {t.delete}
            </button>

            <button
              onClick={() => {
                onPinToMoodboard(item);
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-stone-100 text-stone-950 text-xs font-medium hover:bg-white transition-all flex items-center gap-1.5 shadow-md"
            >
              <Layers size={14} />
              {t.pinToMoodboard}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
