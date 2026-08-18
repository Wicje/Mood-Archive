import React, { useState } from 'react';
import { MoodItem, EmotionTag, AestheticTag } from '../types';
import { Compass, Sparkles, X, Shuffle, ArrowRight, Volume2 } from 'lucide-react';
import { synthService, SOUND_TRACKS } from '../services/audioSynth';

interface VibeRouletteModalProps {
  onClose: () => void;
  items: MoodItem[];
  onApplyVibe: (emotion: string, aesthetic: string) => void;
}

const EMOTIONS: EmotionTag[] = [
  'Nostalgic',
  'Melancholic',
  'Euphoric',
  'Serene',
  'Anxious',
  'Ethereal',
  'Cyber-noir',
  'Cozy',
  'Wanderlust',
  'Solitude'
];

const AESTHETICS: AestheticTag[] = [
  'Cyberpunk',
  'Dark Academia',
  'Cottagecore',
  'Minimalist',
  'Film Grain',
  'Wabi-Sabi',
  'Vaporwave',
  'Brutalist',
  'Surrealism',
  'Monochrome'
];

export const VibeRouletteModal: React.FC<VibeRouletteModalProps> = ({
  onClose,
  items,
  onApplyVibe
}) => {
  const [currentEmotion, setCurrentEmotion] = useState<string>('Cyber-noir');
  const [currentAesthetic, setCurrentAesthetic] = useState<string>('Film Grain');
  const [isSpinning, setIsSpinning] = useState(false);

  const spinRoulette = () => {
    setIsSpinning(true);
    let counter = 0;
    const interval = setInterval(() => {
      const randE = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)];
      const randA = AESTHETICS[Math.floor(Math.random() * AESTHETICS.length)];
      setCurrentEmotion(randE);
      setCurrentAesthetic(randA);
      counter++;
      if (counter > 15) {
        clearInterval(interval);
        setIsSpinning(false);

        // Optionally play sound matching emotion
        const track = SOUND_TRACKS[Math.floor(Math.random() * SOUND_TRACKS.length)];
        synthService.playTrack(track.id);
      }
    }, 80);
  };

  const matchingCount = items.filter(
    (i) => i.emotionTags.includes(currentEmotion) || i.aestheticTags.includes(currentAesthetic)
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/90 backdrop-blur-xl overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6 text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-stone-950/80 border border-stone-800 text-stone-400 hover:text-stone-100"
        >
          <X size={18} />
        </button>

        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500/20 via-rose-500/20 to-purple-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-inner">
          <Compass size={28} className={isSpinning ? 'animate-spin' : ''} />
        </div>

        <div>
          <h2 className="font-serif text-2xl font-medium text-stone-100 mb-1">
            Vibe Roulette
          </h2>
          <p className="text-xs text-stone-400">
            Spin to discover random aesthetic combinations & ambient soundscapes
          </p>
        </div>

        {/* Roulette Deck Card */}
        <div className="bg-stone-950/80 border border-stone-800/80 rounded-2xl p-6 space-y-3 relative overflow-hidden">
          <div className="text-[11px] text-stone-500 uppercase tracking-widest font-sans">
            Random Vibe Vector
          </div>
          <div className="flex items-center justify-center gap-3">
            <span
              className={`font-serif text-xl sm:text-2xl font-medium text-rose-300 transition-all ${
                isSpinning ? 'blur-[1px]' : ''
              }`}
            >
              {currentEmotion}
            </span>
            <span className="text-stone-600 font-serif">&amp;</span>
            <span
              className={`font-serif text-xl sm:text-2xl font-medium text-amber-300 transition-all ${
                isSpinning ? 'blur-[1px]' : ''
              }`}
            >
              {currentAesthetic}
            </span>
          </div>

          <div className="pt-2 text-xs text-stone-400">
            Found {matchingCount} reference item(s) in your archive
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={spinRoulette}
            disabled={isSpinning}
            className="w-full py-3 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-90 text-stone-950 font-medium text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <Shuffle size={16} />
            {isSpinning ? 'Spinning Vibe Wheel...' : 'Spin Vibe Roulette'}
          </button>

          <button
            onClick={() => {
              onApplyVibe(currentEmotion, currentAesthetic);
              onClose();
            }}
            className="w-full py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs rounded-xl font-medium transition-all flex items-center justify-center gap-2"
          >
            Filter Gallery by This Vibe
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
