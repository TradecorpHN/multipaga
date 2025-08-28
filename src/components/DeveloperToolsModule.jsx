import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card.jsx';
import { Button } from './ui/button.jsx';
import { Alert, AlertDescription } from './ui/alert.jsx';
import {
  Code, RefreshCw, AlertCircle, Key, Settings, GitBranch, Cloud
} from 'lucide-react';

const DeveloperToolsModule = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate fetching data or initializing developer tools
    const timer = setTimeout(() => {
      setLoading(false);
      // setError('Error al cargar las herramientas de desarrollador.');
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
            Herramientas de Desarrollador
          </h1>
          <p className="text-gray-600 mt-2">
            Gestiona tus claves API, webhooks y configuraciones de desarrollo
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            onClick={() => { /* Implement refresh logic */ }}
            variant="outline" 
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Secciones de Herramientas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Claves API */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
              <Key className="h-5 w-5 text-blue-600" />
              <span>Claves API</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Gestiona tus claves API públicas y secretas.</p>
            <Button variant="outline" size="sm">
              Ver Claves
            </Button>
          </CardContent>
        </Card>

        {/* Webhooks */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
              <GitBranch className="h-5 w-5 text-blue-600" />
              <span>Webhooks</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Configura y gestiona los webhooks para notificaciones de eventos.</p>
            <Button variant="outline" size="sm">
              Gestionar Webhooks
            </Button>
          </CardContent>
        </Card>

        {/* Configuración de Pagos */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
              <Settings className="h-5 w-5 text-blue-600" />
              <span>Configuración de Pagos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Ajusta la configuración de pagos para entornos de desarrollo.</p>
            <Button variant="outline" size="sm">
              Configurar Pagos
            </Button>
          </CardContent>
        </Card>

        {/* Entornos */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
              <Cloud className="h-5 w-5 text-blue-600" />
              <span>Entornos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Cambia entre entornos de desarrollo, prueba y producción.</p>
            <Button variant="outline" size="sm">
              Gestionar Entornos
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeveloperToolsModule;


