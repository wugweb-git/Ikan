import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from './button';
import { cn } from './utils';

interface ImageUploadProps {
  value?: string;
  /** 
   * Called when image is uploaded or changed
   * @param url - The image URL (data URL or remote URL)
   */
  onChange: (url: string) => void;
  onRemove?: () => void;
  disabled?: boolean;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'wide' | 'portrait';
  maxSizeMB?: number;
  placeholder?: string; // Not used in component but accepted for compatibility
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  disabled = false,
  className,
  aspectRatio = 'video',
  maxSizeMB = 5
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[21/9]',
    portrait: 'aspect-[3/4]'
  };

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    setIsLoading(true);

    try {
      // Convert to base64 for preview (in production, upload to server/Supabase)
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
      
      // TODO: In production, upload to Supabase Storage and get URL
      // const { data, error } = await supabase.storage
      //   .from('images')
      //   .upload(`${Date.now()}_${file.name}`, file);
      // if (data) onChange(publicURL);
      
    } catch (error) {
      console.error('Upload error:', error);
      setIsLoading(false);
      alert('Failed to upload image');
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