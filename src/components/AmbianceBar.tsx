import React, { useState } from 'react';
import { Volume2, VolumeX, Disc, CloudRain, Radio, Waves, Flame, X } from 'lucide-react';
import { synthService, SOUND_TRACKS } from '../services/audioSynth';

interface AmbianceBarProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onClose: () => void;
}

export const AmbianceBar: React.FC<AmbianceBarProps> = ({
  isPlaying,
  onTogglePlay,
  onClose
}) => {
  const [selectedTrackId, setSelectedTrackId] = useState<string>(
    synthService.getTrackId() || 'rain'
  );
  const [volume, setVolume] = useState<number>(0.2);

  const handleTrackSelect = (trackId: string) => {
    setSelectedTrackId(trackId);
    synthService.playTrack(trackId);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    synthService.setVolume(val);
  };

  const getTrackIcon = (id: string) => {
    switch (id) {
      case 'rain':
        return <CloudRain size={15} className="text-cyan-400" />;
      case 'crackle':
        return <Disc size={15} className="text-amber-400" />;
      case 'drone':
        return <Radio size={15} className="text-purple-400" />;
      case 'waves':
        return <Waves size={15} className="text-blue-400" />;
      case 'warmth':
        return <Flame size={15} className="text-rose-400" />;
      default:
        return <CloudRain size={15} />;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 bg-stone-900/90 backdrop-blur-xl border border-stone-800 rounded-2xl p-4 shadow-2xl space-y-3 w-80 animate-slide-up">
      <div className="flex items-center justify-between border-b border-stone-800/80 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span className="text-xs font-serif font-medium text-stone-200">
            Aesthetic Soundscape
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-stone-400 hover:text-stone-200 text-xs"
        >
          <X size={14} />
        </button>
      </div>

      {/* Sound selector buttons */}
      <div className="grid grid-cols-5 gap-1.5 bg-stone-950 p-1 rounded-xl border border-stone-800">
        {SOUND_TRACKS.map((track) => (
          <button
            key={track.id}
            onClick={() => handleTrackSelect(track.id)}
            title={`${track.name} (${track.vibe})`}
            className={`p-2 rounded-lg flex items-center justify-center transition-all ${
              selectedTrackId === track.id
                ? 'bg-stone-800 border border-stone-700 shadow'
                : 'text-stone-500 hover:text-stone-300'
            }`}
          >
            {getTrackIcon(track.id)}
          </button>
        ))}
      </div>

      {/* Track Name & Volume Slider */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onTogglePlay}
          className="p-2 rounded-xl bg-stone-800 border border-stone-700 text-stone-200 hover:bg-stone-700"
        >
          {isPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>

        <div className="flex-1 space-y-1">
          <div className="flex justify-between text-[10px] text-stone-400">
            <span>
              {SOUND_TRACKS.find((t) => t.id === selectedTrackId)?.name || 'Ambient'}
            </span>
            <span>{Math.round(volume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
        </div>
      </div>
    </div>
  );
};
