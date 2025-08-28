import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card.jsx';
import { Button } from './ui/button.jsx';
import { Alert, AlertDescription } from './ui/alert.jsx';
import {
  Settings, RefreshCw, AlertCircle, Trash2, Loader2
} from 'lucide-react';

const SettingsModule = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sampleDataDeleted, setSampleDataDeleted] = useState(false);

  const handleDeleteSampleData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call to delete sample data
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSampleDataDeleted(true);
      // In a real application, you would call an API here:
      // await settingsAPI.deleteSampleData();
    } catch (err) {
      console.error('Error deleting sample data:', err);
      setError('Error al eliminar los datos de muestra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
            Configuración de la Cuenta
          </h1>
          <p className="text-gray-600 mt-2">
            Gestiona la configuración de tu cuenta y el panel de control
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

      {/* Sección de Configuración Personal */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
            <Settings className="h-5 w-5 text-blue-600" />
            <span>Configuración Personal</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tarjeta: Eliminar Datos de Muestra */}
            <div className="flex flex-col bg-white border rounded-lg p-4 gap-4 shadow-sm">
              <h3 className="text-base font-semibold text-gray-800">Eliminar Datos de Muestra</h3>
              <p className="text-sm text-gray-600">Elimina todos los datos de muestra generados.</p>
              <Button 
                onClick={handleDeleteSampleData}
                variant="destructive" 
                size="sm"
                disabled={loading || sampleDataDeleted}
                className="w-fit"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                {sampleDataDeleted ? 'Datos Eliminados' : 'Eliminar Todo'}
              </Button>
              {sampleDataDeleted && (
                <p className="text-sm text-green-600 mt-2">Datos de muestra eliminados exitosamente.</p>
              )}
            </div>

            {/* Aquí se pueden añadir más tarjetas de configuración */}
            <div className="flex flex-col bg-white border rounded-lg p-4 gap-4 shadow-sm">
              <h3 className="text-base font-semibold text-gray-800">Gestión de Perfiles</h3>
              <p className="text-sm text-gray-600">Configura y gestiona tus perfiles de negocio.</p>
              <Button variant="outline" size="sm" className="w-fit">
                Ir a Perfiles
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsModule;


