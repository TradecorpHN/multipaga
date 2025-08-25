import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthProvider.jsx';
import { authService, API_ENDPOINTS } from '../lib/auth.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.jsx';
import { Button } from './ui/button.jsx';
import { Badge } from './ui/badge.jsx';
import { Alert, AlertDescription } from './ui/alert.jsx';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  Users, 
  RefreshCw,
  Calendar,
  Download,
  Filter,
  AlertCircle,
  CheckCircle,
  Clock,
  Globe
} from 'lucide-react';

const AnalyticsModule = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('7d'); // 1d, 7d, 30d, 90d
  const [analyticsData, setAnalyticsData] = useState({
    payments: null,
    refunds: null,
    sdk: null,
    summary: null
  });

  // Colores para gráficos basados en el tema
  const chartColors = {
    primary: '#1E7EF7',
    secondary: '#42A5F5',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#06b6d4'
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const baseURL = authService.baseURL;
      const token = authService.getAuthToken();
      const merchantId = authService.getMerchantId();

      if (!token || !merchantId) {
        throw new Error('No hay token de autenticación o merchant ID');
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      // Calcular fechas basadas en el rango seleccionado
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '1d':
          startDate.setDate(endDate.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        default:
          startDate.setDate(endDate.getDate() - 7);
      }

      const queryParams = new URLSearchParams({
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        granularity: timeRange === '1d' ? 'hour' : 'day'
      });

      // Fetch datos de pagos
      const paymentsResponse = await fetch(
        `${baseURL}${API_ENDPOINTS.ANALYTICS_PAYMENTS}?${queryParams}`,
        { headers }
      );

      // Fetch datos de reembolsos
      const refundsResponse = await fetch(
        `${baseURL}${API_ENDPOINTS.ANALYTICS_REFUNDS}?${queryParams}`,
        { headers }
      );

      // Fetch datos del SDK
      const sdkResponse = await fetch(
        `${baseURL}${API_ENDPOINTS.ANALYTICS_SDK}?${queryParams}`,
        { headers }
      );

      const [paymentsData, refundsData, sdkData] = await Promise.all([
        paymentsResponse.ok ? paymentsResponse.json() : null,
        refundsResponse.ok ? refundsResponse.json() : null,
        sdkResponse.ok ? sdkResponse.json() : null
      ]);

      // Procesar y estructurar los datos
      const processedData = {
        payments: paymentsData,
        refunds: refundsData,
        sdk: sdkData,
        summary: calculateSummary(paymentsData, refundsData)
      };

      setAnalyticsData(processedData);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (paymentsData, refundsData) => {
    if (!paymentsData) return null;

    const totalPayments = paymentsData.queryData?.reduce((sum, item) => sum + (item.count || 0), 0) || 0;
    const totalAmount = paymentsData.queryData?.reduce((sum, item) => sum + (item.total_amount || 0), 0) || 0;
    const successfulPayments = paymentsData.queryData?.reduce((sum, item) => sum + (item.successful_count || 0), 0) || 0;
    const failedPayments = totalPayments - successfulPayments;
    const successRate = totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0;

    const totalRefunds = refundsData?.queryData?.reduce((sum, item) => sum + (item.count || 0), 0) || 0;
    const refundAmount = refundsData?.queryData?.reduce((sum, item) => sum + (item.total_amount || 0), 0) || 0;

    return {
      totalPayments,
      totalAmount,
      successfulPayments,
      failedPayments,
      successRate,
      totalRefunds,
      refundAmount,
      averageTicket: totalPayments > 0 ? totalAmount / totalPayments : 0
    };
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount / 100); // Hyperswitch usa centavos
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('es-HN').format(number);
  };

  const getTimeRangeLabel = (range) => {
    const labels = {
      '1d': 'Último día',
      '7d': 'Últimos 7 días',
      '30d': 'Últimos 30 días',
      '90d': 'Últimos 90 días'
    };
    return labels[range] || labels['7d'];
  };

  const prepareChartData = (data) => {
    if (!data?.queryData) return [];
    
    return data.queryData.map(item => ({
      date: new Date(item.time_bucket).toLocaleDateString('es-HN', { 
        month: 'short', 
        day: 'numeric' 
      }),
      payments: item.count || 0,
      amount: (item.total_amount || 0) / 100,
      successful: item.successful_count || 0,
      failed: (item.count || 0) - (item.successful_count || 0)
    }));
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Analítica</h1>
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin text-blue-400" />
            <span className="text-blue-200">Cargando datos...</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="card-enhanced animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-600 rounded mb-2"></div>
                <div className="h-8 bg-gray-600 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert className="bg-red-900/20 border-red-500/50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-200">
            Error cargando analítica: {error}
          </AlertDescription>
        </Alert>
        <Button 
          onClick={fetchAnalyticsData} 
          className="mt-4 button-primary"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reintentar
        </Button>
      </div>
    );
  }

  const chartData = prepareChartData(analyticsData.payments);
  const { summary } = analyticsData;

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-white gradient-text">Analítica</h1>
          <p className="text-gray-400 mt-1">
            Métricas y estadísticas de tu negocio • {getTimeRangeLabel(timeRange)}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Selector de rango de tiempo */}
          <div className="flex space-x-1 p-1 bg-black/20 rounded-lg">
            {['1d', '7d', '30d', '90d'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {getTimeRangeLabel(range)}
              </button>
            ))}
          </div>
          
          <Button
            onClick={fetchAnalyticsData}
            variant="outline"
            size="sm"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Métricas principales */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="card-enhanced card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Pagos</p>
                  <p className="text-2xl font-bold text-white">
                    {formatNumber(summary.totalPayments)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-blue-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
                <span className="text-sm text-green-400">+12.5%</span>
                <span className="text-sm text-gray-400 ml-1">vs período anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card className="card-enhanced card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Volumen Total</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(summary.totalAmount)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
                <span className="text-sm text-green-400">+8.2%</span>
                <span className="text-sm text-gray-400 ml-1">vs período anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card className="card-enhanced card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Tasa de Éxito</p>
                  <p className="text-2xl font-bold text-white">
                    {summary.successRate.toFixed(1)}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <Badge className="badge-success">
                  Excelente
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="card-enhanced card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Ticket Promedio</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(summary.averageTicket)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
                <span className="text-sm text-green-400">+5.7%</span>
                <span className="text-sm text-gray-400 ml-1">vs período anterior</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de volumen de pagos */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-white">Volumen de Pagos</CardTitle>
            <CardDescription className="text-gray-400">
              Evolución del volumen de transacciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke={chartColors.primary} 
                  fill={`${chartColors.primary}20`}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de número de transacciones */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-white">Número de Transacciones</CardTitle>
            <CardDescription className="text-gray-400">
              Exitosas vs Fallidas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }} 
                />
                <Legend />
                <Bar dataKey="successful" fill={chartColors.success} name="Exitosas" />
                <Bar dataKey="failed" fill={chartColors.error} name="Fallidas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Información adicional */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Globe className="h-5 w-5 mr-2 text-blue-400" />
              Conectores Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Stripe</span>
                <Badge className="badge-success">Activo</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">PayPal</span>
                <Badge className="badge-success">Activo</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Adyen</span>
                <Badge className="badge-warning">Configurando</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Clock className="h-5 w-5 mr-2 text-purple-400" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-gray-300">Pago exitoso - $125.00</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-gray-300">Nuevo cliente registrado</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-gray-300">Reembolso procesado - $45.00</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-white">Resumen de Reembolsos</CardTitle>
          </CardHeader>
          <CardContent>
            {summary && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Total Reembolsos</span>
                  <span className="text-white font-semibold">
                    {formatNumber(summary.totalRefunds)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Monto Reembolsado</span>
                  <span className="text-white font-semibold">
                    {formatCurrency(summary.refundAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Tasa de Reembolso</span>
                  <span className="text-white font-semibold">
                    {summary.totalPayments > 0 
                      ? ((summary.totalRefunds / summary.totalPayments) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsModule;

