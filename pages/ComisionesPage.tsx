import React, { useState, useMemo } from 'react';
import { useComisiones } from '../hooks/useComisiones';
import { ComisionesList } from '../components/comisiones/ComisionesList';
import { ComisionForm } from '../components/comisiones/ComisionForm';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { SearchBar } from '../components/shared/SearchBar';
import { Card } from '../components/ui/Card';
import type { Comision } from '../types';
import type { ComisionFormData } from '../schemas/comisionSchema';
import { useAuth } from '../hooks/useAuth';
import { ModuleGuide } from '../components/shared/ModuleGuide';
import { calculateComisionTotals } from '../utils/calculations';
import toast from 'react-hot-toast';

const ComisionesPage: React.FC = () => {
  const { user } = useAuth();
  const { comisiones, isLoading, createComision, updateComision, deleteComision, isCreating, isUpdating } = useComisiones();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedComision, setSelectedComision] = useState<Comision | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleOpenModal = (comision: Comision | null = null) => {
    setSelectedComision(comision);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedComision(null);
    setIsModalOpen(false);
  };

  const handleOpenConfirm = (comision: Comision) => {
    setSelectedComision(comision);
    setIsConfirmOpen(true);
  };
  
  const handleCloseConfirm = () => {
    setSelectedComision(null);
    setIsConfirmOpen(false);
  };

  const handleSubmit = (formData: ComisionFormData) => {
    if (!user?.email) return toast.error("Debe iniciar sesión.");

    // CRITICAL FIX: Extract 'primas' separately so it's not included in the spread for comisionData
    const { primas, ...restFormData } = formData;

    const totals = calculateComisionTotals(primas, formData);
    
    const comisionData = {
      ...restFormData, // This object now matches the 'comisiones' table schema
      ...totals,
      usuario: user.email,
      nit: 'temp-nit' // Placeholder
    };

    if (selectedComision) {
      updateComision({ 
          id: selectedComision.id, 
          comisionUpdates: comisionData,
          primasUpdates: primas.filter(p => p.id).map(p => ({ id: p.id!, prima: p.prima, comision: p.comision }))
      }, {
        onSuccess: handleCloseModal,
      });
    } else {
      createComision({ comision: comisionData, primas: primas }, {
        onSuccess: handleCloseModal,
      });
    }
  };

  const handleDelete = () => {
    if (selectedComision) {
      deleteComision(selectedComision.id, {
        onSuccess: handleCloseConfirm,
      });
    }
  };
  
  const filteredComisiones = useMemo(() => {
    if (!comisiones) return [];
    return comisiones.filter(c =>
      c.cliente?.nombre_cliente.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [comisiones, searchQuery]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Gestión de Comisiones</h1>
            <p className="mt-1 text-sm text-gray-600">Registra y consulta las comisiones de ARL.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="mt-4 sm:mt-0">
          Nueva Comisión
        </Button>
      </header>
      
      <ModuleGuide title="💰 Guía del Módulo de Comisiones ARL">
        <p className="mb-3">
          Las <strong>Comisiones</strong> representan los ingresos que recibes por administrar la ARL de tus clientes. Este módulo registra las primas mensuales y calcula automáticamente las comisiones anuales.
        </p>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-3">
          <h4 className="font-semibold text-blue-900 mb-2">🎯 ¿Para qué sirve este módulo?</h4>
          <p className="text-sm text-blue-800">
            Registrar las primas de ARL emitidas mensualmente por cliente y calcular automáticamente las comisiones que generan, que luego servirán como base para los presupuestos de inversión.
          </p>
        </div>

        <h4 className="font-semibold mt-4 mb-2">📝 Cómo crear una nueva comisión:</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm ml-2">
          <li>Haz clic en el botón <strong>"Nueva Comisión"</strong> en la parte superior derecha</li>
          <li>Selecciona el <strong>Cliente</strong> (debe existir previamente en el módulo de Clientes)</li>
          <li>Selecciona la <strong>ARL</strong> correspondiente</li>
          <li>Ingresa el <strong>Porcentaje de Comisión</strong> pactado con la ARL (ej: 8% = 0.08)</li>
          <li>Completa las <strong>12 primas mensuales</strong>:
            <ul className="list-disc list-inside ml-6 mt-1">
              <li>El sistema calculará automáticamente la comisión de cada mes</li>
              <li>Al final mostrará el total anual de primas y comisiones</li>
            </ul>
          </li>
          <li>Haz clic en <strong>"Crear Comisión"</strong> para guardar</li>
        </ol>

        <h4 className="font-semibold mt-4 mb-2">🔗 Conexión con otros módulos:</h4>
        <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
          <p className="mb-2"><strong>← Clientes:</strong> Debes tener el cliente creado previamente</p>
          <p><strong>→ Presupuestos:</strong> El monto total de comisión se utiliza para calcular el presupuesto de inversión del cliente</p>
        </div>

        <div className="bg-purple-50 border-l-4 border-purple-500 p-3 mt-3 mb-3">
          <h4 className="font-semibold text-purple-900 mb-2">📊 Cálculos Automáticos:</h4>
          <p className="text-sm text-purple-800">
            <strong>Comisión Mensual</strong> = Prima Emitida × Porcentaje de Comisión<br/>
            <strong>Total Anual</strong> = Suma de las 12 primas/comisiones mensuales
          </p>
        </div>

        <div className="bg-amber-50 border-l-4 border-amber-500 p-3 mt-3">
          <h4 className="font-semibold text-amber-900 mb-1">💡 Consejos:</h4>
          <ul className="list-disc list-inside text-sm text-amber-800 space-y-1">
            <li>Registra las primas mensualmente para mantener el sistema actualizado</li>
            <li>Verifica el porcentaje de comisión según el contrato con la ARL</li>
            <li>Puedes editar una comisión existente para actualizar valores</li>
          </ul>
        </div>
      </ModuleGuide>

      <Card>
        <div className="p-4 border-b">
            <SearchBar onSearch={setSearchQuery} placeholder="Buscar por nombre de cliente..." />
        </div>
        <ComisionesList
          comisiones={filteredComisiones}
          onEdit={handleOpenModal}
          onDelete={handleOpenConfirm}
          isLoading={isLoading}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedComision ? 'Editar Comisión' : 'Nueva Comisión'}
        size="xl"
      >
        <ComisionForm 
          onSubmit={handleSubmit}
          onClose={handleCloseModal}
          selectedId={selectedComision?.id}
          isSubmitting={isCreating || isUpdating}
        />
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={handleCloseConfirm}
        onConfirm={handleDelete}
        title="Confirmar Eliminación"
        message={`¿Estás seguro de que quieres eliminar esta comisión? Se borrarán también sus 12 primas asociadas.`}
      />
    </div>
  );
};

export default ComisionesPage;