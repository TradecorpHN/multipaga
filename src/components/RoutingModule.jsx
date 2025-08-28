import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card.jsx';
import { Button } from './ui/button.jsx';
import { Input } from './ui/input.jsx';
import { Alert, AlertDescription } from './ui/alert.jsx';
import {
  Route, Search, Filter, RefreshCw, PlusCircle, AlertCircle, Loader2
} from 'lucide-react';

const RoutingModule = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate fetching data
    const timer = setTimeout(() => {
      setLoading(false);
      // setError('Error al cargar la configuración de enrutamiento.');
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
            Gestión de Enrutamiento
          </h1>
          <p className="text-gray-600 mt-2">
            Configura y gestiona las reglas de enrutamiento de pagos
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
          <Button variant="outline" size="sm">
            <PlusCircle className="h-4 w-4 mr-2" />
            Nueva Regla
          </Button>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
            <Filter className="h-5 w-5 text-blue-600" />
            <span>Filtros y Búsqueda</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar reglas de enrutamiento..."
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Contenido principal del módulo */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
            <Route className="h-5 w-5 text-blue-600" />
            <span>Reglas de Enrutamiento Activas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <span className="text-gray-600">Cargando reglas de enrutamiento...</span>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="h-16 w-16 mx-auto text-red-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Error al cargar las reglas de enrutamiento
              </h3>
              <p className="text-gray-600">
                Por favor, inténtalo de nuevo más tarde.
              </p>
            </div>
          ) : (
            <div className="text-center py-12">
              <Route className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                No hay reglas de enrutamiento configuradas
              </h3>
              <p className="text-gray-600">
                Puedes crear nuevas reglas para optimizar tus pagos.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RoutingModule;


