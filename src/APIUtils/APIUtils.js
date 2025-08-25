// APIUtils.js - Adaptación del APIUtils.res del Control Center para JavaScript
import { LogicUtils } from '../utils/LogicUtils.js';

// Tipos de entidades V2
export const V2_ENTITY_TYPES = {
  CUSTOMERS: 'CUSTOMERS',
  V2_CONNECTOR: 'V2_CONNECTOR',
  V2_ORDERS_LIST: 'V2_ORDERS_LIST',
  V2_ATTEMPTS_LIST: 'V2_ATTEMPTS_LIST',
  PROCESS_TRACKER: 'PROCESS_TRACKER',
  V2_ORDER_FILTERS: 'V2_ORDER_FILTERS',
  V2_ORDERS_AGGREGATE: 'V2_ORDERS_AGGREGATE',
  PAYMENT_METHOD_LIST: 'PAYMENT_METHOD_LIST',
  TOTAL_TOKEN_COUNT: 'TOTAL_TOKEN_COUNT',
  RETRIEVE_PAYMENT_METHOD: 'RETRIEVE_PAYMENT_METHOD'
};

// Tipos de usuario
export const USER_TYPES = {
  NONE: 'NONE',
  MERCHANT: 'MERCHANT',
  PROFILE: 'PROFILE'
};

// Tipos de transacción
export const TRANSACTION_ENTITY = {
  MERCHANT: 'Merchant',
  PROFILE: 'Profile'
};

// URLs base para diferentes entornos
export const BASE_URLS = {
  SANDBOX: 'https://sandbox.hyperswitch.io',
  PRODUCTION: 'https://api.hyperswitch.io'
};

// Función para obtener URLs V2
export const getV2Url = ({
  entityName,
  userType = USER_TYPES.NONE,
  methodType,
  id = null,
  profileId,
  merchantId,
  transactionEntity,
  queryParameters = null
}) => {
  const connectorBaseURL = "v2/connector-accounts";
  const paymentsBaseURL = "v2/payments";

  switch (entityName) {
    case V2_ENTITY_TYPES.CUSTOMERS:
      switch (methodType) {
        case 'GET':
          return id ? `v2/customers/${id}` : "v2/customers/list";
        default:
          return "";
      }

    case V2_ENTITY_TYPES.V2_CONNECTOR:
      switch (methodType) {
        case 'GET':
          return id 
            ? `${connectorBaseURL}/${id}` 
            : `v2/profiles/${profileId}/connector-accounts`;
        case 'PUT':
        case 'POST':
          return id 
            ? `${connectorBaseURL}/${id}` 
            : connectorBaseURL;
        default:
          return "";
      }

    case V2_ENTITY_TYPES.V2_ORDERS_LIST:
      switch (methodType) {
        case 'GET':
          if (id) {
            return queryParameters 
              ? `${paymentsBaseURL}/${id}?${queryParameters}`
              : `${paymentsBaseURL}/${id}/get-intent`;
          } else {
            return queryParameters 
              ? `${paymentsBaseURL}/list?${queryParameters}`
              : `${paymentsBaseURL}/list?limit=100`;
          }
        default:
          return "";
      }

    case V2_ENTITY_TYPES.V2_ATTEMPTS_LIST:
      switch (methodType) {
        case 'GET':
          return id ? `${paymentsBaseURL}/${id}/list_attempts` : "";
        default:
          return "";
      }

    case V2_ENTITY_TYPES.PROCESS_TRACKER:
      switch (methodType) {
        case 'GET':
          return id 
            ? `v2/process_tracker/revenue_recovery_workflow/${id}`
            : "v2/process_tracker/revenue_recovery_workflow";
        default:
          return "";
      }

    case V2_ENTITY_TYPES.V2_ORDER_FILTERS:
      return "v2/payments/profile/filter";

    case V2_ENTITY_TYPES.V2_ORDERS_AGGREGATE:
      switch (methodType) {
        case 'GET':
          if (queryParameters) {
            switch (transactionEntity) {
              case TRANSACTION_ENTITY.MERCHANT:
                return `v2/payments/aggregate?${queryParameters}`;
              case TRANSACTION_ENTITY.PROFILE:
                return `v2/payments/profile/aggregate?${queryParameters}`;
              default:
                return `v2/payments/aggregate?${queryParameters}`;
            }
          }
          return "";
        default:
          return "";
      }

    case V2_ENTITY_TYPES.PAYMENT_METHOD_LIST:
      return id ? `v2/customers/${id}/saved-payment-methods` : "";

    case V2_ENTITY_TYPES.TOTAL_TOKEN_COUNT:
      return "v2/customers/total-payment-methods";

    case V2_ENTITY_TYPES.RETRIEVE_PAYMENT_METHOD:
      return id ? `v2/customers/payment-methods/${id}` : "";

    default:
      return "";
  }
};

// Función para obtener headers de autenticación
export const getHeaders = ({
  uri,
  headers = {},
  contentType = "application/json",
  xFeatureRoute = true,
  token,
  merchantId,
  profileId,
  version = "V1"
}) => {
  const isMixpanel = uri.includes("mixpanel");
  
  if (isMixpanel) {
    return {
      "Content-Type": "application/x-www-form-urlencoded",
      "accept": "application/json"
    };
  }

  const headerObj = { ...headers };

  // Configurar autorización según la versión
  if (token) {
    if (version === "V1") {
      headerObj["authorization"] = `Bearer ${token}`;
      headerObj["api-key"] = "hyperswitch";
    } else if (version === "V2") {
      headerObj["authorization"] = `Bearer ${token}`;
    }
  }

  // Configurar Content-Type
  if (contentType) {
    headerObj["Content-Type"] = contentType;
  }

  // Headers específicos para x-feature
  if (xFeatureRoute) {
    if (uri.includes("lottie-files") || 
        uri.includes("config/merchant") || 
        uri.includes("config/feature")) {
      headerObj["Content-Type"] = "application/json";
    } else {
      headerObj["x-feature"] = "integ-custom";
    }
  }

  // Header específico para Dynamic Routing
  if (uri.includes("dynamic-routing")) {
    headerObj["x-feature"] = "dynamo-simulator";
  }

  // Headers para V2
  if (profileId) {
    headerObj["X-Profile-Id"] = profileId;
  }
  if (merchantId) {
    headerObj["X-Merchant-Id"] = merchantId;
  }

  return headerObj;
};

// Función para construir URL completa
export const buildFullUrl = (baseUrl, endpoint) => {
  return `${baseUrl}/${endpoint}`;
};

// Función para manejar respuestas HTTP
export const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`HTTP ${response.status}: ${errorData.message || response.statusText}`);
  }
  
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return await response.json();
  }
  
  return await response.text();
};

// Función para manejar errores de API
export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  if (error.message.includes('401')) {
    // Manejar sesión expirada
    localStorage.clear();
    window.location.href = '/login';
    return;
  }
  
  throw error;
};

export default {
  V2_ENTITY_TYPES,
  USER_TYPES,
  TRANSACTION_ENTITY,
  BASE_URLS,
  getV2Url,
  getHeaders,
  buildFullUrl,
  handleResponse,
  handleApiError
};

