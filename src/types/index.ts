export type EmotionTag =
  | 'Nostalgic'
  | 'Melancholic'
  | 'Euphoric'
  | 'Serene'
  | 'Anxious'
  | 'Ethereal'
  | 'Cyber-noir'
  | 'Cozy'
  | 'Wanderlust'
  | 'Solitude'
  | 'Vivid'
  | 'Dreamy'
  | 'Mysterious'
  | 'Rebellious';

export type AestheticTag =
  | 'Cyberpunk'
  | 'Minimalist'
  | 'Dark Academia'
  | 'Cottagecore'
  | 'Neubrutalism'
  | 'Film Grain'
  | 'Wabi-Sabi'
  | 'Vaporwave'
  | 'Brutalist'
  | 'Surrealism'
  | 'Retroism'
  | 'Monochrome'
  | 'Botanical'
  | 'Cinematic';

export interface MoodItem {
  id: string;
  title: string;
  url: string;
  thumbnailUrl?: string;
  source: 'unsplash' | 'custom' | 'url';
  author?: string;
  emotionTags: string[];
  aestheticTags: string[];
  palette: string[]; // hex codes, e.g. ["#1A1D20", "#3E4A56", ...]
  dateAdded: number;
  isFavorite: boolean;
  width?: number;
  height?: number;
  aspectRatio?: number;
  notes?: string;
  location?: string;
}

export interface PalettePreset {
  id: string;
  name: string;
  emotion: string;
  aesthetic: string;
  colors: string[];
  moodItemId?: string;
}

export interface MoodboardNode {
  id: string;
  type: 'image' | 'text' | 'palette';
  moodItemId?: string;
  imageUrl?: string;
  title?: string;
  content?: string;
  colors?: string[];
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  bgColor?: string;
}

export interface FilterState {
  searchQuery: string;
  selectedEmotions: string[];
  selectedAesthetics: string[];
  selectedColorHex: string | null;
  onlyFavorites: boolean;
  sortBy: 'newest' | 'oldest' | 'title';
  layoutMode: 'masonry' | 'grid' | 'filmstrip';
  aspectRatioFilter: 'all' | 'portrait' | 'landscape' | 'square';
}

export interface SoundTrack {
  id: string;
  name: string;
  vibe: string;
  icon: string;
  synthType: 'rain' | 'crackle' | 'drone' | 'waves' | 'chimes' | 'warmth';
}
