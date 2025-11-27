
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
      
      <ModuleGuide title="📦 Guía del Módulo de Órdenes de Servicio">
        <p className="mb-3">
          Las <strong>Órdenes de Servicio (OS)</strong> son el corazón operativo del sistema. Cada orden representa un servicio específico que se ejecuta para un cliente, controlando desde la asignación hasta la facturación.
        </p>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-3">
          <h4 className="font-semibold text-blue-900 mb-2">🎯 ¿Para qué sirve este módulo?</h4>
          <p className="text-sm text-blue-800">
            Gestionar el ciclo completo de los servicios: desde la creación de la orden, asignación al aliado, ejecución, hasta la facturación y pago.
          </p>
        </div>

        <h4 className="font-semibold mt-4 mb-2">📝 Cómo crear una nueva orden de servicio:</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm ml-2">
          <li>Haz clic en el botón <strong>"Nueva Orden"</strong> en la parte superior derecha</li>
          <li>Completa la información básica:
            <ul className="list-disc list-inside ml-6 mt-1">
              <li><strong>OS Número:</strong> Número consecutivo de la orden</li>
              <li><strong>Cliente:</strong> Para quién se realizará el servicio</li>
              <li><strong>Aliado:</strong> Quién ejecutará el servicio</li>
              <li><strong>Fecha de Envío:</strong> Cuándo se asigna la orden</li>
            </ul>
          </li>
          <li>Define el servicio:
            <ul className="list-disc list-inside ml-6 mt-1">
              <li><strong>Actividad:</strong> Descripción del trabajo (ej: "Exámenes médicos ocupacionales")</li>
              <li><strong>Unidades:</strong> Cantidad a ejecutar (ej: 20 exámenes)</li>
              <li><strong>Costo por Hora/Unidad:</strong> Tarifa unitaria</li>
              <li>El sistema calculará el <strong>Total</strong> automáticamente</li>
            </ul>
          </li>
          <li>Gestiona el seguimiento:
            <ul className="list-disc list-inside ml-6 mt-1">
              <li><strong>Estado Actividad:</strong> Programado → En Ejecución → Ejecutado</li>
              <li><strong>Estado Facturación:</strong> Pendiente → Facturado → Pagado</li>
              <li><strong>% Ejecución:</strong> Porcentaje de avance del servicio</li>
            </ul>
          </li>
          <li>Haz clic en <strong>"Crear Orden"</strong> para guardar</li>
        </ol>

        <h4 className="font-semibold mt-4 mb-2">🔄 Ciclo de vida de una orden:</h4>
        <div className="bg-indigo-50 border border-indigo-200 rounded p-3 text-sm mb-3">
          <ol className="list-decimal list-inside space-y-1">
            <li><strong>Creación:</strong> Se crea la orden y se asigna al aliado</li>
            <li><strong>Ejecución:</strong> El aliado realiza el servicio, actualiza el % de ejecución</li>
            <li><strong>Finalización:</strong> Cambiar estado a "Ejecutado" cuando termine</li>
            <li><strong>Facturación:</strong> El aliado envía la factura, cambiar a "Facturado"</li>
            <li><strong>Pago:</strong> Una vez pagado, marcar como "Pagado"</li>
          </ol>
        </div>

        <h4 className="font-semibold mt-4 mb-2">🔗 Conexión con otros módulos:</h4>
        <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
          <p className="mb-2"><strong>← Presupuestos:</strong> Las órdenes se crean con base en los presupuestos aprobados</p>
          <p className="mb-2"><strong>← Clientes:</strong> Cada orden está vinculada a un cliente específico</p>
          <p><strong>← Aliados:</strong> Cada orden debe tener un aliado asignado que ejecutará el servicio</p>
        </div>

        <div className="bg-purple-50 border-l-4 border-purple-500 p-3 mt-3 mb-3">
          <h4 className="font-semibold text-purple-900 mb-2">📊 Cálculos Automáticos:</h4>
          <p className="text-sm text-purple-800">
            <strong>Total de la Orden</strong> = Unidades × Costo por Unidad<br/>
            <strong>% Ejecución Valor</strong> = (Valor Ejecutado / Total) × 100
          </p>
        </div>

        <div className="bg-amber-50 border-l-4 border-amber-500 p-3 mt-3">
          <h4 className="font-semibold text-amber-900 mb-1">💡 Consejos:</h4>
          <ul className="list-disc list-inside text-sm text-amber-800 space-y-1">
            <li>Actualiza el estado regularmente para tener control en tiempo real</li>
            <li>Marca como "Cancelada" si la orden no se ejecutará (checkbox "Cancelado")</li>
            <li>El % de ejecución ayuda a trackear el avance de servicios grandes</li>
            <li>Usa los filtros de búsqueda para encontrar órdenes por número, cliente o aliado</li>
          </ul>
        </div>
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
