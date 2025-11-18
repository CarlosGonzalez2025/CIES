
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center text-center p-4">
      <h1 className="text-6xl font-bold text-primary-600">404</h1>
      <h2 className="mt-4 text-2xl font-semibold text-gray-800">Página no encontrada</h2>
      <p className="mt-2 text-gray-600">
        Lo sentimos, la página que estás buscando no existe.
      </p>
      <Link to="/" className="mt-6">
        <Button>
          Volver al Inicio
        </Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
