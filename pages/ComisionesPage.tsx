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
      
      <ModuleGuide title="Módulo de Comisiones">
        <p>
          Aquí se registran las comisiones anuales generadas por cada cliente. La comisión es la fuente de ingresos que permite la inversión en servicios de seguridad y salud.
        </p>
        <ul className="list-disc list-inside">
          <li><strong>Paso 1:</strong> Crea una nueva comisión para un <strong>Cliente</strong> existente.</li>
          <li><strong>Paso 2:</strong> Ingresa las primas mensuales para calcular automáticamente los totales.</li>
          <li><strong>Conexión:</strong> El valor de la comisión calculada aquí se usa para crear un <strong>Presupuesto</strong> de inversión para el cliente.</li>
        </ul>
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