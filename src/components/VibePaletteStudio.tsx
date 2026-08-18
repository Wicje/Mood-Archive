import React, { useState, useEffect } from 'react';
import { MoodItem } from '../types';
import {
  Palette,
  Shuffle,
  Copy,
  Check,
  Sparkles,
  X,
  Layers,
  Eye
} from 'lucide-react';
import { exportPaletteAsCSS, exportPaletteAsTailwind, generateHarmoniousPalette } from '../services/colorExtractor';
import { TranslationDict } from '../services/i18n';

interface VibePaletteStudioProps {
  items: MoodItem[];
  onClose: () => void;
  onSelectItem: (item: MoodItem) => void;
  t: TranslationDict;
}

export const VibePaletteStudio: React.FC<VibePaletteStudioProps> = ({
  items,
  onClose,
  onSelectItem,
  t
}) => {
  const [selectedEmotion, setSelectedEmotion] = useState<string>('Nostalgic');
  const [selectedAesthetic, setSelectedAesthetic] = useState<string>('Film Grain');
  const [activePalette, setActivePalette] = useState<string[]>(['#1c1917', '#451a03', '#78350f', '#b45309', '#d97706']);
  const [vibeName, setVibeName] = useState<string>('Nostalgic Film Grain');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<'css' | 'tailwind' | 'figma' | 'hexes'>('css');

  const matchingItems = items.filter((item) => {
    const matchEmotion = !selectedEmotion || item.emotionTags.includes(selectedEmotion);
    const matchAesthetic = !selectedAesthetic || item.aestheticTags.includes(selectedAesthetic);
    return matchEmotion || matchAesthetic;
  });

  const pullRandomPalette = () => {
    if (matchingItems.length > 0) {
      const randomIndex = Math.floor(Math.random() * matchingItems.length);
      const chosenItem = matchingItems[randomIndex];
      setActivePalette(chosenItem.palette);
      setVibeName(`${selectedEmotion} ${selectedAesthetic} - ${chosenItem.title}`);
    } else if (items.length > 0) {
      // Derive real color harmony from active archive items
      const randomIndex = Math.floor(Math.random() * items.length);
      const sampleItem = items[randomIndex];
      const baseColor = sampleItem.palette[0] || '#1c1917';
      const harmonies = generateHarmoniousPalette(baseColor);
      setActivePalette(harmonies.monochromatic);
      setVibeName(`${selectedEmotion} ${selectedAesthetic} (Derived from ${sampleItem.title})`);
    }
  };

  useEffect(() => {
    pullRandomPalette();
  }, [selectedEmotion, selectedAesthetic]);

  const exportAsFigmaTokens = (name: string, hexes: string[]): string => {
    const tokens: Record<string, { value: string; type: string }> = {};
    hexes.forEach((hex, i) => {
      tokens[`color.${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.${i + 1}`] = {
        value: hex,
        type: 'color'
      };
    });
    return JSON.stringify(tokens, null, 2);
  };

  const handleCopyCode = () => {
    let codeStr = '';
    if (exportFormat === 'css') {
      codeStr = exportPaletteAsCSS(vibeName, activePalette);
    } else if (exportFormat === 'tailwind') {
      codeStr = exportPaletteAsTailwind(vibeName, activePalette);
    } else if (exportFormat === 'figma') {
      codeStr = exportAsFigmaTokens(vibeName, activePalette);
    } else {
      codeStr = JSON.stringify(activePalette, null, 2);
    }
    navigator.clipboard.writeText(codeStr);
    setCopiedCode(exportFormat);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/90 backdrop-blur-xl overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-5xl bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl my-8 p-6 lg:p-8 space-y-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-stone-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Palette size={20} />
            </div>
            <div>
              <h2 className="font-serif text-xl font-medium text-stone-100 flex items-center gap-2">
                {t.vibeStudioTitle}
              </h2>
              <p className="text-xs text-stone-400">
                {t.vibeStudioDesc}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-stone-950/80 border border-stone-800 text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Vibe Selector Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-stone-950/70 p-4 rounded-2xl border border-stone-800">
          <div>
            <label className="text-xs font-sans font-medium text-stone-400 uppercase tracking-wider block mb-1.5">
              1. {t.emotionHeading}
            </label>
            <select
              value={selectedEmotion}
              onChange={(e) => setSelectedEmotion(e.target.value)}
              className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-xs text-stone-200 outline-none focus:border-rose-500/50"
            >
              {['Nostalgic', 'Melancholic', 'Euphoric', 'Serene', 'Anxious', 'Ethereal', 'Cyber-noir', 'Cozy', 'Wanderlust', 'Solitude'].map(
                (e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label className="text-xs font-sans font-medium text-stone-400 uppercase tracking-wider block mb-1.5">
              2. {t.aestheticHeading}
            </label>
            <select
              value={selectedAesthetic}
              onChange={(e) => setSelectedAesthetic(e.target.value)}
              className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-xs text-stone-200 outline-none focus:border-amber-500/50"
            >
              {['Cyberpunk', 'Dark Academia', 'Cottagecore', 'Minimalist', 'Film Grain', 'Wabi-Sabi', 'Vaporwave', 'Brutalist', 'Surrealism', 'Monochrome'].map(
                (a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={pullRandomPalette}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-stone-950 font-medium text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <Shuffle size={16} />
              {t.pullRandomPalette}
            </button>
          </div>
        </div>

        {/* Active Pulled Palette */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-medium text-stone-200 flex items-center gap-2">
              <Sparkles size={16} className="text-amber-400" />
              {vibeName}
            </h3>

            <div className="flex items-center gap-2">
              <div className="bg-stone-950 p-1 rounded-xl border border-stone-800 flex text-xs">
                {(['css', 'tailwind', 'figma', 'hexes'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setExportFormat(fmt)}
                    className={`px-2.5 py-1 rounded-lg uppercase tracking-wider text-[10px] ${
                      exportFormat === fmt ? 'bg-stone-800 text-stone-100' : 'text-stone-400'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>

              <button
                onClick={handleCopyCode}
                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs flex items-center gap-1.5 transition-all"
              >
                {copiedCode ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copiedCode ? 'Copied!' : 'Export Tokens'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-3">
            {activePalette.map((hex, idx) => (
              <div
                key={idx}
                onClick={() => {
                  navigator.clipboard.writeText(hex);
                  setCopiedCode(hex);
                  setTimeout(() => setCopiedCode(null), 1500);
                }}
                className="group cursor-pointer flex flex-col items-center gap-2"
              >
                <div
                  className="w-full h-24 rounded-2xl border border-stone-800 shadow-xl group-hover:scale-105 transition-all duration-300 relative flex items-center justify-center"
                  style={{ backgroundColor: hex }}
                >
                  {copiedCode === hex && (
                    <span className="text-[10px] font-sans bg-stone-950/80 px-2 py-0.5 rounded text-stone-100">
                      Copied
                    </span>
                  )}
                </div>
                <div className="text-center">
                  <span className="text-xs font-mono text-stone-300 block">{hex}</span>
                  <span className="text-[10px] text-stone-500 font-sans uppercase">Tone {idx + 1}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* UI Mock Preview */}
        <div className="space-y-3 bg-stone-950/80 p-5 rounded-2xl border border-stone-800">
          <span className="text-xs font-medium text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
            <Eye size={14} className="text-cyan-400" />
            {t.uiPreviewTitle}
          </span>

          <div
            className="p-6 rounded-2xl border transition-all space-y-4"
            style={{
              backgroundColor: activePalette[0] || '#1c1917',
              borderColor: activePalette[1] || '#334155'
            }}
          >
            <div className="flex items-center justify-between">
              <h4
                className="font-serif text-xl font-medium"
                style={{ color: activePalette[4] || '#f8fafc' }}
              >
                Aesthetic Interface Sample
              </h4>
              <span
                className="px-3 py-1 rounded-full text-xs font-sans font-medium"
                style={{
                  backgroundColor: activePalette[2] || '#475569',
                  color: activePalette[0] || '#0f172a'
                }}
              >
                Vibe Active
              </span>
            </div>

            <p className="text-xs max-w-lg" style={{ color: activePalette[3] || '#cbd5e1' }}>
              {t.uiPreviewDesc}
            </p>

            <div className="flex gap-3">
              <button
                className="px-4 py-2 rounded-xl text-xs font-medium transition-transform active:scale-95 shadow-md"
                style={{
                  backgroundColor: activePalette[3] || '#38bdf8',
                  color: activePalette[0] || '#0f172a'
                }}
              >
                Primary Token Button
              </button>
              <button
                className="px-4 py-2 rounded-xl text-xs font-medium border"
                style={{
                  borderColor: activePalette[2] || '#475569',
                  color: activePalette[4] || '#ffffff'
                }}
              >
                Secondary Token
              </button>
            </div>
          </div>
        </div>

        {/* Matching Reference Gallery */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-base font-medium text-stone-200 flex items-center gap-2">
              <Layers size={16} className="text-rose-400" />
              {t.matchingGallery} ({matchingItems.length})
            </h3>
          </div>

          {matchingItems.length === 0 ? (
            <p className="text-xs text-stone-500 italic p-4 text-center">
              No matching images in your archive for this specific vibe combination yet.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {matchingItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectItem(item);
                    onClose();
                  }}
                  className="group cursor-pointer aspect-square rounded-2xl overflow-hidden border border-stone-800 relative hover:border-amber-500 transition-all"
                >
                  <img
                    src={item.thumbnailUrl || item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-stone-950/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end">
                    <span className="text-xs font-serif text-stone-100 truncate">{item.title}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
