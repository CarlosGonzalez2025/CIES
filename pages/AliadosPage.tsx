import React, { useState, useMemo } from 'react';
import { useAliados } from '../hooks/useAliados';
import { AliadosList } from '../components/aliados/AliadosList';
import { AliadoForm } from '../components/aliados/AliadoForm';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { SearchBar } from '../components/shared/SearchBar';
import { Card } from '../components/ui/Card';
import type { Aliado } from '../types';
import type { AliadoFormData } from '../schemas/aliadoSchema';
import { useAuth } from '../hooks/useAuth';
import { ModuleGuide } from '../components/shared/ModuleGuide';

const AliadosPage: React.FC = () => {
  const { user } = useAuth();
  const { aliados, isLoading, createAliado, updateAliado, deleteAliado, isCreating, isUpdating } = useAliados();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedAliado, setSelectedAliado] = useState<Aliado | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleOpenModal = (aliado: Aliado | null = null) => {
    setSelectedAliado(aliado);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedAliado(null);
    setIsModalOpen(false);
  };

  const handleOpenConfirm = (aliado: Aliado) => {
    setSelectedAliado(aliado);
    setIsConfirmOpen(true);
  };
  
  const handleCloseConfirm = () => {
    setSelectedAliado(null);
    setIsConfirmOpen(false);
  };

  const handleSubmit = (formData: AliadoFormData) => {
    if (!user || !user.email) {
        alert("Debe iniciar sesión para realizar esta acción.");
        return;
    }

    const aliadoData = {
      ...formData,
      usuario: user.email,
    };

    if (selectedAliado) {
      updateAliado({ id: selectedAliado.id, updates: aliadoData }, {
        onSuccess: handleCloseModal,
      });
    } else {
      createAliado(aliadoData, {
        onSuccess: handleCloseModal,
      });
    }
  };

  const handleDelete = () => {
    if (selectedAliado) {
      deleteAliado(selectedAliado.id, {
        onSuccess: handleCloseConfirm,
      });
    }
  };
  
  const filteredAliados = useMemo(() => {
    if (!aliados) return [];
    return aliados.filter(aliado =>
      aliado.aliado.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (aliado.especialidad && aliado.especialidad.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (aliado.nit && aliado.nit.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [aliados, searchQuery]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Gestión de Aliados</h1>
            <p className="mt-1 text-sm text-gray-600">Crea, edita y administra los aliados estratégicos de CIES.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="mt-4 sm:mt-0">
          Nuevo Aliado
        </Button>
      </header>
      
      <ModuleGuide title="Módulo de Aliados">
        <p>
          Los <strong>Aliados</strong> son los profesionales o empresas que ejecutan los servicios para los clientes. Aquí puedes gestionar su información de contacto y tarifas.
        </p>
        <ul className="list-disc list-inside">
          <li><strong>Paso 1:</strong> Registra a tus aliados para poder asignarlos a las tareas.</li>
          <li><strong>Conexión:</strong> Un aliado se asigna a un <strong>Presupuesto</strong> y a una <strong>Orden de Servicio</strong> para indicar quién realizará el trabajo.</li>
        </ul>
      </ModuleGuide>

      <Card>
        <div className="p-4 border-b">
            <SearchBar onSearch={setSearchQuery} placeholder="Buscar por nombre, especialidad o NIT..." />
        </div>
        <AliadosList
          aliados={filteredAliados}
          onEdit={handleOpenModal}
          onDelete={handleOpenConfirm}
          isLoading={isLoading}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedAliado ? 'Editar Aliado' : 'Nuevo Aliado'}
        size="lg"
      >
        <AliadoForm 
          onSubmit={handleSubmit}
          onClose={handleCloseModal}
          defaultValues={selectedAliado}
          isSubmitting={isCreating || isUpdating}
        />
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={handleCloseConfirm}
        onConfirm={handleDelete}
        title="Confirmar Eliminación"
        message={`¿Estás seguro de que quieres eliminar al aliado "${selectedAliado?.aliado}"? Esta acción no se puede deshacer.`}
      />
    </div>
  );
};

export default AliadosPage;
