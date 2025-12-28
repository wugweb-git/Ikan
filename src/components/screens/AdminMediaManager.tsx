import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Upload, Trash2, Search, Download, ExternalLink, FileText, Film, Music, File } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { apiClient } from '../../lib/api-client';
import { AdminHeader } from '../admin/AdminHeader';
import { AdminEmptyState } from '../admin/AdminEmptyState';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { FileUpload } from '../ui/file-upload';
import { cn } from '../ui/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';

interface MediaFile {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  filePath: string;
  bucket: string;
  url: string;
  uploadedAt: string;
}

interface AdminMediaManagerProps {
  onBack?: () => void;
  className?: string;
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

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getMediaFiles();
      const data = Array.isArray(response) ? response : response.files || [];
      setFiles(data);
      setLoading(false); // Success - stop loading
    } catch (error: any) {
      console.error('Failed to load media files:', error);
      // GLOBAL APPROACH: Show infinite loader on backend errors
      console.error('Backend error - showing infinite loader to force proper backend setup');
      // Don't set loading to false - keeps showing the loader
    }
  };

  const handleFileUploaded = async (url: string) => {
    showToast('success', 'Success', 'File uploaded successfully');
    setShowUploadDialog(false);
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

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    showToast('success', 'Copied', 'URL copied to clipboard');
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="w-6 h-6" />;
    if (fileType.startsWith('video/')) return <Film className="w-6 h-6" />;
    if (fileType.startsWith('audio/')) return <Music className="w-6 h-6" />;
    if (fileType.includes('pdf')) return <FileText className="w-6 h-6" />;
    return <File className="w-6 h-6" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    if (filterType === 'images') return matchesSearch && file.fileType.startsWith('image/');
    if (filterType === 'videos') return matchesSearch && file.fileType.startsWith('video/');
    if (filterType === 'documents') return matchesSearch && (file.fileType.includes('pdf') || file.fileType.includes('document'));
    
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
      value: files.filter(f => f.fileType.startsWith('image/')).length,
      icon: <ImageIcon className="w-4 h-4" style={{ color: 'var(--color-info-default)' }} />
    },
    {
      label: 'Videos',
      value: files.filter(f => f.fileType.startsWith('video/')).length,
      icon: <Film className="w-4 h-4" style={{ color: 'var(--color-success-default)' }} />
    },
    {
      label: 'Total Size',
      value: formatFileSize(files.reduce((acc, f) => acc + f.fileSize, 0)),
      icon: <Download className="w-4 h-4" style={{ color: 'var(--color-warning-default)' }} />
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div
            className="animate-spin rounded-full border-4 mx-auto mb-4"
            style={{
              width: '48px',
              height: '48px',
              borderColor: 'var(--color-accent-default)',
              borderTopColor: 'var(--color-primary-default)'
            }}
          />
          <p
            style={{
              fontFamily: 'var(--font-family-base)',
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-muted)'
            }}
          >
            Loading media files...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminHeader
          title="Media Library"
          description="Manage uploaded images, videos, and documents"
          onBack={onBack}
          breadcrumbs={[{ label: 'Admin', onClick: onBack }, { label: 'Media Library' }]}
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
              <div className="flex gap-2 overflow-x-auto">
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
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                className="hover:shadow-md overflow-hidden"
              >
                <div className="aspect-square relative">
                  {file.fileType.startsWith('image/') ? (
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
                </div>

                <CardContent className="p-3">
                  <p
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--color-text-primary)',
                      marginBottom: 'var(--spacing-1)'
                    }}
                    className="truncate"
                    title={file.fileName}
                  >
                    {file.fileName}
                  </p>
                  <p
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-muted)',
                      marginBottom: 'var(--spacing-2)'
                    }}
                  >
                    {formatFileSize(file.fileSize)} • {new Date(file.uploadedAt).toLocaleDateString()}
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

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload File</DialogTitle>
            <DialogDescription>
              Upload images, videos, PDFs, or other media files. Maximum file size: 50MB
            </DialogDescription>
          </DialogHeader>

          <FileUpload
            onChange={handleFileUploaded}
            maxSize={50}
            helpText="Supported formats: Images (JPG, PNG, WebP), Videos (MP4, WebM), Documents (PDF)"
            preview={true}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete File</DialogTitle>
            <DialogDescription>
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
