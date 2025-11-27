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
      
      <ModuleGuide title="📊 Guía del Módulo de Presupuestos">
        <p className="mb-3">
          Los <strong>Presupuestos</strong> definen cómo se invertirá la comisión de cada cliente en servicios de seguridad y salud ocupacional. Es el puente entre los ingresos (comisiones) y los gastos (órdenes de servicio).
        </p>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-3">
          <h4 className="font-semibold text-blue-900 mb-2">🎯 ¿Para qué sirve este módulo?</h4>
          <p className="text-sm text-blue-800">
            Planificar y controlar la inversión de las comisiones de cada cliente, definiendo qué actividades se realizarán, quién las ejecutará y cuánto costarán.
          </p>
        </div>

        <h4 className="font-semibold mt-4 mb-2">📝 Cómo crear un nuevo presupuesto:</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm ml-2">
          <li>Haz clic en el botón <strong>"Nuevo Presupuesto"</strong> en la parte superior derecha</li>
          <li>Selecciona el <strong>Cliente</strong> y el <strong>Año</strong> del presupuesto</li>
          <li>Ingresa la <strong>Comisión Total</strong> (obtenida del módulo de Comisiones)</li>
          <li>Define el <strong>Porcentaje de Inversión</strong> (ej: si invertirás el 80% ingresa 0.80)</li>
          <li>Completa la información del servicio:
            <ul className="list-disc list-inside ml-6 mt-1">
              <li><strong>Actividad:</strong> Descripción del servicio (ej: "Implementación SG-SST")</li>
              <li><strong>Horas/Unidades:</strong> Cantidad estimada</li>
              <li><strong>Costo por Hora/Unidad:</strong> Tarifa unitaria</li>
              <li><strong>Aliado:</strong> Selecciona quién ejecutará (opcional)</li>
            </ul>
          </li>
          <li>El sistema calculará automáticamente el <strong>Valor Total a Ejecutar</strong></li>
          <li>Haz clic en <strong>"Crear Presupuesto"</strong> para guardar</li>
        </ol>

        <h4 className="font-semibold mt-4 mb-2">🔗 Conexión con otros módulos:</h4>
        <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
          <p className="mb-2"><strong>← Comisiones:</strong> El presupuesto debe basarse en la comisión anual del cliente</p>
          <p className="mb-2"><strong>← Aliados:</strong> Puedes asignar un aliado específico para la ejecución</p>
          <p><strong>→ Órdenes de Servicio:</strong> Con base en este presupuesto se crean las órdenes de servicio para ejecutar las actividades</p>
        </div>

        <div className="bg-purple-50 border-l-4 border-purple-500 p-3 mt-3 mb-3">
          <h4 className="font-semibold text-purple-900 mb-2">📊 Cálculos Automáticos:</h4>
          <p className="text-sm text-purple-800">
            <strong>Inversión a Ejecutar</strong> = Comisión × Porcentaje de Inversión<br/>
            <strong>Valor Total a Ejecutar</strong> = Horas/Unidades × Costo Hora/Unidad
          </p>
        </div>

        <div className="bg-amber-50 border-l-4 border-amber-500 p-3 mt-3">
          <h4 className="font-semibold text-amber-900 mb-1">💡 Consejos:</h4>
          <ul className="list-disc list-inside text-sm text-amber-800 space-y-1">
            <li>Asegúrate de que el valor a ejecutar no supere la inversión disponible</li>
            <li>Actualiza el valor ejecutado conforme se van completando las órdenes de servicio</li>
            <li>Un cliente puede tener múltiples presupuestos para diferentes actividades</li>
          </ul>
        </div>
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
