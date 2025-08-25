import React, { useState, useEffect, useRef } from 'react';
import { createPaymentIntent } from '../lib/hyperswitch-sdk.js';
import { useHyperswitch } from './HyperswitchProvider.jsx';
import { authService } from '../lib/auth.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.jsx';
import { Button } from './ui/button.jsx';
import { Input } from './ui/input.jsx';
import { Badge } from './ui/badge.jsx';
import { Alert, AlertDescription } from './ui/alert.jsx';
import { 
  CreditCard, 
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Shield,
  Lock
} from 'lucide-react';

const PaymentProcessor = ({ onBack, onPaymentComplete }) => {
  const { sdk, initialize, isInitialized, isLoading: sdkLoading, error: sdkError } = useHyperswitch();
  
  const [step, setStep] = useState('form'); // 'form', 'processing', 'payment', 'complete', 'error'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    currency: 'USD',
    description: '',
    customer_email: ''
  });
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);
  
  const paymentElementRef = useRef(null);
  const paymentElementMounted = useRef(false);

  // Limpiar SDK al desmontar componente
  useEffect(() => {
    return () => {
      if (sdk) {
        sdk.destroy();
      }
    };
  }, [sdk]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!paymentData.amount || !paymentData.customer_email) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    const amount = parseFloat(paymentData.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('El monto debe ser un número válido mayor a 0');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setStep('processing');

      // Crear payment intent
      const intent = await createPaymentIntent(amount, paymentData.currency, {
        description: paymentData.description || 'Pago procesado por Multipaga',
        customer_email: paymentData.customer_email,
        metadata: {
          source: 'multipaga_payment_processor',
          user_email: authService.getUserInfo()?.email
        }
      });

      setPaymentIntent(intent);

      // Inicializar SDK
      await initialize(intent.client_secret, {
        appearance: {
          theme: 'stripe',
          labels: 'above',
          variables: {
            fontFamily: 'Inter, system-ui, sans-serif',
            colorPrimary: '#0570de',
            fontSizeBase: '16px',
            colorBackground: '#ffffff'
          }
        },
        locale: 'es'
      });

      // Crear elemento de pago
      const paymentElement = sdk.createPaymentElement({
        layout: {
          type: 'tabs',
          defaultCollapsed: false,
          radios: false,
          spacedAccordionItems: false
        },
        showCardFormByDefault: true,
        displaySavedPaymentMethods: true,
        wallets: {
          walletReturnUrl: window.location.origin + '/payment-complete',
          applePay: 'auto',
          googlePay: 'auto'
        }
      });

      setStep('payment');
      
      // Montar elemento en el DOM después de que el componente se renderice
      setTimeout(() => {
        if (paymentElementRef.current && !paymentElementMounted.current) {
          sdk.mountPaymentElement('#payment-element');
          paymentElementMounted.current = true;
        }
      }, 100);

    } catch (error) {
      console.error('Error creando payment intent:', error);
      setError(error.message || 'Error procesando el pago');
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    if (!sdk.isReady()) {
      setError('SDK no está listo. Por favor intenta de nuevo.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await sdk.confirmPayment({
        return_url: window.location.origin + '/payment-complete',
        confirmParams: {
          payment_method_data: {
            billing_details: {
              email: paymentData.customer_email
            }
          }
        }
      });

      setPaymentResult(result);

      if (result.error) {
        setError(result.error.message || 'Error procesando el pago');
        setStep('error');
      } else if (result.paymentIntent) {
        if (result.paymentIntent.status === 'succeeded') {
          setStep('complete');
          if (onPaymentComplete) {
            onPaymentComplete(result.paymentIntent);
          }
        } else {
          setError(`Pago en estado: ${result.paymentIntent.status}`);
          setStep('error');
        }
      }

    } catch (error) {
      console.error('Error confirmando pago:', error);
      setError(error.message || 'Error procesando el pago');
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatAmount = (amount, currency = 'USD') => {
    if (!amount) return '$0.00';
    const value = parseFloat(amount);
    return new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency: currency === 'HNL' ? 'HNL' : 'USD'
    }).format(value);
  };

  const resetForm = () => {
    setStep('form');
    setError(null);
    setPaymentData({
      amount: '',
      currency: 'USD',
      description: '',
      customer_email: ''
    });
    setPaymentIntent(null);
    setPaymentResult(null);
    paymentElementMounted.current = false;
    // El SDK se resetea a través del contexto
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Procesar Pago</h1>
            <p className="text-gray-600">Procesamiento seguro con Hyperswitch</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Shield className="h-4 w-4 text-green-600" />
          <span>Conexión segura</span>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-4 py-4">
        <div className={`flex items-center space-x-2 ${step === 'form' ? 'text-blue-600' : step === 'processing' || step === 'payment' || step === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'form' ? 'bg-blue-100 border-2 border-blue-600' : step === 'processing' || step === 'payment' || step === 'complete' ? 'bg-green-100 border-2 border-green-600' : 'bg-gray-100 border-2 border-gray-300'}`}>
            {step === 'processing' || step === 'payment' || step === 'complete' ? <CheckCircle className="h-4 w-4" /> : '1'}
          </div>
          <span className="text-sm font-medium">Datos</span>
        </div>
        
        <div className={`w-12 h-0.5 ${step === 'payment' || step === 'complete' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
        
        <div className={`flex items-center space-x-2 ${step === 'payment' ? 'text-blue-600' : step === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'payment' ? 'bg-blue-100 border-2 border-blue-600' : step === 'complete' ? 'bg-green-100 border-2 border-green-600' : 'bg-gray-100 border-2 border-gray-300'}`}>
            {step === 'complete' ? <CheckCircle className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
          </div>
          <span className="text-sm font-medium">Pago</span>
        </div>
        
        <div className={`w-12 h-0.5 ${step === 'complete' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
        
        <div className={`flex items-center space-x-2 ${step === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'complete' ? 'bg-green-100 border-2 border-green-600' : 'bg-gray-100 border-2 border-gray-300'}`}>
            {step === 'complete' ? <CheckCircle className="h-4 w-4" /> : '3'}
          </div>
          <span className="text-sm font-medium">Confirmación</span>
        </div>
      </div>

      {/* Error Alert */}
      {(error || sdkError) && (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-700">
            {error || sdkError}
          </AlertDescription>
        </Alert>
      )}

      {/* Step 1: Payment Form */}
      {step === 'form' && (
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <span>Información del Pago</span>
            </CardTitle>
            <CardDescription>
              Ingresa los detalles del pago que deseas procesar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Monto *</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={paymentData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Moneda</label>
                  <select
                    value={paymentData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USD">USD - Dólar Americano</option>
                    <option value="HNL">HNL - Lempira Hondureño</option>
                    <option value="EUR">EUR - Euro</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email del Cliente *</label>
                <Input
                  type="email"
                  placeholder="cliente@ejemplo.com"
                  value={paymentData.customer_email}
                  onChange={(e) => handleInputChange('customer_email', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Descripción</label>
                <Input
                  placeholder="Descripción del pago (opcional)"
                  value={paymentData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>

              {paymentData.amount && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Total a cobrar:</span>
                    <span className="text-lg font-bold text-blue-600">
                      {formatAmount(paymentData.amount, paymentData.currency)}
                    </span>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading || sdkLoading}>
                {(loading || sdkLoading) ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creando pago...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Continuar al Pago
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Processing */}
      {step === 'processing' && (
        <Card className="bg-white shadow-lg">
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 mx-auto animate-spin text-blue-600" />
              <h3 className="text-lg font-medium text-gray-800">Preparando el pago...</h3>
              <p className="text-gray-600">Configurando la conexión segura con Hyperswitch</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Payment Element */}
      {step === 'payment' && (
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Lock className="h-5 w-5 text-green-600" />
                <span>Información de Pago</span>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-600">
                Seguro
              </Badge>
            </CardTitle>
            <CardDescription>
              Ingresa los detalles de tu método de pago de forma segura
            </CardDescription>
          </CardHeader>
          <CardContent>
            {paymentIntent && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Monto:</span>
                  <span className="font-semibold">
                    {formatAmount(paymentIntent.amount / 100, paymentIntent.currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-gray-600">Cliente:</span>
                  <span className="font-medium">{paymentData.customer_email}</span>
                </div>
              </div>
            )}

            <form onSubmit={handlePaymentSubmit} className="space-y-6">
              {/* Payment Element Container */}
              <div 
                id="payment-element" 
                ref={paymentElementRef}
                className="min-h-[200px] p-4 border border-gray-200 rounded-lg"
              >
                {/* El elemento de pago se montará aquí */}
              </div>

              <Button type="submit" className="w-full" disabled={loading || !sdk.isReady()}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Procesando pago...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Confirmar Pago
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Success */}
      {step === 'complete' && paymentResult && (
        <Card className="bg-white shadow-lg">
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 mx-auto text-green-600" />
              <h3 className="text-2xl font-bold text-gray-800">¡Pago Exitoso!</h3>
              <p className="text-gray-600">El pago se ha procesado correctamente</p>
              
              {paymentResult.paymentIntent && (
                <div className="bg-green-50 p-4 rounded-lg text-left max-w-md mx-auto">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID de Pago:</span>
                      <span className="font-mono text-xs">{paymentResult.paymentIntent.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monto:</span>
                      <span className="font-semibold">
                        {formatAmount(paymentResult.paymentIntent.amount / 100, paymentResult.paymentIntent.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estado:</span>
                      <Badge className="bg-green-100 text-green-800">
                        {paymentResult.paymentIntent.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-3 justify-center">
                <Button onClick={resetForm} variant="outline">
                  Nuevo Pago
                </Button>
                <Button onClick={onBack}>
                  Volver al Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Error */}
      {step === 'error' && (
        <Card className="bg-white shadow-lg">
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <XCircle className="h-16 w-16 mx-auto text-red-600" />
              <h3 className="text-2xl font-bold text-gray-800">Error en el Pago</h3>
              <p className="text-gray-600">No se pudo procesar el pago</p>
              
              <div className="flex space-x-3 justify-center">
                <Button onClick={resetForm} variant="outline">
                  Intentar de Nuevo
                </Button>
                <Button onClick={onBack}>
                  Volver al Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PaymentProcessor;

