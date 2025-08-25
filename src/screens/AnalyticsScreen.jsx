// AnalyticsScreen.jsx - Pantalla de analytics y reportes
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  CreditCard, 
  Users, 
  Activity,
  Calendar,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import { useDataStore, useUIStore, useAuthStore } from '../Recoils/GlobalState';
import { useApiMethods } from '../hooks/useApiMethods';

const AnalyticsScreen = () => {
  const { analytics, setAnalytics, setAnalyticsLoading } = useDataStore();
  const { addNotification } = useUIStore();
  const { merchantId, profileId } = useAuthStore();
  const { fetchAnalytics } = useApiMethods();
  
  const [dateRange, setDateRange] = useState('7d');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  // Datos de ejemplo para analytics
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalRevenue: 0,
      totalTransactions: 0,
      successRate: 0,
      averageOrderValue: 0,
      growth: {
        revenue: 0,
        transactions: 0,
        successRate: 0,
        averageOrderValue: 0
      }
    },
    timeSeriesData: [],
    connectorPerformance: [],
    paymentMethodBreakdown: [],
    geographicDistribution: [],
    topCustomers: [],
    failureAnalysis: []
  });

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange, merchantId, profileId]);

  const loadAnalyticsData = async () => {
    try {
      setAnalyticsLoading(true);
      
      // Simular datos de analytics
      const analyticsData = await fetchAnalytics({ dateRange });
      setAnalyticsData({
        overview: analyticsData.overview || {},
        timeSeriesData: analyticsData.time_series_data || [],
        connectorPerformance: analyticsData.connector_performance || [],
        paymentMethodBreakdown: analyticsData.payment_method_breakdown || [],
        geographicDistribution: analyticsData.geographic_distribution || [],
        topCustomers: analyticsData.top_customers || [],
        failureAnalysis: analyticsData.failure_analysis || []
      });
      setAnalytics(analyticsData);
      
    } catch (error) {
      console.error('Error loading analytics data:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load analytics data'
      });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleExport = () => {
    addNotification({
      type: 'info',
      title: 'Export',
      message: 'Analytics export functionality will be implemented'
    });
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  const getGrowthColor = (growth) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGrowthIcon = (growth) => {
    if (growth > 0) return <TrendingUp className="h-4 w-4" />;
    if (growth < 0) return <TrendingDown className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">
            Insights and performance metrics for your payments
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analyticsData.overview.totalRevenue)}
            </div>
            <p className={`text-xs flex items-center mt-1 ${getGrowthColor(analyticsData.overview.growth.revenue)}`}>
              {getGrowthIcon(analyticsData.overview.growth.revenue)}
              <span className="ml-1">
                {analyticsData.overview.growth.revenue > 0 ? '+' : ''}
                {formatPercentage(analyticsData.overview.growth.revenue)} from last period
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.overview.totalTransactions.toLocaleString()}
            </div>
            <p className={`text-xs flex items-center mt-1 ${getGrowthColor(analyticsData.overview.growth.transactions)}`}>
              {getGrowthIcon(analyticsData.overview.growth.transactions)}
              <span className="ml-1">
                {analyticsData.overview.growth.transactions > 0 ? '+' : ''}
                {formatPercentage(analyticsData.overview.growth.transactions)} from last period
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(analyticsData.overview.successRate)}
            </div>
            <p className={`text-xs flex items-center mt-1 ${getGrowthColor(analyticsData.overview.growth.successRate)}`}>
              {getGrowthIcon(analyticsData.overview.growth.successRate)}
              <span className="ml-1">
                {analyticsData.overview.growth.successRate > 0 ? '+' : ''}
                {formatPercentage(analyticsData.overview.growth.successRate)} from last period
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analyticsData.overview.averageOrderValue)}
            </div>
            <p className={`text-xs flex items-center mt-1 ${getGrowthColor(analyticsData.overview.growth.averageOrderValue)}`}>
              {getGrowthIcon(analyticsData.overview.growth.averageOrderValue)}
              <span className="ml-1">
                {analyticsData.overview.growth.averageOrderValue > 0 ? '+' : ''}
                {formatPercentage(analyticsData.overview.growth.averageOrderValue)} from last period
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos y análisis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rendimiento por conector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Connector Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.connectorPerformance.map((connector) => (
                <div key={connector.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <img 
                        src={`/hyperswitch/${connector.name.toUpperCase()}.svg`}
                        alt={connector.name}
                        className="w-6 h-6"
                        onError={(e) => {
                          e.target.src = '/hyperswitch/CREDIT.svg';
                        }}
                      />
                      <span className="font-medium">{connector.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(connector.revenue)}</p>
                      <p className="text-sm text-gray-600">{connector.transactions} txns</p>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Success Rate: {formatPercentage(connector.successRate)}</span>
                    <span>Volume Share: {formatPercentage(connector.volumeShare)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${connector.volumeShare}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Métodos de pago */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.paymentMethodBreakdown.map((method, index) => (
                <div key={method.method} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ 
                        backgroundColor: [
                          '#3B82F6', '#10B981', '#F59E0B', '#EF4444'
                        ][index % 4] 
                      }}
                    ></div>
                    <span className="font-medium">{method.method}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatPercentage(method.percentage)}</p>
                    <p className="text-sm text-gray-600">{formatCurrency(method.amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribución geográfica y top customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución geográfica */}
        <Card>
          <CardHeader>
            <CardTitle>Geographic Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.geographicDistribution.map((country) => (
                <div key={country.country} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium">
                        {country.country.split(' ').map(word => word[0]).join('').toUpperCase()}
                      </span>
                    </div>
                    <span className="font-medium">{country.country}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatPercentage(country.percentage)}</p>
                    <p className="text-sm text-gray-600">{formatCurrency(country.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top customers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.topCustomers.map((customer, index) => (
                <div key={customer.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-gray-600">{customer.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(customer.totalSpent)}</p>
                    <p className="text-sm text-gray-600">{customer.transactions} txns</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análisis de fallas */}
      <Card>
        <CardHeader>
          <CardTitle>Failure Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {analyticsData.failureAnalysis.map((failure, index) => (
              <div key={failure.reason} className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-red-600">{failure.count}</span>
                </div>
                <p className="font-medium text-sm">{failure.reason}</p>
                <p className="text-xs text-gray-600">{formatPercentage(failure.percentage)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsScreen;