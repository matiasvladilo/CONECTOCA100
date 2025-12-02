import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Download, Image, CheckCircle } from 'lucide-react';
import { 
  generatePlaceholderIcon, 
  downloadPlaceholderIcon, 
  downloadAllPlaceholderIcons,
  ICON_SIZES 
} from '../utils/generatePlaceholderIcon';

/**
 * IconGenerator Component
 * Utility component to generate and download placeholder PWA icons
 * This can be accessed temporarily and removed once real icons are created
 */
export function IconGenerator() {
  const [downloading, setDownloading] = useState(false);
  const [downloadedSizes, setDownloadedSizes] = useState<number[]>([]);

  const handleDownloadSingle = async (size: number) => {
    try {
      await downloadPlaceholderIcon(size);
      setDownloadedSizes(prev => [...prev, size]);
    } catch (error) {
      console.error('Error downloading icon:', error);
    }
  };

  const handleDownloadAll = async () => {
    setDownloading(true);
    try {
      await downloadAllPlaceholderIcons();
      setDownloadedSizes(ICON_SIZES);
    } catch (error) {
      console.error('Error downloading icons:', error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Image className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Generador de Iconos PWA</h2>
              <p className="text-sm text-muted-foreground">
                Descarga iconos placeholder para CONECTOCA
              </p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-amber-800">
              <strong>⚠️ Importante:</strong> Estos son iconos temporales. Para producción, 
              crea iconos profesionales con tu logo usando{' '}
              <a 
                href="https://realfavicongenerator.net/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline hover:text-amber-900"
              >
                RealFaviconGenerator
              </a>
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3 text-foreground">Vista Previa</h3>
            <div className="grid grid-cols-4 gap-4 mb-4">
              {[72, 96, 192, 512].map(size => (
                <div key={size} className="flex flex-col items-center gap-2">
                  <div 
                    className="border border-gray-200 rounded-lg p-2 bg-gray-50"
                    style={{ 
                      width: size > 192 ? '96px' : `${size}px`,
                      height: size > 192 ? '96px' : `${size}px`
                    }}
                  >
                    <img 
                      src={generatePlaceholderIcon(size)} 
                      alt={`Icon ${size}x${size}`}
                      className="w-full h-full"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {size}x{size}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">Tamaños Disponibles</h3>
              <Button 
                onClick={handleDownloadAll}
                disabled={downloading}
                size="sm"
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                {downloading ? 'Descargando...' : 'Descargar Todos'}
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ICON_SIZES.map(size => (
                <Button
                  key={size}
                  onClick={() => handleDownloadSingle(size)}
                  variant={downloadedSizes.includes(size) ? "secondary" : "outline"}
                  size="sm"
                  className="gap-2"
                >
                  {downloadedSizes.includes(size) && (
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  )}
                  {size}×{size}
                </Button>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold mb-2 text-blue-900">
              📋 Instrucciones
            </h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Descarga todos los iconos o tamaños individuales</li>
              <li>Mueve los archivos a la carpeta <code className="bg-blue-100 px-1 rounded">/public/icons/</code></li>
              <li>Verifica que los nombres sean: <code className="bg-blue-100 px-1 rounded">icon-72x72.png</code>, etc.</li>
              <li>Recarga la aplicación para ver los cambios</li>
              <li>Para producción, reemplaza con iconos profesionales</li>
            </ol>
          </div>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            Los iconos generados usan los colores de marca de CONECTOCA:<br/>
            Azul #1e40af (primario) y Amarillo #fbbf24 (secundario)
          </div>
        </div>
      </Card>
    </div>
  );
}
