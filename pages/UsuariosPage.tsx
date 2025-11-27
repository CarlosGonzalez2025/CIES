
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
    const { password, ...profileData } = formData;

    if (selectedUsuario) {
      updateUsuario({ id: selectedUsuario.id, updates: profileData }, {
        onSuccess: handleCloseModal,
      });
    } else {
      // Create new user with password (handled by usuariosApi.createPerfil)
      createUsuario({
          ...profileData,
          password,
          modulos_autorizados: formData.rol === 'CLIENTE' ? ['/portal-cliente'] : formData.modulos_autorizados
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
      
      <ModuleGuide title="🔐 Guía del Módulo de Gestión de Usuarios">
        <p className="mb-3">
          El módulo de <strong>Usuarios</strong> controla quién tiene acceso al sistema CIES y qué permisos tiene cada persona. Es fundamental para la seguridad y el control de accesos.
        </p>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-3">
          <h4 className="font-semibold text-blue-900 mb-2">🎯 ¿Para qué sirve este módulo?</h4>
          <p className="text-sm text-blue-800">
            Gestionar los accesos al sistema, definiendo quién puede ver y editar cada módulo, garantizando la seguridad y confidencialidad de la información.
          </p>
        </div>

        <h4 className="font-semibold mt-4 mb-2">📝 Cómo crear un nuevo usuario:</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm ml-2">
          <li>Haz clic en el botón <strong>"Nuevo Usuario"</strong> en la parte superior derecha</li>
          <li>Completa la información básica:
            <ul className="list-disc list-inside ml-6 mt-1">
              <li><strong>Nombre Completo:</strong> Nombre del usuario</li>
              <li><strong>Correo Electrónico:</strong> Email para inicio de sesión</li>
              <li><strong>Contraseña Temporal:</strong> Password inicial (solo al crear)</li>
            </ul>
          </li>
          <li>Selecciona el <strong>Rol de Usuario</strong>:
            <ul className="list-disc list-inside ml-6 mt-1">
              <li><strong>Administrador:</strong> Acceso total a todos los módulos</li>
              <li><strong>Analista:</strong> Puede gestionar información, selecciona módulos autorizados</li>
              <li><strong>Solo Consulta:</strong> Solo visualización, selecciona módulos autorizados</li>
              <li><strong>Cliente:</strong> Acceso exclusivo al portal del cliente</li>
            </ul>
          </li>
          <li>Si seleccionaste <strong>Cliente</strong>:
            <ul className="list-disc list-inside ml-6 mt-1">
              <li>Aparecerá un campo <strong>"Cliente Asociado"</strong></li>
              <li>Selecciona el cliente al que pertenece este usuario</li>
              <li>El usuario solo verá información de ese cliente específico</li>
            </ul>
          </li>
          <li>Si seleccionaste <strong>Analista o Consulta</strong>:
            <ul className="list-disc list-inside ml-6 mt-1">
              <li>Marca los módulos a los que tendrá acceso</li>
              <li>Los módulos no marcados no serán visibles para este usuario</li>
            </ul>
          </li>
          <li>Marca el checkbox <strong>"Usuario Activo"</strong> para habilitar el acceso</li>
          <li>Haz clic en <strong>"Crear Usuario"</strong> para guardar</li>
        </ol>

        <h4 className="font-semibold mt-4 mb-2">👥 Tipos de Roles y Permisos:</h4>
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded p-3 text-sm mb-3">
          <div className="space-y-2">
            <div className="flex items-start">
              <span className="font-semibold text-purple-900 min-w-[120px]">ADMIN:</span>
              <span className="text-purple-800">Acceso completo a todos los módulos sin restricciones</span>
            </div>
            <div className="flex items-start">
              <span className="font-semibold text-blue-900 min-w-[120px]">ANALISTA:</span>
              <span className="text-blue-800">Puede crear, editar y eliminar registros en módulos autorizados</span>
            </div>
            <div className="flex items-start">
              <span className="font-semibold text-green-900 min-w-[120px]">CONSULTA:</span>
              <span className="text-green-800">Solo visualización de módulos autorizados, sin edición</span>
            </div>
            <div className="flex items-start">
              <span className="font-semibold text-orange-900 min-w-[120px]">CLIENTE:</span>
              <span className="text-orange-800">Acceso exclusivo a su portal financiero con sus datos</span>
            </div>
          </div>
        </div>

        <h4 className="font-semibold mt-4 mb-2">🔗 Conexión con otros módulos:</h4>
        <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
          <p className="mb-2"><strong>→ Portal Cliente:</strong> Los usuarios con rol CLIENTE verán automáticamente su portal personalizado</p>
          <p><strong>→ Todos los módulos:</strong> Los permisos aquí definidos controlan el acceso a cada módulo del sistema</p>
        </div>

        <div className="bg-red-50 border-l-4 border-red-500 p-3 mt-3 mb-3">
          <h4 className="font-semibold text-red-900 mb-2">⚠️ Importante - Seguridad:</h4>
          <ul className="list-disc list-inside text-sm text-red-800 space-y-1">
            <li>Verifica el correo antes de crear el usuario (no se puede cambiar después)</li>
            <li>No compartas las contraseñas temporales por canales inseguros</li>
            <li>Desactiva usuarios que ya no requieren acceso (desmarca "Usuario Activo")</li>
            <li>Solo crea usuarios ADMIN para personal de total confianza</li>
          </ul>
        </div>

        <div className="bg-amber-50 border-l-4 border-amber-500 p-3 mt-3">
          <h4 className="font-semibold text-amber-900 mb-1">💡 Consejos:</h4>
          <ul className="list-disc list-inside text-sm text-amber-800 space-y-1">
            <li>Crea usuarios CLIENTE para que tus clientes accedan a su información financiera</li>
            <li>Usa el rol CONSULTA para auditores o personal que solo necesita visualizar datos</li>
            <li>Revisa periódicamente los usuarios activos y sus permisos</li>
            <li>Usa la barra de búsqueda para encontrar usuarios por nombre o email</li>
          </ul>
        </div>
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
