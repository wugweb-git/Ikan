import { useState } from 'react';
import { Image as ImageIcon, Upload, Search, Download, Film, File as FileIcon } from 'lucide-react';
import { useNotifications } from '../../shared/state/NotificationContext';
import { AdminPageLayout } from '../shell/AdminPageLayout';
import { AdminLoading } from '../ui/kit/AdminLoading';
import { AdminEmptyState } from '../ui/kit/AdminEmptyState';
import { useIsMobile } from '../ui/hooks/useIsMobile';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { copyToClipboard } from '../ui/lib/clipboard';
import { useMediaLibrary } from './useMediaLibrary';
import { MediaFileCard } from './MediaFileCard';
import { MediaUploadDialog } from './MediaUploadDialog';
import { type MediaFilter, MEDIA_FILTERS, formatBytes, isImageType, isVideoType, matchesMediaFilter } from './media-utils';

const CONTROL = 'h-[var(--ikan-component-button-height)] rounded-[var(--ikan-component-border-radius)]';

export function AdminMediaManager() {
  const { showToast } = useNotifications();
  const isMobile = useIsMobile();
  const { files, loading, reload, deleteFile, renameFile, isRenaming } = useMediaLibrary();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<MediaFilter>('all');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [renamingFileId, setRenamingFileId] = useState<string | null>(null);

  const handleFileUploaded = async () => {
    showToast('success', 'Success', 'File uploaded successfully');
    setShowUploadDialog(false);
    await reload();
  };

  const handleCopyUrl = async (url: string) => {
    const ok = await copyToClipboard(url);
    if (ok) showToast('success', 'Copied', 'URL copied to clipboard');
    else showToast('error', 'Copy Failed', 'Unable to copy URL. Please copy it manually.');
  };

  const filteredFiles = files.filter(file => matchesMediaFilter(file, searchQuery, filterType));
  const isFiltered = Boolean(searchQuery) || filterType !== 'all';

  const stats = [
    { label: 'Total Files', value: files.length, icon: <FileIcon className="w-4 h-4 text-[var(--color-primary-default)]" /> },
    { label: 'Images', value: files.filter(f => isImageType(f.fileType)).length, icon: <ImageIcon className="w-4 h-4 text-[var(--color-info-default)]" /> },
    { label: 'Videos', value: files.filter(f => isVideoType(f.fileType)).length, icon: <Film className="w-4 h-4 text-[var(--color-success-default)]" /> },
    { label: 'Total Size', value: formatBytes(files.reduce((acc, f) => acc + (f.fileSize || 0), 0)), icon: <Download className="w-4 h-4 text-[var(--color-warning-default)]" /> },
  ];

  return (
    <>
      <AdminPageLayout
        title="Media Library"
        description="Manage uploaded images, videos, and documents"
        stats={stats}
        actions={
          <Button onClick={() => setShowUploadDialog(true)} className={`${CONTROL} font-medium gap-2 bg-[var(--color-primary-default)] text-[var(--color-primary-on)]`}>
            <Upload className="w-4 h-4" />
            {!isMobile && 'Upload File'}
          </Button>
        }
        loading={loading}
        loadingFallback={<div className="flex items-center justify-center min-h-[400px]"><AdminLoading /></div>}
      >
        {/* Filters */}
        <Card className="bg-[var(--color-bg-card)] rounded-lg">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`${CONTROL} pl-10`}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {MEDIA_FILTERS.map((type) => (
                  <Button
                    key={type}
                    variant={filterType === type ? 'default' : 'outline'}
                    onClick={() => setFilterType(type)}
                    size="sm"
                    className={`${CONTROL} font-medium capitalize whitespace-nowrap`}
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
            icon={<ImageIcon className="w-8 h-8 text-[var(--color-text-muted)] opacity-50" />}
            title={isFiltered ? 'No files found' : 'No files uploaded yet'}
            description={isFiltered ? 'Try adjusting your search or filter criteria' : 'Upload your first file to get started.'}
            actionLabel={isFiltered ? 'Clear Filters' : 'Upload File'}
            onAction={isFiltered ? () => { setSearchQuery(''); setFilterType('all'); } : () => setShowUploadDialog(true)}
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredFiles.map((file) => (
              <MediaFileCard
                key={file.id}
                file={file}
                renaming={renamingFileId === file.id}
                renameBusy={isRenaming}
                onStartRename={() => setRenamingFileId(file.id)}
                onEndRename={() => setRenamingFileId(null)}
                onRename={(name) => renameFile(file.id, name)}
                onCopyUrl={() => handleCopyUrl(file.url)}
                onDelete={() => deleteFile(file)}
              />
            ))}
          </div>
        )}
      </AdminPageLayout>

      <MediaUploadDialog open={showUploadDialog} onOpenChange={setShowUploadDialog} onUploaded={handleFileUploaded} />
    </>
  );
}
