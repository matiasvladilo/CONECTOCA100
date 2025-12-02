/**
 * Generate placeholder PWA icons programmatically
 * This creates simple SVG-based icons that can be used until real icons are ready
 */

export function generatePlaceholderIcon(size: number): string {
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1e40af;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background with gradient -->
      <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
      
      <!-- Safe area border (for maskable icons) -->
      <rect x="${size * 0.1}" y="${size * 0.1}" 
            width="${size * 0.8}" height="${size * 0.8}" 
            rx="${size * 0.15}" 
            fill="none" 
            stroke="#fbbf24" 
            stroke-width="${size * 0.02}"/>
      
      <!-- Letter "C" for CONECTOCA -->
      <text x="50%" y="50%" 
            font-family="Arial, sans-serif" 
            font-size="${size * 0.5}" 
            font-weight="bold"
            fill="#ffffff" 
            text-anchor="middle" 
            dominant-baseline="central">
        C
      </text>
      
      <!-- Small "OCA" text below -->
      <text x="50%" y="${size * 0.75}" 
            font-family="Arial, sans-serif" 
            font-size="${size * 0.12}" 
            font-weight="600"
            fill="#fbbf24" 
            text-anchor="middle" 
            dominant-baseline="central">
        OCA
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

export const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

/**
 * Download a placeholder icon as PNG
 * Usage: downloadPlaceholderIcon(192) → downloads icon-192x192.png
 */
export async function downloadPlaceholderIcon(size: number): Promise<void> {
  const svgUrl = generatePlaceholderIcon(size);
  
  // Create an image element
  const img = new Image();
  img.src = svgUrl;
  
  await new Promise((resolve) => {
    img.onload = resolve;
  });
  
  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  
  // Draw image to canvas
  ctx.drawImage(img, 0, 0, size, size);
  
  // Convert to PNG and download
  canvas.toBlob((blob) => {
    if (!blob) return;
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `icon-${size}x${size}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 'image/png');
}

/**
 * Download all placeholder icons at once
 */
export async function downloadAllPlaceholderIcons(): Promise<void> {
  for (const size of ICON_SIZES) {
    await downloadPlaceholderIcon(size);
    // Small delay between downloads
    await new Promise(resolve => setTimeout(resolve, 300));
  }
}
