import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, File, Image as ImageIcon, FileText, Film, Music, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './button';
import { cn } from './utils';
import { apiClient } from '../../lib/api-client';

export interface FileUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  accept?: string;
  maxSize?: number; // in MB
  bucket?: string;
  preview?: boolean;
  label?: string;
  helpText?: string;
  className?: string;
  disabled?: boolean;
}

interface UploadProgress {
  status: 'idle' | 'uploading' | 'success' | 'error';
  progress: number;
  message?: string;
}

export function FileUpload({
  value,
  onChange,
  onRemove,
  accept = 'image/*,video/*,audio/*,.pdf',
  maxSize = 10, // 10MB default
  bucket = 'make-cc205da9-media',
  preview = true,
  label,
  helpText,
  className,
  disabled = false
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    status: 'idle',
    progress: 0
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="w-8 h-8" />;
    if (fileType.startsWith('video/')) return <Film className="w-8 h-8" />;
    if (fileType.startsWith('audio/')) return <Music className="w-8 h-8" />;
    if (fileType.includes('pdf')) return <FileText className="w-8 h-8" />;
    return <File className="w-8 h-8" />;
  };

  const uploadFile = async (file: File) => {
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setUploadProgress({
        status: 'error',
        progress: 0,
        message: `File size exceeds ${maxSize}MB limit`
      });
      return;
    }

    try {
      setUploadProgress({ status: 'uploading', progress: 0, message: 'Uploading...' });

      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', bucket);

      // Upload via API Client
      const data = await apiClient.uploadMediaFile(file, bucket);
      
      setUploadProgress({ status: 'success', progress: 100, message: 'Upload complete!' });
      onChange(data.url);

      // Reset after 2 seconds
      setTimeout(() => {
        setUploadProgress({ status: 'idle', progress: 0 });
      }, 2000);
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadProgress({
        status: 'error',
        progress: 0,
        message: error.message || 'Upload failed. Please try again.'
      });

      // Reset after 3 seconds
      setTimeout(() => {
        setUploadProgress({ status: 'idle', progress: 0 });
      }, 3000);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (disabled) return;

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        uploadFile(e.dataTransfer.files[0]);
      }
    },
    [disabled]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      if (disabled) return;

      if (e.target.files && e.target.files[0]) {
        uploadFile(e.target.files[0]);
      }
    },
    [disabled]
  );

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove();
    } else {
      onChange('');
    }
    setUploadProgress({ status: 'idle', progress: 0 });
  };

  const isImage = value && (value.match(/\.(jpg|jpeg|png|gif|webp)$/i) || value.includes('image'));
  const isVideo = value && (value.match(/\.(mp4|webm|ogg)$/i) || value.includes('video'));

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label
          style={{
            display: 'block',
            marginBottom: 'var(--spacing-2)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-family-base)'
          }}
        >
          {label}
        </label>
      )}

      {/* Upload Area */}
      {!value && uploadProgress.status === 'idle' && (
        <div
          className={cn(
            'relative rounded-lg border-2 border-dashed transition-all cursor-pointer',
            dragActive
              ? 'border-[var(--color-primary-default)] bg-[var(--color-primary-default)]/5'
              : 'border-[var(--color-border-default)] hover:border-[var(--color-primary-default)]/50',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          style={{
            padding: 'var(--spacing-8)',
            backgroundColor: dragActive ? undefined : 'var(--color-bg-card)'
          }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleChange}
            style={{ display: 'none' }}
            disabled={disabled}
          />

          <div className="flex flex-col items-center text-center">
            <div
              className="rounded-full p-4 mb-4"
              style={{ backgroundColor: 'var(--color-primary-default)', color: 'var(--color-primary-on)' }}
            >
              <Upload className="w-8 h-8" />
            </div>

            <p
              style={{
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--spacing-2)',
                fontFamily: 'var(--font-family-base)'
              }}
            >
              Drop your file here, or <span style={{ color: 'var(--color-primary-default)' }}>browse</span>
            </p>

            {helpText && (
              <p
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-muted)',
                  fontFamily: 'var(--font-family-base)'
                }}
              >
                {helpText}
              </p>
            )}

            <p
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
                marginTop: 'var(--spacing-2)',
                fontFamily: 'var(--font-family-base)'
              }}
            >
              Maximum file size: {maxSize}MB
            </p>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploadProgress.status !== 'idle' && (
        <div
          className="rounded-lg border p-6"
          style={{
            borderColor: 'var(--color-border-default)',
            backgroundColor: 'var(--color-bg-card)'
          }}
        >
          <div className="flex items-center gap-4">
            {uploadProgress.status === 'uploading' && (
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--color-primary-default)' }} />
            )}
            {uploadProgress.status === 'success' && (
              <CheckCircle className="w-8 h-8" style={{ color: 'var(--color-success-default)' }} />
            )}
            {uploadProgress.status === 'error' && (
              <AlertCircle className="w-8 h-8" style={{ color: 'var(--color-danger-default)' }} />
            )}

            <div className="flex-1">
              <p
                style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--spacing-1)',
                  fontFamily: 'var(--font-family-base)'
                }}
              >
                {uploadProgress.message}
              </p>

              {uploadProgress.status === 'uploading' && (
                <div
                  className="w-full h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: 'var(--color-bg-muted)' }}
                >
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${uploadProgress.progress}%`,
                      backgroundColor: 'var(--color-primary-default)'
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* File Preview */}
      {value && uploadProgress.status !== 'uploading' && (
        <div
          className="rounded-lg border overflow-hidden"
          style={{ borderColor: 'var(--color-border-default)' }}
        >
          {preview && isImage && (
            <div className="relative">
              <img src={value} alt="Preview" className="w-full h-64 object-cover" />
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                className="absolute top-2 right-2"
                style={{
                  backgroundColor: 'var(--color-danger-default)',
                  color: 'white'
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {preview && isVideo && (
            <div className="relative">
              <video src={value} controls className="w-full h-64" />
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                className="absolute top-2 right-2"
                style={{
                  backgroundColor: 'var(--color-danger-default)',
                  color: 'white'
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {(!preview || (!isImage && !isVideo)) && (
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div style={{ color: 'var(--color-primary-default)' }}>
                  {getFileIcon(value)}
                </div>
                <div>
                  <p
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--color-text-primary)',
                      fontFamily: 'var(--font-family-base)'
                    }}
                  >
                    File uploaded
                  </p>
                  <p
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-muted)',
                      fontFamily: 'var(--font-family-base)'
                    }}
                    className="truncate max-w-[300px]"
                  >
                    {value}
                  </p>
                </div>
              </div>

              <Button variant="ghost" size="sm" onClick={handleRemove}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
