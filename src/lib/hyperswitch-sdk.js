// Integración del SDK web de Hyperswitch para Multipaga
// Basado en la implementación del Control Center

import { loadHyper } from '@juspay-tech/hyper-js';
import { authService } from './auth.js';

// Configuración del SDK basada en el control center
const SDK_CONFIG = {
  // URLs del SDK según el entorno
  getPublishableKey: () => {
    const environment = import.meta.env.VITE_ENVIRONMENT || 'sandbox';
    // Estas claves deben ser configuradas según el entorno
    return environment === 'production' 
      ? import.meta.env.VITE_HYPERSWITCH_PUBLISHABLE_KEY_PROD
      : import.meta.env.VITE_HYPERSWITCH_PUBLISHABLE_KEY_SANDBOX;
  },
  
  // Configuración de apariencia por defecto
  defaultAppearance: {
    theme: 'stripe',
    labels: 'above',
    variables: {
      fontFamily: 'Inter, system-ui, sans-serif',
      colorPrimary: '#0570de',
      fontSizeBase: '16px',
      colorBackground: '#ffffff'
    }
  },
  
  // Configuración de layout por defecto
  defaultLayout: {
    type: 'tabs',
    defaultCollapsed: false,
    radios: false,
    spacedAccordionItems: false
  }
};

// Clase para manejar el SDK de Hyperswitch
class HyperswitchSDK {
  constructor() {
    this.hyperInstance = null;
    this.elements = null;
    this.paymentElement = null;
    this.isInitialized = false;
  }

  // Inicializar el SDK con el token de autenticación
  async initialize(clientSecret, options = {}) {
    try {
      const publishableKey = SDK_CONFIG.getPublishableKey();
      
      if (!publishableKey) {
        throw new Error('Publishable key no configurada');
      }

      if (!clientSecret) {
        throw new Error('Client secret requerido');
      }

      // Configuración para loadHyper
      const hyperConfig = {
        publishableKey,
        // Agregar headers de autenticación si están disponibles
        ...this.getAuthHeaders()
      };

      // Cargar Hyperswitch
      this.hyperInstance = await loadHyper(publishableKey, hyperConfig);
      
      // Configurar opciones para Elements
      const elementsOptions = {
        clientSecret,
        appearance: {
          ...SDK_CONFIG.defaultAppearance,
          ...options.appearance
        },
        locale: options.locale || 'es',
        loader: options.loader || 'auto'
      };

      this.elements = this.hyperInstance.elements(elementsOptions);
      this.isInitialized = true;

      return this.hyperInstance;
    } catch (error) {
      console.error('Error inicializando Hyperswitch SDK:', error);
      throw error;
    }
  }

  // Obtener headers de autenticación del authService
  getAuthHeaders() {
    const token = authService.getAuthToken();
    const merchantId = authService.getMerchantId();
    const profileId = authService.getProfileId();
    
    const headers = {};
    
    if (token) {
      headers.authorization = `Bearer ${token}`;
    }
    
    if (merchantId) {
      headers['x-merchant-id'] = merchantId;
    }
    
    if (profileId) {
      headers['x-profile-id'] = profileId;
    }

    return { headers };
  }

  // Crear elemento de pago
  createPaymentElement(options = {}) {
    if (!this.elements) {
      throw new Error('SDK no inicializado. Llama a initialize() primero.');
    }

    const paymentElementOptions = {
      layout: {
        ...SDK_CONFIG.defaultLayout,
        ...options.layout
      },
      showCardFormByDefault: options.showCardFormByDefault || false,
      displaySavedPaymentMethods: options.displaySavedPaymentMethods || true,
      wallets: options.wallets || {
        walletReturnUrl: window.location.origin + '/payment-complete',
        applePay: 'auto',
        googlePay: 'auto'
      }
    };

    this.paymentElement = this.elements.create('payment', paymentElementOptions);
    return this.paymentElement;
  }

  // Montar el elemento de pago en el DOM
  mountPaymentElement(selector) {
    if (!this.paymentElement) {
      throw new Error('Elemento de pago no creado. Llama a createPaymentElement() primero.');
    }

    this.paymentElement.mount(selector);
  }

  // Confirmar pago
  async confirmPayment(options = {}) {
    if (!this.hyperInstance) {
      throw new Error('SDK no inicializado');
    }

    try {
      const confirmOptions = {
        elements: this.elements,
        confirmParams: {
          return_url: options.return_url || window.location.origin + '/payment-complete',
          ...options.confirmParams
        },
        redirect: options.redirect || 'if_required'
      };

      const result = await this.hyperInstance.confirmPayment(confirmOptions);
      
      return result;
    } catch (error) {
      console.error('Error confirmando pago:', error);
      throw error;
    }
  }

  // Recuperar intent de pago
  async retrievePaymentIntent(clientSecret) {
    if (!this.hyperInstance) {
      throw new Error('SDK no inicializado');
    }

    try {
      const result = await this.hyperInstance.retrievePaymentIntent(clientSecret);
      return result;
    } catch (error) {
      console.error('Error recuperando payment intent:', error);
      throw error;
    }
  }

  // Actualizar configuración del SDK
  updateConfiguration(options) {
    if (this.elements && options.appearance) {
      this.elements.update({
        appearance: {
          ...SDK_CONFIG.defaultAppearance,
          ...options.appearance
        }
      });
    }

    if (this.paymentElement && options.paymentElement) {
      this.paymentElement.update(options.paymentElement);
    }
  }

  // Obtener estado del elemento de pago
  getPaymentElementState() {
    if (!this.paymentElement) {
      return null;
    }

    // El estado se obtiene a través de eventos, no directamente
    return {
      complete: this.paymentElement.complete || false,
      empty: this.paymentElement.empty || true,
      collapsed: this.paymentElement.collapsed || false
    };
  }

  // Limpiar instancia del SDK
  destroy() {
    if (this.paymentElement) {
      this.paymentElement.unmount();
      this.paymentElement = null;
    }
    
    this.elements = null;
    this.hyperInstance = null;
    this.isInitialized = false;
  }

  // Verificar si el SDK está inicializado
  isReady() {
    return this.isInitialized && this.hyperInstance !== null;
  }
}

// Instancia singleton del SDK
export const hyperswitchSDK = new HyperswitchSDK();

// Hook de React para usar el SDK
export const useHyperswitchSDK = () => {
  return {
    sdk: hyperswitchSDK,
    initialize: hyperswitchSDK.initialize.bind(hyperswitchSDK),
    createPaymentElement: hyperswitchSDK.createPaymentElement.bind(hyperswitchSDK),
    mountPaymentElement: hyperswitchSDK.mountPaymentElement.bind(hyperswitchSDK),
    confirmPayment: hyperswitchSDK.confirmPayment.bind(hyperswitchSDK),
    retrievePaymentIntent: hyperswitchSDK.retrievePaymentIntent.bind(hyperswitchSDK),
    updateConfiguration: hyperswitchSDK.updateConfiguration.bind(hyperswitchSDK),
    getPaymentElementState: hyperswitchSDK.getPaymentElementState.bind(hyperswitchSDK),
    destroy: hyperswitchSDK.destroy.bind(hyperswitchSDK),
    isReady: hyperswitchSDK.isReady.bind(hyperswitchSDK)
  };
};

// Funciones de utilidad para crear payment intents
export const createPaymentIntent = async (amount, currency = 'USD', options = {}) => {
  try {
    const token = authService.getAuthToken();
    const merchantId = authService.getMerchantId();
    const profileId = authService.getProfileId();
    
    if (!token || !merchantId) {
      throw new Error('Usuario no autenticado o merchant ID no disponible');
    }

    const baseURL = authService.baseURL;
    
    const paymentData = {
      amount: amount * 100, // Convertir a centavos
      currency: currency.toUpperCase(),
      confirm: false,
      capture_method: options.capture_method || 'automatic',
      description: options.description || 'Pago procesado por Multipaga',
      metadata: {
        ...options.metadata,
        source: 'multipaga',
        merchant_id: merchantId,
        profile_id: profileId
      },
      ...options
    };

    const response = await fetch(`${baseURL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...(merchantId && { 'x-merchant-id': merchantId }),
        ...(profileId && { 'x-profile-id': profileId })
      },
      body: JSON.stringify(paymentData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error creando payment intent');
    }

    return data;
  } catch (error) {
    console.error('Error creando payment intent:', error);
    throw error;
  }
};

// Función para procesar pagos completos (crear intent + confirmar)
export const processPayment = async (amount, currency = 'USD', paymentOptions = {}, sdkOptions = {}) => {
  try {
    // 1. Crear payment intent
    const paymentIntent = await createPaymentIntent(amount, currency, paymentOptions);
    
    if (!paymentIntent.client_secret) {
      throw new Error('Client secret no recibido del payment intent');
    }

    // 2. Inicializar SDK
    await hyperswitchSDK.initialize(paymentIntent.client_secret, sdkOptions);

    // 3. Crear elemento de pago
    const paymentElement = hyperswitchSDK.createPaymentElement(sdkOptions.paymentElement);

    return {
      paymentIntent,
      paymentElement,
      clientSecret: paymentIntent.client_secret,
      sdk: hyperswitchSDK
    };
  } catch (error) {
    console.error('Error procesando pago:', error);
    throw error;
  }
};

export default hyperswitchSDK;

