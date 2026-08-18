import { colord, extend } from 'colord';
import a11yPlugin from 'colord/plugins/a11y';
import harmoniesPlugin from 'colord/plugins/harmonies';
import labPlugin from 'colord/plugins/lab';

extend([a11yPlugin, harmoniesPlugin, labPlugin]);

export interface ExtractedColor {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  percentage: number;
  isDark: boolean;
}

/**
 * Extracts dominant colors from an image URL using HTML5 Canvas
 */
export async function extractPaletteFromImage(
  imageUrl: string,
  colorCount: number = 5
): Promise<string[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageUrl;

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(['#1e293b', '#475569', '#64748b', '#94a3b8', '#cbd5e1']);
          return;
        }

        // Downscale for fast performance
        const width = 100;
        const height = Math.round((img.height / img.width) * 100);
        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);
        const pixels = imageData.data;

        const colorMap: Map<string, number> = new Map();
        const step = 4 * 4; // Sample every 4th pixel

        for (let i = 0; i < pixels.length; i += step) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          const a = pixels[i + 3];

          if (a < 128) continue; // skip transparent

          // Quantize RGB slightly to group similar shades
          const qr = Math.round(r / 24) * 24;
          const qg = Math.round(g / 24) * 24;
          const qb = Math.round(b / 24) * 24;

          const hex = colord({ r: qr, g: qg, b: qb }).toHex();
          colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
        }

        // Sort by frequency
        const sorted = Array.from(colorMap.entries())
          .sort((a, b) => b[1] - a[1])
          .map((entry) => entry[0]);

        // Filter out colors that are too similar visually
        const filtered: string[] = [];
        for (const hex of sorted) {
          if (filtered.length >= colorCount) break;
          const isTooClose = filtered.some((existingHex) => {
            const distance = getColorDistance(hex, existingHex);
            return distance < 25;
          });
          if (!isTooClose) {
            filtered.push(hex);
          }
        }

        while (filtered.length < colorCount) {
          filtered.push(sorted[filtered.length] || '#0f172a');
        }

        resolve(filtered);
      } catch (err) {
        console.warn('Canvas pixel extraction failed due to CORS or security:', err);
        resolve(['#18181b', '#3f3f46', '#71717a', '#a1a1aa', '#e4e4e7']);
      }
    };

    img.onerror = () => {
      resolve(['#1e1b4b', '#3730a3', '#4f46e5', '#818cf8', '#c7d2fe']);
    };
  });
}

/**
 * Calculates Euclidean distance between two HEX colors in RGB space
 */
export function getColorDistance(hex1: string, hex2: string): number {
  const c1 = colord(hex1).toRgb();
  const c2 = colord(hex2).toRgb();

  const rDiff = c1.r - c2.r;
  const gDiff = c1.g - c2.g;
  const bDiff = c1.b - c2.b;

  return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
}

/**
 * Generate harmonious palette variations from a base hex
 */
export function generateHarmoniousPalette(baseHex: string): {
  analogous: string[];
  triadic: string[];
  monochromatic: string[];
} {
  const color = colord(baseHex);
  const analogous = color.harmonies('analogous').map((c) => c.toHex());
  const triadic = color.harmonies('triadic').map((c) => c.toHex());

  const monochromatic = [
    color.darken(0.3).toHex(),
    color.darken(0.15).toHex(),
    baseHex,
    color.lighten(0.15).toHex(),
    color.lighten(0.3).toHex(),
  ];

  return { analogous, triadic, monochromatic };
}

/**
 * Converts Hex to CSS variable export format
 */
export function exportPaletteAsCSS(name: string, hexes: string[]): string {
  const formattedName = name.toLowerCase().replace(/\s+/g, '-');
  let css = `:root {\n  /* Palette: ${name} */\n`;
  hexes.forEach((hex, i) => {
    css += `  --color-${formattedName}-${i + 1}: ${hex};\n`;
  });
  css += `}`;
  return css;
}

/**
 * Format Hex to Tailwind config object string
 */
export function exportPaletteAsTailwind(name: string, hexes: string[]): string {
  const key = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const obj: Record<string, string> = {};
  hexes.forEach((hex, i) => {
    obj[`${(i + 1) * 100}`] = hex;
  });
  return `'${key}': ${JSON.stringify(obj, null, 2)}`;
}
