import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from './button';
import { cn } from './utils';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

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
  bucket?: string; // Supabase storage bucket name
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  disabled = false,
  className,
  aspectRatio = 'video',
  maxSizeMB = 5,
  bucket = 'make-cc205da9-images'
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[21/9]',
    portrait: 'aspect-[3/4]'
  };

  const handleFileSelect = async (file: File) => {
    // Enhanced validation
    if (!file.type.startsWith('image/')) {
      toast.error('Invalid File Type', {
        description: 'Please select an image file (JPG, PNG, WebP)'
      });
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error('File Too Large', {
        description: `Image must be smaller than ${maxSizeMB}MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`
      });
      return;
    }

    // Check file dimensions
    try {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = objectUrl;
      });
      
      URL.revokeObjectURL(objectUrl);
      
      // Warn if image is very large
      if (img.width > 4000 || img.height > 4000) {
        toast.warning('Large Image', {
          description: 'This image is very large and may take longer to upload'
        });
      }
    } catch (error) {
      toast.error('Invalid Image', {
        description: 'The selected file appears to be corrupted'
      });
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);

    try {
      // Upload to Supabase Storage via server endpoint
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', bucket);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/upload-image`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: formData
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed:', errorText);
        
        // Provide specific error messages
        if (response.status === 413) {
          throw new Error('File is too large for server');
        } else if (response.status === 415) {
          throw new Error('Unsupported file format');
        } else if (response.status === 401) {
          throw new Error('Authentication failed');
        } else {
          throw new Error(`Upload failed: ${response.status}`);
        }
      }

      const data = await response.json();
      
      if (data.url) {
        onChange(data.url);
        setUploadProgress(100);
        toast.success('Image Uploaded', {
          description: 'Your image has been uploaded successfully'
        });
      } else {
        throw new Error('No URL returned from server');
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

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
              <Button
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  color: 'var(--color-text-primary)'
                }}
              >
                <Upload size={16} className="mr-2" />
                Change
              </Button>
              {onRemove && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onRemove}
                  style={{
                    backgroundColor: 'var(--color-bg-card)',
                    color: 'var(--color-status-danger)'
                  }}
                >
                  <X size={16} className="mr-2" />
                  Remove
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
                    width: '32px',
                    height: '32px',
                    borderColor: 'var(--color-accent-default)',
                    borderTopColor: 'var(--color-primary-default)'
                  }}
                />
                <p style={{ 
                  fontSize: 'var(--text-sm)', 
                  color: 'var(--color-text-muted)',
                  fontFamily: 'var(--font-family-base)'
                }}>
                  Uploading...
                </p>
              </>
            ) : (
              <>
                <div 
                  className="rounded-full p-4"
                  style={{ backgroundColor: 'var(--color-bg-card)' }}
                >
                  <ImageIcon 
                    size={32} 
                    style={{ color: 'var(--color-text-muted)' }}
                  />
                </div>
                <div className="text-center">
                  <p style={{ 
                    fontSize: 'var(--text-sm)', 
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-family-base)',
                    marginBottom: 'var(--spacing-1)'
                  }}>
                    Click to upload or drag and drop
                  </p>
                  <p style={{ 
                    fontSize: 'var(--text-xs)', 
                    color: 'var(--color-text-muted)',
                    fontFamily: 'var(--font-family-base)'
                  }}>
                    PNG, JPG or WebP (max {maxSizeMB}MB)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}