
import React, { useState, useMemo } from 'react';
import { useOrdenesServicio } from '../hooks/useOrdenesServicio';
import { OrdenesList } from '../components/ordenes/OrdenesList';
import { OrdenForm } from '../components/ordenes/OrdenForm';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { SearchBar } from '../components/shared/SearchBar';
import { Card } from '../components/ui/Card';
import type { OrdenServicio } from '../types';
import type { OrdenServicioFormData } from '../schemas/ordenServicioSchema';
import { useAuth } from '../hooks/useAuth';
import { ModuleGuide } from '../components/shared/ModuleGuide';

const OrdenesServicioPage: React.FC = () => {
  const { user } = useAuth();
  const { ordenes, isLoading, createOrden, updateOrden, deleteOrden, isCreating, isUpdating } = useOrdenesServicio();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedOrden, setSelectedOrden] = useState<OrdenServicio | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleOpenModal = (orden: OrdenServicio | null = null) => {
    setSelectedOrden(orden);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedOrden(null);
    setIsModalOpen(false);
  };

  const handleOpenConfirm = (orden: OrdenServicio) => {
    setSelectedOrden(orden);
    setIsConfirmOpen(true);
  };
  
  const handleCloseConfirm = () => {
    setSelectedOrden(null);
    setIsConfirmOpen(false);
  };

  const handleSubmit = (formData: OrdenServicioFormData) => {
    if (!user?.email) {
        alert("Debe iniciar sesión.");
        return;
    }

    const total = (formData.unidad || 0) * (formData.costo_hora || 0);

    const ordenData = {
      ...formData,
      usuario: user.email,
      total,
    };

    if (selectedOrden) {
      updateOrden({ id: selectedOrden.id, updates: ordenData }, {
        onSuccess: handleCloseModal,
      });
    } else {
      createOrden(ordenData, {
        onSuccess: handleCloseModal,
      });
    }
  };

  const handleDelete = () => {
    if (selectedOrden) {
      deleteOrden(selectedOrden.id, {
        onSuccess: handleCloseConfirm,
      });
    }
  };
  
  const filteredOrdenes = useMemo(() => {
    if (!ordenes) return [];
    return ordenes.filter(o =>
      o.os_numero.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.cliente?.nombre_cliente.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.aliado?.aliado.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [ordenes, searchQuery]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Gestión de Órdenes de Servicio</h1>
            <p className="mt-1 text-sm text-gray-600">Controla la ejecución y facturación de servicios.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="mt-4 sm:mt-0">
          Nueva Orden
        </Button>
      </header>
      
      <ModuleGuide title="Flujo de Órdenes de Servicio">
        <p>
           Este módulo centraliza la operación. Asegúrate de actualizar el <strong>Estado</strong> a "Ejecutado" cuando el aliado termine la labor, y a "Facturado" cuando se emita la cuenta de cobro.
        </p>
      </ModuleGuide>

      <Card>
        <div className="p-4 border-b">
            <SearchBar onSearch={setSearchQuery} placeholder="Buscar por OS, Cliente o Aliado..." />
        </div>
        <OrdenesList
          ordenes={filteredOrdenes}
          onEdit={handleOpenModal}
          onDelete={handleOpenConfirm}
          isLoading={isLoading}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedOrden ? `Editar Orden ${selectedOrden.os_numero}` : 'Nueva Orden de Servicio'}
        size="xl"
      >
        <OrdenForm 
          onSubmit={handleSubmit}
          onClose={handleCloseModal}
          defaultValues={selectedOrden}
          isSubmitting={isCreating || isUpdating}
        />
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={handleCloseConfirm}
        onConfirm={handleDelete}
        title="Anular Orden"
        message={`¿Estás seguro de que quieres eliminar la Orden de Servicio #${selectedOrden?.os_numero}?`}
      />
    </div>
  );
};

export default OrdenesServicioPage;
