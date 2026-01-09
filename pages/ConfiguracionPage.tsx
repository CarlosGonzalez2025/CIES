import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { User, Bell, Shield, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ConfiguracionPage() {
    const { user, profile } = useAuth();
    const [activeTab, setActiveTab] = useState('perfil');

    // Mock implementation for UI demonstration
    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success('Configuración guardada correctamente');
    };

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Configuración</h1>
                <p className="mt-1 text-sm text-gray-600">Administra tu perfil y las preferencias del sistema.</p>
            </header>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar de Configuración */}
                <aside className="w-full lg:w-64 space-y-2">
                    <ConfigTab
                        id="perfil"
                        label="Mi Perfil"
                        icon={<User className="w-4 h-4" />}
                        active={activeTab}
                        onClick={setActiveTab}
                    />
                    <ConfigTab
                        id="seguridad"
                        label="Seguridad"
                        icon={<Lock className="w-4 h-4" />}
                        active={activeTab}
                        onClick={setActiveTab}
                    />
                    <ConfigTab
                        id="notificaciones"
                        label="Notificaciones"
                        icon={<Bell className="w-4 h-4" />}
                        active={activeTab}
                        onClick={setActiveTab}
                    />
                    {profile?.rol === 'ADMIN' && (
                        <ConfigTab
                            id="sistema"
                            label="Parámetros Sistema"
                            icon={<Shield className="w-4 h-4" />}
                            active={activeTab}
                            onClick={setActiveTab}
                        />
                    )}
                </aside>

                {/* Contenido Principal */}
                <div className="flex-1">
                    {activeTab === 'perfil' && (
                        <Card className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Información Personal</h2>
                            <form onSubmit={handleSave} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Correo Electrónico"
                                        value={user?.email || ''}
                                        disabled
                                        className="bg-gray-100"
                                    />
                                    <Input
                                        label="Rol Asignado"
                                        value={profile?.rol || 'N/A'}
                                        disabled
                                        className="bg-gray-100"
                                    />
                                    <Input
                                        label="Nombre Completo"
                                        placeholder="Tu nombre"
                                        defaultValue={profile?.nombre || ''}
                                    />
                                    <Input
                                        label="Cargo / Título"
                                        placeholder="Ej. Analista Senior"
                                    />
                                </div>
                                <div className="pt-4 flex justify-end">
                                    <Button type="submit">Guardar Cambios</Button>
                                </div>
                            </form>
                        </Card>
                    )}

                    {activeTab === 'seguridad' && (
                        <Card className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Seguridad de la Cuenta</h2>
                            <form onSubmit={handleSave} className="space-y-4 max-w-lg">
                                <Input
                                    label="Contraseña Actual"
                                    type="password"
                                />
                                <Input
                                    label="Nueva Contraseña"
                                    type="password"
                                />
                                <Input
                                    label="Confirmar Nueva Contraseña"
                                    type="password"
                                />
                                <div className="pt-4">
                                    <Button type="submit" variant="secondary">Actualizar Contraseña</Button>
                                </div>
                            </form>
                        </Card>
                    )}

                    {activeTab === 'notificaciones' && (
                        <Card className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Preferencias de Notificación</h2>
                            <div className="space-y-4">
                                <ToggleOption label="Notificarme cuando se cree una Orden de Servicio" />
                                <ToggleOption label="Alertas de presupuesto bajo (< 20%)" defaultChecked />
                                <ToggleOption label="Resumen semanal por correo" />
                            </div>
                        </Card>
                    )}

                    {activeTab === 'sistema' && (
                        <Card className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Parámetros Globales (Admin)</h2>
                            <div className="space-y-4">
                                <Input label="IVA Global (%)" defaultValue="19" type="number" />
                                <Input label="Retención Default (%)" defaultValue="4" type="number" />
                                <div className="pt-4">
                                    <Button type="submit" variant="outline" onClick={() => toast.success('Parámetros actualizados')}>
                                        Actualizar Parámetros
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

const ConfigTab = ({ id, label, icon, active, onClick }: any) => (
    <button
        onClick={() => onClick(id)}
        className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${active === id
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

const ToggleOption = ({ label, defaultChecked = false }: any) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
        <span className="text-gray-700">{label}</span>
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked={defaultChecked} />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
    </div>
);
