import { MoodItem } from '../types';
import { colord } from 'colord';

export interface VisualAIFeatures {
  colorVector: number[]; // R, G, B averages
  warmth: number; // 0 (cool blue/neon) to 100 (warm tungsten/amber)
  brightness: number; // 0 to 100
  contrast: number; // 0 to 100
  suggestedEmotions: string[];
  suggestedAesthetics: string[];
}

/**
 * Simulates AI visual feature extraction from an image's palette and title
 */
export function analyzeVisualFeatures(palette: string[], title: string = ''): VisualAIFeatures {
  let totalR = 0, totalG = 0, totalB = 0, totalL = 0;

  palette.forEach((hex) => {
    const rgb = colord(hex).toRgb();
    const hsl = colord(hex).toHsl();
    totalR += rgb.r;
    totalG += rgb.g;
    totalB += rgb.b;
    totalL += hsl.l;
  });

  const count = palette.length || 1;
  const avgR = totalR / count;
  const avgG = totalG / count;
  const avgB = totalB / count;
  const avgL = totalL;

  // Warmth calculation: higher red/green vs blue
  const warmth = Math.max(0, Math.min(100, Math.round(((avgR + avgG * 0.5 - avgB) / 255) * 100 + 50)));
  const brightness = Math.round(avgL);
  const contrast = Math.round(Math.abs(avgR - avgB) / 2.55);

  // Auto-suggest tags based on color vector and title keywords
  const suggestedEmotions: string[] = [];
  const suggestedAesthetics: string[] = [];

  const lowerTitle = title.toLowerCase();

  if (warmth > 65) {
    suggestedEmotions.push('Nostalgic', 'Cozy');
    suggestedAesthetics.push('Dark Academia', 'Cottagecore');
  } else if (warmth < 40) {
    suggestedEmotions.push('Cyber-noir', 'Anxious', 'Solitude');
    suggestedAesthetics.push('Cyberpunk', 'Monochrome');
  }

  if (avgL < 30) {
    suggestedEmotions.push('Melancholic', 'Mysterious');
    suggestedAesthetics.push('Brutalist', 'Film Grain');
  } else if (avgL > 65) {
    suggestedEmotions.push('Ethereal', 'Euphoric', 'Serene');
    suggestedAesthetics.push('Minimalist', 'Wabi-Sabi');
  }

  if (lowerTitle.includes('rain') || lowerTitle.includes('night') || lowerTitle.includes('neon')) {
    suggestedEmotions.push('Cyber-noir');
    suggestedAesthetics.push('Cinematic');
  }

  return {
    colorVector: [avgR, avgG, avgB],
    warmth,
    brightness,
    contrast,
    suggestedEmotions: Array.from(new Set(suggestedEmotions)),
    suggestedAesthetics: Array.from(new Set(suggestedAesthetics))
  };
}

/**
 * Calculates AI visual similarity score between two MoodItems (0 to 100%)
 */
export function calculateVisualSimilarityScore(a: MoodItem, b: MoodItem): number {
  const featA = analyzeVisualFeatures(a.palette, a.title);
  const featB = analyzeVisualFeatures(b.palette, b.title);

  // 1. Color distance in RGB vector space
  const rDiff = featA.colorVector[0] - featB.colorVector[0];
  const gDiff = featA.colorVector[1] - featB.colorVector[1];
  const bDiff = featA.colorVector[2] - featB.colorVector[2];
  const colorDist = Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
  const colorMatch = Math.max(0, 100 - (colorDist / 441.67) * 100);

  // 2. Emotion overlap
  const emotionOverlap = a.emotionTags.filter((e) => b.emotionTags.includes(e)).length;
  const emotionMatch = (emotionOverlap / Math.max(1, a.emotionTags.length)) * 100;

  // 3. Aesthetic overlap
  const aestheticOverlap = a.aestheticTags.filter((ast) => b.aestheticTags.includes(ast)).length;
  const aestheticMatch = (aestheticOverlap / Math.max(1, a.aestheticTags.length)) * 100;

  // 4. Warmth score similarity
  const warmthMatch = 100 - Math.abs(featA.warmth - featB.warmth);

  // Weighted composite score
  const totalScore = colorMatch * 0.35 + emotionMatch * 0.25 + aestheticMatch * 0.25 + warmthMatch * 0.15;
  return Math.round(Math.min(100, Math.max(0, totalScore)));
}
