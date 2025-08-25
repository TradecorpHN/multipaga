// ConnectorsScreen.jsx - Pantalla de gestión de conectores
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { 
  Plus, 
  Search, 
  Settings, 
  Trash2, 
  Eye,
  EyeOff,
  Globe,
  CreditCard,
  Zap,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useDataStore, useUIStore, useAuthStore } from '../Recoils/GlobalState';
import { useApiMethods } from '../hooks/useApiMethods';

const ConnectorsScreen = () => {
  const { connectors, setConnectors, setConnectorsLoading } = useDataStore();
  const { openModal, addNotification } = useUIStore();
  const { merchantId, profileId } = useAuthStore();
  const { fetchConnectors, createConnector, updateConnector, deleteConnector } = useApiMethods();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConnector, setSelectedConnector] = useState(null);
  const [showApiKeys, setShowApiKeys] = useState({});

  // Lista de conectores disponibles
  const availableConnectors = [
    { 
      id: 'stripe', 
      name: 'Stripe', 
      logo: '/hyperswitch/STRIPE.svg',
      description: 'Accept payments online',
      category: 'Payment Processor',
      regions: ['Global'],
      paymentMethods: ['Cards', 'Wallets', 'Bank Transfers']
    },
    { 
      id: 'adyen', 
      name: 'Adyen', 
      logo: '/hyperswitch/ADYEN.svg',
      description: 'Global payment platform',
      category: 'Payment Processor',
      regions: ['Global'],
      paymentMethods: ['Cards', 'Wallets', 'Local Methods']
    },
    { 
      id: 'paypal', 
      name: 'PayPal', 
      logo: '/hyperswitch/PAYPAL.svg',
      description: 'Digital wallet and payments',
      category: 'Digital Wallet',
      regions: ['Global'],
      paymentMethods: ['PayPal', 'Cards']
    },
    { 
      id: 'square', 
      name: 'Square', 
      logo: '/hyperswitch/SQUARE.svg',
      description: 'Point of sale and online payments',
      category: 'Payment Processor',
      regions: ['US', 'CA', 'AU', 'UK'],
      paymentMethods: ['Cards', 'Wallets']
    }
  ];

  useEffect(() => {
    loadConnectors();
  }, [merchantId, profileId]);

  const loadConnectors = async () => {
    try {
      setConnectorsLoading(true);
      
      // Simular datos de conectores configurados
      const mockConnectors = [
        {
          id: 'conn_stripe_001',
          connector_name: 'stripe',
          display_name: 'Stripe Production',
          status: 'active',
          test_mode: false,
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-20T14:45:00Z',
          connector_account_details: {
            account_id: 'acct_1234567890',
            api_key: 'sk_live_*********************',
            webhook_endpoint: 'https://api.hyperswitch.io/webhooks/stripe'
          },
          payment_methods_enabled: ['card', 'wallet'],
          metadata: {
            priority: 1,
            volume_split: 60
          }
        },
        {
          id: 'conn_adyen_001',
          connector_name: 'adyen',
          display_name: 'Adyen Europe',
          status: 'active',
          test_mode: false,
          created_at: '2024-01-10T09:15:00Z',
          updated_at: '2024-01-18T16:20:00Z',
          connector_account_details: {
            merchant_account: 'YourMerchantAccount',
            api_key: '*********************',
            webhook_endpoint: 'https://api.hyperswitch.io/webhooks/adyen'
          },
          payment_methods_enabled: ['card', 'wallet', 'bank_redirect'],
          metadata: {
            priority: 2,
            volume_split: 40
          }
        }
      ];

      setConnectors(mockConnectors);
      
    } catch (error) {
      console.error('Error loading connectors:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load connectors'
      });
    } finally {
      setConnectorsLoading(false);
    }
  };

  const handleCreateConnector = (connectorType) => {
    setSelectedConnector(connectorType);
    openModal('createConnector');
  };

  const handleEditConnector = (connector) => {
    setSelectedConnector(connector);
    openModal('editConnector');
  };

  const handleDeleteConnector = async (connectorId) => {
    if (window.confirm('Are you sure you want to delete this connector?')) {
      try {
        await deleteConnector(connectorId);
        await loadConnectors();
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Connector deleted successfully'
        });
      } catch (error) {
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to delete connector'
        });
      }
    }
  };

  const toggleApiKeyVisibility = (connectorId) => {
    setShowApiKeys(prev => ({
      ...prev,
      [connectorId]: !prev[connectorId]
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'inactive': return <AlertCircle className="h-4 w-4" />;
      case 'pending': return <AlertCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const filteredConnectors = connectors.filter(connector =>
    connector.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    connector.connector_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAvailableConnectors = availableConnectors.filter(connector =>
    connector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    connector.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Connectors</h1>
          <p className="text-gray-600 mt-1">
            Manage your payment processors and gateways
          </p>
        </div>
        <Button onClick={() => openModal('createConnector')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Connector
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search connectors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Conectores configurados */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Configured Connectors</h2>
        
        {filteredConnectors.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No connectors configured
              </h3>
              <p className="text-gray-600 mb-4">
                Get started by adding your first payment connector
              </p>
              <Button onClick={() => openModal('createConnector')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Connector
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredConnectors.map((connector) => (
              <Card key={connector.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={`/hyperswitch/${connector.connector_name.toUpperCase()}.svg`}
                        alt={connector.connector_name}
                        className="w-8 h-8"
                        onError={(e) => {
                          e.target.src = '/hyperswitch/CREDIT.svg';
                        }}
                      />
                      <div>
                        <CardTitle className="text-lg">
                          {connector.display_name}
                        </CardTitle>
                        <p className="text-sm text-gray-600 capitalize">
                          {connector.connector_name}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(connector.status)}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(connector.status)}
                        <span className="capitalize">{connector.status}</span>
                      </div>
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Mode</p>
                      <p className="font-medium">
                        {connector.test_mode ? 'Test' : 'Live'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Priority</p>
                      <p className="font-medium">
                        {connector.metadata?.priority || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-600 text-sm mb-2">Payment Methods</p>
                    <div className="flex flex-wrap gap-1">
                      {connector.payment_methods_enabled.map((method) => (
                        <Badge key={method} variant="outline" className="text-xs">
                          {method}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-600 text-sm">API Key</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleApiKeyVisibility(connector.id)}
                      >
                        {showApiKeys[connector.id] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs font-mono bg-gray-100 p-2 rounded">
                      {showApiKeys[connector.id] 
                        ? connector.connector_account_details.api_key
                        : '••••••••••••••••••••'
                      }
                    </p>
                  </div>

                  <div className="flex justify-between pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditConnector(connector)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteConnector(connector.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Conectores disponibles */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Available Connectors</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredAvailableConnectors.map((connector) => (
            <Card key={connector.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <img 
                    src={connector.logo}
                    alt={connector.name}
                    className="w-8 h-8"
                    onError={(e) => {
                      e.target.src = '/hyperswitch/CREDIT.svg';
                    }}
                  />
                  <div>
                    <h3 className="font-medium">{connector.name}</h3>
                    <p className="text-xs text-gray-600">{connector.category}</p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">
                  {connector.description}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div>
                    <p className="text-xs text-gray-600">Regions</p>
                    <div className="flex flex-wrap gap-1">
                      {connector.regions.map((region) => (
                        <Badge key={region} variant="outline" className="text-xs">
                          {region}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-600">Payment Methods</p>
                    <div className="flex flex-wrap gap-1">
                      {connector.paymentMethods.slice(0, 2).map((method) => (
                        <Badge key={method} variant="outline" className="text-xs">
                          {method}
                        </Badge>
                      ))}
                      {connector.paymentMethods.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{connector.paymentMethods.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={() => handleCreateConnector(connector)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Connect
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConnectorsScreen;

