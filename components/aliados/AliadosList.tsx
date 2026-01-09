import React, { useState, useMemo } from 'react';
import { Table } from '../ui/Table';
import type { Aliado } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import {
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  Briefcase,
  DollarSign,
  Calendar,
  Building2,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface AliadosListProps {
  aliados: Aliado[];
  onEdit: (aliado: Aliado) => void;
  onDelete: (aliado: Aliado) => void;
  isLoading?: boolean;
}

// Componente de Badge para especialidades
const SpecialtyBadge: React.FC<{ specialty?: string }> = ({ specialty }) => {
  if (!specialty) return <span className="text-gray-400 text-sm">Sin especialidad</span>;

  const colors: Record<string, string> = {
    'seguridad': 'bg-red-100 text-red-700 border-red-200',
    'salud': 'bg-green-100 text-green-700 border-green-200',
    'ambiental': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'industrial': 'bg-blue-100 text-blue-700 border-blue-200',
    'consultoria': 'bg-purple-100 text-purple-700 border-purple-200',
    'capacitacion': 'bg-amber-100 text-amber-700 border-amber-200',
  };

  const normalizedSpecialty = specialty.toLowerCase();
  const colorClass = Object.entries(colors).find(([key]) =>
    normalizedSpecialty.includes(key)
  )?.[1] || 'bg-gray-100 text-gray-700 border-gray-200';

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
      <Briefcase className="w-3 h-3 mr-1" />
      {specialty}
    </span>
  );
};

// Componente para mostrar información de contacto
const ContactInfo: React.FC<{ email?: string; phone?: string; name?: string }> = ({
  email,
  phone,
  name
}) => {
  return (
    <div className="space-y-1">
      {name && (
        <p className="text-sm font-medium text-gray-900">{name}</p>
      )}
      {phone && (
        <div className="flex items-center text-xs text-gray-600">
          <Phone className="w-3 h-3 mr-1.5 text-gray-400" />
          <a href={`tel:${phone}`} className="hover:text-primary-600 transition-colors">
            {phone}
          </a>
        </div>
      )}
      {email && (
        <div className="flex items-center text-xs text-gray-600">
          <Mail className="w-3 h-3 mr-1.5 text-gray-400" />
          <a href={`mailto:${email}`} className="hover:text-primary-600 transition-colors truncate max-w-[200px]">
            {email}
          </a>
        </div>
      )}
    </div>
  );
};

// Componente para tarifas con comparación
const TarifaDisplay: React.FC<{ pbl?: number; especializada?: number }> = ({
  pbl,
  especializada
}) => {
  const hasBoth = pbl && especializada;
  const diff = hasBoth ? ((especializada - pbl) / pbl * 100) : 0;

  return (
    <div className="space-y-1">
      {pbl && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">PBL:</span>
          <span className="text-sm font-semibold text-gray-900">{formatCurrency(pbl)}</span>
        </div>
      )}
      {especializada && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Esp:</span>
          <span className="text-sm font-semibold text-primary-600">{formatCurrency(especializada)}</span>
        </div>
      )}
      {hasBoth && diff > 0 && (
        <div className="flex items-center text-xs text-emerald-600 pt-1 border-t border-gray-100">
          <TrendingUp className="w-3 h-3 mr-1" />
          <span>+{diff.toFixed(0)}%</span>
        </div>
      )}
      {!pbl && !especializada && (
        <span className="text-xs text-gray-400">Sin tarifas</span>
      )}
    </div>
  );
};

// Componente de estadísticas rápidas
const StatsBar: React.FC<{ aliados: Aliado[] }> = ({ aliados }) => {
  const stats = useMemo(() => {
    const total = aliados.length;
    const conTarifas = aliados.filter(a => a.hora_pbl || a.hora_especializada).length;
    const conEmail = aliados.filter(a => a.email).length;
    const tarifaPromedio = aliados.reduce((acc, a) => acc + (a.hora_pbl || 0), 0) / (total || 1);

    return { total, conTarifas, conEmail, tarifaPromedio };
  }, [aliados]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-blue-600 mb-1">Total Aliados</p>
            <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
          </div>
          <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-emerald-600 mb-1">Con Tarifas</p>
            <p className="text-2xl font-bold text-emerald-900">{stats.conTarifas}</p>
          </div>
          <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-purple-600 mb-1">Con Email</p>
            <p className="text-2xl font-bold text-purple-900">{stats.conEmail}</p>
          </div>
          <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center">
            <Mail className="w-5 h-5 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-amber-600 mb-1">Tarifa Prom.</p>
            <p className="text-lg font-bold text-amber-900">{formatCurrency(stats.tarifaPromedio)}</p>
          </div>
          <div className="w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-amber-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const AliadosList: React.FC<AliadosListProps> = ({
  aliados,
  onEdit,
  onDelete,
  isLoading
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Filtrado y búsqueda
  const filteredAliados = useMemo(() => {
    let filtered = [...aliados];

    // Búsqueda global
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(aliado =>
        aliado.aliado?.toLowerCase().includes(search) ||
        aliado.contacto?.toLowerCase().includes(search) ||
        aliado.email?.toLowerCase().includes(search) ||
        aliado.especialidad?.toLowerCase().includes(search) ||
        aliado.numero_telefonico?.includes(search)
      );
    }

    // Filtro por especialidad
    if (filterSpecialty !== 'all') {
      filtered = filtered.filter(aliado =>
        aliado.especialidad?.toLowerCase().includes(filterSpecialty.toLowerCase())
      );
    }

    return filtered;
  }, [aliados, searchTerm, filterSpecialty]);

  // Obtener especialidades únicas
  const specialties = useMemo(() => {
    const unique = [...new Set(aliados.map(a => a.especialidad).filter(Boolean))];
    return unique.sort();
  }, [aliados]);

  // Exportar a CSV
  const handleExport = () => {
    const headers = ['Nombre', 'Especialidad', 'Contacto', 'Teléfono', 'Email', 'Tarifa PBL', 'Tarifa Especializada'];
    const csvData = filteredAliados.map(a => [
      a.aliado || '',
      a.especialidad || '',
      a.contacto || '',
      a.numero_telefonico || '',
      a.email || '',
      a.hora_pbl || '',
      a.hora_especializada || ''
    ]);

    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aliados_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const columns = [
    {
      key: 'aliado',
      label: 'Aliado',
      render: (aliado: Aliado) => (
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0">
            {aliado.aliado?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {aliado.aliado || 'Sin nombre'}
            </p>
            {aliado.nit && (
              <p className="text-xs text-gray-500 flex items-center mt-1">
                <Building2 className="w-3 h-3 mr-1" />
                NIT: {aliado.nit}
              </p>
            )}
            {aliado.fecha_registro && (
              <p className="text-xs text-gray-500 flex items-center mt-0.5">
                <Calendar className="w-3 h-3 mr-1" />
                {new Date(aliado.fecha_registro).toLocaleDateString('es-CO')}
              </p>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'especialidad',
      label: 'Especialidad',
      render: (aliado: Aliado) => <SpecialtyBadge specialty={aliado.especialidad} />
    },
    {
      key: 'contacto',
      label: 'Información de Contacto',
      render: (aliado: Aliado) => (
        <ContactInfo
          name={aliado.contacto}
          phone={aliado.numero_telefonico}
          email={aliado.email}
        />
      )
    },
    {
      key: 'tarifas',
      label: 'Tarifas',
      render: (aliado: Aliado) => (
        <TarifaDisplay
          pbl={aliado.hora_pbl}
          especializada={aliado.hora_especializada}
        />
      )
    },
    {
      key: 'banco',
      label: 'Información Bancaria',
      render: (aliado: Aliado) => (
        <div className="space-y-1">
          {aliado.banco && (
            <p className="text-sm font-medium text-gray-900">{aliado.banco}</p>
          )}
          {aliado.tipo_cuenta && (
            <p className="text-xs text-gray-600">
              {aliado.tipo_cuenta}
            </p>
          )}
          {aliado.numero_cuenta && (
            <p className="text-xs text-gray-500 font-mono">
              {aliado.numero_cuenta}
            </p>
          )}
          {!aliado.banco && !aliado.tipo_cuenta && (
            <span className="text-xs text-gray-400">Sin datos bancarios</span>
          )}
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      {/* Barra de estadísticas */}
      <StatsBar aliados={aliados} />

      {/* Barra de búsqueda y filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre, contacto, email, teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={`${showFilters ? 'bg-primary-50 border-primary-300' : ''}`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
              {filterSpecialty !== 'all' && (
                <span className="ml-2 w-2 h-2 bg-primary-600 rounded-full" />
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleExport}
              disabled={filteredAliados.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Panel de filtros expandible */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 animate-slide-down">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Especialidad
                </label>
                <select
                  value={filterSpecialty}
                  onChange={(e) => setFilterSpecialty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">Todas las especialidades</option>
                  {specialties.map(specialty => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>
              </div>

              {/* Botón para limpiar filtros */}
              {filterSpecialty !== 'all' && (
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => setFilterSpecialty('all')}
                    className="w-full"
                  >
                    Limpiar filtros
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Contador de resultados */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          {searchTerm || filterSpecialty !== 'all' ? (
            <>
              <AlertCircle className="w-4 h-4 text-primary-600" />
              <span>
                Mostrando <strong className="text-gray-900">{filteredAliados.length}</strong> de{' '}
                <strong className="text-gray-900">{aliados.length}</strong> aliados
              </span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>
                Total: <strong className="text-gray-900">{aliados.length}</strong> aliados
              </span>
            </>
          )}
        </div>

        {filteredAliados.length === 0 && !isLoading && (
          <span className="text-amber-600 font-medium">
            No se encontraron resultados
          </span>
        )}
      </div>

      {/* Tabla */}
      <Table<Aliado>
        columns={columns}
        data={filteredAliados}
        onEdit={onEdit}
        onDelete={onDelete}
        isLoading={isLoading}
        getRowKey={(aliado) => aliado.id}
        emptyMessage={
          searchTerm || filterSpecialty !== 'all'
            ? "No se encontraron aliados con los criterios de búsqueda"
            : "No hay aliados registrados. Crea el primero para comenzar."
        }
      />

      {/* Animación CSS */}
      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 500px;
          }
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};
