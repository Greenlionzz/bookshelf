import { useState, useEffect } from 'react';

interface ExtractedColors {
  dominant: string;
  vibrant: string;
  muted: string;
  darkMuted: string;
  lightVibrant: string;
}

const defaultColors: ExtractedColors = {
  dominant: 'rgba(103, 80, 164, 0.3)',
  vibrant: 'rgba(103, 80, 164, 0.4)',
  muted: 'rgba(103, 80, 164, 0.15)',
  darkMuted: 'rgba(50, 40, 80, 0.5)',
  lightVibrant: 'rgba(200, 180, 255, 0.3)',
};

// Simple color distance calculation
function colorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

// Check if a color is too close to white/black/grey (not interesting)
function isSaturated(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  // If the difference between channels is tiny, it's grey/white/black
  return diff > 30;
}

function getLuminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function rgbToString(r: number, g: number, b: number, a: number = 1): string {
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

interface ColorBucket {
  r: number;
  g: number;
  b: number;
  count: number;
}

function extractColorsFromImageData(imageData: ImageData): ExtractedColors {
  const { data, width, height } = imageData;
  const buckets: ColorBucket[] = [];
  const step = 4; // Sample every 4th pixel for speed

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      // Skip transparent pixels
      if (a < 128) continue;
      // Skip very dark and very light pixels
      const lum = getLuminance(r, g, b);
      if (lum < 15 || lum > 245) continue;

      // Find closest bucket or create new one
      let foundBucket = false;
      for (const bucket of buckets) {
        if (colorDistance(r, g, b, bucket.r, bucket.g, bucket.b) < 45) {
          // Weighted average to shift bucket center
          const total = bucket.count + 1;
          bucket.r = Math.round((bucket.r * bucket.count + r) / total);
          bucket.g = Math.round((bucket.g * bucket.count + g) / total);
          bucket.b = Math.round((bucket.b * bucket.count + b) / total);
          bucket.count = total;
          foundBucket = true;
          break;
        }
      }

      if (!foundBucket) {
        buckets.push({ r, g, b, count: 1 });
      }
    }
  }

  if (buckets.length === 0) return defaultColors;

  // Sort by frequency
  buckets.sort((a, b) => b.count - a.count);

  // Get dominant color (most frequent)
  const dominant = buckets[0];

  // Get vibrant color (most saturated among top colors)
  const vibrantBucket = buckets
    .slice(0, Math.min(20, buckets.length))
    .filter(b => isSaturated(b.r, b.g, b.b))
    .sort((a, b) => {
      const satA = Math.max(a.r, a.g, a.b) - Math.min(a.r, a.g, a.b);
      const satB = Math.max(b.r, b.g, b.b) - Math.min(b.r, b.g, b.b);
      return satB - satA;
    })[0] || dominant;

  // Get muted color
  const mutedBucket = buckets
    .slice(0, Math.min(20, buckets.length))
    .filter(b => {
      const lum = getLuminance(b.r, b.g, b.b);
      return lum > 60 && lum < 200;
    })
    .sort((a, b) => {
      const satA = Math.max(a.r, a.g, a.b) - Math.min(a.r, a.g, a.b);
      const satB = Math.max(b.r, b.g, b.b) - Math.min(b.r, b.g, b.b);
      return satA - satB;
    })[0] || dominant;

  // Dark muted: darkest among top colors
  const darkMutedBucket = buckets
    .slice(0, Math.min(15, buckets.length))
    .sort((a, b) => getLuminance(a.r, a.g, a.b) - getLuminance(b.r, b.g, b.b))[0] || dominant;

  // Light vibrant: lightest saturated color
  const lightVibrantBucket = buckets
    .slice(0, Math.min(15, buckets.length))
    .filter(b => isSaturated(b.r, b.g, b.b))
    .sort((a, b) => getLuminance(b.r, b.g, b.b) - getLuminance(a.r, a.g, a.b))[0] || dominant;

  return {
    dominant: rgbToString(dominant.r, dominant.g, dominant.b),
    vibrant: rgbToString(vibrantBucket.r, vibrantBucket.g, vibrantBucket.b),
    muted: rgbToString(mutedBucket.r, mutedBucket.g, mutedBucket.b),
    darkMuted: rgbToString(darkMutedBucket.r, darkMutedBucket.g, darkMutedBucket.b),
    lightVibrant: rgbToString(lightVibrantBucket.r, lightVibrantBucket.g, lightVibrantBucket.b),
  };
}

// Cache colors per URL to avoid re-extracting
const colorCache = new Map<string, ExtractedColors>();

export function useImageColor(imageUrl: string | undefined): { colors: ExtractedColors; loading: boolean } {
  const [colors, setColors] = useState<ExtractedColors>(defaultColors);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!imageUrl) {
      setColors(defaultColors);
      setLoading(false);
      return;
    }

    // Check cache
    const cached = colorCache.get(imageUrl);
    if (cached) {
      setColors(cached);
      setLoading(false);
      return;
    }

    setLoading(true);

    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setColors(defaultColors);
          setLoading(false);
          return;
        }

        // Resize for performance
        const scale = 80 / Math.max(img.width, img.height);
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const extracted = extractColorsFromImageData(imageData);

        colorCache.set(imageUrl, extracted);
        setColors(extracted);
      } catch {
        // CORS or other error
        setColors(defaultColors);
      }
      setLoading(false);
    };

    img.onerror = () => {
      setColors(defaultColors);
      setLoading(false);
    };

    img.src = imageUrl;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl]);

  return { colors, loading };
}

// Helper to parse rgba string into components
export function parseRgba(rgba: string): { r: number; g: number; b: number } {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    return { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) };
  }
  return { r: 103, g: 80, b: 164 };
}
