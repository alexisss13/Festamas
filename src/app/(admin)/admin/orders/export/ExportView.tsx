'use client';

import { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Download, SlidersHorizontal, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  OrderForExport, 
  ExportFormat,
  exportToExcel,
  exportToCSV,
  exportToPDF,
  exportToJSON
} from '@/lib/export';
import { useUIStore } from '@/store/ui';

// Asumiendo que estos componentes están en la misma carpeta o ajusta las rutas
import { DateFilters } from './components/DateFilters';
import { StatusFilters } from './components/StatusFilters';
import { ColumnSelector } from './components/ColumnSelector';
import { FormatSelector } from './components/FormatSelector';
import { ExportSummary } from './components/ExportSummary';

interface ExportViewProps {
  orders: OrderForExport[];
}

const COLUMNS = [
  { id: 'receiptNumber', label: 'N° Pedido', default: true },
  { id: 'date', label: 'Fecha', default: true },
  { id: 'time', label: 'Hora', default: true },
  { id: 'origin', label: 'Origen (POS/WEB)', default: true },
  { id: 'client', label: 'Cliente', default: true },
  { id: 'dni', label: 'DNI', default: true },
  { id: 'phone', label: 'Celular', default: true },
  { id: 'delivery', label: 'Método Entrega', default: true },
  { id: 'address', label: 'Dirección', default: true },
  { id: 'products', label: 'Productos', default: true },
  { id: 'status', label: 'Estado', default: true },
  { id: 'paid', label: 'Pagado', default: true },
  { id: 'subtotal', label: 'Subtotal', default: true },
  { id: 'shipping', label: 'Costo Envío', default: true },
  { id: 'total', label: 'Total', default: true },
];

export function ExportView({ orders }: ExportViewProps) {
  const activeBranchId = useUIStore(state => state.activeBranchId);
  const branches = useUIStore(state => state.branches);
  const [logo, setLogo] = useState<string>('');
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [deliveryFilter, setDeliveryFilter] = useState('all');

  useEffect(() => {
    const loadLogo = async () => {
      try {
        const branch = branches.find(b => b.id === activeBranchId);
        const logoPath = (branch as any)?.logos?.isotipo ?? (branch as any)?.logos?.imagotipo ?? '';
        
        // Solo para evitar fallas si no hay logo, omitimos el fetch en ese caso:
        if (!logoPath) return;
        
        const response = await fetch(logoPath);
        const blob = await response.blob();
        const reader = new FileReader();
        
        reader.onloadend = () => {
          setLogo(reader.result as string);
        };
        
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error('Error cargando logo:', error);
      }
    };
    loadLogo();
  }, [activeBranchId, branches]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    COLUMNS.filter(col => col.default).map(col => col.id)
  );
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('xlsx');
  const [isExporting, setIsExporting] = useState(false);
  const [lastColumnAction, setLastColumnAction] = useState<'all' | 'none' | null>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter !== 'all' && order.status !== statusFilter) return false;
      if (paymentFilter === 'paid' && !order.isPaid) return false;
      if (paymentFilter === 'unpaid' && order.isPaid) return false;
      if (deliveryFilter !== 'all' && order.deliveryMethod !== deliveryFilter) return false;

      if (startDate) {
        const orderDate = new Date(order.createdAt);
        const start = new Date(startDate);
        if (orderDate < start) return false;
      }
      if (endDate) {
        const orderDate = new Date(order.createdAt);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (orderDate > end) return false;
      }

      return true;
    });
  }, [orders, startDate, endDate, statusFilter, paymentFilter, deliveryFilter]);

  // Calculamos el monto total dinámicamente para el Summary
  const totalAmount = useMemo(() => {
    return filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  }, [filteredOrders]);

  const handleToggleColumn = (columnId: string) => {
    setSelectedColumns(prev => 
      prev.includes(columnId) 
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId]
    );
  };

  const handleSelectAllColumns = () => {
    setSelectedColumns(COLUMNS.map(col => col.id));
    setLastColumnAction('all');
  };
  const handleDeselectAllColumns = () => {
    setSelectedColumns([]);
    setLastColumnAction('none');
  };

  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setStatusFilter('all');
    setPaymentFilter('all');
    setDeliveryFilter('all');
  };

  const handleExport = async () => {
    if (filteredOrders.length === 0 || selectedColumns.length === 0) return;
    try {
      setIsExporting(true);
      await new Promise(resolve => setTimeout(resolve, 150)); // UX delay

      switch (selectedFormat) {
        case 'xlsx': exportToExcel(filteredOrders, selectedColumns); break;
        case 'csv': exportToCSV(filteredOrders, selectedColumns); break;
        case 'pdf': {
          const branch = branches.find(b => b.id === activeBranchId);
          const storeName = branch?.name || 'Tienda';
          exportToPDF(filteredOrders, selectedColumns, logo, storeName);
          break;
        }
        case 'json': exportToJSON(filteredOrders, selectedColumns); break;
      }
    } catch (error) {
      console.error(`Error exportando ${selectedFormat}:`, error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Limpio */}
      <div className="border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Button variant="link" size="sm" asChild className="mb-4 -ml-2 text-slate-500 hover:text-slate-900 p-0 h-auto group">
            <Link href="/admin/orders" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="group-hover:underline">Volver a pedidos</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Exportar <span className="text-primary">Datos</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-500 mt-1 sm:mt-2">
              Configura y descarga reportes personalizados de tus ventas.
            </p>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Panel Izquierdo: Configuración (Ocupa 8 columnas) */}
          <div className="xl:col-span-8 space-y-6">
            
            {/* Sección de Filtros Unificada */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-primary" />
                  <h2 className="font-semibold text-slate-800 text-sm">Criterios de Filtrado</h2>
                </div>
                <button
                  onClick={resetFilters}
                  className="text-xs px-2 py-1 text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  Limpiar
                </button>
              </div>
              <div className="p-5 space-y-6">
                <DateFilters 
                  startDate={startDate} 
                  endDate={endDate} 
                  onStartDateChange={setStartDate} 
                  onEndDateChange={setEndDate} 
                />
                <StatusFilters
                  statusFilter={statusFilter}
                  paymentFilter={paymentFilter}
                  deliveryFilter={deliveryFilter}
                  onStatusChange={setStatusFilter}
                  onPaymentChange={setPaymentFilter}
                  onDeliveryChange={setDeliveryFilter}
                  onReset={resetFilters}
                />
              </div>
            </div>

            {/* Sección de Columnas */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4 text-primary" />
                  <h2 className="font-semibold text-slate-800 text-sm">Columnas del Reporte</h2>
                  <span className="bg-primary/[0.06] text-primary/80 text-xs px-2 py-0.5 rounded-full ml-2">
                    {selectedColumns.length} seleccionadas
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSelectAllColumns}
                    className={`text-xs px-2 py-1 cursor-pointer ${
                      selectedColumns.length === COLUMNS.length
                        ? 'text-slate-900 border-b-2 border-slate-300' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Seleccionar todas
                  </button>
                  <button
                    onClick={handleDeselectAllColumns}
                    className="text-xs px-2 py-1 text-slate-500 hover:text-slate-700 cursor-pointer"
                  >
                    Limpiar
                  </button>
                </div>
              </div>
              <div className="p-5">
                <ColumnSelector
                  columns={COLUMNS}
                  selectedColumns={selectedColumns}
                  onToggleColumn={handleToggleColumn}
                />
              </div>
            </div>

          </div>

          {/* Panel Derecho: Resumen y Acción (Ocupa 4 columnas, Sticky) */}
          <div className="xl:col-span-4 relative">
            <div className="sticky top-6 space-y-6">
              
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4 flex items-center gap-2">
                  <Download className="h-4 w-4 text-primary" />
                  <h2 className="font-semibold text-slate-800 text-sm">Exportación</h2>
                </div>
                <div className="p-5 space-y-6">
                  {/* Formato */}
                  <FormatSelector
                    selectedFormat={selectedFormat}
                    onFormatChange={setSelectedFormat}
                  />
                  
                  {/* Usando el ExportSummary que tenías ignorado */}
                  <ExportSummary 
                    totalOrders={orders.length}
                    filteredOrders={filteredOrders.length}
                    selectedColumns={selectedColumns.length}
                    totalAmount={totalAmount}
                  />

                  {/* Botón de Acción Principal */}
                  <Button
                    onClick={handleExport}
                    disabled={filteredOrders.length === 0 || selectedColumns.length === 0 || isExporting}
                    className="w-full h-11 text-sm font-medium shadow-sm transition-all"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isExporting ? 'Generando...' : 'Exportar datos'}
                  </Button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}