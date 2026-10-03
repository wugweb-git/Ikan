import { useCallback, useRef, useState } from 'react';
import type React from 'react';
import { Upload, Check, X, Zap } from 'lucide-react';
import { apiClient } from '../../shared/api/api';
import { errorMessageOf } from '../ui/hooks/useAdminResource';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { cn } from '../ui/utils';
import { MEDIA_BUCKET, formatBytes, isCompressible, optimizeImageForUpload } from './media-utils';

interface MediaUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploaded: (url: string) => void;
}

export function MediaUploadDialog({ open, onOpenChange, onUploaded }: MediaUploadDialogProps) {
  const [autoCompress, setAutoCompress] = useState(true);
  const [isCompressing, setIsCompressing] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-medium">Upload File</DialogTitle>
          <DialogDescription>
            Upload images, videos, PDFs, or other media files. Maximum file size: 50MB
          </DialogDescription>
        </DialogHeader>

        {/* Auto-Compress Toggle */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-[var(--color-bg-muted)] border border-[var(--color-border-default)]">
          <Checkbox id="autoCompress" checked={autoCompress} onCheckedChange={(checked) => setAutoCompress(checked as boolean)} />
          <div className="flex-1">
            <Label htmlFor="autoCompress" className="cursor-pointer font-medium text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-[var(--color-success-default)]" />
              Auto-compress & optimize images
            </Label>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Converts images to WebP format and optimizes quality to reduce file size.
              Original dimensions are preserved. Files under 500KB, SVGs, and GIFs are kept as-is.
              Only truly oversized images (4K+) are downscaled.
            </p>
          </div>
        </div>

        {isCompressing && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-info-bg,var(--color-status-info-light))] border border-[var(--color-info-default,var(--color-status-info))]">
            <div className="animate-spin">
              <Zap className="w-4 h-4 text-[var(--color-info-default,var(--color-status-info))]" />
            </div>
            <p className="text-sm text-[var(--color-text-primary)]">Compressing image before upload...</p>
          </div>
        )}

        <CompressedFileUpload
          onUpload={(url) => { setIsCompressing(false); onUploaded(url); }}
          autoCompress={autoCompress}
          onCompressStart={() => setIsCompressing(true)}
          onCompressEnd={() => setIsCompressing(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

// ── File picker / drop zone that optimises images before uploading ──

type UploadState = 'idle' | 'compressing' | 'uploading' | 'success' | 'error';

interface CompressedFileUploadProps {
  onUpload: (url: string) => void;
  autoCompress: boolean;
  onCompressStart: () => void;
  onCompressEnd: () => void;
}

function CompressedFileUpload({ onUpload, autoCompress, onCompressStart, onCompressEnd }: CompressedFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const resetLater = (ms: number) => setTimeout(() => {
    setUploadState('idle');
    setStatusMessage('');
  }, ms);

  const processAndUpload = useCallback(async (file: File) => {
    try {
      let fileToUpload = file;
      let savings: string | null = null;
      const originalSize = file.size;

      if (autoCompress && isCompressible(file)) {
        setUploadState('compressing');
        setStatusMessage('Optimizing image...');
        onCompressStart();

        fileToUpload = await optimizeImageForUpload(file);
        onCompressEnd();

        if (fileToUpload.size < originalSize) {
          const savedPercent = Math.round((1 - fileToUpload.size / originalSize) * 100);
          savings = `Compressed: ${formatBytes(originalSize)} → ${formatBytes(fileToUpload.size)} (${savedPercent}% smaller)`;
          setStatusMessage(savings);
        } else {
          savings = 'Image already optimized — uploaded as-is';
          setStatusMessage('Image already optimized — uploading original...');
        }
      }

      setUploadState('uploading');
      if (!savings) setStatusMessage('Uploading...');

      const data = await apiClient.uploadMediaFile(fileToUpload, MEDIA_BUCKET);

      setUploadState('success');
      setStatusMessage('Upload complete!');
      onUpload(data.url);
      resetLater(2000);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadState('error');
      setStatusMessage(errorMessageOf(error, 'Upload failed'));
      onCompressEnd();
      resetLater(3000);
    }
  }, [autoCompress, onCompressStart, onCompressEnd, onUpload]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) void processAndUpload(e.dataTransfer.files[0]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) void processAndUpload(e.target.files[0]);
  };

  if (uploadState !== 'idle') {
    return (
      <div className="rounded-lg border p-6 border-[var(--color-border-default)] bg-[var(--color-bg-card)]">
        <div className="flex items-center gap-4">
          {(uploadState === 'compressing' || uploadState === 'uploading') && (
            <div className="animate-spin">
              {uploadState === 'compressing'
                ? <Zap className="w-8 h-8 text-[var(--color-success-default)]" />
                : <Upload className="w-8 h-8 text-[var(--color-primary-default)]" />}
            </div>
          )}
          {uploadState === 'success' && <Check className="w-8 h-8 text-[var(--color-success-default)]" />}
          {uploadState === 'error' && <X className="w-8 h-8 text-[var(--color-danger-default)]" />}
          <div className="flex-1">
            <p className="text-base font-medium text-[var(--color-text-primary)]">
              {uploadState === 'compressing' ? 'Optimizing...' : uploadState === 'uploading' ? 'Uploading...' : uploadState === 'success' ? 'Done!' : 'Error'}
            </p>
            {statusMessage && <p className="text-sm text-[var(--color-text-muted)] mt-1">{statusMessage}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative rounded-lg border-2 border-dashed cursor-pointer p-8',
        dragActive
          ? 'border-[var(--color-primary-default)] bg-[var(--color-primary-default)]/5'
          : 'border-[var(--color-border-default)] hover:border-[var(--color-primary-default)]/50 bg-[var(--color-bg-card)]',
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input ref={inputRef} type="file" accept="image/*,video/*,audio/*,.pdf" onChange={handleChange} className="hidden" />
      <div className="flex flex-col items-center text-center">
        <div className="rounded-full p-4 mb-4 bg-[var(--color-primary-default)] text-[var(--color-primary-on)]">
          <Upload className="w-8 h-8" />
        </div>
        <p className="text-base font-medium text-[var(--color-text-primary)] mb-2">
          Drop your file here, or <span className="text-[var(--color-primary-default)]">browse</span>
        </p>
        <p className="text-sm text-[var(--color-text-muted)]">
          Supported: Images (JPG, PNG, WebP), Videos (MP4, WebM), Documents (PDF)
        </p>
        <p className="text-xs text-[var(--color-text-muted)] mt-2">
          Maximum file size: 50MB {autoCompress && '• Images will be auto-optimized'}
        </p>
      </div>
    </div>
  );
}
