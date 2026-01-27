import { Order } from '../App';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { formatCLP } from '../utils/format';
import {
  Printer,
  Settings,
  X,
  ZoomIn,
  ZoomOut,
  AlignCenter,
  Type
} from 'lucide-react';
import { useState, useRef } from 'react';
import { toast } from 'sonner';

interface ThermalReceiptConfigProps {
  order: Order;
  open: boolean;
  onClose: () => void;
  businessName?: string;
  businessAddress?: string;
  businessPhone?: string;
}

export function ThermalReceiptConfig({
  order,
  open,
  onClose,
  businessName = "CONECTOCA",
  businessAddress = "Av. La Oca 123, Santiago",
  businessPhone = "+569 1234 5678"
}: ThermalReceiptConfigProps) {
  // Configuration state
  const [paperWidth, setPaperWidth] = useState<'58mm' | '80mm'>('80mm');
  const [fontSize, setFontSize] = useState(14); // Base font size
  const [lineHeight, setLineHeight] = useState(1.4);
  const [marginX, setMarginX] = useState(4); // Horizontal margin in mm
  const [marginY, setMarginY] = useState(4); // Vertical margin in mm
  const [showBorders, setShowBorders] = useState(true);
  const [boldText, setBoldText] = useState(true);
  const [fontFamily, setFontFamily] = useState<string>('Roboto Mono');
  const [isPrinting, setIsPrinting] = useState(false);

  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    setIsPrinting(true);

    setTimeout(() => {
      window.print();

      setTimeout(() => {
        setIsPrinting(false);
        toast.success('Recibo enviado a impresora');
      }, 500);
    }, 100);
  };

  const resetToDefault = () => {
    setPaperWidth('80mm');
    setFontSize(14);
    setLineHeight(1.4);
    setMarginX(4);
    setMarginY(4);
    setShowBorders(true);
    setBoldText(true);
    setFontFamily('Roboto Mono');
    toast.success('Configuración restaurada');
  };

  // Font options with descriptions
  const fontOptions = [
    { value: 'Roboto Mono', label: 'Roboto Mono', description: 'Moderna y gruesa (Recomendada)' },
    { value: 'Consolas', label: 'Consolas', description: 'Muy gruesa y clara' },
    { value: 'Monaco', label: 'Monaco', description: 'Compacta y legible' },
    { value: 'Lucida Console', label: 'Lucida Console', description: 'Gruesa y profesional' },
    { value: 'Courier New', label: 'Courier New', description: 'Clásica de máquina de escribir' },
    { value: 'Arial', label: 'Arial (Sans)', description: 'Moderna sin serifas' },
  ];

  const getFontStack = (font: string) => {
    switch (font) {
      case 'Roboto Mono':
        return '"Roboto Mono", "Courier New", monospace';
      case 'Consolas':
        return 'Consolas, "Courier New", monospace';
      case 'Monaco':
        return 'Monaco, "Courier New", monospace';
      case 'Lucida Console':
        return '"Lucida Console", Monaco, monospace';
      case 'Courier New':
        return '"Courier New", Courier, monospace';
      case 'Arial':
        return 'Arial, Helvetica, sans-serif';
      default:
        return '"Roboto Mono", monospace';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#0047BA]">
              <Printer className="w-5 h-5" />
              Configuración de Recibo Térmico
            </DialogTitle>
            <DialogDescription>
              Ajusta el formato para tu impresora térmica
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[calc(95vh-200px)] overflow-y-auto">
            {/* Configuration Panel */}
            <div className="space-y-6 pr-4 border-r border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Configuración
                </h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={resetToDefault}
                  className="text-xs"
                >
                  Restaurar
                </Button>
              </div>

              {/* Paper Width */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <AlignCenter className="w-4 h-4" />
                  Ancho de Papel
                </Label>
                <Select value={paperWidth} onValueChange={(v) => setPaperWidth(v as '58mm' | '80mm')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="58mm">58mm (Papel pequeño)</SelectItem>
                    <SelectItem value="80mm">80mm (Papel estándar)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">Ancho del papel de tu impresora térmica</p>
              </div>

              {/* Font Size */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    Tamaño de Letra
                  </span>
                  <span className="text-blue-600 font-mono">{fontSize}px</span>
                </Label>
                <Slider
                  value={[fontSize]}
                  onValueChange={([value]) => setFontSize(value)}
                  min={10}
                  max={20}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Pequeña (10px)</span>
                  <span>Grande (20px)</span>
                </div>
              </div>

              {/* Line Height */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <ZoomIn className="w-4 h-4" />
                    Espaciado de Línea
                  </span>
                  <span className="text-blue-600 font-mono">{lineHeight.toFixed(1)}</span>
                </Label>
                <Slider
                  value={[lineHeight]}
                  onValueChange={([value]) => setLineHeight(value)}
                  min={1.0}
                  max={2.0}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Compacto (1.0)</span>
                  <span>Espaciado (2.0)</span>
                </div>
              </div>

              {/* Horizontal Margin */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center justify-between">
                  <span>Margen Horizontal</span>
                  <span className="text-blue-600 font-mono">{marginX}mm</span>
                </Label>
                <Slider
                  value={[marginX]}
                  onValueChange={([value]) => setMarginX(value)}
                  min={0}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-gray-500">Espacio a los lados del recibo</p>
              </div>

              {/* Vertical Margin */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center justify-between">
                  <span>Margen Vertical</span>
                  <span className="text-blue-600 font-mono">{marginY}mm</span>
                </Label>
                <Slider
                  value={[marginY]}
                  onValueChange={([value]) => setMarginY(value)}
                  min={0}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-gray-500">Espacio arriba y abajo del recibo</p>
              </div>

              {/* Bold Text */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Texto en Negrita</Label>
                  <p className="text-xs text-gray-500">Mejora la impresión en papel térmico</p>
                </div>
                <Switch
                  checked={boldText}
                  onCheckedChange={setBoldText}
                />
              </div>

              {/* Show Borders */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Mostrar Separadores</Label>
                  <p className="text-xs text-gray-500">Líneas entre secciones</p>
                </div>
                <Switch
                  checked={showBorders}
                  onCheckedChange={setShowBorders}
                />
              </div>

              {/* Font Family */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  Fuente de Letra
                </Label>
                <Select value={fontFamily} onValueChange={(v) => setFontFamily(v as string)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label} - {option.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">Estilo de letra para el recibo</p>
              </div>
            </div>

            {/* Preview Panel */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Vista Previa</h3>

              <div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-[600px]">
                <div
                  ref={printRef}
                  className="bg-white mx-auto shadow-lg"
                  style={{
                    width: paperWidth,
                    fontSize: `${fontSize}px`,
                    lineHeight: lineHeight,
                    padding: `${marginY}mm ${marginX}mm`,
                    fontFamily: getFontStack(fontFamily)
                  }}
                >
                  {/* Business Info */}
                  <div className="text-center mb-3">
                    <div
                      className="text-lg mb-1"
                      style={{ fontWeight: boldText ? '900' : '700' }}
                    >
                      RECIBO #{order.id.slice(0, 8).toUpperCase()}
                    </div>
                    <div style={{ fontWeight: boldText ? '700' : '600' }}>
                      {businessName}
                    </div>
                    <div className="text-xs mt-1" style={{ fontWeight: boldText ? '600' : '400' }}>
                      {businessPhone}
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="mb-3">
                    <div style={{ fontWeight: boldText ? '700' : '600' }}>
                      {order.customerName}
                    </div>
                    {order.deliveryAddress && (
                      <div className="text-xs mt-1" style={{ fontWeight: boldText ? '600' : '400' }}>
                        - {order.deliveryAddress}
                      </div>
                    )}
                  </div>

                  {/* Date */}
                  <div className="mb-3 text-sm" style={{ fontWeight: boldText ? '600' : '400' }}>
                    {order.customerName || 'Cliente'}
                  </div>
                  {order.deliveryAddress && (
                    <div className="mb-3 text-xs" style={{ fontWeight: boldText ? '600' : '400' }}>
                      +{order.deliveryAddress.slice(0, 15)}
                    </div>
                  )}

                  {/* Products Count */}
                  <div className="mb-2" style={{ fontWeight: boldText ? '700' : '600' }}>
                    {order.products?.length || 0} artículo{(order.products?.length || 0) !== 1 ? 's' : ''}
                    {order.products && order.products.length > 0 && (
                      <span className="ml-1">
                        (Cant: {order.products.reduce((sum, p) => sum + p.quantity, 0)})
                      </span>
                    )}
                  </div>

                  {showBorders && <div className="border-b border-dashed border-gray-400 my-2" />}

                  {/* Products */}
                  <div className="space-y-2 mb-3">
                    {order.products && order.products.length > 0 ? (
                      order.products.map((product, index) => (
                        <div key={index}>
                          <div style={{ fontWeight: boldText ? '700' : '600' }}>
                            {product.quantity}x {product.name}
                          </div>
                          {showBorders && index < order.products!.length - 1 && (
                            <div className="border-b border-dotted border-gray-300 my-1.5" />
                          )}
                        </div>
                      ))
                    ) : (
                      <div style={{ fontWeight: boldText ? '700' : '600' }}>
                        {order.quantity}x {order.productName}
                      </div>
                    )}
                  </div>

                  {showBorders && <div className="border-b border-gray-400 my-2" />}

                  {/* Total */}
                  <div className="text-right mb-3">
                    <div className="text-sm" style={{ fontWeight: boldText ? '600' : '400' }}>
                      Tot:
                    </div>
                  </div>

                  {showBorders && <div className="border-b border-gray-400 my-2" />}

                  {/* Date/Time */}
                  <div className="text-center text-xs mt-3" style={{ fontWeight: boldText ? '600' : '400' }}>
                    {formatDate(order.createdAt || order.date)} {formatTime(order.createdAt || order.date)}
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  <strong>💡 Tip:</strong> Si el texto se ve cortado en tu impresora, reduce el tamaño de letra o los márgenes.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={handlePrint}
              disabled={isPrinting}
              className="flex-1"
              style={{
                background: 'linear-gradient(90deg, #0059FF 0%, #004BCE 100%)',
              }}
            >
              <Printer className="w-4 h-4 mr-2" />
              {isPrinting ? 'Imprimiendo...' : 'Imprimir Recibo'}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Print-only styles */}
      {isPrinting && (
        <style>{`
          @media print {
            @page {
              size: ${paperWidth} auto;
              margin: 0mm;
            }
            
            body {
              margin: 0;
              padding: 0;
              width: ${paperWidth};
              min-width: ${paperWidth};
            }

            body * {
              visibility: hidden;
              height: 0;
            }
            
            .thermal-print-container,
            .thermal-print-container * {
              visibility: visible;
              height: auto;
            }
            
            .thermal-print-container {
              position: absolute;
              left: 0;
              top: 0;
              width: ${paperWidth} !important;
              margin: 0;
              padding: 0;
              background-color: white;
              z-index: 9999;
            }
          }
        `}</style>
      )}

      {isPrinting && (
        <div className="thermal-print-container">
          <div
            style={{
              width: paperWidth,
              fontSize: `${fontSize}px`,
              lineHeight: lineHeight,
              padding: `${marginY}mm ${marginX}mm`,
              fontFamily: getFontStack(fontFamily),
              fontWeight: boldText ? '900' : '700'
            }}
          >
            {/* Business Info */}
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <div style={{
                fontSize: '1.2em',
                fontWeight: '900',
                marginBottom: '4px'
              }}>
                RECIBO #{order.id.slice(0, 8).toUpperCase()}
              </div>
              <div style={{ fontWeight: '900' }}>
                {businessName}
              </div>
              <div style={{ fontSize: '0.85em', fontWeight: boldText ? '700' : '600', marginTop: '2px' }}>
                {businessPhone}
              </div>
            </div>

            {/* Customer */}
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontWeight: '900' }}>
                {order.customerName}
              </div>
              {order.deliveryAddress && (
                <div style={{ fontSize: '0.85em', fontWeight: boldText ? '700' : '600', marginTop: '2px' }}>
                  - {order.deliveryAddress}
                </div>
              )}
            </div>

            {/* Products Count */}
            <div style={{ fontWeight: '900', marginBottom: '6px' }}>
              {order.products?.length || 0} artículo{(order.products?.length || 0) !== 1 ? 's' : ''}
              {order.products && order.products.length > 0 && (
                <span>
                  {' '}(Cant: {order.products.reduce((sum, p) => sum + p.quantity, 0)})
                </span>
              )}
            </div>

            {showBorders && (
              <div style={{
                borderBottom: '1px dashed #666',
                margin: '6px 0'
              }} />
            )}

            {/* Products */}
            <div style={{ marginBottom: '8px' }}>
              {order.products && order.products.length > 0 ? (
                order.products.map((product, index) => (
                  <div key={index} style={{ marginBottom: '6px' }}>
                    <div style={{ fontWeight: '900' }}>
                      {product.quantity}x {product.name}
                    </div>
                    {showBorders && index < order.products!.length - 1 && (
                      <div style={{
                        borderBottom: '1px dotted #999',
                        margin: '4px 0'
                      }} />
                    )}
                  </div>
                ))
              ) : (
                <div style={{ fontWeight: '900' }}>
                  {order.quantity}x {order.productName}
                </div>
              )}
            </div>

            {showBorders && (
              <div style={{
                borderBottom: '2px solid #333',
                margin: '6px 0'
              }} />
            )}

            {/* Total */}
            <div style={{ textAlign: 'right', marginBottom: '8px' }}>
              <div style={{ fontSize: '0.9em', fontWeight: boldText ? '700' : '600' }}>
                Tot:
              </div>
            </div>

            {showBorders && (
              <div style={{
                borderBottom: '2px solid #333',
                margin: '6px 0'
              }} />
            )}

            {/* Date/Time */}
            <div style={{
              textAlign: 'center',
              fontSize: '0.85em',
              fontWeight: boldText ? '700' : '600',
              marginTop: '8px'
            }}>
              {formatDate(order.createdAt || order.date)} {formatTime(order.createdAt || order.date)}
            </div>
          </div>
        </div>
      )}
    </>
  );
}