import React, { useState, useEffect, useMemo } from 'react';
import { MoodItem, EmotionTag, AestheticTag, FilterState } from './types';
import {
  getAllMoodItems,
  saveMoodItem,
  deleteMoodItem,
  toggleFavoriteItem
} from './services/storage';
import { Navbar } from './components/Navbar';
import { SidebarFilter } from './components/SidebarFilter';
import { ImageGrid } from './components/ImageGrid';
import { ImageDetailModal } from './components/ImageDetailModal';
import { VibePaletteStudio } from './components/VibePaletteStudio';
import { MoodboardCanvas } from './components/MoodboardCanvas';
import { UploadModal } from './components/UploadModal';
import { PinterestImporterModal } from './components/PinterestImporterModal';
import { VibeRouletteModal } from './components/VibeRouletteModal';
import { AmbianceBar } from './components/AmbianceBar';
import { synthService } from './services/audioSynth';
import { getColorDistance } from './services/colorExtractor';
import { Language, TRANSLATIONS } from './services/i18n';

export function App() {
  const [items, setItems] = useState<MoodItem[]>([]);
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');

  const t = useMemo(() => TRANSLATIONS[currentLanguage], [currentLanguage]);

  const [filterState, setFilterState] = useState<FilterState>({
    searchQuery: '',
    selectedEmotions: [],
    selectedAesthetics: [],
    selectedColorHex: null,
    onlyFavorites: false,
    sortBy: 'newest',
    layoutMode: 'masonry',
    aspectRatioFilter: 'all'
  });

  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  const [selectedItem, setSelectedItem] = useState<MoodItem | null>(null);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState<boolean>(false);
  const [showVibePaletteModal, setShowVibePaletteModal] = useState<boolean>(false);
  const [showMoodboardModal, setShowMoodboardModal] = useState<boolean>(false);
  const [showVibeRouletteModal, setShowVibeRouletteModal] = useState<boolean>(false);
  const [showSoundBar, setShowSoundBar] = useState<boolean>(false);
  const [soundPlaying, setSoundPlaying] = useState<boolean>(false);
  const [pinnedItems, setPinnedItems] = useState<MoodItem[]>([]);

  useEffect(() => {
    getAllMoodItems().then((fetched) => setItems(fetched));
  }, []);

  const availableEmotions = useMemo(() => {
    const set = new Set<EmotionTag>();
    items.forEach((item) =>
      item.emotionTags.forEach((e) => set.add(e as EmotionTag))
    );
    return Array.from(set);
  }, [items]);

  const availableAesthetics = useMemo(() => {
    const set = new Set<AestheticTag>();
    items.forEach((item) =>
      item.aestheticTags.forEach((a) => set.add(a as AestheticTag))
    );
    return Array.from(set);
  }, [items]);

  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        if (filterState.searchQuery) {
          const q = filterState.searchQuery.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchNotes = item.notes?.toLowerCase().includes(q) || false;
          const matchAuthor = item.author?.toLowerCase().includes(q) || false;
          const matchTag =
            item.emotionTags.some((e) => e.toLowerCase().includes(q)) ||
            item.aestheticTags.some((a) => a.toLowerCase().includes(q));
          if (!matchTitle && !matchNotes && !matchAuthor && !matchTag) return false;
        }

        if (filterState.onlyFavorites && !item.isFavorite) return false;

        if (filterState.selectedEmotions.length > 0) {
          const hasEmotion = filterState.selectedEmotions.some((e) =>
            item.emotionTags.includes(e)
          );
          if (!hasEmotion) return false;
        }

        if (filterState.selectedAesthetics.length > 0) {
          const hasAesthetic = filterState.selectedAesthetics.some((a) =>
            item.aestheticTags.includes(a)
          );
          if (!hasAesthetic) return false;
        }

        if (filterState.selectedColorHex) {
          const hasCloseColor = item.palette.some((hex) => {
            const dist = getColorDistance(hex, filterState.selectedColorHex!);
            return dist < 65;
          });
          if (!hasCloseColor) return false;
        }

        if (filterState.aspectRatioFilter !== 'all') {
          const aspect = item.aspectRatio || 1.0;
          if (filterState.aspectRatioFilter === 'portrait' && aspect >= 1.0)
            return false;
          if (filterState.aspectRatioFilter === 'landscape' && aspect <= 1.1)
            return false;
          if (
            filterState.aspectRatioFilter === 'square' &&
            (aspect < 0.85 || aspect > 1.15)
          )
            return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filterState.sortBy === 'newest') return b.dateAdded - a.dateAdded;
        if (filterState.sortBy === 'oldest') return a.dateAdded - b.dateAdded;
        if (filterState.sortBy === 'title') return a.title.localeCompare(b.title);
        return 0;
      });
  }, [items, filterState]);

  const handleToggleFavorite = async (id: string) => {
    const updated = await toggleFavoriteItem(id);
    setItems(updated);
    if (selectedItem && selectedItem.id === id) {
      setSelectedItem((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null));
    }
  };

  const handleSaveUploadedItem = async (newItem: MoodItem) => {
    await saveMoodItem(newItem);
    setItems((prev) => [newItem, ...prev]);
  };

  const handleBulkSaveUploadedItems = async (newItems: MoodItem[]) => {
    for (const item of newItems) {
      await saveMoodItem(item);
    }
    setItems((prev) => [...newItems, ...prev]);
  };

  const handleUpdateItem = async (updatedItem: MoodItem) => {
    await saveMoodItem(updatedItem);
    setItems((prev) => prev.map((i) => (i.id === updatedItem.id ? updatedItem : i)));
    setSelectedItem(updatedItem);
  };

  const handleDeleteItem = async (id: string) => {
    await deleteMoodItem(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    setSelectedItem(null);
  };

  const handlePinToMoodboard = (item: MoodItem) => {
    if (!pinnedItems.some((i) => i.id === item.id)) {
      setPinnedItems((prev) => [...prev, item]);
    }
    setShowMoodboardModal(true);
  };

  const handleToggleSound = () => {
    if (soundPlaying) {
      synthService.stop();
      setSoundPlaying(false);
    } else {
      synthService.playTrack('rain');
      setSoundPlaying(true);
      setShowSoundBar(true);
    }
  };

  const handleApplyVibeFromRoulette = (emotion: string, aesthetic: string) => {
    setFilterState((prev) => ({
      ...prev,
      selectedEmotions: [emotion],
      selectedAesthetics: [aesthetic],
      searchQuery: '',
      selectedColorHex: null
    }));
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-rose-500/30 selection:text-rose-200">
      <Navbar
        filterState={filterState}
        setFilterState={setFilterState}
        onOpenUpload={() => setShowUploadModal(true)}
        onOpenBulkImport={() => setShowBulkImportModal(true)}
        onOpenVibePalette={() => setShowVibePaletteModal(true)}
        onOpenMoodboard={() => setShowMoodboardModal(true)}
        onOpenVibeRoulette={() => setShowVibeRouletteModal(true)}
        soundPlaying={soundPlaying}
        onToggleSound={handleToggleSound}
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        totalItemsCount={filteredItems.length}
        currentLanguage={currentLanguage}
        onChangeLanguage={(lang) => setCurrentLanguage(lang)}
        t={t}
      />

      <div className="flex-1 flex max-w-full">
        {showSidebar && (
          <SidebarFilter
            filterState={filterState}
            setFilterState={setFilterState}
            availableEmotions={availableEmotions}
            availableAesthetics={availableAesthetics}
            t={t}
          />
        )}

        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto space-y-6 overflow-hidden">
          {(filterState.selectedEmotions.length > 0 ||
            filterState.selectedAesthetics.length > 0 ||
            filterState.selectedColorHex ||
            filterState.onlyFavorites ||
            filterState.searchQuery) && (
            <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-900/60 border border-stone-800/80 p-3 rounded-2xl">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-stone-400 font-medium uppercase tracking-wider">
                  {t.activeFilters}
                </span>
                {filterState.selectedEmotions.map((e) => (
                  <span
                    key={e}
                    className="bg-rose-950/60 text-rose-300 border border-rose-800 px-2.5 py-0.5 rounded-full flex items-center gap-1"
                  >
                    {e}
                    <button
                      onClick={() =>
                        setFilterState((prev) => ({
                          ...prev,
                          selectedEmotions: prev.selectedEmotions.filter((i) => i !== e)
                        }))
                      }
                    >
                      &times;
                    </button>
                  </span>
                ))}
                {filterState.selectedAesthetics.map((a) => (
                  <span
                    key={a}
                    className="bg-amber-950/60 text-amber-300 border border-amber-800 px-2.5 py-0.5 rounded-full flex items-center gap-1"
                  >
                    {a}
                    <button
                      onClick={() =>
                        setFilterState((prev) => ({
                          ...prev,
                          selectedAesthetics: prev.selectedAesthetics.filter((i) => i !== a)
                        }))
                      }
                    >
                      &times;
                    </button>
                  </span>
                ))}
                {filterState.selectedColorHex && (
                  <span className="bg-stone-800 text-stone-200 border border-stone-700 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: filterState.selectedColorHex }}
                    />
                    Color Match
                    <button
                      onClick={() =>
                        setFilterState((prev) => ({ ...prev, selectedColorHex: null }))
                      }
                    >
                      &times;
                    </button>
                  </span>
                )}
              </div>

              <button
                onClick={() =>
                  setFilterState((prev) => ({
                    ...prev,
                    selectedEmotions: [],
                    selectedAesthetics: [],
                    selectedColorHex: null,
                    searchQuery: '',
                    onlyFavorites: false
                  }))
                }
                className="text-xs text-stone-400 hover:text-amber-300 transition-colors"
              >
                {t.clearFilters}
              </button>
            </div>
          )}

          <ImageGrid
            items={filteredItems}
            filterState={filterState}
            onSelectItem={(item) => setSelectedItem(item)}
            onToggleFavorite={handleToggleFavorite}
            onPinToMoodboard={handlePinToMoodboard}
            t={t}
          />
        </main>
      </div>

      {selectedItem && (
        <ImageDetailModal
          item={selectedItem}
          allItems={items}
          onClose={() => setSelectedItem(null)}
          onToggleFavorite={handleToggleFavorite}
          onUpdateItem={handleUpdateItem}
          onDeleteItem={handleDeleteItem}
          onPinToMoodboard={handlePinToMoodboard}
          onSelectSimilar={(item) => setSelectedItem(item)}
          t={t}
        />
      )}

      {showVibePaletteModal && (
        <VibePaletteStudio
          items={items}
          onClose={() => setShowVibePaletteModal(false)}
          onSelectItem={(item) => setSelectedItem(item)}
          t={t}
        />
      )}

      {showMoodboardModal && (
        <MoodboardCanvas
          onClose={() => setShowMoodboardModal(false)}
          pinnedItems={pinnedItems}
          allItems={items}
          t={t}
        />
      )}

      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onSave={handleSaveUploadedItem}
          availableEmotions={availableEmotions}
          availableAesthetics={availableAesthetics}
        />
      )}

      {showBulkImportModal && (
        <PinterestImporterModal
          onClose={() => setShowBulkImportModal(false)}
          onBulkSave={handleBulkSaveUploadedItems}
          t={t}
        />
      )}

      {showVibeRouletteModal && (
        <VibeRouletteModal
          onClose={() => setShowVibeRouletteModal(false)}
          items={items}
          onApplyVibe={handleApplyVibeFromRoulette}
        />
      )}

      {showSoundBar && (
        <AmbianceBar
          isPlaying={soundPlaying}
          onTogglePlay={handleToggleSound}
          onClose={() => setShowSoundBar(false)}
        />
      )}
    </div>
  );
}
