import { projectId } from '../../shared/config/supabase-info';
import { getAuthHeaders } from '../../shared/supabase';
import { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Crop, Eye } from 'lucide-react';
import { Button } from './button';
import { cn } from './utils';
import { toast } from 'sonner';
import { ImageCropDialog } from './image-crop-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { compressImage, formatFileSize } from '../lib/image-compress';

interface ImageUploadProps {
  value?: string;
  /** 
   * Called when image is uploaded or changed
   * @param url - The image URL (Supabase Storage URL or remote URL)
   */
  onChange: (url: string) => void;
  onRemove?: () => void;
  disabled?: boolean;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'wide' | 'portrait';
  maxSizeMB?: number;
  placeholder?: string;
  bucket?: string;
  /** Enable crop dialog before upload */
  enableCrop?: boolean;
  /** Crop aspect ratio (width/height). Defaults to matching aspectRatio prop */
  cropAspectRatio?: number;
}

const ASPECT_RATIOS: Record<string, number> = {
  square: 1,
  video: 16 / 9,
  wide: 21 / 9,
  portrait: 3 / 4,
};

export function ImageUpload({
  value,
  onChange,
  onRemove,
  disabled = false,
  className,
  aspectRatio = 'video',
  maxSizeMB = 5,
  bucket = 'make-cc205da9-images',
  enableCrop = true,
  cropAspectRatio,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Crop state
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  
  // Preview state
  const [showPreview, setShowPreview] = useState(false);

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[21/9]',
    portrait: 'aspect-[3/4]'
  };

  const effectiveCropRatio = cropAspectRatio || ASPECT_RATIOS[aspectRatio] || 1;

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Invalid File Type', { description: 'Please select an image file (JPG, PNG, WebP)' });
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error('File Too Large', { description: `Image must be smaller than ${maxSizeMB}MB` });
      return;
    }

    // Validate image can load
    try {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = objectUrl; });
      URL.revokeObjectURL(objectUrl);
      if (img.width > 4000 || img.height > 4000) {
        toast.warning('Large Image', { description: 'This image is very large and may take longer to upload' });
      }
    } catch (error) {
      toast.error('Invalid Image', { description: 'The selected file appears to be corrupted' });
      return;
    }

    // If crop is enabled, show crop dialog first
    if (enableCrop) {
      setPendingFile(file);
      setShowCropDialog(true);
      return;
    }

    // Otherwise upload directly
    await uploadFile(file);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    // Convert blob to file for upload
    const croppedFile = new File(
      [croppedBlob],
      pendingFile?.name || 'cropped-image.jpg',
      { type: 'image/jpeg' }
    );
    setPendingFile(null);
    await uploadFile(croppedFile);
  };

  const uploadFile = async (file: File | Blob) => {
    setIsLoading(true);
    setUploadProgress(0);

    try {
      // ── Client-side compression & WebP conversion ──────────────
      let uploadBlob: File | Blob = file;
      try {
        const result = await compressImage(file, { maxDimension: 2048, quality: 0.82 });
        uploadBlob = result.blob;
        if (result.compressedSize < result.originalSize) {
          console.log(
            `[ImageUpload] Compressed ${formatFileSize(result.originalSize)} → ${formatFileSize(result.compressedSize)} (${result.outputType})${result.wasResized ? ' (resized)' : ''}`
          );
        }
      } catch (compressErr) {
        console.warn('[ImageUpload] Compression skipped:', compressErr);
        // Continue with original file
      }

      const formData = new FormData();
      formData.append('file', uploadBlob);
      formData.append('bucket', bucket);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/upload-image`,
        {
          method: 'POST',
          headers: await getAuthHeaders(),
          body: formData
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed:', errorText);
        if (response.status === 413) throw new Error('File is too large for server');
        else if (response.status === 415) throw new Error('Unsupported file format');
        else if (response.status === 401) throw new Error('Authentication failed');
        else throw new Error(`Upload failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.url) {
        onChange(data.url);
        setUploadProgress(100);
        toast.success('Image Uploaded', { description: 'Your image has been uploaded successfully' });
      } else {
        throw new Error('No URL returned from server');
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Fallback: try the professional-file upload endpoint
      try {
        const formData = new FormData();
        formData.append('file', file as File);
        formData.append('category', 'photo');
        formData.append('professionalId', 'general');

        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/upload/professional-file`,
          {
            method: 'POST',
            headers: await getAuthHeaders(),
            body: formData
          }
        );

        const data = await response.json();
        if (data.success && data.url) {
          onChange(data.url);
          toast.success('Image Uploaded', { description: 'Uploaded via fallback endpoint' });
          return;
        }
      } catch (fallbackErr) {
        console.error('Fallback upload also failed:', fallbackErr);
      }

      toast.error('Upload Failed', {
        description: errorMessage + '. Please try again or paste a URL instead.',
        duration: 5000
      });
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => { setIsDragging(false); };

  return (
    <div className={cn("relative", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        className="hidden"
        disabled={disabled}
      />

      {value ? (
        <div className={cn("relative rounded-lg overflow-hidden", aspectRatioClasses[aspectRatio])}>
          <img 
            src={value} 
            alt="Upload preview" 
            className="w-full h-full object-cover"
            style={{ borderRadius: 'var(--radius-lg)' }}
          />
          {!disabled && (
            <div 
              className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            >
              {/* Preview button */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowPreview(true)}
                style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }}
                className="h-9 w-9 p-0 rounded-full"
                title="Preview"
              >
                <Eye size={16} />
              </Button>
              {/* Re-upload button */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }}
                className="h-9 w-9 p-0 rounded-full"
                title="Replace image"
              >
                <Upload size={16} />
              </Button>
              {/* Crop button */}
              {enableCrop && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    // Fetch the current image and open crop dialog
                    try {
                      const response = await fetch(value);
                      const blob = await response.blob();
                      const file = new File([blob], 'current-image.jpg', { type: blob.type });
                      setPendingFile(file);
                      setShowCropDialog(true);
                    } catch {
                      toast.error('Cannot load image for cropping');
                    }
                  }}
                  style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }}
                  className="h-9 w-9 p-0 rounded-full"
                  title="Crop image"
                >
                  <Crop size={16} />
                </Button>
              )}
              {/* Remove button */}
              {onRemove && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onRemove}
                  style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-status-danger)' }}
                  className="h-9 w-9 p-0 rounded-full"
                  title="Remove image"
                >
                  <X size={16} />
                </Button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-lg cursor-pointer transition-all",
            aspectRatioClasses[aspectRatio],
            isDragging && "border-primary bg-primary/5",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          style={{
            borderColor: isDragging ? 'var(--color-primary-default)' : 'var(--color-border-default)',
            backgroundColor: isDragging ? 'var(--color-primary-default)' + '0D' : 'var(--color-bg-muted)',
            borderRadius: 'var(--radius-lg)'
          }}
        >
          <div className="h-full flex flex-col items-center justify-center gap-3 p-6">
            {isLoading ? (
              <>
                <div 
                  className="animate-spin rounded-full border-4"
                  style={{
                    width: '32px', height: '32px',
                    borderColor: 'var(--color-accent-default)',
                    borderTopColor: 'var(--color-primary-default)'
                  }}
                />
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)' }}>
                  Uploading...
                </p>
              </>
            ) : (
              <>
                <div className="rounded-full p-4" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                  <ImageIcon size={32} style={{ color: 'var(--color-text-muted)' }} />
                </div>
                <div className="text-center p-2">
                  <div className="flex justify-center mb-2">
                    <Button 
                      variant="ghost" 
                      className="h-12 w-12 rounded-full p-0"
                      style={{ backgroundColor: 'var(--color-bg-muted)' }}
                      onClick={() => !disabled && fileInputRef.current?.click()}
                    >
                      <Upload size={20} style={{ color: 'var(--color-text-muted)' }} />
                    </Button>
                  </div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)' }}>
                    Max {maxSizeMB}MB
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Crop Dialog */}
      <ImageCropDialog
        open={showCropDialog}
        onOpenChange={(open) => { setShowCropDialog(open); if (!open) setPendingFile(null); }}
        imageFile={pendingFile}
        aspectRatio={effectiveCropRatio}
        onCropComplete={handleCropComplete}
        title={value ? 'Crop & Replace Image' : 'Crop Image Before Upload'}
      />

      {/* Full-size Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle style={{ fontWeight: 500 }}>Image Preview</DialogTitle>
          </DialogHeader>
          {value && (
            <img
              src={value}
              alt="Full preview"
              style={{ width: '100%', borderRadius: 'var(--radius-md)', maxHeight: '70vh', objectFit: 'contain' }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}