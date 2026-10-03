/**
 * ImageField — Unified image input with URL, Upload, and Media Library picker.
 * All uploads are stored in Supabase Storage via the media upload endpoint and
 * automatically appear in the Media Library for reuse.
 */
import { useState, useRef } from 'react';
import { Image as ImageIcon, Upload, FolderOpen, X, Loader2, Link as LinkIcon } from 'lucide-react';
import { apiClient } from '../../../shared/api/api';
import { Button } from '../button';
import { Input } from '../input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../dialog';

interface ImageFieldProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  helpText?: string;
  previewHeight?: number;
  previewBg?: string;       // e.g. 'dark' for light logos on dark bg
  accept?: string;
}

export function ImageField({
  value,
  onChange,
  label,
  helpText,
  previewHeight = 40,
  previewBg,
  accept = 'image/*',
}: ImageFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const result = await apiClient.uploadMediaFile(file);
      const url = result?.url || result?.signed_url || result?.public_url || '';
      if (url) {
        onChange(url);
      }
    } catch (err: any) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const openMediaLibrary = async () => {
    setShowMediaPicker(true);
    setMediaLoading(true);
    try {
      const items = await apiClient.getMediaFiles();
      // Filter to images only
      const images = (Array.isArray(items) ? items : []).filter(
        (f: any) => f.fileType?.startsWith('image/') || f.fileName?.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/i)
      );
      setMediaItems(images);
    } catch {
      setMediaItems([]);
    } finally {
      setMediaLoading(false);
    }
  };

  const handleMediaSelect = (item: any) => {
    const url = item.url || item.signed_url || item.public_url || '';
    if (url) onChange(url);
    setShowMediaPicker(false);
  };

  const previewBgStyle = previewBg === 'dark'
    ? { backgroundColor: 'var(--color-primary-default)' }
    : previewBg === 'checkerboard'
    ? { backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)', backgroundSize: '16px 16px', backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px' }
    : { backgroundColor: 'var(--color-bg-muted)' };

  return (
    <div>
      {label && (
        <label style={{
          display: 'block',
          fontSize: 'var(--text-sm)',
          fontWeight: 500,
          fontFamily: 'var(--font-family-base)',
          color: 'var(--color-text-primary)',
          marginBottom: 6,
        }}>
          {label}
        </label>
      )}

      {/* Preview + Actions */}
      {value ? (
        <div
          className="relative rounded-lg overflow-hidden border"
          style={{
            borderColor: 'var(--color-border-default)',
            ...previewBgStyle,
            padding: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <img
            src={value}
            alt={label || 'Preview'}
            style={{ height: previewHeight, maxWidth: '60%', objectFit: 'contain' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="flex-1" />
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="h-7 px-2 text-xs gap-1"
              disabled={uploading}
            >
              <Upload className="w-3 h-3" /> Replace
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={openMediaLibrary}
              className="h-7 px-2 text-xs gap-1"
            >
              <FolderOpen className="w-3 h-3" /> Library
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="h-7 px-2 text-xs gap-1"
            >
              <LinkIcon className="w-3 h-3" /> URL
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange('')}
              className="h-7 w-7 p-0"
              style={{ color: 'var(--color-danger-default)' }}
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          className="rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-3 py-5"
          style={{ borderColor: 'var(--color-border-default)', backgroundColor: 'var(--color-bg-muted)' }}
        >
          {uploading ? (
            <div className="flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family-base)' }}>Uploading...</span>
            </div>
          ) : (
            <>
              <ImageIcon className="w-8 h-8" style={{ color: 'var(--color-text-muted)', opacity: 0.4 }} />
              <div className="flex items-center gap-2 flex-wrap justify-center px-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-8 text-xs gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" /> Upload
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openMediaLibrary}
                  className="h-8 text-xs gap-1.5"
                >
                  <FolderOpen className="w-3.5 h-3.5" /> Media Library
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="h-8 text-xs gap-1.5"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <LinkIcon className="w-3.5 h-3.5" /> Paste URL
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* URL text input (toggled) */}
      {showUrlInput && (
        <div className="mt-2 flex gap-2">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://..."
            className="flex-1 text-xs"
          />
          <Button variant="ghost" size="sm" onClick={() => setShowUrlInput(false)} className="h-9 w-9 p-0">
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}

      {helpText && (
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 4, fontFamily: 'var(--font-family-base)' }}>
          {helpText}
        </p>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
          e.target.value = '';
        }}
      />

      {/* Media Library Picker Dialog */}
      <Dialog open={showMediaPicker} onOpenChange={setShowMediaPicker}>
        <DialogContent className="max-w-2xl" style={{ maxHeight: '80vh', overflow: 'auto' }}>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'var(--font-family-base)', fontWeight: 500 }}>
              Select from Media Library
            </DialogTitle>
            <DialogDescription style={{ fontFamily: 'var(--font-family-base)' }}>
              Choose an existing image or upload a new one via the Media Manager.
            </DialogDescription>
          </DialogHeader>

          {/* Upload inline from picker */}
          <div className="flex items-center gap-3 p-3 rounded-lg" style={{ border: '1px dashed var(--color-border-default)', backgroundColor: 'var(--color-bg-muted)' }}>
            <Upload className="w-4 h-4 shrink-0" style={{ color: 'var(--color-text-muted)' }} />
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)', flex: 1 }}>
              Upload a new image directly
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5"
              disabled={uploading}
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = accept;
                input.onchange = async (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    setUploading(true);
                    try {
                      const result = await apiClient.uploadMediaFile(file);
                      const url = result?.url || result?.signed_url || result?.public_url || '';
                      if (url) {
                        onChange(url);
                        setShowMediaPicker(false);
                      }
                      // Refresh media list
                      const items = await apiClient.getMediaFiles();
                      setMediaItems((Array.isArray(items) ? items : []).filter(
                        (f: any) => f.fileType?.startsWith('image/')
                      ));
                    } catch (err) {
                      console.error('Upload from picker failed:', err);
                    } finally {
                      setUploading(false);
                    }
                  }
                };
                input.click();
              }}
            >
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>

          {mediaLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--color-primary-default)' }} />
            </div>
          ) : mediaItems.length === 0 ? (
            <div className="text-center p-8">
              <ImageIcon className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--color-text-muted)', opacity: 0.5 }} />
              <p style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                No images in your media library yet. Upload one above!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {mediaItems.map((item: any, idx: number) => {
                const url = item.url || item.signed_url || item.public_url || '';
                const name = item.fileName || item.name || `Item ${idx + 1}`;
                const isSelected = value === url;
                return (
                  <button
                    key={item.id || idx}
                    onClick={() => handleMediaSelect(item)}
                    className="group relative aspect-square rounded-lg overflow-hidden border-2 transition-colors"
                    style={{
                      borderColor: isSelected ? 'var(--color-primary-default)' : 'var(--color-border-default)',
                      backgroundColor: 'var(--color-bg-muted)',
                    }}
                  >
                    <img src={url} alt={name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                      <span className="text-white truncate w-full" style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-family-base)' }}>{name}</span>
                    </div>
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-default)' }}>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
