import { useEffect, useRef, useState } from 'react';
import type React from 'react';
import { Image as ImageIcon, Trash2, Download, ExternalLink, FileText, Film, Music, File as FileIcon, Pencil, Zap } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { type MediaFile, formatBytes } from './media-utils';

function FileTypeIcon({ fileType }: { fileType: string }) {
  const cls = 'w-6 h-6';
  if (!fileType) return <FileIcon className={cls} />;
  if (fileType.startsWith('image/')) return <ImageIcon className={cls} />;
  if (fileType.startsWith('video/')) return <Film className={cls} />;
  if (fileType.startsWith('audio/')) return <Music className={cls} />;
  if (fileType.includes('pdf')) return <FileText className={cls} />;
  return <FileIcon className={cls} />;
}

const ACTION = 'flex-1 p-1';

interface MediaFileCardProps {
  file: MediaFile;
  renaming: boolean;
  renameBusy: boolean;
  onStartRename: () => void;
  onEndRename: () => void;
  onRename: (newName: string) => Promise<void>;
  onCopyUrl: () => void;
  onDelete: () => void;
}

export function MediaFileCard({ file, renaming, renameBusy, onStartRename, onEndRename, onRename, onCopyUrl, onDelete }: MediaFileCardProps) {
  const [renameValue, setRenameValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  // Enter commits, then the input's blur fires too — commit only once.
  const committing = useRef(false);

  useEffect(() => {
    if (renaming) {
      setRenameValue(file.fileName || '');
      // Focus once the input has rendered with its value.
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }
  }, [renaming, file.fileName]);

  const confirmRename = async () => {
    if (committing.current) return;
    committing.current = true;
    try {
      const trimmed = renameValue.trim();
      if (trimmed && trimmed !== file.fileName) await onRename(trimmed);
    } finally {
      committing.current = false;
      onEndRename();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      void confirmRename();
    } else if (e.key === 'Escape') {
      onEndRename();
    }
  };

  return (
    <Card className="bg-[var(--color-bg-card)] rounded-lg shadow-[var(--shadow-sm)] cursor-pointer overflow-hidden">
      <div className="aspect-square relative">
        {(file.fileType || '').startsWith('image/') ? (
          <img src={file.url} alt={file.fileName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[var(--color-bg-muted)]">
            <div className="text-[var(--color-primary-default)]">
              <FileTypeIcon fileType={file.fileType} />
            </div>
          </div>
        )}
        {file.optimized && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-[rgba(16,185,129,0.9)] text-white text-xs">
            <Zap className="w-3 h-3" />
          </div>
        )}
      </div>

      <CardContent className="p-3">
        {/* File Name — editable inline */}
        {renaming ? (
          <div className="flex items-center gap-1 mb-1">
            <Input
              ref={inputRef}
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => void confirmRename()}
              disabled={renameBusy}
              className="text-xs h-7 px-1.5 py-0.5 rounded-sm"
            />
          </div>
        ) : (
          <div className="flex items-center gap-1 mb-1 group/name">
            <p className="truncate flex-1 text-sm font-medium text-[var(--color-text-primary)]" title={file.fileName}>
              {file.fileName}
            </p>
            <button
              onClick={(e) => { e.stopPropagation(); onStartRename(); }}
              className="shrink-0 opacity-0 group-hover/name:opacity-100 p-0.5 border-none bg-transparent cursor-pointer text-[var(--color-text-muted)] rounded-sm"
              title="Rename file"
            >
              <Pencil className="w-3 h-3" />
            </button>
          </div>
        )}

        <p className="text-xs text-[var(--color-text-muted)] mb-2">
          {formatBytes(file.fileSize)} {file.uploadedAt ? `· ${new Date(file.uploadedAt).toLocaleDateString()}` : ''}
        </p>

        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={onCopyUrl} className={ACTION} title="Copy URL">
            <ExternalLink className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onStartRename} className={ACTION} title="Rename">
            <Pencil className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => window.open(file.url, '_blank', 'noopener,noreferrer')} className={ACTION} title="Preview">
            <Download className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete} className={`${ACTION} text-[var(--color-danger-default)]`} title="Delete">
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
