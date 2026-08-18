/**
 * Image Resolver & CORS Bypass Service for Mood Archive
 * Resolves Pinterest URLs, Pin links, and direct CDN image URLs cleanly.
 */

/**
 * Normalizes and extracts clean image URLs from raw user input strings
 * (Handles Pinterest pin links, pin.it shortlinks, direct pinimg URLs, etc.)
 */
export function normalizeImageUrl(inputUrl: string): string {
  const url = inputUrl.trim();
  if (!url) return '';

  // 1. If it's already a direct Pinterest image URL (i.pinimg.com)
  if (url.includes('i.pinimg.com') || url.includes('pinimg.com')) {
    return url;
  }

  // 2. If it's a Pinterest Pin link (pinterest.com/pin/123456789/ or similar)
  const pinMatch = url.match(/pinterest\.[a-z.]+\/pin\/(\d+)/i);
  if (pinMatch && pinMatch[1]) {
    const pinId = pinMatch[1];
    // Construct direct Pinterest image CDN pattern
    return `https://i.pinimg.com/originals/${pinId.slice(0, 2)}/${pinId.slice(2, 4)}/${pinId.slice(4, 6)}/${pinId}.jpg`;
  }

  return url;
}

/**
 * Wraps an image URL in a CORS-safe proxy (images.weserv.nl)
 * to prevent CORS restrictions, hotlink blocking, and blank canvas renderings.
 */
export function getCorsSafeImageUrl(rawUrl: string): string {
  const url = normalizeImageUrl(rawUrl);
  if (!url || !url.startsWith('http')) return url;

  // Don't proxy data URIs or local blobs
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }

  // Use weserv.nl open-source CORS proxy for remote images
  const cleanUrl = url.replace(/^https?:\/\//, '');
  return `https://images.weserv.nl/?url=${encodeURIComponent(cleanUrl)}&output=webp`;
}
