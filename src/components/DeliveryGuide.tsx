import { Order } from '../App';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { formatCLP } from '../utils/format';
import {
  Printer,
  X,
  FileText
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { StandardDeliveryGuide } from './StandardDeliveryGuide';
import { ThermalReceiptConfig } from './ThermalReceiptConfig';

interface DeliveryGuideProps {
  order: Order;
  open: boolean;
  onClose: () => void;
  businessName?: string;
  businessAddress?: string;
  businessPhone?: string;
}

export function DeliveryGuide({
  order,
  open,
  onClose,
  businessName = "CONECTOCA",
  businessAddress = "Dirección del Negocio",
  businessPhone = "+56 9 XXXX XXXX"
}: DeliveryGuideProps) {
  const [showStandardGuide, setShowStandardGuide] = useState(false);
  const [showThermalConfig, setShowThermalConfig] = useState(false);

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#0047BA]">
              <Printer className="w-5 h-5" />
              Seleccionar Formato de Impresión
            </DialogTitle>
            <DialogDescription>
              Elige el tipo de guía que deseas imprimir
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {/* Thermal Receipt Option */}
            <button
              onClick={() => {
                onClose();
                setTimeout(() => setShowThermalConfig(true), 300);
              }}
              className="w-full p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-left group"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Printer className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Recibo Térmico
                  </h3>
                  <p className="text-sm text-gray-600">
                    Para impresoras térmicas de 58mm y 80mm
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      Letras Gruesas
                    </span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      Ajustable
                    </span>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                      Optimizado
                    </span>
                  </div>
                </div>
              </div>
            </button>

            {/* A4 Standard Option */}
            <button
              onClick={() => {
                onClose();
                setTimeout(() => setShowStandardGuide(true), 300);
              }}
              className="w-full p-4 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all text-left group"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Guía A4 Estándar
                  </h3>
                  <p className="text-sm text-gray-600">
                    Para impresoras de oficina (formato A4)
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      Profesional
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      Completo
                    </span>
                  </div>
                </div>
              </div>
            </button>

            {/* Close Button */}
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Thermal Receipt with Configuration */}
      <ThermalReceiptConfig
        order={order}
        open={showThermalConfig}
        onClose={() => setShowThermalConfig(false)}
        businessName={businessName}
        businessAddress={businessAddress}
        businessPhone={businessPhone}
      />

      {/* Standard Delivery Guide */}
      <StandardDeliveryGuide
        order={order}
        open={showStandardGuide}
        onClose={() => setShowStandardGuide(false)}
        businessName={businessName}
        businessAddress={businessAddress}
        businessPhone={businessPhone}
      />
    </>
  );
}