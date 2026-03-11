import { useState, useRef, useCallback, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Check, X, Move } from 'lucide-react';
import { Button } from './button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './dialog';
import { Label } from './label';

interface ImageCropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageFile: File | null;
  aspectRatio?: number; // width / height, e.g. 1 for square, 16/9 for wide
  onCropComplete: (croppedBlob: Blob) => void;
  title?: string;
}

interface CropState {
  x: number;
  y: number;
  zoom: number;
  rotation: number;
}

export function ImageCropDialog({
  open,
  onOpenChange,
  imageFile,
  aspectRatio = 1,
  onCropComplete,
  title = 'Crop Image'
}: ImageCropDialogProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [processing, setProcessing] = useState(false);

  const [crop, setCrop] = useState<CropState>({
    x: 0, y: 0, zoom: 1, rotation: 0
  });

  // Load image from File
  useEffect(() => {
    if (!imageFile) return;
    const url = URL.createObjectURL(imageFile);
    setImageUrl(url);
    setCrop({ x: 0, y: 0, zoom: 1, rotation: 0 });
    setImageLoaded(false);

    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
      setImageLoaded(true);
    };
    img.src = url;

    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  // Draw preview
  useEffect(() => {
    if (!imageLoaded || !canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const img = imageRef.current;

    // Canvas size for preview (match container)
    const containerWidth = 400;
    const containerHeight = containerWidth / aspectRatio;
    canvas.width = containerWidth;
    canvas.height = containerHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    // Center + transform
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((crop.rotation * Math.PI) / 180);
    ctx.scale(crop.zoom, crop.zoom);

    // Fit image to canvas
    const scale = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
    const drawW = img.naturalWidth * scale;
    const drawH = img.naturalHeight * scale;

    ctx.drawImage(
      img,
      -drawW / 2 + crop.x,
      -drawH / 2 + crop.y,
      drawW,
      drawH
    );

    ctx.restore();
  }, [crop, imageLoaded, aspectRatio]);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
    setDragStart({ x: e.clientX - crop.x, y: e.clientY - crop.y });
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    setCrop(prev => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    }));
  }, [dragging, dragStart]);

  const handleMouseUp = () => setDragging(false);

  // Touch support
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setDragging(true);
    setDragStart({ x: touch.clientX - crop.x, y: touch.clientY - crop.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragging) return;
    const touch = e.touches[0];
    setCrop(prev => ({
      ...prev,
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    }));
  };

  const handleTouchEnd = () => setDragging(false);

  // Zoom via slider or scroll
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    setCrop(prev => ({
      ...prev,
      zoom: Math.max(0.5, Math.min(3, prev.zoom + delta))
    }));
  };

  const handleRotate = () => {
    setCrop(prev => ({ ...prev, rotation: (prev.rotation + 90) % 360 }));
  };

  // Export cropped image
  const handleCrop = async () => {
    if (!imageRef.current) return;

    setProcessing(true);
    try {
      const img = imageRef.current;
      const outputSize = 800; // Max output dimension
      const outW = aspectRatio >= 1 ? outputSize : outputSize * aspectRatio;
      const outH = aspectRatio >= 1 ? outputSize / aspectRatio : outputSize;

      const offscreen = document.createElement('canvas');
      offscreen.width = outW;
      offscreen.height = outH;
      const ctx = offscreen.getContext('2d')!;

      ctx.translate(outW / 2, outH / 2);
      ctx.rotate((crop.rotation * Math.PI) / 180);
      ctx.scale(crop.zoom, crop.zoom);

      const scale = Math.max(outW / img.naturalWidth, outH / img.naturalHeight);
      const drawW = img.naturalWidth * scale;
      const drawH = img.naturalHeight * scale;

      ctx.drawImage(
        img,
        -drawW / 2 + crop.x * (outW / 400),
        -drawH / 2 + crop.y * (outW / 400),
        drawW,
        drawH
      );

      offscreen.toBlob((blob) => {
        if (blob) {
          onCropComplete(blob);
          onOpenChange(false);
        }
      }, 'image/jpeg', 0.9);
    } catch (err) {
      console.error('Crop error:', err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle style={{ fontWeight: 500 }}>{title}</DialogTitle>
          <DialogDescription>Drag to reposition, scroll to zoom</DialogDescription>
        </DialogHeader>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)', alignItems: 'center' }}>
          {/* Canvas Preview */}
          <div
            ref={previewRef}
            style={{
              width: '100%',
              maxWidth: 400,
              aspectRatio: `${aspectRatio}`,
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              cursor: dragging ? 'grabbing' : 'grab',
              backgroundColor: 'var(--color-bg-muted)',
              position: 'relative',
              border: '2px solid var(--color-border-default)',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
          >
            <canvas
              ref={canvasRef}
              style={{ width: '100%', height: '100%', display: 'block' }}
            />
            {/* Overlay hint */}
            {!dragging && imageLoaded && (
              <div style={{
                position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
                padding: '4px 12px', borderRadius: 'var(--radius-pill)',
                backgroundColor: 'rgba(0,0,0,0.6)', color: 'var(--color-text-inverse)',
                fontSize: 'var(--text-xs)', pointerEvents: 'none',
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <Move className="w-3 h-3" /> Drag to adjust
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 w-full justify-center">
            <Button variant="outline" size="icon" onClick={() => setCrop(prev => ({ ...prev, zoom: Math.max(0.5, prev.zoom - 0.1) }))}
              style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)' }}>
              <ZoomOut className="w-4 h-4" />
            </Button>

            <div style={{ flex: 1, maxWidth: 200 }}>
              <input
                type="range" min="50" max="300" value={crop.zoom * 100}
                onChange={(e) => setCrop(prev => ({ ...prev, zoom: parseInt(e.target.value) / 100 }))}
                style={{ width: '100%', accentColor: 'var(--color-primary-default)' }}
              />
            </div>

            <Button variant="outline" size="icon" onClick={() => setCrop(prev => ({ ...prev, zoom: Math.min(3, prev.zoom + 0.1) }))}
              style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)' }}>
              <ZoomIn className="w-4 h-4" />
            </Button>

            <Button variant="outline" size="icon" onClick={handleRotate}
              style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)' }}>
              <RotateCw className="w-4 h-4" />
            </Button>
          </div>

          {/* Zoom label */}
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            {Math.round(crop.zoom * 100)}% zoom · {crop.rotation}° rotation
          </span>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} style={{ gap: 'var(--spacing-2)' }}>
            <X className="w-4 h-4" /> Cancel
          </Button>
          <Button onClick={handleCrop} disabled={processing || !imageLoaded}
            style={{ gap: 'var(--spacing-2)', backgroundColor: 'var(--color-primary-default)', color: 'var(--color-primary-on)' }}>
            <Check className="w-4 h-4" /> {processing ? 'Processing...' : 'Apply Crop'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}