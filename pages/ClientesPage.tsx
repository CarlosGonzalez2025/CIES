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
import { FileUp, Download } from 'lucide-react';
import { generateTemplate, readExcelFile } from '../utils/excel';
import { clientesApi } from '../services/api/clientesApi';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

const ClientesPage: React.FC = () => {
  const { user } = useAuth();
  const { clientes, isLoading, createCliente, updateCliente, deleteCliente, isCreating, isUpdating } = useClientes();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const handleDownloadTemplate = () => {
    const columns = ['nombre_cliente', 'nit_documento', 'arl_id', 'nombre_contacto', 'numero_contacto', 'email_contacto', 'valor_hora', 'porcentaje_comision', 'direccion'];
    generateTemplate(columns, 'Plantilla_Carga_Masiva_Clientes');
    toast.success('Plantilla descargada correctamente');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await readExcelFile(file);
      if (!data || data.length === 0) {
        toast.error('El archivo está vacío');
        return;
      }

      // Basic validation/transformation mapping
      const clientesToCreate = data.map((row: any) => ({
        nombre_cliente: row.nombre_cliente,
        nit_documento: String(row.nit_documento),
        arl_id: Number(row.arl_id) || 1, // Fallback to 1 if missing, assuming valid ID
        nombre_contacto: row.nombre_contacto || '',
        numero_contacto: String(row.numero_contacto || ''),
        email_contacto: row.email_contacto || '',
        valor_hora: Number(row.valor_hora) || 0,
        porcentaje_comision: Number(row.porcentaje_comision) || 0,
        direccion: row.direccion || '',
        usuario: user?.email || 'bulk_import',
        fecha: new Date().toISOString().split('T')[0]
      }));

      // NOTE: Using the API directly here to bypass the hook limitation for now, 
      // but ideally should be in a hook.
      await clientesApi.createMany(clientesToCreate);

      toast.success(`${clientesToCreate.length} clientes importados correctamente`);
      queryClient.invalidateQueries({ queryKey: ['clientes'] });

    } catch (error) {
      console.error(error);
      toast.error('Error al procesar el archivo Excel');
    }
  };

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
        <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
          <Button variant="outline" onClick={handleDownloadTemplate} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Plantilla
          </Button>
          <div className="relative">
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button variant="outline" className="flex items-center gap-2">
              <FileUp className="w-4 h-4" />
              Importar
            </Button>
          </div>
          <Button onClick={() => handleOpenModal()}>
            Nuevo Cliente
          </Button>
        </div>
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
