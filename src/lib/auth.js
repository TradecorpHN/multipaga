// Sistema de autenticación idéntico al control center de Hyperswitch
import Cookies from 'js-cookie';

// Estados de autenticación basados en el control center
export const AUTH_STATES = {
  LOGGED_OUT: 'logged_out',
  CHECKING_AUTH: 'checking_auth',
  PRE_LOGIN: 'pre_login', // Para 2FA
  LOGGED_IN: 'logged_in',
  SESSION_EXPIRED: 'session_expired'
};

// Configuración de cookies idéntica al control center
const COOKIE_CONFIG = {
  domain: import.meta.env.NODE_ENV === 'production' ? '.multipaga.com' : undefined,
  secure: import.meta.env.NODE_ENV === 'production',
  sameSite: 'lax',
  expires: 7 // 7 días
};

// Nombres de cookies del control center
const COOKIE_NAMES = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_INFO: 'user_info',
  MERCHANT_ID: 'merchant_id',
  ORG_ID: 'org_id',
  PROFILE_ID: 'profile_id',
  TWO_FA_TOKEN: 'two_fa_token'
};

// URLs de la API basadas en el control center
const getApiBaseUrl = () => {
  const environment = import.meta.env.VITE_ENVIRONMENT || 'sandbox';
  return environment === 'production' 
    ? 'https://api.hyperswitch.io'
    : 'https://sandbox.hyperswitch.io';
};

// Endpoints idénticos al control center
export const API_ENDPOINTS = {
  // Autenticación
  SIGNIN: '/user/v2/signin',
  SIGNIN_MAGIC_LINK: '/user/signin',
  SIGNOUT: '/user/signout',
  REFRESH_TOKEN: '/user/refresh_token',
  
  // 2FA
  TOTP_VERIFY: '/user/2fa/totp/verify',
  TOTP_RESET: '/user/2fa/totp/reset',
  RECOVERY_CODE_VERIFY: '/user/2fa/recovery_code/verify',
  
  // Usuario
  USER_INFO: '/user',
  SWITCH_MERCHANT: '/user/v2/switch_merchant',
  
  // Merchant/Organization
  MERCHANT_ACCOUNT: '/accounts',
  MERCHANT_LIST: '/accounts/list',
  
  // Pagos
  PAYMENTS_LIST: '/payments/list',
  PAYMENT_INTENT: '/payments',
  PAYMENT_CONFIRM: '/payments/{payment_id}/confirm',
  PAYMENT_CAPTURE: '/payments/{payment_id}/capture',
  PAYMENT_CANCEL: '/payments/{payment_id}/cancel',
  
  // Reembolsos
  REFUNDS_LIST: '/refunds/list',
  REFUND_CREATE: '/refunds',
  
  // Disputas
  DISPUTES_LIST: '/disputes/list',
  DISPUTE_EVIDENCE: '/disputes/{dispute_id}/evidence',
  
  // Analítica
  ANALYTICS_PAYMENTS: '/analytics/v1/merchant/metrics/payments',
  ANALYTICS_REFUNDS: '/analytics/v1/merchant/metrics/refunds',
  ANALYTICS_SDK: '/analytics/v1/sdk_events/metrics',
  
  // Conectores
  CONNECTORS_LIST: '/account/{account_id}/connectors',
  CONNECTOR_CREATE: '/account/{account_id}/connectors',
  CONNECTOR_UPDATE: '/account/{account_id}/connectors/{connector_id}',
  
  // Webhooks
  WEBHOOKS_LIST: '/webhooks',
  WEBHOOK_CREATE: '/webhooks',
  
  // API Keys
  API_KEYS_LIST: '/api_keys/list',
  API_KEY_CREATE: '/api_keys',
  
  // Business Profile
  BUSINESS_PROFILE: '/account/{account_id}/business_profile',
  
  // Routing
  ROUTING_CONFIG: '/routing',
  
  // Customers
  CUSTOMERS_LIST: '/customers/list',
  CUSTOMER_CREATE: '/customers'
};

// Clase de autenticación idéntica al control center
class AuthService {
  constructor() {
    this.baseURL = getApiBaseUrl();
    this.interceptors = [];
  }

  // Configurar interceptores de axios idénticos al control center
  setupAxiosInterceptors(axiosInstance) {
    // Request interceptor
    axiosInstance.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Headers adicionales del control center
        config.headers['Content-Type'] = 'application/json';
        config.headers['Accept'] = 'application/json';
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            await this.refreshToken();
            const newToken = this.getAuthToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axiosInstance(originalRequest);
          } catch (refreshError) {
            this.clearAuth();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Métodos de gestión de cookies idénticos al control center
  setAuthToken(token) {
    Cookies.set(COOKIE_NAMES.AUTH_TOKEN, token, COOKIE_CONFIG);
  }

  getAuthToken() {
    return Cookies.get(COOKIE_NAMES.AUTH_TOKEN);
  }

  setRefreshToken(token) {
    Cookies.set(COOKIE_NAMES.REFRESH_TOKEN, token, COOKIE_CONFIG);
  }

  getRefreshToken() {
    return Cookies.get(COOKIE_NAMES.REFRESH_TOKEN);
  }

  setUserInfo(userInfo) {
    Cookies.set(COOKIE_NAMES.USER_INFO, JSON.stringify(userInfo), COOKIE_CONFIG);
  }

  getUserInfo() {
    const userInfo = Cookies.get(COOKIE_NAMES.USER_INFO);
    return userInfo ? JSON.parse(userInfo) : null;
  }

  setMerchantId(merchantId) {
    Cookies.set(COOKIE_NAMES.MERCHANT_ID, merchantId, COOKIE_CONFIG);
  }

  getMerchantId() {
    return Cookies.get(COOKIE_NAMES.MERCHANT_ID);
  }

  setOrgId(orgId) {
    Cookies.set(COOKIE_NAMES.ORG_ID, orgId, COOKIE_CONFIG);
  }

  getOrgId() {
    return Cookies.get(COOKIE_NAMES.ORG_ID);
  }

  setProfileId(profileId) {
    Cookies.set(COOKIE_NAMES.PROFILE_ID, profileId, COOKIE_CONFIG);
  }

  getProfileId() {
    return Cookies.get(COOKIE_NAMES.PROFILE_ID);
  }

  setTwoFAToken(token) {
    Cookies.set(COOKIE_NAMES.TWO_FA_TOKEN, token, COOKIE_CONFIG);
  }

  getTwoFAToken() {
    return Cookies.get(COOKIE_NAMES.TWO_FA_TOKEN);
  }

  // Limpiar todas las cookies de autenticación
  clearAuth() {
    Object.values(COOKIE_NAMES).forEach(cookieName => {
      Cookies.remove(cookieName);
      if (COOKIE_CONFIG.domain) {
        Cookies.remove(cookieName, { domain: COOKIE_CONFIG.domain });
      }
    });
  }

  // Verificar si el usuario está autenticado
  isAuthenticated() {
    const token = this.getAuthToken();
    const userInfo = this.getUserInfo();
    return !!(token && userInfo);
  }

  // Verificar si requiere 2FA
  requires2FA() {
    return !!this.getTwoFAToken();
  }

  // Método de login (idéntico al control center)
  async signIn(email, password) {
    try {
      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.SIGNIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await response.json();
      console.log('[DEBUG] Login response token:', data.token);

      if (!response.ok) {
        throw new Error(data.message || 'Error de autenticación');
      }

      // Manejar respuesta del control center
      if (data.two_factor_auth_required) {
        this.setTwoFAToken(data.token);
        return { requires2FA: true, token: data.token };
      }

      // Login exitoso
      this.setAuthToken(data.token);
      if (data.refresh_token) {
        this.setRefreshToken(data.refresh_token);
      }
      
      // Obtener información del usuario
      await this.fetchUserInfo();
      
      return { success: true };
    } catch (error) {
      console.error('Error en signIn:', error);
      throw error;
    }
  }

  // Login con magic link (idéntico al control center)
  async signInWithMagicLink(email) {
    try {
      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.SIGNIN_MAGIC_LINK}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error enviando magic link');
      }

      return { success: true, message: data.message };
    } catch (error) {
      console.error('Error en signInWithMagicLink:', error);
      throw error;
    }
  }

  // Verificar 2FA (idéntico al control center)
  async verify2FA(totp, recoveryCode = null) {
    try {
      const token = this.getTwoFAToken();
      if (!token) {
        throw new Error('Token 2FA no encontrado');
      }

      const endpoint = recoveryCode 
        ? API_ENDPOINTS.RECOVERY_CODE_VERIFY 
        : API_ENDPOINTS.TOTP_VERIFY;

      const body = recoveryCode 
        ? { recovery_code: recoveryCode }
        : { totp };

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error verificando 2FA');
      }

      // 2FA exitoso
      this.setAuthToken(data.token);
      if (data.refresh_token) {
        this.setRefreshToken(data.refresh_token);
      }
      
      // Limpiar token 2FA
      Cookies.remove(COOKIE_NAMES.TWO_FA_TOKEN);
      
      // Obtener información del usuario
      await this.fetchUserInfo();
      
      return { success: true };
    } catch (error) {
      console.error('Error en verify2FA:', error);
      throw error;
    }
  }

  // Obtener información del usuario (idéntico al control center)
  async fetchUserInfo() {
    try {
      const token = this.getAuthToken();
      console.log('[DEBUG] Token before /user:', token);
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.USER_INFO}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Error obteniendo información del usuario');
      }

      const data = await response.json();

      // Guardar información del usuario y merchant
      this.setUserInfo(data);
      if (data.merchant_id) {
        this.setMerchantId(data.merchant_id);
      }
      if (data.org_id) {
        this.setOrgId(data.org_id);
      }
      if (data.profile_id) {
        this.setProfileId(data.profile_id);
      }

      return data;
    } catch (error) {
      console.error('Error en fetchUserInfo:', error);
      throw error;
    }
  }

  // Refresh token (idéntico al control center)
  async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No hay refresh token');
      }

      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.REFRESH_TOKEN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          refresh_token: refreshToken
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error refrescando token');
      }

      this.setAuthToken(data.token);
      if (data.refresh_token) {
        this.setRefreshToken(data.refresh_token);
      }

      return data;
    } catch (error) {
      console.error('Error en refreshToken:', error);
      this.clearAuth();
      throw error;
    }
  }

  // Cerrar sesión (idéntico al control center)
  async signOut() {
    try {
      const token = this.getAuthToken();
      if (token) {
        await fetch(`${this.baseURL}${API_ENDPOINTS.SIGNOUT}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Error en signOut:', error);
    } finally {
      this.clearAuth();
    }
  }

  // Cambiar merchant (idéntico al control center)
  async switchMerchant(merchantId) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.SWITCH_MERCHANT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          merchant_id: merchantId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error cambiando merchant');
      }

      // Actualizar información
      this.setMerchantId(merchantId);
      await this.fetchUserInfo();

      return data;
    } catch (error) {
      console.error('Error en switchMerchant:', error);
      throw error;
    }
  }
}

// Instancia singleton del servicio de autenticación
export const authService = new AuthService();

// Funciones de utilidad
export const getAuthHeaders = () => {
  const token = authService.getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getMerchantHeaders = () => {
  const merchantId = authService.getMerchantId();
  return merchantId ? { 'x-merchant-id': merchantId } : {};
};

export const getApiHeaders = () => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  ...getAuthHeaders(),
  ...getMerchantHeaders()
});

export default authService;