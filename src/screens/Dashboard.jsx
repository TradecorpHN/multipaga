// Dashboard.jsx - Pantalla principal del dashboard
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  TrendingUp, 
  DollarSign, 
  CreditCard, 
  Users, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from 'lucide-react';
import { useAuthStore, useDataStore, useUIStore } from '../Recoils/GlobalState';
import { useApiMethods } from '../hooks/useApiMethods';

const Dashboard = () => {
  const { user, merchantId, profileId } = useAuthStore();
  const { analytics, setAnalytics, setAnalyticsLoading } = useDataStore();
  const { addNotification } = useUIStore();
  const { fetchAnalytics } = useApiMethods();
  
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState('7d');

  // Datos de ejemplo para el dashboard
  const [dashboardData, setDashboardData] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    successRate: 0,
    activeCustomers: 0,
    recentTransactions: [],
    topConnectors: [],
    performanceMetrics: {}
  });

  useEffect(() => {
    loadDashboardData();
  }, [dateRange, merchantId, profileId]);

  const loadDashboardData = async () => {
    try {
      setAnalyticsLoading(true);
      
      // Simular carga de datos del dashboard
      const mockData = {
        totalRevenue: 125430.50,
        totalTransactions: 1247,
        successRate: 94.2,
        activeCustomers: 856,
        recentTransactions: [
          {
            id: 'pay_001',
            amount: 299.99,
            currency: 'USD',
            status: 'succeeded',
            customer: 'john@example.com',
            connector: 'stripe',
            timestamp: new Date(Date.now() - 1000 * 60 * 15)
          },
          {
            id: 'pay_002',
            amount: 149.50,
            currency: 'USD',
            status: 'processing',
            customer: 'jane@example.com',
            connector: 'adyen',
            timestamp: new Date(Date.now() - 1000 * 60 * 30)
          },
          {
            id: 'pay_003',
            amount: 89.99,
            currency: 'EUR',
            status: 'failed',
            customer: 'bob@example.com',
            connector: 'paypal',
            timestamp: new Date(Date.now() - 1000 * 60 * 45)
          }
        ],
        topConnectors: [
          { name: 'Stripe', volume: 45.2, transactions: 567 },
          { name: 'Adyen', volume: 32.1, transactions: 401 },
          { name: 'PayPal', volume: 15.7, transactions: 196 },
          { name: 'Square', volume: 7.0, transactions: 83 }
        ],
        performanceMetrics: {
          averageProcessingTime: 2.3,
          disputeRate: 0.8,
          refundRate: 2.1,
          conversionRate: 87.5
        }
      };

      setDashboardData(mockData);
      setAnalytics(mockData);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load dashboard data'
      });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'succeeded': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.name || 'User'}
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
          <Button 
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
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
              {formatCurrency(dashboardData.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
              +12.5% from last period
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
              {dashboardData.totalTransactions.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
              +8.2% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.successRate}%
            </div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <ArrowDownRight className="h-3 w-3 mr-1 text-red-500" />
              -0.3% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.activeCustomers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
              +15.3% from last period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transacciones recientes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{transaction.id}</p>
                      <p className="text-sm text-gray-600">{transaction.customer}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getStatusColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatDate(transaction.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Connectors */}
        <Card>
          <CardHeader>
            <CardTitle>Top Connectors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.topConnectors.map((connector, index) => (
                <div key={connector.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{connector.name}</p>
                      <p className="text-sm text-gray-600">
                        {connector.transactions} transactions
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{connector.volume}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas de rendimiento */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {dashboardData.performanceMetrics.averageProcessingTime}s
              </div>
              <p className="text-sm text-gray-600">Avg Processing Time</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {dashboardData.performanceMetrics.disputeRate}%
              </div>
              <p className="text-sm text-gray-600">Dispute Rate</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {dashboardData.performanceMetrics.refundRate}%
              </div>
              <p className="text-sm text-gray-600">Refund Rate</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {dashboardData.performanceMetrics.conversionRate}%
              </div>
              <p className="text-sm text-gray-600">Conversion Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

