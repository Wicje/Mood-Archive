import React from 'react';
import {
  Sparkles,
  Palette,
  Plus,
  Compass,
  Volume2,
  VolumeX,
  Search,
  SlidersHorizontal,
  Bookmark,
  Layers,
  Globe,
  Download,
  UploadCloud
} from 'lucide-react';
import { FilterState } from '../types';
import { Language, TRANSLATIONS, TranslationDict } from '../services/i18n';

interface NavbarProps {
  filterState: FilterState;
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>;
  onOpenUpload: () => void;
  onOpenBulkImport: () => void;
  onOpenVibePalette: () => void;
  onOpenMoodboard: () => void;
  onOpenVibeRoulette: () => void;
  soundPlaying: boolean;
  onToggleSound: () => void;
  showSidebar: boolean;
  setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  totalItemsCount: number;
  currentLanguage: Language;
  onChangeLanguage: (lang: Language) => void;
  t: TranslationDict;
}

export const Navbar: React.FC<NavbarProps> = ({
  filterState,
  setFilterState,
  onOpenUpload,
  onOpenBulkImport,
  onOpenVibePalette,
  onOpenMoodboard,
  onOpenVibeRoulette,
  soundPlaying,
  onToggleSound,
  showSidebar,
  setShowSidebar,
  totalItemsCount,
  currentLanguage,
  onChangeLanguage,
  t
}) => {
  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-stone-950/80 border-b border-stone-800/80 px-4 lg:px-8 py-3 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Sidebar Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSidebar((prev) => !prev)}
            className={`p-2 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800/60 transition-all ${
              showSidebar ? 'bg-stone-800/80 text-stone-100' : ''
            }`}
            title="Toggle Filter Panel"
          >
            <SlidersHorizontal size={18} />
          </button>

          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() =>
              setFilterState((prev) => ({
                ...prev,
                selectedEmotions: [],
                selectedAesthetics: [],
                selectedColorHex: null,
                searchQuery: ''
              }))
            }
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 via-rose-500/20 to-stone-900 border border-stone-700/60 flex items-center justify-center text-amber-300 shadow-inner">
              <Sparkles size={18} />
            </div>
            <div>
              <h1 className="font-serif text-lg font-medium tracking-tight text-stone-100 flex items-center gap-1.5 leading-none">
                {t.appTitle}
                <span className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-stone-800 text-amber-300/90 font-normal uppercase tracking-wider">
                  Global
                </span>
              </h1>
              <p className="text-[11px] font-sans text-stone-400 tracking-wide">
                {t.tagline} ({totalItemsCount})
              </p>
            </div>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-500 group-focus-within:text-amber-400 transition-colors" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={filterState.searchQuery}
              onChange={(e) =>
                setFilterState((prev) => ({ ...prev, searchQuery: e.target.value }))
              }
              className="w-full bg-stone-900/90 border border-stone-800 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 rounded-xl pl-9 pr-4 py-1.5 text-sm text-stone-200 placeholder-stone-500 outline-none transition-all"
            />
            {filterState.searchQuery && (
              <button
                onClick={() => setFilterState((prev) => ({ ...prev, searchQuery: '' }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-500 hover:text-stone-300"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2">
          {/* Language Selector Dropdown */}
          <div className="relative flex items-center gap-1 bg-stone-900/80 border border-stone-800 rounded-lg px-2 py-1 text-xs">
            <Globe size={14} className="text-amber-400" />
            <select
              value={currentLanguage}
              onChange={(e) => onChangeLanguage(e.target.value as Language)}
              className="bg-transparent text-stone-200 outline-none cursor-pointer text-xs uppercase"
            >
              <option value="en">EN</option>
              <option value="ja">JA (日本語)</option>
              <option value="fr">FR (Français)</option>
              <option value="de">DE (Deutsch)</option>
              <option value="es">ES (Español)</option>
              <option value="ko">KO (한국어)</option>
            </select>
          </div>

          {/* Bulk Pinterest/Web Import Button */}
          <button
            onClick={onOpenBulkImport}
            className="p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium bg-stone-900/80 border border-stone-800 text-cyan-300 hover:bg-stone-800 hover:border-cyan-500/40 transition-all flex items-center gap-1.5"
            title={t.bulkImport}
          >
            <UploadCloud size={15} />
            <span className="hidden xl:inline">{t.bulkImport}</span>
          </button>

          {/* Favorites Filter */}
          <button
            onClick={() =>
              setFilterState((prev) => ({ ...prev, onlyFavorites: !prev.onlyFavorites }))
            }
            className={`p-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 border ${
              filterState.onlyFavorites
                ? 'bg-rose-950/40 border-rose-800/80 text-rose-300'
                : 'bg-stone-900/60 border-stone-800/80 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
            title={t.saved}
          >
            <Bookmark
              size={16}
              className={filterState.onlyFavorites ? 'fill-rose-400 text-rose-400' : ''}
            />
            <span className="hidden sm:inline text-xs">{t.saved}</span>
          </button>

          {/* Vibe Roulette */}
          <button
            onClick={onOpenVibeRoulette}
            className="p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium bg-stone-900/80 border border-stone-800 text-amber-200/90 hover:bg-stone-800 hover:border-amber-500/40 transition-all flex items-center gap-1.5 shadow-sm"
            title={t.vibeRoulette}
          >
            <Compass size={15} className="text-amber-400 animate-spin-slow" />
            <span className="hidden sm:inline">{t.vibeRoulette}</span>
          </button>

          {/* Palette Studio */}
          <button
            onClick={onOpenVibePalette}
            className="p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium bg-stone-900/80 border border-stone-800 text-stone-200 hover:bg-stone-800 hover:border-stone-700 transition-all flex items-center gap-1.5"
            title={t.vibePalettes}
          >
            <Palette size={15} className="text-rose-400" />
            <span className="hidden md:inline">{t.vibePalettes}</span>
          </button>

          {/* Moodboard Studio */}
          <button
            onClick={onOpenMoodboard}
            className="p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium bg-stone-900/80 border border-stone-800 text-stone-200 hover:bg-stone-800 hover:border-stone-700 transition-all flex items-center gap-1.5"
            title={t.moodboardStudio}
          >
            <Layers size={15} className="text-cyan-400" />
            <span className="hidden lg:inline">{t.moodboardStudio}</span>
          </button>

          {/* Soundscape Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-lg transition-all border ${
              soundPlaying
                ? 'bg-amber-950/40 border-amber-800/80 text-amber-300 animate-pulse'
                : 'bg-stone-900/80 border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
            title="Toggle Ambient Soundscape"
          >
            {soundPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* Add Vibe */}
          <button
            onClick={onOpenUpload}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-stone-100 hover:bg-white text-stone-950 font-sans tracking-wide transition-all shadow-md flex items-center gap-1.5 active:scale-95"
          >
            <Plus size={16} />
            <span>{t.addVibe}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
