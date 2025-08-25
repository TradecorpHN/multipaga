import React, { useState, useEffect } from 'react';
import { useHyperswitch, usePaymentElements, usePaymentState } from '../../context/HyperswitchProvider';
import { LogicUtils } from '../../utils/LogicUtils';

const PaymentForm = ({ 
  amount, 
  currency = 'USD', 
  onSuccess, 
  onError, 
  onCancel,
  customerInfo = {},
  metadata = {} 
}) => {
  const { 
    hyper, 
    isLoading: hyperswitchLoading, 
    error: hyperswitchError,
    createPaymentSession,
    confirmPayment 
  } = useHyperswitch();
  
  const { elements, createElements } = usePaymentElements();
  const { paymentState, updatePaymentState, resetPaymentState } = usePaymentState();
  
  const [paymentElement, setPaymentElement] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);

  // Inicializar elementos de pago
  useEffect(() => {
    const initializePayment = async () => {
      try {
        if (!hyper || !amount || amount <= 0) return;

        // Crear sesión de pago
        const paymentData = {
          amount: Math.round(amount * 100), // Convertir a centavos
          currency: currency.toLowerCase(),
          customer: customerInfo,
          metadata: {
            ...metadata,
            source: 'multipaga'
          },
          automatic_payment_methods: {
            enabled: true
          }
        };

        const session = await createPaymentSession(paymentData);
        setClientSecret(session.client_secret);

        // Crear elementos de pago
        const elementsInstance = await createElements({
          clientSecret: session.client_secret,
          appearance: {
            theme: 'stripe',
            variables: {
              colorPrimary: '#0570de',
              colorBackground: '#ffffff',
              colorText: '#30313d',
              colorDanger: '#df1b41',
              fontFamily: 'system-ui, sans-serif',
              spacingUnit: '4px',
              borderRadius: '6px'
            }
          }
        });

        // Crear elemento de pago
        const paymentEl = elementsInstance.create('payment', {
          layout: 'tabs'
        });

        setPaymentElement(paymentEl);
        updatePaymentState({ 
          status: 'ready',
          paymentIntent: session 
        });

      } catch (error) {
        console.error('Error inicializando pago:', error);
        updatePaymentState({ 
          status: 'failed',
          error: error.message 
        });
        onError?.(error);
      }
    };

    initializePayment();
  }, [hyper, amount, currency, customerInfo, metadata, createPaymentSession, createElements, updatePaymentState, onError]);

  // Montar elemento de pago en el DOM
  useEffect(() => {
    if (paymentElement) {
      const paymentElementContainer = document.getElementById('payment-element');
      if (paymentElementContainer) {
        paymentElement.mount('#payment-element');
      }
    }

    return () => {
      if (paymentElement) {
        paymentElement.unmount();
      }
    };
  }, [paymentElement]);

  // Manejar envío del formulario
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!hyper || !elements || !clientSecret) {
      onError?.(new Error('Elementos de pago no están listos'));
      return;
    }

    setIsProcessing(true);
    updatePaymentState({ status: 'processing' });

    try {
      const result = await confirmPayment(elements, {
  return_url: import.meta.env.VITE_PAYMENT_RETURN_URL || `${window.location.origin}/payment-complete`
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      updatePaymentState({ 
        status: 'succeeded',
        paymentIntent: result.paymentIntent 
      });
      
      onSuccess?.(result);
    } catch (error) {
      console.error('Error procesando pago:', error);
      updatePaymentState({ 
        status: 'failed',
        error: error.message 
      });
      onError?.(error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Manejar cancelación
  const handleCancel = () => {
    resetPaymentState();
    onCancel?.();
  };

  // Formatear monto para mostrar
  const formatAmount = (amount, currency) => {
    return LogicUtils.formatCurrency(amount, currency);
  };

  // Renderizar estado de carga
  if (hyperswitchLoading || paymentState.status === 'idle') {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Inicializando pago...</span>
      </div>
    );
  }

  // Renderizar error
  if (hyperswitchError || paymentState.status === 'failed') {
    const errorMessage = hyperswitchError || paymentState.error;
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error en el pago</h3>
            <div className="mt-2 text-sm text-red-700">
              {errorMessage}
            </div>
            <div className="mt-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar éxito
  if (paymentState.status === 'succeeded') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">Pago exitoso</h3>
            <div className="mt-2 text-sm text-green-700">
              Tu pago de {formatAmount(amount, currency)} ha sido procesado correctamente.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Completar Pago
        </h2>
        <div className="text-2xl font-bold text-blue-600">
          {formatAmount(amount, currency)}
        </div>
        {customerInfo.email && (
          <div className="text-sm text-gray-600 mt-1">
            Para: {customerInfo.email}
          </div>
        )}
      </div>

      {/* Formulario de pago */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Elemento de pago de Hyperswitch */}
        <div id="payment-element" className="mb-4">
          {/* El elemento de pago se montará aquí */}
        </div>

        {/* Información adicional */}
        <div className="text-xs text-gray-500 mb-4">
          <p>Tu pago está protegido por encriptación SSL de 256 bits.</p>
        </div>

        {/* Botones de acción */}
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isProcessing || paymentState.status !== 'ready'}
            className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Procesando...
              </div>
            ) : (
              `Pagar ${formatAmount(amount, currency)}`
            )}
          </button>
        </div>
      </form>

      {/* Métodos de pago aceptados */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          Aceptamos tarjetas de crédito, débito y métodos de pago digitales
        </div>
        <div className="flex justify-center mt-2 space-x-2">
          <img src="/hyperswitch/Gateway/VISA.svg" alt="Visa" className="h-6 w-auto" />
          <img src="/hyperswitch/Gateway/MASTERCARD.svg" alt="Mastercard" className="h-6 w-auto" />
          <img src="/hyperswitch/Gateway/AMERICANEXPRESS.svg" alt="American Express" className="h-6 w-auto" />
          <img src="/hyperswitch/Gateway/PAYPAL.svg" alt="PayPal" className="h-6 w-auto" />
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;

