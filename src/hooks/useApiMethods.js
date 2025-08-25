import { useState, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthProvider';
import { useUserInfo } from '../context/UserInfoProvider';
import APIUtils from '../APIUtils/APIUtils';
import { V2_ENTITY_TYPES, HTTP_METHODS } from '../APIUtils/APIUtilsTypes';

// Hook para manejar el progreso de las peticiones
export const useApiProgress = () => {
  const [pendingRequests, setPendingRequests] = useState(0);
  const isLoading = pendingRequests > 0;

  const incrementProgress = useCallback(() => {
    setPendingRequests(prev => prev + 1);
  }, []);

  const decrementProgress = useCallback(() => {
    setPendingRequests(prev => Math.max(0, prev - 1));
  }, []);

  return {
    isLoading,
    pendingRequests,
    incrementProgress,
    decrementProgress
  };
};

// Hook principal para realizar peticiones a la API
export const useApiFetcher = () => {
  const { token, setAuthStateToLogout } = useAuth();
  const { merchantInfo, profileInfo } = useUserInfo();
  const { incrementProgress, decrementProgress } = useApiProgress();

  const apiFetcher = useCallback(async ({
    uri,
    bodyStr = "",
    bodyFormData = null,
    headers = {},
    method = 'GET',
    contentType = "application/json",
    xFeatureRoute = true,
    forceCookies = false,
    merchantId = merchantInfo?.merchant_id || "",
    profileId = profileInfo?.profile_id || "",
    version = "V1"
  }) => {
    try {
      incrementProgress();

      // Construir headers
      const requestHeaders = APIUtils.getHeaders({
        uri,
        headers,
        contentType,
        xFeatureRoute,
        token,
        merchantId,
        profileId,
        version
      });

      // Configurar body
      let body = null;
      if (method !== 'GET') {
        if (bodyFormData) {
          body = bodyFormData;
          // Remover Content-Type para FormData (el navegador lo establece automáticamente)
          delete requestHeaders['Content-Type'];
        } else if (bodyStr) {
          body = bodyStr;
        }
      }

      // Configurar opciones de fetch
      const fetchOptions = {
        method,
        headers: requestHeaders,
        credentials: forceCookies ? 'same-origin' : 'omit'
      };

      if (body) {
        fetchOptions.body = body;
      }

      // Realizar petición
      const response = await fetch(uri, fetchOptions);

      // Manejar respuesta 401 (no autorizado)
      if (response.status === 401) {
        setAuthStateToLogout();
        window.location.href = '/login';
        return response;
      }

      return response;
    } catch (error) {
      console.error('API Fetcher Error:', error);
      throw error;
    } finally {
      decrementProgress();
    }
  }, [token, merchantInfo, profileInfo, setAuthStateToLogout, incrementProgress, decrementProgress]);

  return apiFetcher;
};

// Hook para métodos GET
export const useGetMethod = () => {
  const apiFetcher = useApiFetcher();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const getMethod = useCallback(async (url, options = {}) => {
    try {
      setLoading(true);
      setError(null);

      // Cancelar petición anterior si existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Crear nuevo AbortController
      abortControllerRef.current = new AbortController();

      const response = await apiFetcher({
        uri: url,
        method: 'GET',
        ...options
      });

      const data = await APIUtils.handleResponse(response);
      return data;
    } catch (error) {
      if (error.name !== 'AbortError') {
        setError(error);
        APIUtils.handleApiError(error);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, [apiFetcher]);

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    getMethod,
    loading,
    error,
    cancelRequest
  };
};

// Hook para métodos de actualización (POST, PUT, PATCH, DELETE)
export const useUpdateMethod = () => {
  const apiFetcher = useApiFetcher();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateMethod = useCallback(async (url, options = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiFetcher({
        uri: url,
        method: 'POST',
        ...options
      });

      const data = await APIUtils.handleResponse(response);
      return data;
    } catch (error) {
      setError(error);
      APIUtils.handleApiError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [apiFetcher]);

  return {
    updateMethod,
    loading,
    error
  };
};

// Hook para manejar logout
export const useHandleLogout = () => {
  const { setAuthStateToLogout } = useAuth();

  const handleLogout = useCallback(async () => {
    try {
      // Realizar petición de logout al servidor si es necesario
      // await apiFetcher({ uri: '/logout', method: 'POST' });
      
      // Limpiar estado de autenticación
      setAuthStateToLogout();
      
      // Redirigir a login
      window.location.href = '/login';
    } catch (error) {
      console.error('Error during logout:', error);
      // Forzar logout incluso si hay error
      setAuthStateToLogout();
      window.location.href = '/login';
    }
  }, [setAuthStateToLogout]);

  return handleLogout;
};

// Hook para construir URLs de API
export const useApiUrl = () => {
  const { merchantInfo, profileInfo } = useUserInfo();

  const buildUrl = useCallback((entityName, options = {}) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || APIUtils.BASE_URLS.SANDBOX;
    
    const urlOptions = {
      entityName,
      merchantId: merchantInfo?.merchant_id,
      profileId: profileInfo?.profile_id,
      ...options
    };

    const endpoint = APIUtils.getV2Url(urlOptions);
    return APIUtils.buildFullUrl(baseUrl, endpoint);
  }, [merchantInfo, profileInfo]);

  return { buildUrl };
};

// Hook para manejar paginación
export const usePagination = (initialPage = 1, initialPageSize = 10) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalItems, setTotalItems] = useState(0);

  const totalPages = Math.ceil(totalItems / pageSize);

  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const goToNextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const goToPreviousPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const changePageSize = useCallback((newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page
  }, []);

  return {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    setTotalItems,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    changePageSize,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1
  };
};

// Hook para manejar filtros
export const useFilters = (initialFilters = {}) => {
  const [filters, setFilters] = useState(initialFilters);

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const removeFilter = useCallback((key) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value);
      }
    });
    
    return params.toString();
  }, [filters]);

  return {
    filters,
    updateFilter,
    removeFilter,
    clearFilters,
    buildQueryString
  };
};

// Hook para métodos específicos de entidades
export const useApiMethods = () => {
  const apiFetcher = useApiFetcher();
  const { buildUrl } = useApiUrl();
  const { merchantInfo, profileInfo } = useUserInfo();

  // Métodos para conectores
  const fetchConnectors = useCallback(async () => {
    const url = buildUrl(V2_ENTITY_TYPES.V2_CONNECTOR, {
      methodType: HTTP_METHODS.GET,
      profileId: profileInfo?.profile_id
    });
    
    const response = await apiFetcher({ uri: url, method: 'GET' });
    return await APIUtils.handleResponse(response);
  }, [apiFetcher, buildUrl, profileInfo]);

  const createConnector = useCallback(async (connectorData) => {
    const url = buildUrl(V2_ENTITY_TYPES.V2_CONNECTOR, {
      methodType: HTTP_METHODS.POST,
      profileId: profileInfo?.profile_id
    });
    
    const response = await apiFetcher({
      uri: url,
      method: 'POST',
      bodyStr: JSON.stringify(connectorData)
    });
    return await APIUtils.handleResponse(response);
  }, [apiFetcher, buildUrl, profileInfo]);

  const updateConnector = useCallback(async (connectorId, connectorData) => {
    const url = buildUrl(V2_ENTITY_TYPES.V2_CONNECTOR, {
      methodType: HTTP_METHODS.PUT,
      id: connectorId,
      profileId: profileInfo?.profile_id
    });
    
    const response = await apiFetcher({
      uri: url,
      method: 'PUT',
      bodyStr: JSON.stringify(connectorData)
    });
    return await APIUtils.handleResponse(response);
  }, [apiFetcher, buildUrl, profileInfo]);

  const deleteConnector = useCallback(async (connectorId) => {
    const url = buildUrl(V2_ENTITY_TYPES.V2_CONNECTOR, {
      methodType: HTTP_METHODS.DELETE,
      id: connectorId,
      profileId: profileInfo?.profile_id
    });
    
    const response = await apiFetcher({ uri: url, method: 'DELETE' });
    return await APIUtils.handleResponse(response);
  }, [apiFetcher, buildUrl, profileInfo]);

  // Métodos para pagos
  const fetchPayments = useCallback(async (queryParams = {}) => {
    const queryString = new URLSearchParams(queryParams).toString();
    const url = buildUrl(V2_ENTITY_TYPES.V2_ORDERS_LIST, {
      methodType: HTTP_METHODS.GET,
      queryParameters: queryString
    });
    
    const response = await apiFetcher({ uri: url, method: 'GET' });
    return await APIUtils.handleResponse(response);
  }, [apiFetcher, buildUrl]);

  const fetchPaymentDetails = useCallback(async (paymentId) => {
    const url = buildUrl(V2_ENTITY_TYPES.V2_ORDERS_LIST, {
      methodType: HTTP_METHODS.GET,
      id: paymentId
    });
    
    const response = await apiFetcher({ uri: url, method: 'GET' });
    return await APIUtils.handleResponse(response);
  }, [apiFetcher, buildUrl]);

  const createPayment = useCallback(async (paymentData) => {
    const url = buildUrl(V2_ENTITY_TYPES.V2_ORDERS_LIST, {
      methodType: HTTP_METHODS.POST
    });
    
    const response = await apiFetcher({
      uri: url,
      method: 'POST',
      bodyStr: JSON.stringify(paymentData)
    });
    return await APIUtils.handleResponse(response);
  }, [apiFetcher, buildUrl]);

  // Métodos para clientes
  const fetchCustomers = useCallback(async () => {
    const url = buildUrl(V2_ENTITY_TYPES.CUSTOMERS, {
      methodType: HTTP_METHODS.GET
    });
    
    const response = await apiFetcher({ uri: url, method: 'GET' });
    return await APIUtils.handleResponse(response);
  }, [apiFetcher, buildUrl]);

  const fetchCustomerDetails = useCallback(async (customerId) => {
    const url = buildUrl(V2_ENTITY_TYPES.CUSTOMERS, {
      methodType: HTTP_METHODS.GET,
      id: customerId
    });
    
    const response = await apiFetcher({ uri: url, method: 'GET' });
    return await APIUtils.handleResponse(response);
  }, [apiFetcher, buildUrl]);

  // Métodos para analytics
  const fetchAnalytics = useCallback(async (queryParams = {}) => {
    const queryString = new URLSearchParams(queryParams).toString();
    const url = buildUrl(V2_ENTITY_TYPES.V2_ORDERS_AGGREGATE, {
      methodType: HTTP_METHODS.GET,
      queryParameters: queryString,
      transactionEntity: 'Profile'
    });
    
    const response = await apiFetcher({ uri: url, method: 'GET' });
    return await APIUtils.handleResponse(response);
  }, [apiFetcher, buildUrl]);

  const fetchPaymentFilters = useCallback(async () => {
    const url = buildUrl(V2_ENTITY_TYPES.V2_ORDER_FILTERS, {
      methodType: HTTP_METHODS.GET
    });
    
    const response = await apiFetcher({ uri: url, method: 'GET' });
    return await APIUtils.handleResponse(response);
  }, [apiFetcher, buildUrl]);

  // Métodos para usuarios
  const fetchUsers = useCallback(async (userType = 'LIST_MERCHANT') => {
    const url = buildUrl(V2_ENTITY_TYPES.USERS, {
      methodType: HTTP_METHODS.GET,
      userType
    });
    
    const response = await apiFetcher({ uri: url, method: 'GET' });
    return await APIUtils.handleResponse(response);
  }, [apiFetcher, buildUrl]);

  const createUser = useCallback(async (userData) => {
    const url = buildUrl(V2_ENTITY_TYPES.USERS, {
      methodType: HTTP_METHODS.POST,
      userType: 'CREATE_MERCHANT'
    });
    
    const response = await apiFetcher({
      uri: url,
      method: 'POST',
      bodyStr: JSON.stringify(userData)
    });
    return await APIUtils.handleResponse(response);
  }, [apiFetcher, buildUrl]);

  return {
    // Conectores
    fetchConnectors,
    createConnector,
    updateConnector,
    deleteConnector,
    
    // Pagos
    fetchPayments,
    fetchPaymentDetails,
    createPayment,
    
    // Clientes
    fetchCustomers,
    fetchCustomerDetails,
    
    // Analytics
    fetchAnalytics,
    fetchPaymentFilters,
    
    // Usuarios
    fetchUsers,
    createUser
  };
};

export default {
  useApiProgress,
  useApiFetcher,
  useGetMethod,
  useUpdateMethod,
  useHandleLogout,
  useApiUrl,
  usePagination,
  useFilters,
  useApiMethods
};

