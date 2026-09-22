export interface MediaFile {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  filePath: string;
  bucket: string;
  url: string;
  uploadedAt: string;
  updatedAt?: string;
  optimized?: boolean;
  originalSize?: number;
}

export type MediaFilter = 'all' | 'images' | 'videos' | 'documents';
export const MEDIA_FILTERS: MediaFilter[] = ['all', 'images', 'videos', 'documents'];

export const MEDIA_BUCKET = 'make-cc205da9-media';

/** "512 B", "3.4 KB", "1.25 MB" (two decimals for MB, unlike image-compress's formatFileSize). */
export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export const isImageType = (t: string | undefined) => (t || '').startsWith('image/');
export const isVideoType = (t: string | undefined) => (t || '').startsWith('video/');

export function matchesMediaFilter(file: MediaFile, query: string, filter: MediaFilter) {
  const matchesSearch = (file.fileName || '').toLowerCase().includes(query.toLowerCase());
  if (!matchesSearch) return false;
  const type = file.fileType || '';
  if (filter === 'images') return type.startsWith('image/');
  if (filter === 'videos') return type.startsWith('video/');
  if (filter === 'documents') return type.includes('pdf') || type.includes('document');
  return true;
}

/** Raster images we re-encode on upload (SVG and GIF are left alone). */
export function isCompressible(file: File) {
  return file.type.startsWith('image/') && file.type !== 'image/svg+xml' && file.type !== 'image/gif';
}

/**
 * Media-library upload optimisation: re-encode as WebP, keeping the original
 * dimensions unless an edge exceeds 4096px. Files under 500KB, non-raster
 * files, and results that would be larger are returned unchanged.
 */
export async function optimizeImageForUpload(file: File, quality = 0.82): Promise<File> {
  if (!isCompressible(file)) return file;

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;

      if (file.size < 512000) {
        resolve(file);
        return;
      }

      const MAX_EDGE = 4096;
      if (width > MAX_EDGE || height > MAX_EDGE) {
        const ratio = Math.min(MAX_EDGE / width, MAX_EDGE / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      const outputType = 'image/webp';
      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) {
            resolve(file);
            return;
          }
          const baseName = file.name.replace(/\.[^.]+$/, '');
          resolve(new File([blob], `${baseName}.webp`, { type: outputType, lastModified: Date.now() }));
        },
        outputType,
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });
}
