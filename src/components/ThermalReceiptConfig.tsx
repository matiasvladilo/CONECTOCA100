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
  Type,
  AlignLeft,
  AlignCenter
} from 'lucide-react';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import logo from '../assets/logo.png'; // Assuming logo exists

interface ThermalReceiptConfigProps {
  order: Order;
  open: boolean;
  onClose: () => void;
  businessName?: string;
  businessAddress?: string;
  businessPhone?: string;
  businessRut?: string;
}

export function ThermalReceiptConfig({
  order,
  open,
  onClose,
  businessName = "PANIFICADORA ELORRIO LTDA.",
  businessAddress = "PEDRO DE VALDIVIA 4280",
  businessPhone = "+569 1234 5678",
  businessRut = "76.020.756-K"
}: ThermalReceiptConfigProps) {
  // Configuration state - Defaults based on user request
  const [paperWidth, setPaperWidth] = useState<'58mm' | '80mm'>('80mm');
  const [fontSize, setFontSize] = useState(12); // Slightly smaller for table
  const [marginTop, setMarginTop] = useState(5); // 5mm top
  const [marginBottom, setMarginBottom] = useState(3); // 3mm bottom
  const [marginX, setMarginX] = useState(2); // 2mm side
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Helper component for the receipt content
  const ReceiptContent = () => (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      fontSize: `${fontSize}px`,
      color: 'black',
      lineHeight: '1.2'
    }}>
      {/* 1. Header: Logo Left, Text Right */}
      <div style={{ display: 'flex', gap: '5px', marginBottom: '10px', alignItems: 'flex-start' }}>
        {/* Logo Area */}
        <div style={{ width: '35%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <img
            src={logo}
            alt="Logo"
            style={{
              width: '100%',
              maxWidth: '60px',
              filter: 'grayscale(100%) contrast(150%)', // High contrast for thermal
              marginBottom: '2px'
            }}
          />
          <div style={{ fontSize: '10px', fontWeight: 'bold', textAlign: 'center' }}>La Oca</div>
        </div>

        {/* Business Details */}
        <div style={{ width: '65%', paddingLeft: '5px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '1.1em', lineHeight: '1.1', marginBottom: '2px' }}>
            {businessName}
          </div>
          <div style={{ fontSize: '0.9em', marginBottom: '1px' }}>
            RUT: {businessRut}
          </div>
          <div style={{ fontSize: '0.9em', marginBottom: '4px' }}>
            Dirección: {businessAddress}
          </div>

          <div style={{ fontWeight: 'bold', fontSize: '1em', marginTop: '4px' }}>
            GUÍA DE DESPACHO
          </div>
          <div style={{ fontSize: '0.9em' }}>
            ID Despacho: D-{order.id.slice(0, 4)}
          </div>
        </div>
      </div>

      {/* 2. Customer Info */}
      <div style={{
        borderTop: '1px solid black',
        borderBottom: '1px solid black',
        padding: '5px 0',
        marginBottom: '10px',
        fontSize: '0.95em'
      }}>
        <div style={{ display: 'flex', marginBottom: '2px' }}>
          <span style={{ fontWeight: 'bold', width: '70px' }}>Cliente:</span>
          <span>{order.customerName}</span>
        </div>
        <div style={{ display: 'flex', marginBottom: '2px' }}>
          <span style={{ fontWeight: 'bold', width: '70px' }}>Dirección:</span>
          <span>{order.deliveryAddress || '-'}</span>
        </div>
        <div style={{ display: 'flex' }}>
          <span style={{ fontWeight: 'bold', width: '70px' }}>Fecha:</span>
          <span>{formatDate(order.createdAt || order.date)}</span>
        </div>
      </div>

      {/* 3. Products Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', fontSize: '0.9em' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid black' }}>
            <th style={{ textAlign: 'left', padding: '2px' }}>Producto</th>
            <th style={{ textAlign: 'center', padding: '2px', width: '40px' }}>Cant.</th>
            <th style={{ textAlign: 'right', padding: '2px', width: '60px' }}>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {order.products && order.products.length > 0 ? (
            order.products.map((p, i) => (
              <tr key={i} style={{ borderBottom: '1px dotted #ccc' }}>
                <td style={{ padding: '4px 2px', verticalAlign: 'top' }}>
                  {p.name}
                </td>
                <td style={{ padding: '4px 2px', textAlign: 'center', verticalAlign: 'top' }}>
                  {p.quantity}
                </td>
                <td style={{ padding: '4px 2px', textAlign: 'right', verticalAlign: 'top' }}>
                  {formatCLP(p.price * p.quantity)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td style={{ padding: '4px 2px' }}>{order.productName}</td>
              <td style={{ padding: '4px 2px', textAlign: 'center' }}>{order.quantity}</td>
              <td style={{ padding: '4px 2px', textAlign: 'right' }}>{formatCLP(order.total || 0)}</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 4. Total */}
      <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '1.2em', marginBottom: '20px' }}>
        Total: {formatCLP(order.total || 0)}
      </div>

      {/* 5. Footer / Signature */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '30px' }}>
        <div style={{ textAlign: 'center', width: '120px' }}>
          <div style={{ fontSize: '0.8em', color: '#666', marginBottom: '25px' }}>Firma Empresa:</div>
          <div style={{ borderTop: '1px solid black', paddingTop: '2px', fontSize: '0.8em' }}>
            Recibí Conforme
          </div>
        </div>
      </div>
    </div>
  );

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
              Ajusta el formato para tu impresora térmica (Optimizado)
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-h-[calc(95vh-200px)] overflow-y-auto">
            {/* Configuration Panel */}
            <div className="space-y-6 pr-4 border-r border-gray-200 col-span-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Ajustes de Impresión
                </h3>
              </div>

              {/* Paper Width */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Ancho de Papel</Label>
                <Select value={paperWidth} onValueChange={(v) => setPaperWidth(v as '58mm' | '80mm')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="58mm">58mm</SelectItem>
                    <SelectItem value="80mm">80mm (Estándar)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Font Size */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex justify-between">
                  <span>Tamaño Letra</span>
                  <span className="text-blue-600">{fontSize}px</span>
                </Label>
                <Slider value={[fontSize]} onValueChange={([v]) => setFontSize(v)} min={10} max={16} step={1} />
              </div>

              {/* Margins */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex justify-between">
                    <span>Margen Superior (Top)</span>
                    <span className="text-blue-600">{marginTop}mm</span>
                  </Label>
                  <Slider value={[marginTop]} onValueChange={([v]) => setMarginTop(v)} min={0} max={20} step={1} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex justify-between">
                    <span>Margen Inferior (Bottom)</span>
                    <span className="text-blue-600">{marginBottom}mm</span>
                  </Label>
                  <Slider value={[marginBottom]} onValueChange={([v]) => setMarginBottom(v)} min={0} max={20} step={1} />
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded text-xs text-blue-800">
                Diseño optimizado según especificaciones: Logo a la izquierda, datos a la derecha, tabla compacta.
              </div>
            </div>

            {/* Preview Panel */}
            <div className="col-span-2 bg-gray-100 p-8 rounded-lg overflow-auto flex justify-center">
              <div
                id="thermal-receipt-preview"
                className="bg-white shadow-xl"
                style={{
                  width: paperWidth,
                  minHeight: '400px',
                  padding: `${marginTop}mm ${marginX}mm ${marginBottom}mm ${marginX}mm`,
                }}
              >
                <ReceiptContent />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={handlePrint}
              disabled={isPrinting}
              className="flex-1"
              style={{ background: 'linear-gradient(90deg, #0059FF 0%, #004BCE 100%)' }}
            >
              <Printer className="w-4 h-4 mr-2" />
              {isPrinting ? 'Imprimiendo...' : 'Imprimir Recibo'}
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              <X className="w-4 h-4 mr-2" /> Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden Print Content (Rendered outside Dialog to avoid display:none) */}
      {isPrinting && (
        <div
          id="thermal-receipt-print" // Use distinct ID for printing
          className="thermal-print-content"
          style={{
            width: paperWidth,
            padding: `${marginTop}mm ${marginX}mm ${marginBottom}mm ${marginX}mm`
          }}
        >
          <ReceiptContent />
        </div>
      )}
    </>
  );
}