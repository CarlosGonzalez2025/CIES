import React, { useState, useMemo } from 'react';
import { useClientes } from '../hooks/useClientes';
import { ClientesList } from '../components/clientes/ClientesList';
import { ClienteForm } from '../components/clientes/ClienteForm';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { SearchBar } from '../components/shared/SearchBar';
import { Card } from '../components/ui/Card';
import type { Cliente } from '../types';
import type { ClienteFormData } from '../schemas/clienteSchema';
import { useAuth } from '../hooks/useAuth';
import { ModuleGuide } from '../components/shared/ModuleGuide';

const ClientesPage: React.FC = () => {
  const { user } = useAuth();
  const { clientes, isLoading, createCliente, updateCliente, deleteCliente, isCreating, isUpdating } = useClientes();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleOpenModal = (cliente: Cliente | null = null) => {
    setSelectedCliente(cliente);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedCliente(null);
    setIsModalOpen(false);
  };

  const handleOpenConfirm = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setIsConfirmOpen(true);
  };
  
  const handleCloseConfirm = () => {
    setSelectedCliente(null);
    setIsConfirmOpen(false);
  };

  const handleSubmit = (formData: ClienteFormData) => {
    if (!user) {
        alert("Debe iniciar sesión para realizar esta acción.");
        return;
    }

    const clienteData = {
      ...formData,
      usuario: user.email!,
      arl_id: Number(formData.arl_id),
    };

    if (selectedCliente) {
      updateCliente({ id: selectedCliente.id, updates: clienteData }, {
        onSuccess: handleCloseModal,
      });
    } else {
      createCliente(clienteData, {
        onSuccess: handleCloseModal,
      });
    }
  };

  const handleDelete = () => {
    if (selectedCliente) {
      deleteCliente(selectedCliente.id, {
        onSuccess: handleCloseConfirm,
      });
    }
  };
  
  const filteredClientes = useMemo(() => {
    if (!clientes) return [];
    return clientes.filter(cliente =>
      cliente.nombre_cliente.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cliente.nit_documento.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [clientes, searchQuery]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Gestión de Clientes</h1>
            <p className="mt-1 text-sm text-gray-600">Crea, edita y administra los clientes de CIES.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="mt-4 sm:mt-0">
          Nuevo Cliente
        </Button>
      </header>
      
      <ModuleGuide title="Módulo de Clientes">
        <p>
          Los <strong>Clientes</strong> son el punto de partida del sistema. Toda la información y los flujos de trabajo giran en torno a ellos.
        </p>
        <ul className="list-disc list-inside">
          <li><strong>Paso 1:</strong> Crea un cliente para poder registrar sus comisiones.</li>
          <li><strong>Conexión:</strong> La información de un cliente se utilizará para crear <strong>Comisiones</strong>, <strong>Presupuestos</strong> y <strong>Órdenes de Servicio</strong>.</li>
        </ul>
      </ModuleGuide>

      <Card>
        <div className="p-4 border-b">
            <SearchBar onSearch={setSearchQuery} placeholder="Buscar por nombre o NIT..." />
        </div>
        <ClientesList
          clientes={filteredClientes}
          onEdit={handleOpenModal}
          onDelete={handleOpenConfirm}
          isLoading={isLoading}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
        size="lg"
      >
        <ClienteForm 
          onSubmit={handleSubmit}
          onClose={handleCloseModal}
          defaultValues={selectedCliente}
          isSubmitting={isCreating || isUpdating}
        />
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={handleCloseConfirm}
        onConfirm={handleDelete}
        title="Confirmar Eliminación"
        message={`¿Estás seguro de que quieres eliminar al cliente "${selectedCliente?.nombre_cliente}"? Esta acción no se puede deshacer.`}
      />
    </div>
  );
};

export default ClientesPage;
