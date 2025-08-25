import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card.jsx';
import { Button } from './ui/button.jsx';
import { Input } from './ui/input.jsx';
import { Alert, AlertDescription } from './ui/alert.jsx';
import { 
  Plug, 
  Search, 
  RefreshCw, 
  PlusCircle, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Settings
} from 'lucide-react';

const ConnectorsModule = () => {
  const [connectors, setConnectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchConnectors();
  }, []);

  const fetchConnectors = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simular una llamada a la API para obtener conectores
      // En una implementación real, esto usaría authService y API_ENDPOINTS
      const mockConnectors = [
        {
          id: 'conn_123',
          name: 'Stripe',
          type: 'Payment Processor',
          status: 'active',
          last_updated: '2024-08-15T10:00:00Z',
        },
        {
          id: 'conn_124',
          name: 'PayPal',
          type: 'Payment Processor',
          status: 'inactive',
          last_updated: '2024-08-14T15:30:00Z',
        },
        {
          id: 'conn_125',
          name: 'Adyen',
          type: 'Payment Processor',
          status: 'active',
          last_updated: '2024-08-16T09:00:00Z',
        },
        {
          id: 'conn_126',
          name: 'TaxJar',
          type: 'Tax Processor',
          status: 'active',
          last_updated: '2024-08-10T11:00:00Z',
        },
      ];
      setConnectors(mockConnectors);
    } catch (err) {
      console.error('Error fetching connectors:', err);
      setError('Error al cargar los conectores.');
    } finally {
      setLoading(false);
    }
  };

  const filteredConnectors = connectors.filter(connector =>
    connector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    connector.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-HN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white gradient-text">
            Gestión de Conectores
          </h1>
          <p className="text-gray-400 mt-2">
            Administra tus integraciones con proveedores de servicios
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            onClick={fetchConnectors}
            variant="outline" 
            size="sm"
            disabled={loading}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button variant="default" size="sm" className="button-primary">
            <PlusCircle className="h-4 w-4 mr-2" />
            Nuevo Conector
          </Button>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar conector por nombre o tipo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-card border-border text-foreground"
        />
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="bg-red-900/20 border-red-500/50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-200">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Lista de Conectores */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-gray-400">Cargando conectores...</span>
          </div>
        </div>
      ) : filteredConnectors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredConnectors.map(connector => (
            <Card key={connector.id} className="card-enhanced card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium text-white">
                  {connector.name}
                </CardTitle>
                <Plug className="h-5 w-5 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-400">
                  Tipo: <span className="font-semibold text-white">{connector.type}</span>
                </div>
                <div className="text-sm text-gray-400 flex items-center space-x-1 mt-1">
                  Estado: {getStatusIcon(connector.status)}
                  <span className="capitalize text-white">{connector.status === 'active' ? 'Activo' : 'Inactivo'}</span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Última actualización: {formatDate(connector.last_updated)}
                </div>
                <div className="mt-4 flex justify-end">
                  <Button variant="ghost" size="sm" className="text-blue-400 hover:bg-blue-900/20">
                    <Settings className="h-4 w-4 mr-1" />
                    Configurar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Plug className="h-16 w-16 mx-auto text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            No se encontraron conectores
          </h3>
          <p className="text-gray-400">
            Intenta ajustar tu búsqueda o agrega un nuevo conector.
          </p>
        </div>
      )}
    </div>
  );
};

export default ConnectorsModule;


