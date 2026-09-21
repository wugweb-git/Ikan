import { useState, useEffect, useRef, useCallback } from 'react';
import { Image as ImageIcon, Upload, Trash2, Search, Download, ExternalLink, FileText, Film, Music, File, Pencil, Check, X, Zap } from 'lucide-react';
import { useNotifications } from '../../shared/contexts/NotificationContext';
import { apiClient } from '../../shared/api';
import { AdminHeader } from '../components/AdminHeader';
import { AdminLoading } from '../components/AdminLoading';
import { useIsMobile } from '../ui/hooks/useIsMobile';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { AdminEmptyState } from '../components/AdminEmptyState';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { copyToClipboard } from '../ui/lib/clipboard';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';

interface MediaFile {
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

interface AdminMediaManagerProps {
  onBack?: () => void;
  className?: string;
}

// ── Client-side Image Compression ──────────────────────────────
async function compressImage(file: File, quality = 0.82): Promise<File> {
  // Only compress raster images (skip SVG, GIF)
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Skip if image is already small enough (under 500KB)
      if (file.size < 512000) {
        resolve(file);
        return;
      }

      // Only downscale truly oversized images (e.g. 4K+ phone camera shots)
      // Preserves original dimensions for all normal images
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

      // Convert to WebP if supported, otherwise JPEG
      const outputType = 'image/webp';

      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) {
            // If compressed is larger, use original
            resolve(file);
            return;
          }

          // Create new file with .webp extension
          const ext = outputType === 'image/webp' ? 'webp' : 'jpg';
          const baseName = file.name.replace(/\.[^.]+$/, '');
          const compressedFile = new File([blob], `${baseName}.${ext}`, {
            type: outputType,
            lastModified: Date.now()
          });
          resolve(compressedFile);
        },
        outputType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file); // Fallback to original on error
    };

    img.src = url;
  });
}

export function AdminMediaManager({ onBack, className }: AdminMediaManagerProps) {
  const { showToast } = useNotifications();
  const isMobile = useIsMobile();

  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [autoCompress, setAutoCompress] = useState(true);

  // Rename state
  const [renamingFileId, setRenamingFileId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Upload with compression state
  const [isCompressing, setIsCompressing] = useState(false);

  useEffect(() => {
    loadFiles();
  }, []);

  useEffect(() => {
    if (renamingFileId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingFileId]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getMediaFiles();
      const data = Array.isArray(response) ? response : response.files || [];
      setFiles(data);
    } catch (error: any) {
      console.error('Failed to load media files:', error);
      showToast('error', 'Error', 'Failed to load media files');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUploaded = async (url: string) => {
    showToast('success', 'Success', 'File uploaded successfully');
    setShowUploadDialog(false);
    setIsCompressing(false);
    await loadFiles();
  };

  const handleDelete = async () => {
    if (!selectedFile) return;

    try {
      await apiClient.deleteMediaFile(selectedFile.id);
      showToast('success', 'Success', 'File deleted');
      setIsDeleteDialogOpen(false);
      setSelectedFile(null);
      await loadFiles();
    } catch (error: any) {
      showToast('error', 'Error', error.message || 'Failed to delete file');
    }
  };

  const handleCopyUrl = async (url: string) => {
    const ok = await copyToClipboard(url);
    if (ok) {
      showToast('success', 'Copied', 'URL copied to clipboard');
    } else {
      showToast('error', 'Copy Failed', 'Unable to copy URL. Please copy it manually.');
    }
  };

  // ── Rename Handlers ──────────────────────────────────────────
  const startRename = (file: MediaFile, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setRenamingFileId(file.id);
    setRenameValue(file.fileName || '');
  };

  const cancelRename = () => {
    setRenamingFileId(null);
    setRenameValue('');
  };

  const confirmRename = async (fileId: string) => {
    const trimmed = renameValue.trim();
    if (!trimmed) {
      cancelRename();
      return;
    }

    const file = files.find(f => f.id === fileId);
    if (!file || file.fileName === trimmed) {
      cancelRename();
      return;
    }

    try {
      setIsRenaming(true);
      await apiClient.renameMediaFile(fileId, trimmed);
      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, fileName: trimmed } : f));
      showToast('success', 'Renamed', `File renamed to "${trimmed}"`);
    } catch (error: any) {
      console.error('Rename failed:', error);
      showToast('error', 'Error', error.message || 'Failed to rename file');
    } finally {
      setIsRenaming(false);
      cancelRename();
    }
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent, fileId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      confirmRename(fileId);
    } else if (e.key === 'Escape') {
      cancelRename();
    }
  };

  const getFileIcon = (fileType: string) => {
    if (!fileType) return <File className="w-6 h-6" />;
    if (fileType.startsWith('image/')) return <ImageIcon className="w-6 h-6" />;
    if (fileType.startsWith('video/')) return <Film className="w-6 h-6" />;
    if (fileType.startsWith('audio/')) return <Music className="w-6 h-6" />;
    if (fileType.includes('pdf')) return <FileText className="w-6 h-6" />;
    return <File className="w-6 h-6" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const filteredFiles = files.filter((file) => {
    const matchesSearch = (file.fileName || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (filterType === 'all') return matchesSearch;
    if (filterType === 'images') return matchesSearch && (file.fileType || '').startsWith('image/');
    if (filterType === 'videos') return matchesSearch && (file.fileType || '').startsWith('video/');
    if (filterType === 'documents') return matchesSearch && ((file.fileType || '').includes('pdf') || (file.fileType || '').includes('document'));

    return matchesSearch;
  });

  const stats = [
    {
      label: 'Total Files',
      value: files.length,
      icon: <File className="w-4 h-4" style={{ color: 'var(--color-primary-default)' }} />
    },
    {
      label: 'Images',
      value: files.filter(f => (f.fileType || '').startsWith('image/')).length,
      icon: <ImageIcon className="w-4 h-4" style={{ color: 'var(--color-info-default)' }} />
    },
    {
      label: 'Videos',
      value: files.filter(f => (f.fileType || '').startsWith('video/')).length,
      icon: <Film className="w-4 h-4" style={{ color: 'var(--color-success-default)' }} />
    },
    {
      label: 'Total Size',
      value: formatFileSize(files.reduce((acc, f) => acc + (f.fileSize || 0), 0)),
      icon: <Download className="w-4 h-4" style={{ color: 'var(--color-warning-default)' }} />
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <AdminLoading />
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminHeader
          title="Media Library"
          description="Manage uploaded images, videos, and documents"
          stats={stats}
          actions={
            <Button
              onClick={() => setShowUploadDialog(true)}
              style={{
                height: 'var(--ikan-component-button-height)',
                borderRadius: 'var(--ikan-component-border-radius)',
                fontWeight: 'var(--font-weight-medium)',
                gap: 'var(--spacing-2)',
                backgroundColor: 'var(--color-primary-default)',
                color: 'var(--color-primary-on)'
              }}
            >
              <Upload className="w-4 h-4" />
              {!isMobile && 'Upload File'}
            </Button>
          }
        />

        {/* Filters */}
        <Card style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                  style={{ color: 'var(--color-text-muted)' }}
                />
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    paddingLeft: 'var(--spacing-10)',
                    height: 'var(--ikan-component-button-height)',
                    borderRadius: 'var(--ikan-component-border-radius)'
                  }}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {(['all', 'images', 'videos', 'documents'] as const).map((type) => (
                  <Button
                    key={type}
                    variant={filterType === type ? 'default' : 'outline'}
                    onClick={() => setFilterType(type)}
                    size="sm"
                    style={{
                      height: 'var(--ikan-component-button-height)',
                      borderRadius: 'var(--ikan-component-border-radius)',
                      fontWeight: 'var(--font-weight-medium)',
                      textTransform: 'capitalize',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Files Grid */}
        {filteredFiles.length === 0 ? (
          <AdminEmptyState
            icon={ImageIcon}
            title={searchQuery || filterType !== 'all' ? 'No files found' : 'No files uploaded yet'}
            description={
              searchQuery || filterType !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Upload your first file to get started.'
            }
            actionLabel={searchQuery || filterType !== 'all' ? 'Clear Filters' : 'Upload File'}
            onAction={
              searchQuery || filterType !== 'all'
                ? () => {
                    setSearchQuery('');
                    setFilterType('all');
                  }
                : () => setShowUploadDialog(true)
            }
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredFiles.map((file) => (
              <Card
                key={file.id}
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-sm)',
                  cursor: 'pointer',
                  overflow: 'hidden'
                }}
              >
                <div className="aspect-square relative">
                  {(file.fileType || '').startsWith('image/') ? (
                    <img
                      src={file.url}
                      alt={file.fileName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ backgroundColor: 'var(--color-bg-muted)' }}
                    >
                      <div style={{ color: 'var(--color-primary-default)' }}>
                        {getFileIcon(file.fileType)}
                      </div>
                    </div>
                  )}
                  {/* Optimized badge */}
                  {file.optimized && (
                    <div
                      className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: 'rgba(16, 185, 129, 0.9)',
                        color: 'white',
                        fontSize: 'var(--text-xs)',
                        fontFamily: 'var(--font-family-base)'
                      }}
                    >
                      <Zap className="w-3 h-3" />
                    </div>
                  )}
                </div>

                <CardContent className="p-3">
                  {/* File Name — editable inline */}
                  {renamingFileId === file.id ? (
                    <div className="flex items-center gap-1 mb-1">
                      <Input
                        ref={renameInputRef}
                        value={renameValue || ''}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => handleRenameKeyDown(e, file.id)}
                        onBlur={() => confirmRename(file.id)}
                        disabled={isRenaming}
                        style={{
                          fontSize: 'var(--text-xs)',
                          height: '28px',
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-sm)',
                          fontFamily: 'var(--font-family-base)'
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 mb-1 group/name">
                      <p
                        style={{
                          fontSize: 'var(--text-sm)',
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--color-text-primary)',
                          fontFamily: 'var(--font-family-base)'
                        }}
                        className="truncate flex-1"
                        title={file.fileName}
                      >
                        {file.fileName}
                      </p>
                      <button
                        onClick={(e) => startRename(file, e)}
                        className="shrink-0 opacity-0 group-hover/name:opacity-100"
                        style={{
                          padding: '2px',
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          color: 'var(--color-text-muted)',
                          borderRadius: 'var(--radius-sm)'
                        }}
                        title="Rename file"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  <p
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-muted)',
                      marginBottom: 'var(--spacing-2)',
                      fontFamily: 'var(--font-family-base)'
                    }}
                  >
                    {formatFileSize(file.fileSize)} {file.uploadedAt ? `\u00b7 ${new Date(file.uploadedAt).toLocaleDateString()}` : ''}
                  </p>

                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyUrl(file.url)}
                      style={{ flex: 1, padding: 'var(--spacing-1)' }}
                      title="Copy URL"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startRename(file)}
                      style={{ flex: 1, padding: 'var(--spacing-1)' }}
                      title="Rename"
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(file.url, '_blank')}
                      style={{ flex: 1, padding: 'var(--spacing-1)' }}
                      title="Preview"
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedFile(file);
                        setIsDeleteDialogOpen(true);
                      }}
                      style={{ flex: 1, padding: 'var(--spacing-1)', color: 'var(--color-danger-default)' }}
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Upload Dialog with Auto-Compress */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle style={{ fontWeight: 'var(--font-weight-medium)', fontFamily: 'var(--font-family-base)' }}>
              Upload File
            </DialogTitle>
            <DialogDescription style={{ fontFamily: 'var(--font-family-base)' }}>
              Upload images, videos, PDFs, or other media files. Maximum file size: 50MB
            </DialogDescription>
          </DialogHeader>

          {/* Auto-Compress Toggle */}
          <div
            className="flex items-start gap-3 p-4 rounded-lg"
            style={{ backgroundColor: 'var(--color-bg-muted)', border: '1px solid var(--color-border-default)' }}
          >
            <Checkbox
              id="autoCompress"
              checked={autoCompress}
              onCheckedChange={(checked) => setAutoCompress(checked as boolean)}
            />
            <div className="flex-1">
              <Label
                htmlFor="autoCompress"
                className="cursor-pointer"
                style={{ fontWeight: 'var(--font-weight-medium)', fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}
              >
                <Zap className="w-4 h-4" style={{ color: 'var(--color-success-default)' }} />
                Auto-compress & optimize images
              </Label>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)', fontFamily: 'var(--font-family-base)' }}>
                Converts images to WebP format and optimizes quality to reduce file size. 
                Original dimensions are preserved. Files under 500KB, SVGs, and GIFs are kept as-is.
                Only truly oversized images (4K+) are downscaled.
              </p>
            </div>
          </div>

          {isCompressing && (
            <div
              className="flex items-center gap-3 p-3 rounded-lg"
              style={{ backgroundColor: 'var(--color-info-bg, #EFF6FF)', border: '1px solid var(--color-info-default, #3B82F6)' }}
            >
              <div className="animate-spin">
                <Zap className="w-4 h-4" style={{ color: 'var(--color-info-default, #3B82F6)' }} />
              </div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-base)' }}>
                Compressing image before upload...
              </p>
            </div>
          )}

          <CompressedFileUpload
            onUpload={handleFileUploaded}
            autoCompress={autoCompress}
            onCompressStart={() => setIsCompressing(true)}
            onCompressEnd={() => setIsCompressing(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ fontWeight: 'var(--font-weight-medium)', fontFamily: 'var(--font-family-base)' }}>
              Delete File
            </DialogTitle>
            <DialogDescription style={{ fontFamily: 'var(--font-family-base)' }}>
              Are you sure you want to delete "{selectedFile?.fileName}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              style={{ backgroundColor: 'var(--color-danger-default)', color: 'white' }}
            >
              Delete File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Wrapper around FileUpload that adds compression ────────────
interface CompressedFileUploadProps {
  onUpload: (url: string) => void;
  autoCompress: boolean;
  onCompressStart: () => void;
  onCompressEnd: () => void;
}

function CompressedFileUpload({ onUpload, autoCompress, onCompressStart, onCompressEnd }: CompressedFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadState, setUploadState] = useState<'idle' | 'compressing' | 'uploading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [compressionSavings, setCompressionSavings] = useState<string | null>(null);

  const processAndUpload = async (file: File) => {
    try {
      let fileToUpload = file;
      const originalSize = file.size;

      // Auto-compress if enabled and it's an image
      if (autoCompress && file.type.startsWith('image/') && file.type !== 'image/svg+xml' && file.type !== 'image/gif') {
        setUploadState('compressing');
        setStatusMessage('Optimizing image...');
        onCompressStart();

        fileToUpload = await compressImage(file);

        onCompressEnd();

        if (fileToUpload.size < originalSize) {
          const savedPercent = Math.round((1 - fileToUpload.size / originalSize) * 100);
          const savedBytes = originalSize - fileToUpload.size;
          const savings = `Compressed: ${formatBytes(originalSize)} → ${formatBytes(fileToUpload.size)} (${savedPercent}% smaller)`;
          setCompressionSavings(savings);
          setStatusMessage(savings);
        } else {
          setCompressionSavings('Image already optimized — uploaded as-is');
          setStatusMessage('Image already optimized — uploading original...');
        }
      }

      setUploadState('uploading');
      if (!compressionSavings) setStatusMessage('Uploading...');

      const data = await apiClient.uploadMediaFile(fileToUpload, 'make-cc205da9-media');

      setUploadState('success');
      setStatusMessage('Upload complete!');
      onUpload(data.url);

      setTimeout(() => {
        setUploadState('idle');
        setStatusMessage('');
        setCompressionSavings(null);
      }, 2000);
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadState('error');
      setStatusMessage(error.message || 'Upload failed');
      onCompressEnd();

      setTimeout(() => {
        setUploadState('idle');
        setStatusMessage('');
        setCompressionSavings(null);
      }, 3000);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) processAndUpload(e.dataTransfer.files[0]);
  }, [autoCompress]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processAndUpload(e.target.files[0]);
  }, [autoCompress]);

  if (uploadState !== 'idle') {
    return (
      <div
        className="rounded-lg border p-6"
        style={{ borderColor: 'var(--color-border-default)', backgroundColor: 'var(--color-bg-card)' }}
      >
        <div className="flex items-center gap-4">
          {(uploadState === 'compressing' || uploadState === 'uploading') && (
            <div className="animate-spin">
              {uploadState === 'compressing' ? (
                <Zap className="w-8 h-8" style={{ color: 'var(--color-success-default)' }} />
              ) : (
                <Upload className="w-8 h-8" style={{ color: 'var(--color-primary-default)' }} />
              )}
            </div>
          )}
          {uploadState === 'success' && (
            <Check className="w-8 h-8" style={{ color: 'var(--color-success-default)' }} />
          )}
          {uploadState === 'error' && (
            <X className="w-8 h-8" style={{ color: 'var(--color-danger-default)' }} />
          )}
          <div className="flex-1">
            <p style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-base)' }}>
              {uploadState === 'compressing' ? 'Optimizing...' : uploadState === 'uploading' ? 'Uploading...' : uploadState === 'success' ? 'Done!' : 'Error'}
            </p>
            {statusMessage && (
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)', marginTop: 'var(--spacing-1)' }}>
                {statusMessage}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-lg border-2 border-dashed cursor-pointer ${
        dragActive
          ? 'border-[var(--color-primary-default)] bg-[var(--color-primary-default)]/5'
          : 'border-[var(--color-border-default)] hover:border-[var(--color-primary-default)]/50'
      }`}
      style={{ padding: 'var(--spacing-8)', backgroundColor: dragActive ? undefined : 'var(--color-bg-card)' }}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*,audio/*,.pdf"
        onChange={handleChange}
        style={{ display: 'none' }}
      />
      <div className="flex flex-col items-center text-center">
        <div className="rounded-full p-4 mb-4" style={{ backgroundColor: 'var(--color-primary-default)', color: 'var(--color-primary-on)' }}>
          <Upload className="w-8 h-8" />
        </div>
        <p style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-2)', fontFamily: 'var(--font-family-base)' }}>
          Drop your file here, or <span style={{ color: 'var(--color-primary-default)' }}>browse</span>
        </p>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)' }}>
          Supported: Images (JPG, PNG, WebP), Videos (MP4, WebM), Documents (PDF)
        </p>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-2)', fontFamily: 'var(--font-family-base)' }}>
          Maximum file size: 50MB {autoCompress && '• Images will be auto-optimized'}
        </p>
      </div>
    </div>
  );
}