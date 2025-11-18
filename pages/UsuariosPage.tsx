
import React, { useState, useMemo } from 'react';
import { useUsuarios } from '../hooks/useUsuarios';
import { UsuariosList } from '../components/usuarios/UsuariosList';
import { UsuarioForm } from '../components/usuarios/UsuarioForm';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { SearchBar } from '../components/shared/SearchBar';
import { Card } from '../components/ui/Card';
import type { PerfilUsuario } from '../types';
import type { UsuarioFormData } from '../schemas/usuarioSchema';
import { ModuleGuide } from '../components/shared/ModuleGuide';
import { v4 as uuidv4 } from 'uuid';

const UsuariosPage: React.FC = () => {
  const { usuarios, isLoading, createUsuario, updateUsuario, deleteUsuario, isCreating, isUpdating } = useUsuarios();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<PerfilUsuario | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleOpenModal = (usuario: PerfilUsuario | null = null) => {
    setSelectedUsuario(usuario);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedUsuario(null);
    setIsModalOpen(false);
  };

  const handleOpenConfirm = (usuario: PerfilUsuario) => {
    setSelectedUsuario(usuario);
    setIsConfirmOpen(true);
  };
  
  const handleCloseConfirm = () => {
    setSelectedUsuario(null);
    setIsConfirmOpen(false);
  };

  const handleSubmit = (formData: UsuarioFormData) => {
    // Note: In a real implementation, password handling would be done via Auth API.
    const { password, ...profileData } = formData;
    
    if (selectedUsuario) {
      updateUsuario({ id: selectedUsuario.id, updates: profileData }, {
        onSuccess: handleCloseModal,
      });
    } else {
      // Mocking ID generation for profile - in reality this comes from Auth.signUp
      createUsuario({ 
          ...profileData, 
          id: uuidv4(), 
          modulos_autorizados: formData.rol === 'ADMIN' ? [] : formData.modulos_autorizados // Admin gets all by logic, or store specifically
      }, {
        onSuccess: handleCloseModal,
      });
    }
  };

  const handleDelete = () => {
    if (selectedUsuario) {
      deleteUsuario(selectedUsuario.id, {
        onSuccess: handleCloseConfirm,
      });
    }
  };
  
  const filteredUsuarios = useMemo(() => {
    if (!usuarios) return [];
    return usuarios.filter(u =>
      (u.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
      (u.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [usuarios, searchQuery]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Gestión de Usuarios</h1>
            <p className="mt-1 text-sm text-gray-600">Administra los accesos y roles del sistema.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="mt-4 sm:mt-0">
          Nuevo Usuario
        </Button>
      </header>
      
      <ModuleGuide title="Seguridad y Accesos">
        <p>
          Desde aquí puedes controlar quién entra al sistema y qué puede ver.
        </p>
        <ul className="list-disc list-inside">
          <li><strong>Administrador:</strong> Tiene acceso total a todos los módulos.</li>
          <li><strong>Permisos:</strong> Puedes restringir el acceso a módulos sensibles (como Presupuestos o Comisiones) a usuarios específicos.</li>
        </ul>
      </ModuleGuide>

      <Card>
        <div className="p-4 border-b">
            <SearchBar onSearch={setSearchQuery} placeholder="Buscar por nombre o email..." />
        </div>
        <UsuariosList
          usuarios={filteredUsuarios}
          onEdit={handleOpenModal}
          onDelete={handleOpenConfirm}
          isLoading={isLoading}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
        size="lg"
      >
        <UsuarioForm 
          onSubmit={handleSubmit}
          onClose={handleCloseModal}
          defaultValues={selectedUsuario}
          isSubmitting={isCreating || isUpdating}
        />
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={handleCloseConfirm}
        onConfirm={handleDelete}
        title="Eliminar Usuario"
        message={`¿Estás seguro de que quieres eliminar a "${selectedUsuario?.nombre}"? Se revocará su acceso inmediatamente.`}
      />
    </div>
  );
};

export default UsuariosPage;
