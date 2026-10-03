/**
 * Client-side image compression & WebP conversion for iKan PWA.
 *
 * Resizes images that exceed maxDimension on their longest side,
 * then exports as WebP (with JPEG fallback for browsers without WebP encode).
 */

interface CompressOptions {
  /** Max px on the longest side (default 2048) */
  maxDimension?: number;
  /** WebP / JPEG quality 0-1 (default 0.82) */
  quality?: number;
  /** Force output MIME — default tries WebP first */
  outputType?: 'image/webp' | 'image/jpeg';
}

/**
 * Compress & optionally resize an image File / Blob.
 * Returns { blob, wasResized, originalSize, compressedSize, outputType }.
 */
export async function compressImage(
  input: File | Blob,
  opts: CompressOptions = {}
): Promise<{
  blob: Blob;
  wasResized: boolean;
  originalSize: number;
  compressedSize: number;
  outputType: string;
}> {
  const { maxDimension = 2048, quality = 0.82, outputType } = opts;
  const originalSize = input.size;

  // Load into an Image element
  const img = await loadImage(input);
  const { width, height } = img;

  // Determine target dimensions
  let targetW = width;
  let targetH = height;
  let wasResized = false;

  if (width > maxDimension || height > maxDimension) {
    const ratio = Math.min(maxDimension / width, maxDimension / height);
    targetW = Math.round(width * ratio);
    targetH = Math.round(height * ratio);
    wasResized = true;
  }

  // Draw to canvas
  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  ctx.drawImage(img, 0, 0, targetW, targetH);

  // Try WebP first, fall back to JPEG
  const preferredType = outputType || 'image/webp';
  let blob = await canvasToBlob(canvas, preferredType, quality);

  // If the browser didn't actually produce WebP (Safari < 16), fall back to JPEG
  if (!blob || (preferredType === 'image/webp' && blob.type !== 'image/webp')) {
    blob = await canvasToBlob(canvas, 'image/jpeg', quality);
  }

  if (!blob) throw new Error('Image compression failed — no blob produced');

  // If compressed is somehow larger than original (rare, tiny images), return original
  if (blob.size >= originalSize && !wasResized) {
    return { blob: input, wasResized: false, originalSize, compressedSize: originalSize, outputType: input.type };
  }

  return {
    blob,
    wasResized,
    originalSize,
    compressedSize: blob.size,
    outputType: blob.type,
  };
}

// ── helpers ────────────────────────────────────────────────────

function loadImage(src: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(src);
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to decode image')); };
    img.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), type, quality);
  });
}

/**
 * Human-readable file size string.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
