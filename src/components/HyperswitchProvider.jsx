import React, { createContext, useContext, useState, useEffect } from 'react';
import { hyperswitchSDK } from '../lib/hyperswitch-sdk.js';
import { authService } from '../lib/auth.js';

// Contexto para el SDK de Hyperswitch
const HyperswitchContext = createContext({
  sdk: null,
  isInitialized: false,
  isLoading: false,
  error: null,
  initialize: () => {},
  reset: () => {}
});

// Hook para usar el contexto
export const useHyperswitch = () => {
  const context = useContext(HyperswitchContext);
  if (!context) {
    throw new Error('useHyperswitch debe ser usado dentro de HyperswitchProvider');
  }
  return context;
};

// Proveedor del contexto
export const HyperswitchProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Verificar si el usuario está autenticado y tiene los datos necesarios
  const checkAuthStatus = () => {
    const token = authService.getAuthToken();
    const merchantId = authService.getMerchantId();
    const userInfo = authService.getUserInfo();
    
    return {
      isAuthenticated: !!(token && userInfo),
      hasMerchantId: !!merchantId,
      token,
      merchantId,
      userInfo
    };
  };

  // Inicializar el SDK con un client secret específico
  const initialize = async (clientSecret, options = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      const authStatus = checkAuthStatus();
      if (!authStatus.isAuthenticated) {
        throw new Error('Usuario no autenticado');
      }

      // Configurar opciones por defecto con información del usuario autenticado
      const defaultOptions = {
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
        locale: 'es',
        ...options
      };

      await hyperswitchSDK.initialize(clientSecret, defaultOptions);
      setIsInitialized(true);
      
      return hyperswitchSDK;
    } catch (error) {
      console.error('Error inicializando Hyperswitch SDK:', error);
      setError(error.message || 'Error inicializando SDK');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Resetear el SDK
  const reset = () => {
    try {
      hyperswitchSDK.destroy();
      setIsInitialized(false);
      setError(null);
    } catch (error) {
      console.error('Error reseteando SDK:', error);
    }
  };

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      reset();
    };
  }, []);

  // Resetear cuando el usuario cierre sesión
  useEffect(() => {
    const authStatus = checkAuthStatus();
    if (!authStatus.isAuthenticated && isInitialized) {
      reset();
    }
  }, [isInitialized]);

  const value = {
    sdk: hyperswitchSDK,
    isInitialized,
    isLoading,
    error,
    initialize,
    reset
  };

  return (
    <HyperswitchContext.Provider value={value}>
      {children}
    </HyperswitchContext.Provider>
  );
};

export default HyperswitchProvider;

