'use client';

interface Column {
  id: string;
  label: string;
  default: boolean;
}

interface ColumnSelectorProps {
  columns: Column[];
  selectedColumns: string[];
  onToggleColumn: (columnId: string) => void;
}

const COLUMN_GROUPS = [
  {
    title: 'Datos del Cliente',
    keys: ['client', 'dni', 'phone']
  },
  {
    title: 'Información del Pedido',
    keys: ['receiptNumber', 'date', 'time', 'origin', 'status', 'products']
  },
  {
    title: 'Finanzas y Logística',
    keys: ['delivery', 'address', 'paid', 'subtotal', 'shipping', 'total']
  }
];

export function ColumnSelector({
  columns,
  selectedColumns,
  onToggleColumn,
}: ColumnSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {COLUMN_GROUPS.map((group) => {
        const groupColumns = group.keys
          .map(key => columns.find(col => col.id === key))
          .filter((col): col is Column => col !== undefined);
        
        if (groupColumns.length === 0) return null;

        return (
          <div key={group.title} className="flex flex-col">
            <h4 className="text-xs font-medium text-slate-500 mb-3">
              {group.title}
            </h4>
            
            <div className="flex flex-col gap-2">
              {groupColumns.map((column) => {
                const isSelected = selectedColumns.includes(column.id);
                
                return (
                  <label
                    key={column.id}
                    className={`
                      flex items-center px-3 py-2 rounded-md cursor-pointer border
                      ${isSelected 
                        ? 'bg-white border-primary/30 text-slate-900' 
                        : 'bg-white border-slate-200 text-slate-600'}
                    `}
                  >
                    <span className="text-sm">
                      {column.label}
                    </span>

                    <input 
                      type="checkbox"
                      className="sr-only"
                      checked={isSelected}
                      onChange={() => onToggleColumn(column.id)}
                    />
                  </label>
                );
              })}
            </div>
            
          </div>
        );
      })}
    </div>
  );
}