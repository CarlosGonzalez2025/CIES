import React, { useState, useMemo } from 'react';
import { usePresupuestos } from '../hooks/usePresupuesto';
import { PresupuestoList } from '../components/presupuesto/PresupuestoList';
import { PresupuestoForm } from '../components/presupuesto/PresupuestoForm';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { SearchBar } from '../components/shared/SearchBar';
import { Card } from '../components/ui/Card';
import type { Presupuesto } from '../types';
import type { PresupuestoFormData } from '../schemas/presupuestoSchema';
import { useAuth } from '../hooks/useAuth';
import { ModuleGuide } from '../components/shared/ModuleGuide';

const PresupuestoPage: React.FC = () => {
  const { user } = useAuth();
  const { presupuestos, isLoading, createPresupuesto, updatePresupuesto, deletePresupuesto, isCreating, isUpdating } = usePresupuestos();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedPresupuesto, setSelectedPresupuesto] = useState<Presupuesto | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleOpenModal = (presupuesto: Presupuesto | null = null) => {
    setSelectedPresupuesto(presupuesto);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedPresupuesto(null);
    setIsModalOpen(false);
  };

  const handleOpenConfirm = (presupuesto: Presupuesto) => {
    setSelectedPresupuesto(presupuesto);
    setIsConfirmOpen(true);
  };
  
  const handleCloseConfirm = () => {
    setSelectedPresupuesto(null);
    setIsConfirmOpen(false);
  };

  const handleSubmit = (formData: PresupuestoFormData) => {
    if (!user?.email) {
        alert("Debe iniciar sesión para realizar esta acción.");
        return;
    }

    // Calcular valores derivados
    const inversion_ejecutar = (formData.comision || 0) * (formData.porcentaje_inversion_anio || 0);
    const valor_total_ejecutar = (formData.horas_unidades || 0) * (formData.costo_hora_unidad || 0);

    const presupuestoData = {
      ...formData,
      usuario: user.email,
      inversion_ejecutar,
      valor_total_ejecutar,
      aliado_id: formData.aliado_id || undefined,
    };

    if (selectedPresupuesto) {
      updatePresupuesto({ id: selectedPresupuesto.id, updates: presupuestoData }, {
        onSuccess: handleCloseModal,
      });
    } else {
      createPresupuesto(presupuestoData, {
        onSuccess: handleCloseModal,
      });
    }
  };

  const handleDelete = () => {
    if (selectedPresupuesto) {
      deletePresupuesto(selectedPresupuesto.id, {
        onSuccess: handleCloseConfirm,
      });
    }
  };
  
  const filteredPresupuestos = useMemo(() => {
    if (!presupuestos) return [];
    return presupuestos.filter(p =>
      p.cliente?.nombre_cliente.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.aliado && p.aliado.aliado.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [presupuestos, searchQuery]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Gestión de Presupuestos</h1>
            <p className="mt-1 text-sm text-gray-600">Crea y administra los presupuestos de inversión por cliente.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="mt-4 sm:mt-0">
          Nuevo Presupuesto
        </Button>
      </header>
      
      <ModuleGuide title="Módulo de Presupuestos">
        <p>
          El presupuesto representa el monto de la comisión de un cliente que se destinará a la inversión en servicios. Es el puente entre los ingresos (comisiones) y los gastos (órdenes de servicio).
        </p>
        <ul className="list-disc list-inside">
          <li><strong>Paso 1:</strong> Crea un presupuesto a partir de la <strong>Comisión</strong> total de un cliente.</li>
          <li><strong>Paso 2:</strong> Asigna un <strong>Aliado</strong> si ya se conoce quién ejecutará el trabajo.</li>
          <li><strong>Conexión:</strong> Desde un presupuesto aprobado se generan una o varias <strong>Órdenes de Servicio</strong> para ejecutar las actividades.</li>
        </ul>
      </ModuleGuide>

      <Card>
        <div className="p-4 border-b">
            <SearchBar onSearch={setSearchQuery} placeholder="Buscar por cliente o aliado..." />
        </div>
        <PresupuestoList
          presupuestos={filteredPresupuestos}
          onEdit={handleOpenModal}
          onDelete={handleOpenConfirm}
          isLoading={isLoading}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedPresupuesto ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
        size="lg"
      >
        <PresupuestoForm 
          onSubmit={handleSubmit}
          onClose={handleCloseModal}
          defaultValues={selectedPresupuesto}
          isSubmitting={isCreating || isUpdating}
        />
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={handleCloseConfirm}
        onConfirm={handleDelete}
        title="Confirmar Eliminación"
        message={`¿Estás seguro de que quieres eliminar este presupuesto? Esta acción no se puede deshacer.`}
      />
    </div>
  );
};

export default PresupuestoPage;
