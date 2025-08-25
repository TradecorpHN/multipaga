import React, { useState, useEffect, useCallback } from 'react';
import { useGetMethod, useApiUrl, usePagination, useFilters } from '../../../hooks/useApiMethods';
import { V2_ENTITY_TYPES } from '../../../APIUtils/APIUtils';
import { LogicUtils } from '../../../utils/LogicUtils';

// Componente principal del módulo de Orders
const OrdersModule = () => {
  const { getMethod, loading, error } = useGetMethod();
  const { buildUrl } = useApiUrl();
  const { 
    currentPage, 
    pageSize, 
    totalItems, 
    setTotalItems, 
    goToPage, 
    goToNextPage, 
    goToPreviousPage,
    hasNextPage,
    hasPreviousPage 
  } = usePagination(1, 10);
  
  const { 
    filters, 
    updateFilter, 
    clearFilters, 
    buildQueryString 
  } = useFilters({
    status: '',
    currency: '',
    amount_gte: '',
    amount_lte: '',
    created_gte: '',
    created_lte: ''
  });

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Función para cargar orders
  const loadOrders = useCallback(async () => {
    try {
      const queryParams = buildQueryString();
      const url = buildUrl(V2_ENTITY_TYPES.V2_ORDERS_LIST, {
        methodType: 'GET',
        queryParameters: `${queryParams}&limit=${pageSize}&offset=${(currentPage - 1) * pageSize}`
      });

      const response = await getMethod(url);
      
      if (response && response.data) {
        setOrders(response.data);
        setTotalItems(response.total_count || 0);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  }, [getMethod, buildUrl, buildQueryString, pageSize, currentPage, setTotalItems]);

  // Cargar orders al montar el componente y cuando cambien los filtros
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Función para obtener detalles de un order
  const getOrderDetails = useCallback(async (orderId) => {
    try {
      const url = buildUrl(V2_ENTITY_TYPES.V2_ORDERS_LIST, {
        methodType: 'GET',
        id: orderId
      });

      const response = await getMethod(url);
      setSelectedOrder(response);
    } catch (error) {
      console.error('Error loading order details:', error);
    }
  }, [getMethod, buildUrl]);

  // Función para formatear estado
  const formatStatus = (status) => {
    const statusColors = {
      'succeeded': 'text-green-600 bg-green-100',
      'failed': 'text-red-600 bg-red-100',
      'pending': 'text-yellow-600 bg-yellow-100',
      'processing': 'text-blue-600 bg-blue-100',
      'cancelled': 'text-gray-600 bg-gray-100'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'text-gray-600 bg-gray-100'}`}>
        {status?.toUpperCase() || 'UNKNOWN'}
      </span>
    );
  };

  // Función para formatear moneda
  const formatAmount = (amount, currency) => {
    return LogicUtils.formatCurrency(amount / 100, currency); // Convertir de centavos
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    return LogicUtils.formatDate(dateString, 'long');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Órdenes de Pago</h1>
          <p className="text-gray-600">Gestiona y monitorea todas las transacciones de pago</p>
        </div>
        <button
          onClick={loadOrders}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Cargando...' : 'Actualizar'}
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <h3 className="text-lg font-medium mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={filters.status}
              onChange={(e) => updateFilter('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="succeeded">Exitoso</option>
              <option value="failed">Fallido</option>
              <option value="pending">Pendiente</option>
              <option value="processing">Procesando</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
            <select
              value={filters.currency}
              onChange={(e) => updateFilter('currency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="COP">COP</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monto Mín.</label>
            <input
              type="number"
              value={filters.amount_gte}
              onChange={(e) => updateFilter('amount_gte', e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monto Máx.</label>
            <input
              type="number"
              value={filters.amount_lte}
              onChange={(e) => updateFilter('amount_lte', e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Desde</label>
            <input
              type="date"
              value={filters.created_gte}
              onChange={(e) => updateFilter('created_gte', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Hasta</label>
            <input
              type="date"
              value={filters.created_lte}
              onChange={(e) => updateFilter('created_lte', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end mt-4 space-x-2">
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Limpiar Filtros
          </button>
          <button
            onClick={loadOrders}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Aplicar Filtros
          </button>
        </div>
      </div>

      {/* Tabla de Orders */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID de Pago
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Método de Pago
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    Cargando órdenes...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No se encontraron órdenes
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.payment_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.payment_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatStatus(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatAmount(order.amount, order.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.customer_id || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.payment_method || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(order.created)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => getOrderDetails(order.payment_id)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Ver Detalles
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalItems > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={goToPreviousPage}
                disabled={!hasPreviousPage}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={goToNextPage}
                disabled={!hasNextPage}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando{' '}
                  <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span>
                  {' '}a{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * pageSize, totalItems)}
                  </span>
                  {' '}de{' '}
                  <span className="font-medium">{totalItems}</span>
                  {' '}resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={goToPreviousPage}
                    disabled={!hasPreviousPage}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    Página {currentPage}
                  </span>
                  <button
                    onClick={goToNextPage}
                    disabled={!hasNextPage}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de detalles del order */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Detalles del Pago: {selectedOrder.payment_id}
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
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
                    <div className="mt-1">{formatStatus(selectedOrder.status)}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Monto</label>
                    <div className="mt-1 text-lg font-semibold">
                      {formatAmount(selectedOrder.amount, selectedOrder.currency)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cliente ID</label>
                    <div className="mt-1">{selectedOrder.customer_id || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Método de Pago</label>
                    <div className="mt-1">{selectedOrder.payment_method || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha de Creación</label>
                    <div className="mt-1">{formatDate(selectedOrder.created)}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Última Actualización</label>
                    <div className="mt-1">{formatDate(selectedOrder.last_synced)}</div>
                  </div>
                </div>
                
                {selectedOrder.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Descripción</label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-md">{selectedOrder.description}</div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                {error.message || 'Ocurrió un error al cargar los datos'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersModule;

