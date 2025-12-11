import React from 'react';
import svgPaths from "../imports/svg-ptmlmkxncr";

interface PWAIconProps {
  size: number;
  filename: string;
  isMaskable?: boolean;
  borderRadius?: number;
}

export function PWAIcon({ size, filename, isMaskable = false, borderRadius }: PWAIconProps) {
  // Calculate appropriate border radius based on size
  const defaultRadius = isMaskable ? 0 : Math.max(size * 0.15, 12);
  const radius = borderRadius ?? defaultRadius;
  
  // Calculate padding for maskable icons (20% safe zone)
  const padding = isMaskable ? size * 0.2 : size * 0.125;
  const iconSize = size - (padding * 2);
  const scale = iconSize / 47; // Original viewBox is 47x47
  
  return (
    <div className="inline-block m-4 text-center">
      <div className="mb-2">
        <svg 
          width={size} 
          height={size} 
          viewBox={`0 0 ${size} ${size}`} 
          xmlns="http://www.w3.org/2000/svg"
          className="shadow-lg"
        >
          {/* Background */}
          <rect 
            width={size} 
            height={size} 
            rx={radius} 
            fill="var(--color-primary-default)" 
          />
          
          {/* Icon */}
          <g transform={`translate(${padding}, ${padding}) scale(${scale})`}>
            <path 
              d={svgPaths.p23092d00} 
              fill="white" 
            />
          </g>
        </svg>
      </div>
      
      <div className="text-sm">
        <strong>{size}×{size}</strong>
        <br />
        {filename}.png
        {isMaskable && <><br /><em>(Maskable)</em></>}
      </div>
      
      <button 
        onClick={() => downloadAsPNG(size, filename, isMaskable, radius)}
        className="mt-2 px-3 py-1 bg-primary text-white rounded text-xs hover:opacity-90"
      >
        Download PNG
      </button>
    </div>
  );
}

// Utility function to download SVG as PNG
function downloadAsPNG(size: number, filename: string, isMaskable: boolean, radius: number) {
  const padding = isMaskable ? size * 0.2 : size * 0.125;
  const iconSize = size - (padding * 2);
  const scale = iconSize / 47;
  
  const svgString = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" rx="${radius}" fill="#2A2A2A"/>
      <g transform="translate(${padding}, ${padding}) scale(${scale})">
        <path d="${svgPaths.p23092d00}" fill="white"/>
      </g>
    </svg>
  `;
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  canvas.width = size;
  canvas.height = size;
  
  const img = new Image();
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(svgBlob);
  
  img.onload = function() {
    ctx.drawImage(img, 0, 0, size, size);
    
    canvas.toBlob(function(blob) {
      if (blob) {
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `${filename}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);
      }
    }, 'image/png');
    
    URL.revokeObjectURL(url);
  };
  
  img.src = url;
}

export function PWAIconGenerator() {
  const icons = [
    { size: 64, filename: 'pwa-64x64' },
    { size: 192, filename: 'pwa-192x192' },
    { size: 512, filename: 'pwa-512x512' },
    { size: 512, filename: 'maskable-icon-512x512', isMaskable: true },
    { size: 180, filename: 'apple-touch-icon', borderRadius: 32 },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
          iKan PWA Icon Generator
        </h1>
        
        <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Preview the generated icons below</li>
            <li>Click "Download PNG" for each icon you need</li>
            <li>Replace the placeholder icons in your `/public` folder</li>
            <li>Icons are generated with proper PWA safe zones and sizing</li>
          </ol>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-6">Generated Icons</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {icons.map((icon, index) => (
              <PWAIcon
                key={index}
                size={icon.size}
                filename={icon.filename}
                isMaskable={icon.isMaskable}
                borderRadius={icon.borderRadius}
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 mt-8 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Technical Details</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>Background:</strong> iKan brand color (#2A2A2A)</li>
            <li><strong>Icon:</strong> White radial design from Figma import</li>
            <li><strong>Safe zones:</strong> 12.5% padding for standard icons</li>
            <li><strong>Maskable:</strong> 20% padding for Android adaptive icons</li>
            <li><strong>Apple Touch:</strong> 32px border radius for iOS</li>
          </ul>
        </div>
      </div>
    </div>
  );
}