// PaymentsScreen.jsx - Pantalla de gestión de pagos
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { 
  Search, 
  Filter, 
  Download, 
  Eye,
  RefreshCw,
  CreditCard,
  DollarSign,
  Calendar,
  User,
  Globe,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { useDataStore, useUIStore, useAuthStore } from '../Recoils/GlobalState';
import { useApiMethods } from '../hooks/useApiMethods';

const PaymentsScreen = () => {
  const { payments, setPayments, setPaymentsLoading } = useDataStore();
  const { addNotification, filters, setFilters, pagination, setPagination } = useUIStore();
  const { merchantId, profileId } = useAuthStore();
  const { fetchPayments } = useApiMethods();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPayments();
  }, [merchantId, profileId, filters, pagination.page]);

  const loadPayments = async () => {
    try {
      setPaymentsLoading(true);
      
      // Simular datos de pagos
      const mockPayments = [
        {
          payment_id: 'pay_001',
          merchant_id: merchantId,
          status: 'succeeded',
          amount: 29999,
          currency: 'USD',
          customer: {
            id: 'cust_001',
            email: 'john.doe@example.com',
            name: 'John Doe'
          },
          connector: 'stripe',
          payment_method: 'card',
          payment_method_data: {
            card: {
              last4: '4242',
              brand: 'visa',
              exp_month: 12,
              exp_year: 2025
            }
          },
          description: 'Premium subscription',
          created_at: '2024-01-20T10:30:00Z',
          updated_at: '2024-01-20T10:32:15Z',
          captured_at: '2024-01-20T10:32:15Z',
          metadata: {
            order_id: 'order_12345',
            customer_ip: '192.168.1.1'
          },
          billing_address: {
            country: 'US',
            state: 'CA',
            city: 'San Francisco'
          }
        },
        {
          payment_id: 'pay_002',
          merchant_id: merchantId,
          status: 'processing',
          amount: 14950,
          currency: 'USD',
          customer: {
            id: 'cust_002',
            email: 'jane.smith@example.com',
            name: 'Jane Smith'
          },
          connector: 'adyen',
          payment_method: 'wallet',
          payment_method_data: {
            wallet: {
              type: 'paypal'
            }
          },
          description: 'Monthly plan',
          created_at: '2024-01-20T09:15:00Z',
          updated_at: '2024-01-20T09:16:30Z',
          metadata: {
            order_id: 'order_12346'
          },
          billing_address: {
            country: 'GB',
            city: 'London'
          }
        },
        {
          payment_id: 'pay_003',
          merchant_id: merchantId,
          status: 'failed',
          amount: 8999,
          currency: 'EUR',
          customer: {
            id: 'cust_003',
            email: 'bob.wilson@example.com',
            name: 'Bob Wilson'
          },
          connector: 'square',
          payment_method: 'card',
          payment_method_data: {
            card: {
              last4: '1234',
              brand: 'mastercard',
              exp_month: 8,
              exp_year: 2024
            }
          },
          description: 'Basic plan',
          created_at: '2024-01-20T08:45:00Z',
          updated_at: '2024-01-20T08:46:12Z',
          error_message: 'Insufficient funds',
          metadata: {
            order_id: 'order_12347'
          },
          billing_address: {
            country: 'DE',
            city: 'Berlin'
          }
        }
      ];

      setPayments(mockPayments);
      setPagination({ ...pagination, total: mockPayments.length });
      
    } catch (error) {
      console.error('Error loading payments:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load payments'
      });
    } finally {
      setPaymentsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPayments();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleViewPayment = (payment) => {
    setSelectedPayment(payment);
    // Aquí se abriría un modal o se navegaría a una página de detalles
  };

  const handleExport = () => {
    // Implementar exportación de datos
    addNotification({
      type: 'info',
      title: 'Export',
      message: 'Export functionality will be implemented'
    });
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount / 100);
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'succeeded': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'requires_action': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'succeeded': return <CheckCircle className="h-4 w-4" />;
      case 'processing': return <Clock className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'requires_action': return <AlertCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getPaymentMethodIcon = (method, data) => {
    if (method === 'card') {
      const brand = data?.card?.brand?.toLowerCase();
      switch (brand) {
        case 'visa': return <img src="/hyperswitch/VISA.svg" alt="Visa" className="h-6 w-6" />;
        case 'mastercard': return <img src="/hyperswitch/MASTERCARD.svg" alt="Mastercard" className="h-6 w-6" />;
        default: return <CreditCard className="h-6 w-6" />;
      }
    } else if (method === 'wallet') {
      const type = data?.wallet?.type?.toLowerCase();
      switch (type) {
        case 'paypal': return <img src="/hyperswitch/PAYPAL.svg" alt="PayPal" className="h-6 w-6" />;
        case 'google_pay': return <img src="/hyperswitch/GOOGLE_PAY.svg" alt="Google Pay" className="h-6 w-6" />;
        case 'apple_pay': return <img src="/hyperswitch/APPLE_PAY.svg" alt="Apple Pay" className="h-6 w-6" />;
        default: return <DollarSign className="h-6 w-6" />;
      }
    }
    return <CreditCard className="h-6 w-6" />;
  };

  const filteredPayments = payments.filter(payment =>
    payment.payment_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600 mt-1">
            Monitor and manage all payment transactions
          </p>
        </div>
        <div className="flex items-center space-x-3">
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

      {/* Filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search payments by ID, customer, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Payments</p>
                <p className="text-2xl font-bold">{filteredPayments.length}</p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Successful</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredPayments.filter(p => p.status === 'succeeded').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Processing</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {filteredPayments.filter(p => p.status === 'processing').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">
                  {filteredPayments.filter(p => p.status === 'failed').length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de pagos */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPayments.map((payment) => (
              <div key={payment.payment_id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getPaymentMethodIcon(payment.payment_method, payment.payment_method_data)}
                      <div>
                        <p className="font-medium">{payment.payment_id}</p>
                        <p className="text-sm text-gray-600">
                          {payment.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="hidden md:block">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">{payment.customer.name}</p>
                          <p className="text-xs text-gray-600">{payment.customer.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="hidden lg:block">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium capitalize">{payment.connector}</p>
                          <p className="text-xs text-gray-600">
                            {payment.billing_address?.country || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        {formatCurrency(payment.amount, payment.currency)}
                      </p>
                      <p className="text-xs text-gray-600">
                        {formatDate(payment.created_at)}
                      </p>
                    </div>

                    <Badge className={getStatusColor(payment.status)}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(payment.status)}
                        <span className="capitalize">{payment.status}</span>
                      </div>
                    </Badge>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewPayment(payment)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {payment.status === 'failed' && payment.error_message && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <p className="text-sm text-red-800">
                        <span className="font-medium">Error:</span> {payment.error_message}
                      </p>
                    </div>
                  </div>
                )}

                {/* Información adicional en móvil */}
                <div className="md:hidden mt-3 pt-3 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Customer:</span>
                    <span>{payment.customer.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Connector:</span>
                    <span className="capitalize">{payment.connector}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Country:</span>
                    <span>{payment.billing_address?.country || 'N/A'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredPayments.length === 0 && (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No payments found
              </h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try adjusting your search criteria' : 'No payments have been processed yet'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentsScreen;

