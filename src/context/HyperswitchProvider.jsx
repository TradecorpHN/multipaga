import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { HyperLoader } from '@juspay-tech/react-hyper-js';

// Contexto de Hyperswitch
const HyperswitchContext = createContext({
  hyper: null,
  isLoading: false,
  error: null,
  environment: 'sandbox',
  publishableKey: null,
  initializeHyperswitch: () => {},
  createPaymentSession: () => {},
  confirmPayment: () => {},
  retrievePayment: () => {},
  setEnvironment: () => {}
});

// Configuración de entornos
const ENVIRONMENTS = {
  sandbox: {
    baseUrl: import.meta.env.VITE_SANDBOX_URL || 'https://sandbox.hyperswitch.io',
    publishableKey: import.meta.env.VITE_HYPERSWITCH_PUBLISHABLE_KEY_SANDBOX
  },
  production: {
    baseUrl: import.meta.env.VITE_PRODUCTION_URL || 'https://api.hyperswitch.io',
    publishableKey: import.meta.env.VITE_HYPERSWITCH_PUBLISHABLE_KEY_PROD
  }
};

// Utilidades de Hyperswitch
export const HyperswitchUtils = {
  // Obtener configuración del entorno
  getEnvironmentConfig: (environment) => {
    return ENVIRONMENTS[environment] || ENVIRONMENTS.sandbox;
  },

  // Validar clave publicable
  isValidPublishableKey: (key) => {
    if (!key) return false;
    return key.startsWith('pk_snd_') || key.startsWith('pk_live_');
  },

  // Obtener entorno desde la clave
  getEnvironmentFromKey: (key) => {
    if (!key) return 'sandbox';
    return key.startsWith('pk_live_') ? 'production' : 'sandbox';
  },

  // Formatear errores de Hyperswitch
  formatError: (error) => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.error?.message) return error.error.message;
    return 'Error desconocido en Hyperswitch';
  },

  // Validar datos de pago
  validatePaymentData: (paymentData) => {
    const required = ['amount', 'currency'];
    const missing = required.filter(field => !paymentData[field]);
    
    if (missing.length > 0) {
      throw new Error(`Campos requeridos faltantes: ${missing.join(', ')}`);
    }

    if (paymentData.amount <= 0) {
      throw new Error('El monto debe ser mayor a 0');
    }

    return true;
  }
};

// Provider de Hyperswitch
export const HyperswitchProvider = ({ children }) => {
  const [hyper, setHyper] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [environment, setEnvironment] = useState(
    import.meta.env.VITE_HYPERSWITCH_ENVIRONMENT || 
    import.meta.env.VITE_ENVIRONMENT || 
    'sandbox'
  );

  // Obtener configuración del entorno actual
  const currentConfig = HyperswitchUtils.getEnvironmentConfig(environment);
  const publishableKey = currentConfig.publishableKey;

  // Función para inicializar Hyperswitch
  const initializeHyperswitch = useCallback(async (customConfig = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      const config = {
        ...currentConfig,
        ...customConfig
      };

      if (!HyperswitchUtils.isValidPublishableKey(config.publishableKey)) {
        throw new Error('Clave publicable de Hyperswitch no válida');
      }

      // Configuración de Hyperswitch
      const hyperswitchConfig = {
        publishableKey: config.publishableKey,
        clientSecret: config.clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#0570de',
            colorBackground: '#ffffff',
            colorText: '#30313d',
            colorDanger: '#df1b41',
            fontFamily: 'Ideal Sans, system-ui, sans-serif',
            spacingUnit: '2px',
            borderRadius: '4px'
          }
        },
        loader: 'auto'
      };

      // Inicializar Hyperswitch usando HyperLoader
      const hyperInstance = await HyperLoader(hyperswitchConfig);
      setHyper(hyperInstance);

      console.log('Hyperswitch inicializado correctamente:', {
        environment,
        publishableKey: config.publishableKey
      });

    } catch (error) {
      const errorMessage = HyperswitchUtils.formatError(error);
      setError(errorMessage);
      console.error('Error inicializando Hyperswitch:', error);
    } finally {
      setIsLoading(false);
    }
  }, [environment, currentConfig]);

  // Función para crear sesión de pago
  const createPaymentSession = useCallback(async (paymentData) => {
    try {
      if (!hyper) {
        throw new Error('Hyperswitch no está inicializado');
      }

      HyperswitchUtils.validatePaymentData(paymentData);

      const paymentSession = await hyper.create({
        type: 'payment',
        ...paymentData
      });

      return paymentSession;
    } catch (error) {
      const errorMessage = HyperswitchUtils.formatError(error);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [hyper]);

  // Función para confirmar pago
  const confirmPayment = useCallback(async (paymentIntent, paymentMethod) => {
    try {
      if (!hyper) {
        throw new Error('Hyperswitch no está inicializado');
      }

      const result = await hyper.confirmPayment({
        elements: paymentIntent,
        confirmParams: {
          payment_method: paymentMethod,
          return_url: import.meta.env.VITE_PAYMENT_RETURN_URL || window.location.origin + '/payment-complete'
        }
      });

      return result;
    } catch (error) {
      const errorMessage = HyperswitchUtils.formatError(error);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [hyper]);

  // Función para recuperar pago
  const retrievePayment = useCallback(async (paymentId) => {
    try {
      if (!hyper) {
        throw new Error('Hyperswitch no está inicializado');
      }

      const payment = await hyper.retrievePayment(paymentId);
      return payment;
    } catch (error) {
      const errorMessage = HyperswitchUtils.formatError(error);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [hyper]);

  // Función para cambiar entorno
  const changeEnvironment = useCallback((newEnvironment) => {
    if (ENVIRONMENTS[newEnvironment]) {
      setEnvironment(newEnvironment);
      setHyper(null); // Resetear instancia para reinicializar
      setError(null);
    } else {
      setError(`Entorno no válido: ${newEnvironment}`);
    }
  }, []);

  // Inicializar automáticamente cuando cambie el entorno
  useEffect(() => {
    if (publishableKey && HyperswitchUtils.isValidPublishableKey(publishableKey)) {
      initializeHyperswitch();
    }
  }, [environment, publishableKey, initializeHyperswitch]);

  // Limpiar errores después de un tiempo
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 10000); // Limpiar error después de 10 segundos

      return () => clearTimeout(timer);
    }
  }, [error]);

  const contextValue = {
    hyper,
    isLoading,
    error,
    environment,
    publishableKey,
    initializeHyperswitch,
    createPaymentSession,
    confirmPayment,
    retrievePayment,
    setEnvironment: changeEnvironment
  };

  return (
    <HyperswitchContext.Provider value={contextValue}>
      {children}
    </HyperswitchContext.Provider>
  );
};

// Hook para usar el contexto de Hyperswitch
export const useHyperswitch = () => {
  const context = useContext(HyperswitchContext);
  if (!context) {
    throw new Error('useHyperswitch debe ser usado dentro de HyperswitchProvider');
  }
  return context;
};

// Hook para crear elementos de pago
export const usePaymentElements = () => {
  const { hyper, isLoading, error } = useHyperswitch();
  const [elements, setElements] = useState(null);

  const createElements = useCallback(async (options = {}) => {
    try {
      if (!hyper) {
        throw new Error('Hyperswitch no está inicializado');
      }

      const elementsInstance = hyper.elements({
        appearance: {
          theme: 'stripe',
          ...options.appearance
        },
        ...options
      });

      setElements(elementsInstance);
      return elementsInstance;
    } catch (error) {
      console.error('Error creando elementos de pago:', error);
      throw error;
    }
  }, [hyper]);

  return {
    elements,
    createElements,
    isLoading,
    error
  };
};

// Hook para manejar el estado de pago
export const usePaymentState = () => {
  const [paymentState, setPaymentState] = useState({
    status: 'idle', // idle, processing, succeeded, failed
    paymentIntent: null,
    error: null,
    metadata: {}
  });

  const updatePaymentState = useCallback((updates) => {
    setPaymentState(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  const resetPaymentState = useCallback(() => {
    setPaymentState({
      status: 'idle',
      paymentIntent: null,
      error: null,
      metadata: {}
    });
  }, []);

  return {
    paymentState,
    updatePaymentState,
    resetPaymentState
  };
};

export default HyperswitchProvider;

