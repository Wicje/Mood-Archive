import React from 'react';
import { EmotionTag, AestheticTag, FilterState } from '../types';
import {
  RotateCcw,
  Sparkles,
  Grid,
  Columns,
  Tag,
  Palette as PaletteIcon,
  Sliders,
  Film
} from 'lucide-react';
import { TranslationDict } from '../services/i18n';

interface SidebarFilterProps {
  filterState: FilterState;
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>;
  availableEmotions: EmotionTag[];
  availableAesthetics: AestheticTag[];
  onCloseMobile?: () => void;
  t: TranslationDict;
}

const COLOR_SWATCHES = [
  { name: 'Midnight', hex: '#0f172a' },
  { name: 'Crimson', hex: '#be123c' },
  { name: 'Amber', hex: '#d97706' },
  { name: 'Emerald', hex: '#047857' },
  { name: 'Indigo', hex: '#4338ca' },
  { name: 'Violet', hex: '#7e22ce' },
  { name: 'Charcoal', hex: '#27272a' },
  { name: 'Warm Warmth', hex: '#78350f' }
];

export const SidebarFilter: React.FC<SidebarFilterProps> = ({
  filterState,
  setFilterState,
  availableEmotions,
  availableAesthetics,
  onCloseMobile,
  t
}) => {
  const toggleEmotion = (emotion: string) => {
    setFilterState((prev) => {
      const exists = prev.selectedEmotions.includes(emotion);
      return {
        ...prev,
        selectedEmotions: exists
          ? prev.selectedEmotions.filter((e) => e !== emotion)
          : [...prev.selectedEmotions, emotion]
      };
    });
  };

  const toggleAesthetic = (aesthetic: string) => {
    setFilterState((prev) => {
      const exists = prev.selectedAesthetics.includes(aesthetic);
      return {
        ...prev,
        selectedAesthetics: exists
          ? prev.selectedAesthetics.filter((a) => a !== aesthetic)
          : [...prev.selectedAesthetics, aesthetic]
      };
    });
  };

  const resetFilters = () => {
    setFilterState({
      searchQuery: '',
      selectedEmotions: [],
      selectedAesthetics: [],
      selectedColorHex: null,
      onlyFavorites: false,
      sortBy: 'newest',
      layoutMode: filterState.layoutMode,
      aspectRatioFilter: 'all'
    });
  };

  const hasActiveFilters =
    filterState.selectedEmotions.length > 0 ||
    filterState.selectedAesthetics.length > 0 ||
    filterState.selectedColorHex !== null ||
    filterState.searchQuery !== '' ||
    filterState.onlyFavorites ||
    filterState.aspectRatioFilter !== 'all';

  return (
    <aside className="w-full lg:w-72 bg-stone-950/60 border-r border-stone-800/80 p-5 flex flex-col gap-6 overflow-y-auto max-h-[calc(100vh-60px)] sticky top-[60px]">
      {/* Header & Reset */}
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-sm font-medium tracking-wide text-stone-200 uppercase flex items-center gap-2">
          <Sliders size={15} className="text-amber-400" />
          {t.appTitle} Filter
        </h2>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-xs text-stone-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
          >
            <RotateCcw size={12} />
            {t.resetAll}
          </button>
        )}
      </div>

      {/* Layout Display Modes */}
      <div className="space-y-2">
        <label className="text-xs font-sans font-medium text-stone-400 uppercase tracking-wider block">
          {t.layoutView}
        </label>
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-900/90 rounded-xl border border-stone-800">
          <button
            onClick={() => setFilterState((prev) => ({ ...prev, layoutMode: 'masonry' }))}
            className={`py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
              filterState.layoutMode === 'masonry'
                ? 'bg-stone-800 text-amber-200 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Columns size={14} />
            Masonry
          </button>
          <button
            onClick={() => setFilterState((prev) => ({ ...prev, layoutMode: 'grid' }))}
            className={`py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
              filterState.layoutMode === 'grid'
                ? 'bg-stone-800 text-amber-200 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Grid size={14} />
            Grid
          </button>
          <button
            onClick={() => setFilterState((prev) => ({ ...prev, layoutMode: 'filmstrip' }))}
            className={`py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
              filterState.layoutMode === 'filmstrip'
                ? 'bg-stone-800 text-amber-200 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Film size={14} />
            Strip
          </button>
        </div>
      </div>

      {/* Emotion Filter Tags */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-sans font-medium text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={13} className="text-rose-400" />
            {t.emotionHeading}
          </label>

          {filterState.selectedEmotions.length > 0 && (
            <span className="text-[10px] bg-rose-950/60 border border-rose-800/80 text-rose-300 px-1.5 py-0.5 rounded-full">
              {filterState.selectedEmotions.length}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {availableEmotions.map((emotion) => {
            const isSelected = filterState.selectedEmotions.includes(emotion);
            return (
              <button
                key={emotion}
                onClick={() => toggleEmotion(emotion)}
                className={`px-2.5 py-1 rounded-full text-xs font-sans transition-all duration-200 border ${
                  isSelected
                    ? 'bg-rose-900/40 border-rose-600 text-rose-200 shadow-sm'
                    : 'bg-stone-900/60 border-stone-800/80 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                }`}
              >
                {emotion}
              </button>
            );
          })}
        </div>
      </div>

      {/* Aesthetic & Vibe Filter Tags */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-sans font-medium text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
            <Tag size={13} className="text-amber-400" />
            {t.aestheticHeading}
          </label>
          {filterState.selectedAesthetics.length > 0 && (
            <span className="text-[10px] bg-amber-950/60 border border-amber-800/80 text-amber-300 px-1.5 py-0.5 rounded-full">
              {filterState.selectedAesthetics.length}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {availableAesthetics.map((aesthetic) => {
            const isSelected = filterState.selectedAesthetics.includes(aesthetic);
            return (
              <button
                key={aesthetic}
                onClick={() => toggleAesthetic(aesthetic)}
                className={`px-2.5 py-1 rounded-full text-xs font-sans transition-all duration-200 border ${
                  isSelected
                    ? 'bg-amber-900/40 border-amber-600 text-amber-200 shadow-sm'
                    : 'bg-stone-900/60 border-stone-800/80 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                }`}
              >
                {aesthetic}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dominant Color Filter */}
      <div className="space-y-2.5">
        <label className="text-xs font-sans font-medium text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
          <PaletteIcon size={13} className="text-cyan-400" />
          {t.colorHeading}
        </label>
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={() => setFilterState((prev) => ({ ...prev, selectedColorHex: null }))}
            className={`px-2 py-1 rounded-lg text-xs border transition-all ${
              filterState.selectedColorHex === null
                ? 'bg-stone-800 border-amber-400/60 text-amber-200'
                : 'bg-stone-900 border-stone-800 text-stone-400'
            }`}
          >
            {t.allColors}
          </button>
          {COLOR_SWATCHES.map((swatch) => {
            const isSelected = filterState.selectedColorHex === swatch.hex;
            return (
              <button
                key={swatch.hex}
                onClick={() =>
                  setFilterState((prev) => ({
                    ...prev,
                    selectedColorHex: isSelected ? null : swatch.hex
                  }))
                }
                title={swatch.name}
                className={`w-6 h-6 rounded-full transition-transform border-2 relative ${
                  isSelected ? 'scale-125 border-amber-300 shadow-lg' : 'border-stone-800 hover:scale-110'
                }`}
                style={{ backgroundColor: swatch.hex }}
              />
            );
          })}
        </div>
      </div>

      {/* Aspect Ratio Filter */}
      <div className="space-y-2">
        <label className="text-xs font-sans font-medium text-stone-400 uppercase tracking-wider block">
          {t.aspectHeading}
        </label>
        <div className="grid grid-cols-4 gap-1 p-1 bg-stone-900/90 rounded-xl border border-stone-800 text-[11px]">
          {(['all', 'portrait', 'landscape', 'square'] as const).map((ratio) => (
            <button
              key={ratio}
              onClick={() => setFilterState((prev) => ({ ...prev, aspectRatioFilter: ratio }))}
              className={`py-1 capitalize rounded-md transition-all ${
                filterState.aspectRatioFilter === ratio
                  ? 'bg-stone-800 text-stone-100 font-medium'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {ratio}
            </button>
          ))}
        </div>
      </div>

      {/* Sort Order */}
      <div className="space-y-2">
        <label className="text-xs font-sans font-medium text-stone-400 uppercase tracking-wider block">
          {t.sortHeading}
        </label>
        <select
          value={filterState.sortBy}
          onChange={(e) =>
            setFilterState((prev) => ({
              ...prev,
              sortBy: e.target.value as 'newest' | 'oldest' | 'title'
            }))
          }
          className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-1.5 text-xs text-stone-200 outline-none focus:border-stone-700"
        >
          <option value="newest">{t.recentlyArchived}</option>
          <option value="oldest">{t.oldestFirst}</option>
          <option value="title">{t.titleAZ}</option>
        </select>
      </div>

      {onCloseMobile && (
        <button
          onClick={onCloseMobile}
          className="lg:hidden mt-2 w-full py-2 bg-stone-800 rounded-xl text-xs text-stone-200 font-medium"
        >
          Apply Filters
        </button>
      )}
    </aside>
  );
};
