import React, { useState } from 'react';
import { MoodItem, FilterState } from '../types';
import { Heart, Plus, Sparkles } from 'lucide-react';
import { TranslationDict } from '../services/i18n';

interface ImageGridProps {
  items: MoodItem[];
  filterState: FilterState;
  onSelectItem: (item: MoodItem) => void;
  onToggleFavorite: (id: string) => void;
  onPinToMoodboard: (item: MoodItem) => void;
  t: TranslationDict;
}

export const ImageGrid: React.FC<ImageGridProps> = ({
  items,
  filterState,
  onSelectItem,
  onToggleFavorite,
  onPinToMoodboard,
  t
}) => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const handleCopyHex = (e: React.MouseEvent, hex: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] p-8 text-center border border-dashed border-stone-800/80 rounded-2xl bg-stone-950/40 my-6">
        <div className="w-12 h-12 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-500 mb-4">
          <Sparkles size={24} />
        </div>
        <h3 className="font-serif text-lg font-medium text-stone-200 mb-1">
          {t.noMatchTitle}
        </h3>
        <p className="text-xs text-stone-400 max-w-sm mb-4">
          {t.noMatchDesc}
        </p>
      </div>
    );
  }

  if (filterState.layoutMode === 'filmstrip') {
    return (
      <div className="flex gap-4 overflow-x-auto py-4 px-2 scrollbar-thin">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectItem(item)}
            className="flex-shrink-0 w-80 group cursor-pointer bg-stone-900/80 border border-stone-800 rounded-2xl overflow-hidden hover:border-stone-700 transition-all duration-300 shadow-lg"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-stone-950">
              <img
                src={item.thumbnailUrl || item.url}
                alt={item.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(item.id);
                }}
                className="absolute top-3 right-3 p-2 rounded-full bg-stone-950/60 backdrop-blur-md text-stone-300 hover:text-rose-400 border border-stone-800 transition-all"
              >
                <Heart size={15} className={item.isFavorite ? 'fill-rose-500 text-rose-500' : ''} />
              </button>
            </div>
            <div className="p-4 space-y-2">
              <h4 className="font-serif text-sm text-stone-200 truncate">{item.title}</h4>
              <div className="flex flex-wrap gap-1">
                {item.emotionTags.map((tag) => (
                  <span key={tag} className="text-[10px] bg-stone-800 text-stone-400 px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={
        filterState.layoutMode === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
          : 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4'
      }
    >
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => onSelectItem(item)}
          className="group relative cursor-pointer break-inside-avoid rounded-2xl bg-stone-900/70 border border-stone-800/80 overflow-hidden transition-all duration-300 hover:border-amber-500/30 hover:shadow-2xl hover:shadow-black/60"
        >
          <div className="relative overflow-hidden bg-stone-950">
            <img
              src={item.thumbnailUrl || item.url}
              alt={item.title}
              loading="lazy"
              className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4" />

            <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex flex-wrap gap-1 max-w-[70%]">
                {item.emotionTags.slice(0, 2).map((emotion) => (
                  <span
                    key={emotion}
                    className="text-[10px] font-sans font-medium px-2 py-0.5 rounded-full bg-stone-950/80 backdrop-blur-md border border-stone-800 text-rose-300"
                  >
                    {emotion}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-1.5 pointer-events-auto">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPinToMoodboard(item);
                  }}
                  title="Pin to Moodboard Studio"
                  className="p-1.5 rounded-full bg-stone-950/80 backdrop-blur-md border border-stone-800 text-stone-300 hover:text-cyan-300 hover:border-cyan-800 transition-all"
                >
                  <Plus size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(item.id);
                  }}
                  title="Bookmark item"
                  className="p-1.5 rounded-full bg-stone-950/80 backdrop-blur-md border border-stone-800 text-stone-300 hover:text-rose-400 hover:border-rose-800 transition-all"
                >
                  <Heart
                    size={14}
                    className={item.isFavorite ? 'fill-rose-500 text-rose-500' : ''}
                  />
                </button>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-col gap-2 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-stone-950/90 backdrop-blur-md border-t border-stone-800/80">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xs font-medium text-stone-100 truncate pr-2">
                  {item.title}
                </h3>
                <span className="text-[10px] text-stone-400 font-sans">
                  {item.aestheticTags[0]}
                </span>
              </div>

              <div className="flex items-center gap-1 pt-1 border-t border-stone-800/60">
                {item.palette.map((hex) => (
                  <button
                    key={hex}
                    onClick={(e) => handleCopyHex(e, hex)}
                    title={`Copy ${hex}`}
                    className="flex-1 h-3.5 rounded-sm transition-transform hover:scale-125 relative group/hex"
                    style={{ backgroundColor: hex }}
                  >
                    {copiedHex === hex && (
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-stone-900 border border-stone-700 text-stone-200 text-[9px] px-1 py-0.5 rounded shadow">
                        Copied!
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
