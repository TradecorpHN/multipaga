import React, { useState, useEffect } from 'react';
import { paymentsAPI } from '../lib/api.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.jsx';
import { Button } from './ui/button.jsx';
import { Input } from './ui/input.jsx';
import { Badge } from './ui/badge.jsx';
import { Alert, AlertDescription } from './ui/alert.jsx';
import PaymentProcessor from './PaymentProcessor.jsx';
import { 
  CreditCard, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  ArrowUpDown,
  Loader2,
  Plus
} from 'lucide-react';

const PaymentsModule = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentProcessor, setShowPaymentProcessor] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    dateRange: 'today'
  });
  const [pagination, setPagination] = useState({
    offset: 0,
    limit: 20,
    total: 0
  });

  useEffect(() => {
    loadPayments();
  }, [filters, pagination.offset]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError(null);

      // Construir parámetros de filtro
      const params = {
        limit: pagination.limit,
        offset: pagination.offset
      };

      // Agregar filtros de fecha
      if (filters.dateRange !== 'all') {
        const now = new Date();
        let startTime;
        
        switch (filters.dateRange) {
          case 'today':
            startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'week':
            startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startTime = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          default:
            startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        }

        params.time_range = {
          start_time: startTime.toISOString(),
          end_time: now.toISOString()
        };
      }

      // Agregar filtro de estado
      if (filters.status !== 'all') {
        params.status = [filters.status];
      }

      const response = await paymentsAPI.getPayments(params);
      
      setPayments(response.data?.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.data?.total_count || 0
      }));

    } catch (error) {
      console.error('Error cargando pagos:', error);
      setError(error.response?.data?.message || 'Error cargando pagos');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({
      ...prev,
      offset: 0
    }));
  };

  const formatAmount = (amount, currency = 'USD') => {
    if (!amount) return '$0.00';
    const value = amount / 100;
    return new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency: currency === 'HNL' ? 'HNL' : 'USD'
    }).format(value);
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

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'succeeded':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      succeeded: { variant: 'success', label: 'Exitoso', className: 'bg-green-100 text-green-800' },
      failed: { variant: 'destructive', label: 'Fallido', className: 'bg-red-100 text-red-800' },
      processing: { variant: 'warning', label: 'Procesando', className: 'bg-yellow-100 text-yellow-800' },
      pending: { variant: 'secondary', label: 'Pendiente', className: 'bg-blue-100 text-blue-800' }
    };

    const config = statusConfig[status?.toLowerCase()] || { 
      variant: 'secondary', 
      label: status,
      className: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getPaymentMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case 'card':
        return <CreditCard className="h-4 w-4" />;
      case 'bank_transfer':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const handlePageChange = (newOffset) => {
    setPagination(prev => ({
      ...prev,
      offset: newOffset
    }));
  };

  const handlePaymentComplete = (paymentIntent) => {
    console.log('Pago completado:', paymentIntent);
    setShowPaymentProcessor(false);
    // Recargar la lista de pagos para mostrar el nuevo pago
    loadPayments();
  };

  const handleBackFromProcessor = () => {
    setShowPaymentProcessor(false);
  };

  // Si se está mostrando el procesador de pagos, renderizarlo
  if (showPaymentProcessor) {
    return (
      <PaymentProcessor 
        onBack={handleBackFromProcessor}
        onPaymentComplete={handlePaymentComplete}
      />
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
            Gestión de Pagos
          </h1>
          <p className="text-gray-600 mt-2">
            Monitorea y gestiona todas las transacciones de pago
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            onClick={() => setShowPaymentProcessor(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Pago
          </Button>
          <Button 
            onClick={loadPayments}
            variant="outline" 
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
            <Filter className="h-5 w-5 text-blue-600" />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="ID de pago, email..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Estado</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los estados</option>
                <option value="succeeded">Exitoso</option>
                <option value="failed">Fallido</option>
                <option value="processing">Procesando</option>
                <option value="pending">Pendiente</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Período</label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="today">Hoy</option>
                <option value="week">Última semana</option>
                <option value="month">Último mes</option>
                <option value="all">Todo el tiempo</option>
              </select>
            </div>
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

      {/* Tabla de Pagos */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <span>Transacciones</span>
            </div>
            <Badge variant="outline">
              {pagination.total} total
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <span className="text-gray-600">Cargando pagos...</span>
              </div>
            </div>
          ) : payments.length > 0 ? (
            <div className="space-y-4">
              {/* Header de tabla */}
              <div className="grid grid-cols-12 gap-4 p-3 bg-gray-50 rounded-lg text-sm font-medium text-gray-700">
                <div className="col-span-3 flex items-center space-x-2">
                  <ArrowUpDown className="h-3 w-3" />
                  <span>ID / Cliente</span>
                </div>
                <div className="col-span-2">Método</div>
                <div className="col-span-2">Monto</div>
                <div className="col-span-2">Estado</div>
                <div className="col-span-2">Fecha</div>
                <div className="col-span-1">Acciones</div>
              </div>

              {/* Filas de datos */}
              {payments.map((payment, index) => (
                <div key={payment.payment_id || index} className="grid grid-cols-12 gap-4 p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="col-span-3">
                    <p className="font-medium text-gray-800 text-sm">
                      {payment.payment_id || `pay_${index}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {payment.customer_email || 'cliente@ejemplo.com'}
                    </p>
                  </div>
                  
                  <div className="col-span-2 flex items-center space-x-2">
                    {getPaymentMethodIcon(payment.payment_method)}
                    <span className="text-sm text-gray-700 capitalize">
                      {payment.payment_method || 'card'}
                    </span>
                  </div>
                  
                  <div className="col-span-2">
                    <p className="font-semibold text-gray-800">
                      {formatAmount(payment.amount, payment.currency)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {payment.currency || 'USD'}
                    </p>
                  </div>
                  
                  <div className="col-span-2 flex items-center space-x-2">
                    {getStatusIcon(payment.status)}
                    {getStatusBadge(payment.status)}
                  </div>
                  
                  <div className="col-span-2">
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(payment.created || new Date().toISOString())}</span>
                    </div>
                  </div>
                  
                  <div className="col-span-1">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {/* Paginación */}
              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Mostrando {pagination.offset + 1} a {Math.min(pagination.offset + pagination.limit, pagination.total)} de {pagination.total} resultados
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(Math.max(0, pagination.offset - pagination.limit))}
                    disabled={pagination.offset === 0}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.offset + pagination.limit)}
                    disabled={pagination.offset + pagination.limit >= pagination.total}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <CreditCard className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                No hay pagos disponibles
              </h3>
              <p className="text-gray-600">
                Los pagos aparecerán aquí cuando se procesen transacciones
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentsModule;

