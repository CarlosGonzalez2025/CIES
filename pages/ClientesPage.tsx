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
      
      <ModuleGuide title="📋 Guía del Módulo de Clientes">
        <p className="mb-3">
          Los <strong>Clientes</strong> son el punto de partida del sistema CIES. Representan las empresas para las cuales gestionas comisiones ARL y servicios de seguridad y salud ocupacional.
        </p>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-3">
          <h4 className="font-semibold text-blue-900 mb-2">🎯 ¿Para qué sirve este módulo?</h4>
          <p className="text-sm text-blue-800">
            Gestionar la información básica de tus clientes para poder vincularla posteriormente con comisiones, presupuestos y órdenes de servicio.
          </p>
        </div>

        <h4 className="font-semibold mt-4 mb-2">📝 Cómo crear un nuevo cliente:</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm ml-2">
          <li>Haz clic en el botón <strong>"Nuevo Cliente"</strong> en la parte superior derecha</li>
          <li>Completa los campos requeridos:
            <ul className="list-disc list-inside ml-6 mt-1">
              <li><strong>Nombre del Cliente:</strong> Razón social de la empresa</li>
              <li><strong>NIT/Documento:</strong> Identificación tributaria</li>
              <li><strong>ARL:</strong> Selecciona la Administradora de Riesgos Laborales</li>
              <li><strong>Tipo de Actividad:</strong> Sector económico del cliente</li>
            </ul>
          </li>
          <li>Haz clic en <strong>"Crear Cliente"</strong> para guardar</li>
        </ol>

        <h4 className="font-semibold mt-4 mb-2">🔗 Conexión con otros módulos:</h4>
        <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
          <p className="mb-2"><strong>1. Comisiones →</strong> Después de crear un cliente, puedes registrar sus comisiones anuales de ARL en el módulo de Comisiones</p>
          <p className="mb-2"><strong>2. Presupuestos →</strong> Con base en las comisiones, creas presupuestos de inversión para servicios</p>
          <p><strong>3. Órdenes de Servicio →</strong> Finalmente, ejecutas servicios específicos mediante órdenes de servicio</p>
        </div>

        <div className="bg-amber-50 border-l-4 border-amber-500 p-3 mt-3">
          <h4 className="font-semibold text-amber-900 mb-1">💡 Consejos:</h4>
          <ul className="list-disc list-inside text-sm text-amber-800 space-y-1">
            <li>Verifica que el NIT esté correcto antes de guardar</li>
            <li>Mantén actualizada la información de contacto</li>
            <li>Usa la barra de búsqueda para encontrar clientes rápidamente</li>
          </ul>
        </div>
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
