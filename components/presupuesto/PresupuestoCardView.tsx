// components/presupuesto/PresupuestoCardView.tsx
import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Pencil, Trash2, Copy, Eye, MoreVertical } from 'lucide-react';
import type { Presupuesto } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface PresupuestoCardViewProps {
    presupuesto: Presupuesto;
    onEdit: () => void;
    onDelete: () => void;
    onDuplicate: () => void;
    isSelected: boolean;
    onSelect: () => void;
}

export const PresupuestoCardView: React.FC<PresupuestoCardViewProps> = ({
    presupuesto,
    onEdit,
    onDelete,
    onDuplicate,
    isSelected,
    onSelect,
}) => {
    const getStatusColor = (estado: string) => {
        switch (estado) {
            case 'activo': return 'bg-green-100 text-green-800';
            case 'pendiente': return 'bg-yellow-100 text-yellow-800';
            case 'ejecutado': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Card className={`p-6 hover:shadow-lg transition-all ${isSelected ? 'ring-2 ring-primary-500' : ''}`}>
            <div className="flex items-start justify-between mb-4">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={onSelect}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500 mt-1"
                />
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(presupuesto.estado || '')}`}>
                    {presupuesto.estado}
                </span>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {presupuesto.cliente?.nombre_cliente}
            </h3>

            <p className="text-sm text-gray-600 mb-4">
                NIT: {presupuesto.nit}
            </p>

            <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Comisión:</span>
                    <span className="font-semibold text-gray-900">
                        {formatCurrency(presupuesto.comision || 0)}
                    </span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Inversión:</span>
                    <span className="font-semibold text-primary-600">
                        {formatCurrency(presupuesto.inversion_ejecutar || 0)}
                    </span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ejecutado:</span>
                    <span className="font-semibold text-green-600">
                        {formatCurrency(presupuesto.valor_total_ejecutar || 0)}
                    </span>
                </div>
            </div>

            {presupuesto.aliado && (
                <div className="mb-4 p-2 bg-gray-50 rounded text-sm">
                    <span className="text-gray-600">Aliado: </span>
                    <span className="font-medium">{presupuesto.aliado.aliado}</span>
                </div>
            )}

            <div className="text-xs text-gray-500 mb-4">
                {formatDate(presupuesto.fecha)}
            </div>

            <div className="flex gap-2 pt-4 border-t border-gray-200">
                <Button variant="ghost" size="sm" icon={Eye} onClick={() => { }} className="flex-1">
                    Ver
                </Button>
                <Button variant="ghost" size="sm" icon={Pencil} onClick={onEdit}>
                    Editar
                </Button>
                <div className="relative group">
                    <Button variant="ghost" size="sm" icon={MoreVertical} />
                    <div className="absolute right-0 bottom-full mb-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                        <button
                            onClick={onDuplicate}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-t-lg flex items-center gap-2"
                        >
                            <Copy className="w-4 h-4" />
                            Duplicar
                        </button>
                        <button
                            onClick={onDelete}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-b-lg flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>
        </Card>
    );
};
