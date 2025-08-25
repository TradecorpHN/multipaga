import React, { useState, useEffect, useCallback } from 'react';
import { useGetMethod, useUpdateMethod, useApiUrl } from '../../../hooks/useApiMethods';
import { V2_ENTITY_TYPES } from '../../../APIUtils/APIUtilsTypes';
import { LogicUtils } from '../../../utils/LogicUtils';

// Lista de conectores disponibles basada en los logos de Gateway
const AVAILABLE_CONNECTORS = [
  { id: 'stripe', name: 'Stripe', logo: '/hyperswitch/Gateway/STRIPE.svg', type: 'payment_processor' },
  { id: 'adyen', name: 'Adyen', logo: '/hyperswitch/Gateway/ADYEN.svg', type: 'payment_processor' },
  { id: 'paypal', name: 'PayPal', logo: '/hyperswitch/Gateway/PAYPAL.svg', type: 'payment_processor' },
  { id: 'square', name: 'Square', logo: '/hyperswitch/Gateway/SQUARE.svg', type: 'payment_processor' },
  { id: 'braintree', name: 'Braintree', logo: '/hyperswitch/Gateway/BRAINTREE.svg', type: 'payment_processor' },
  { id: 'checkout', name: 'Checkout.com', logo: '/hyperswitch/Gateway/CHECKOUT.svg', type: 'payment_processor' },
  { id: 'worldpay', name: 'Worldpay', logo: '/hyperswitch/Gateway/WORLDPAY.svg', type: 'payment_processor' },
  { id: 'cybersource', name: 'Cybersource', logo: '/hyperswitch/Gateway/CYBERSOURCE.svg', type: 'payment_processor' },
  { id: 'authorize_net', name: 'Authorize.Net', logo: '/hyperswitch/Gateway/AUTHORIZEDOTNET.svg', type: 'payment_processor' },
  { id: 'mollie', name: 'Mollie', logo: '/hyperswitch/Gateway/MOLLIE.svg', type: 'payment_processor' }
];

const ConnectorsModule = () => {
  const { getMethod, loading: getLoading, error: getError } = useGetMethod();
  const { updateMethod, loading: updateLoading, error: updateError } = useUpdateMethod();
  const { buildUrl } = useApiUrl();

  const [connectors, setConnectors] = useState([]);
  const [selectedConnector, setSelectedConnector] = useState(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configForm, setConfigForm] = useState({});

  // Función para cargar conectores configurados
  const loadConnectors = useCallback(async () => {
    try {
      const url = buildUrl(V2_ENTITY_TYPES.V2_CONNECTOR, {
        methodType: 'GET'
      });

      const response = await getMethod(url);
      
      if (response && response.data) {
        setConnectors(response.data);
      }
    } catch (error) {
      console.error('Error loading connectors:', error);
    }
  }, [getMethod, buildUrl]);

  // Cargar conectores al montar el componente
  useEffect(() => {
    loadConnectors();
  }, [loadConnectors]);

  // Función para obtener detalles de un conector
  const getConnectorDetails = useCallback(async (connectorId) => {
    try {
      const url = buildUrl(V2_ENTITY_TYPES.V2_CONNECTOR, {
        methodType: 'GET',
        id: connectorId
      });

      const response = await getMethod(url);
      setSelectedConnector(response);
    } catch (error) {
      console.error('Error loading connector details:', error);
    }
  }, [getMethod, buildUrl]);

  // Función para configurar un nuevo conector
  const configureConnector = useCallback(async (connectorData) => {
    try {
      const url = buildUrl(V2_ENTITY_TYPES.V2_CONNECTOR, {
        methodType: 'POST'
      });

      const response = await updateMethod(url, {
        bodyStr: JSON.stringify(connectorData),
        contentType: 'application/json'
      });

      if (response) {
        await loadConnectors();
        setShowConfigModal(false);
        setConfigForm({});
      }
    } catch (error) {
      console.error('Error configuring connector:', error);
    }
  }, [updateMethod, buildUrl, loadConnectors]);

  // Función para actualizar un conector existente
  const updateConnector = useCallback(async (connectorId, connectorData) => {
    try {
      const url = buildUrl(V2_ENTITY_TYPES.V2_CONNECTOR, {
        methodType: 'PUT',
        id: connectorId
      });

      const response = await updateMethod(url, {
        bodyStr: JSON.stringify(connectorData),
        contentType: 'application/json'
      });

      if (response) {
        await loadConnectors();
        setSelectedConnector(null);
      }
    } catch (error) {
      console.error('Error updating connector:', error);
    }
  }, [updateMethod, buildUrl, loadConnectors]);

  // Función para activar/desactivar conector
  const toggleConnectorStatus = useCallback(async (connectorId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await updateConnector(connectorId, { status: newStatus });
    } catch (error) {
      console.error('Error toggling connector status:', error);
    }
  }, [updateConnector]);

  // Función para abrir modal de configuración
  const openConfigModal = (connector) => {
    setConfigForm({
      connector_name: connector.id,
      connector_type: connector.type,
      business_country: 'US',
      business_label: '',
      connector_label: '',
      test_mode: true,
      disabled: false,
      payment_methods_enabled: [],
      metadata: {},
      connector_account_details: {}
    });
    setShowConfigModal(true);
  };

  // Función para manejar cambios en el formulario
  const handleFormChange = (field, value) => {
    setConfigForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Función para enviar configuración
  const handleSubmitConfig = (e) => {
    e.preventDefault();
    configureConnector(configForm);
  };

  // Función para formatear estado
  const formatStatus = (status) => {
    const statusColors = {
      'active': 'text-green-600 bg-green-100',
      'inactive': 'text-red-600 bg-red-100',
      'pending': 'text-yellow-600 bg-yellow-100'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'text-gray-600 bg-gray-100'}`}>
        {status?.toUpperCase() || 'UNKNOWN'}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Conectores de Pago</h1>
          <p className="text-gray-600">Configura y gestiona los procesadores de pago</p>
        </div>
        <button
          onClick={loadConnectors}
          disabled={getLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {getLoading ? 'Cargando...' : 'Actualizar'}
        </button>
      </div>

      {/* Conectores Disponibles */}
      <div className="bg-white rounded-lg shadow border">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Conectores Disponibles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {AVAILABLE_CONNECTORS.map((connector) => {
              const isConfigured = connectors.some(c => c.connector_name === connector.id);
              const configuredConnector = connectors.find(c => c.connector_name === connector.id);
              
              return (
                <div key={connector.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3 mb-3">
                    <img 
                      src={connector.logo} 
                      alt={connector.name}
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">{connector.name}</h3>
                      <p className="text-sm text-gray-500">{connector.type.replace('_', ' ')}</p>
                    </div>
                  </div>
                  
                  {isConfigured ? (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Estado:</span>
                        {formatStatus(configuredConnector.status)}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => getConnectorDetails(configuredConnector.merchant_connector_id)}
                          className="flex-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                        >
                          Ver Detalles
                        </button>
                        <button
                          onClick={() => toggleConnectorStatus(configuredConnector.merchant_connector_id, configuredConnector.status)}
                          disabled={updateLoading}
                          className={`flex-1 px-3 py-1 text-sm rounded ${
                            configuredConnector.status === 'active' 
                              ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {configuredConnector.status === 'active' ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => openConfigModal(connector)}
                      className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Configurar
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Conectores Configurados */}
      <div className="bg-white rounded-lg shadow border">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Conectores Configurados</h2>
          {connectors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay conectores configurados
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Conector
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Etiqueta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Modo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {connectors.map((connector) => (
                    <tr key={connector.merchant_connector_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {connector.connector_name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatStatus(connector.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {connector.connector_label || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {connector.test_mode ? 'Test' : 'Producción'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => getConnectorDetails(connector.merchant_connector_id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Ver Detalles
                        </button>
                        <button
                          onClick={() => toggleConnectorStatus(connector.merchant_connector_id, connector.status)}
                          disabled={updateLoading}
                          className={`${
                            connector.status === 'active' 
                              ? 'text-red-600 hover:text-red-900' 
                              : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {connector.status === 'active' ? 'Desactivar' : 'Activar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Configuración */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <form onSubmit={handleSubmitConfig}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Configurar Conector: {configForm.connector_name}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Etiqueta del Negocio
                  </label>
                  <input
                    type="text"
                    value={configForm.business_label}
                    onChange={(e) => handleFormChange('business_label', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Etiqueta del Conector
                  </label>
                  <input
                    type="text"
                    value={configForm.connector_label}
                    onChange={(e) => handleFormChange('connector_label', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    País del Negocio
                  </label>
                  <select
                    value={configForm.business_country}
                    onChange={(e) => handleFormChange('business_country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="US">Estados Unidos</option>
                    <option value="CO">Colombia</option>
                    <option value="MX">México</option>
                    <option value="BR">Brasil</option>
                    <option value="AR">Argentina</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="test_mode"
                    checked={configForm.test_mode}
                    onChange={(e) => handleFormChange('test_mode', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="test_mode" className="ml-2 block text-sm text-gray-900">
                    Modo de Prueba
                  </label>
                </div>
              </div>

              <div className="flex justify-end mt-6 space-x-3">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {updateLoading ? 'Configurando...' : 'Configurar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Detalles del Conector */}
      {selectedConnector && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Detalles del Conector: {selectedConnector.connector_name}
              </h3>
              <button
                onClick={() => setSelectedConnector(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado</label>
                  <div className="mt-1">{formatStatus(selectedConnector.status)}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Modo</label>
                  <div className="mt-1">{selectedConnector.test_mode ? 'Prueba' : 'Producción'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Etiqueta del Negocio</label>
                  <div className="mt-1">{selectedConnector.business_label || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Etiqueta del Conector</label>
                  <div className="mt-1">{selectedConnector.connector_label || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">País del Negocio</label>
                  <div className="mt-1">{selectedConnector.business_country || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">ID del Conector</label>
                  <div className="mt-1 text-xs font-mono">{selectedConnector.merchant_connector_id}</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setSelectedConnector(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error messages */}
      {(getError || updateError) && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                {getError?.message || updateError?.message || 'Ocurrió un error'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectorsModule;

