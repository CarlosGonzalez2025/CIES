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
      
      <ModuleGuide title="🤝 Guía del Módulo de Aliados Estratégicos">
        <p className="mb-3">
          Los <strong>Aliados</strong> son los profesionales, empresas o contratistas que ejecutan los servicios de seguridad y salud ocupacional para tus clientes.
        </p>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-3">
          <h4 className="font-semibold text-blue-900 mb-2">🎯 ¿Para qué sirve este módulo?</h4>
          <p className="text-sm text-blue-800">
            Mantener un catálogo de proveedores de servicios con sus tarifas, especialidades y datos de contacto para asignarlos a presupuestos y órdenes de servicio.
          </p>
        </div>

        <h4 className="font-semibold mt-4 mb-2">📝 Cómo crear un nuevo aliado:</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm ml-2">
          <li>Haz clic en el botón <strong>"Nuevo Aliado"</strong> en la parte superior derecha</li>
          <li>Completa los campos requeridos:
            <ul className="list-disc list-inside ml-6 mt-1">
              <li><strong>Nombre del Aliado:</strong> Razón social o nombre del profesional</li>
              <li><strong>NIT:</strong> Identificación tributaria (opcional)</li>
              <li><strong>Especialidad:</strong> Área de expertise (ej: Medicina laboral, SG-SST, Higiene industrial)</li>
              <li><strong>Email y Teléfono:</strong> Datos de contacto</li>
              <li><strong>Tarifa por Hora/Unidad:</strong> Costo estándar para cotizaciones</li>
            </ul>
          </li>
          <li>Haz clic en <strong>"Crear Aliado"</strong> para guardar</li>
        </ol>

        <h4 className="font-semibold mt-4 mb-2">🔗 Conexión con otros módulos:</h4>
        <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
          <p className="mb-2"><strong>1. Presupuestos →</strong> Al crear un presupuesto, puedes asignar un aliado específico para ejecutar el servicio</p>
          <p><strong>2. Órdenes de Servicio →</strong> Cada orden debe tener un aliado asignado que será quien facture el servicio</p>
        </div>

        <div className="bg-amber-50 border-l-4 border-amber-500 p-3 mt-3">
          <h4 className="font-semibold text-amber-900 mb-1">💡 Consejos:</h4>
          <ul className="list-disc list-inside text-sm text-amber-800 space-y-1">
            <li>Mantén actualizadas las tarifas para cotizaciones precisas</li>
            <li>Registra la especialidad para asignar el aliado correcto según el servicio</li>
            <li>Guarda múltiples aliados para comparar precios</li>
          </ul>
        </div>
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
