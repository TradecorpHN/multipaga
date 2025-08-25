import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthProvider.jsx';
import { paymentsAPI, analyticsAPI } from '../lib/api.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.jsx';
import { Alert, AlertDescription } from './ui/alert.jsx';
import { Badge } from './ui/badge.jsx';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  Users, 
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  Calendar,
  Loader2
} from 'lucide-react';

const Dashboard = () => {
  const { user, merchantInfo } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    payments: [],
    analytics: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true, error: null }));

      // Obtener datos de pagos recientes
      const paymentsResponse = await paymentsAPI.getPayments({
        limit: 10,
        offset: 0
      });

      // Obtener métricas de analítica
      const analyticsResponse = await analyticsAPI.getPaymentMetrics('payments', {
        time_range: {
          start_time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Últimas 24 horas
          end_time: new Date().toISOString()
        }
      });

      setDashboardData({
        payments: paymentsResponse.data?.data || [],
        analytics: analyticsResponse.data,
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
      setDashboardData(prev => ({
        ...prev,
        loading: false,
        error: error.response?.data?.message || 'Error cargando datos'
      }));
    }
  };

  const formatAmount = (amount, currency = 'USD') => {
    if (!amount) return '$0.00';
    const value = amount / 100; // Hyperswitch usa centavos
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
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      succeeded: { variant: 'success', label: 'Exitoso' },
      failed: { variant: 'destructive', label: 'Fallido' },
      processing: { variant: 'warning', label: 'Procesando' },
      pending: { variant: 'secondary', label: 'Pendiente' }
    };

    const config = statusConfig[status?.toLowerCase()] || { variant: 'secondary', label: status };
    
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  if (dashboardData.loading) {
    return (
      <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-lg text-gray-600">Cargando datos...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Bienvenido de nuevo, {user?.name || 'Usuario'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Conectado - Sandbox</span>
            </div>
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Honduras 🇭🇳
          </Badge>
        </div>
      </div>

      {/* Error Alert */}
      {dashboardData.error && (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-700">
            {dashboardData.error}
          </AlertDescription>
        </Alert>
      )}

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">
              Transacciones Hoy
            </CardTitle>
            <CreditCard className="h-4 w-4 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.analytics?.total_count || dashboardData.payments.length}
            </div>
            <p className="text-xs text-blue-200 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12.5% vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-100">
              Volumen Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.analytics?.total_amount 
                ? formatAmount(dashboardData.analytics.total_amount)
                : formatAmount(dashboardData.payments.reduce((sum, payment) => sum + (payment.amount || 0), 0))
              }
            </div>
            <p className="text-xs text-green-200 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8.3% vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">
              Tasa de Éxito
            </CardTitle>
            <Activity className="h-4 w-4 text-purple-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.analytics?.success_rate 
                ? `${dashboardData.analytics.success_rate.toFixed(1)}%`
                : `${((dashboardData.payments.filter(p => p.status === 'succeeded').length / dashboardData.payments.length) * 100 || 0).toFixed(1)}%`
              }
            </div>
            <p className="text-xs text-purple-200 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +0.8% vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-cyan-100">
              Conectores Activos
            </CardTitle>
            <Users className="h-4 w-4 text-cyan-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.analytics?.active_connectors || 8}
            </div>
            <p className="text-xs text-cyan-200 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +9.7% vs período anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contenido principal en dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actividad Reciente */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <span>Actividad Reciente</span>
            </CardTitle>
            <CardDescription>
              Últimas transacciones procesadas en Honduras
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.payments.length > 0 ? (
                dashboardData.payments.slice(0, 5).map((payment, index) => (
                  <div key={payment.payment_id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(payment.status)}
                      <div>
                        <p className="font-medium text-gray-800">
                          {payment.payment_id || `pay_HN00${index + 1}`}
                        </p>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(payment.created || new Date().toISOString())}</span>
                        </div>
                        {payment.customer_email && (
                          <p className="text-xs text-gray-500">{payment.customer_email}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">
                        {formatAmount(payment.amount, payment.currency)}
                      </p>
                      {getStatusBadge(payment.status)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay transacciones recientes</p>
                  <p className="text-sm">Las transacciones aparecerán aquí cuando se procesen</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Estado del Sistema */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Estado del Sistema</span>
            </CardTitle>
            <CardDescription>
              Monitoreo de conectores y servicios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium text-gray-800">FICOHSA</p>
                    <p className="text-sm text-gray-600">Uptime: 99.9%</p>
                  </div>
                </div>
                <Badge variant="success">Activo</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium text-gray-800">Banco Atlántida</p>
                    <p className="text-sm text-gray-600">Uptime: 98.7%</p>
                  </div>
                </div>
                <Badge variant="success">Activo</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium text-gray-800">Tigo Money</p>
                    <p className="text-sm text-gray-600">Uptime: 97.2%</p>
                  </div>
                </div>
                <Badge variant="success">Activo</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="font-medium text-gray-800">ENEE</p>
                    <p className="text-sm text-gray-600">Uptime: 95.1%</p>
                  </div>
                </div>
                <Badge variant="warning">Mantenimiento</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información adicional */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <span>Cobertura Honduras</span>
          </CardTitle>
          <CardDescription>
            Servicios disponibles en todo el territorio nacional
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="font-bold text-blue-600">18</p>
              <p className="text-sm text-gray-600">Departamentos</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="font-bold text-green-600">298</p>
              <p className="text-sm text-gray-600">Municipios</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="font-bold text-purple-600">8</p>
              <p className="text-sm text-gray-600">Bancos Conectados</p>
            </div>
            <div className="text-center p-3 bg-cyan-50 rounded-lg">
              <p className="font-bold text-cyan-600">24/7</p>
              <p className="text-sm text-gray-600">Disponibilidad</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

