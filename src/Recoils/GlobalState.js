// GlobalState.js - Estado global usando Zustand (equivalente a Recoil en Control Center)
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Store principal para autenticación
export const useAuthStore = create(
  persist(
    (set, get) => ({
      // Estado de autenticación
      isAuthenticated: false,
      token: null,
      user: null,
      merchantId: null,
      profileId: null,
      organizationId: null,
      
      // Acciones de autenticación
      login: (userData) => set({
        isAuthenticated: true,
        token: userData.token,
        user: userData.user,
        merchantId: userData.merchantId,
        profileId: userData.profileId,
        organizationId: userData.organizationId
      }),
      
      logout: () => set({
        isAuthenticated: false,
        token: null,
        user: null,
        merchantId: null,
        profileId: null,
        organizationId: null
      }),
      
      updateProfile: (profileData) => set(state => ({
        user: { ...state.user, ...profileData }
      })),
      
      setMerchantId: (merchantId) => set({ merchantId }),
      setProfileId: (profileId) => set({ profileId })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        user: state.user,
        merchantId: state.merchantId,
        profileId: state.profileId,
        organizationId: state.organizationId
      })
    }
  )
);

// Store para configuración de la aplicación
export const useConfigStore = create((set, get) => ({
  // Configuración de tema
  theme: 'light',
  sidebarCollapsed: false,
  
  // Configuración de API
  apiBaseUrl: 'https://sandbox.hyperswitch.io',
  apiVersion: 'v1',
  
  // Configuración de features
  features: {
    analytics: true,
    payments: true,
    connectors: true,
    routing: true,
    disputes: true,
    refunds: true,
    users: true,
    webhooks: true
  },
  
  // Acciones
  setTheme: (theme) => set({ theme }),
  toggleSidebar: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setApiConfig: (config) => set(state => ({
    apiBaseUrl: config.baseUrl || state.apiBaseUrl,
    apiVersion: config.version || state.apiVersion
  })),
  updateFeatures: (features) => set(state => ({
    features: { ...state.features, ...features }
  }))
}));

// Store para datos de la aplicación
export const useDataStore = create((set, get) => ({
  // Cache de datos
  connectors: [],
  payments: [],
  customers: [],
  analytics: {},
  
  // Estados de carga
  loading: {
    connectors: false,
    payments: false,
    customers: false,
    analytics: false
  },
  
  // Errores
  errors: {
    connectors: null,
    payments: null,
    customers: null,
    analytics: null
  },
  
  // Acciones para conectores
  setConnectors: (connectors) => set({ connectors }),
  setConnectorsLoading: (loading) => set(state => ({
    loading: { ...state.loading, connectors: loading }
  })),
  setConnectorsError: (error) => set(state => ({
    errors: { ...state.errors, connectors: error }
  })),
  
  // Acciones para pagos
  setPayments: (payments) => set({ payments }),
  setPaymentsLoading: (loading) => set(state => ({
    loading: { ...state.loading, payments: loading }
  })),
  setPaymentsError: (error) => set(state => ({
    errors: { ...state.errors, payments: error }
  })),
  
  // Acciones para clientes
  setCustomers: (customers) => set({ customers }),
  setCustomersLoading: (loading) => set(state => ({
    loading: { ...state.loading, customers: loading }
  })),
  setCustomersError: (error) => set(state => ({
    errors: { ...state.errors, customers: error }
  })),
  
  // Acciones para analytics
  setAnalytics: (analytics) => set({ analytics }),
  setAnalyticsLoading: (loading) => set(state => ({
    loading: { ...state.loading, analytics: loading }
  })),
  setAnalyticsError: (error) => set(state => ({
    errors: { ...state.errors, analytics: error }
  })),
  
  // Limpiar datos
  clearData: () => set({
    connectors: [],
    payments: [],
    customers: [],
    analytics: {},
    errors: {
      connectors: null,
      payments: null,
      customers: null,
      analytics: null
    }
  })
}));

// Store para UI state
export const useUIStore = create((set, get) => ({
  // Modales
  modals: {
    createConnector: false,
    editConnector: false,
    deleteConfirm: false,
    userProfile: false,
    settings: false
  },
  
  // Notificaciones
  notifications: [],
  
  // Filtros y búsqueda
  filters: {
    dateRange: null,
    status: null,
    connector: null,
    searchTerm: ''
  },
  
  // Paginación
  pagination: {
    page: 1,
    limit: 20,
    total: 0
  },
  
  // Acciones para modales
  openModal: (modalName) => set(state => ({
    modals: { ...state.modals, [modalName]: true }
  })),
  
  closeModal: (modalName) => set(state => ({
    modals: { ...state.modals, [modalName]: false }
  })),
  
  closeAllModals: () => set(state => ({
    modals: Object.keys(state.modals).reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {})
  })),
  
  // Acciones para notificaciones
  addNotification: (notification) => set(state => ({
    notifications: [...state.notifications, {
      id: Date.now(),
      timestamp: new Date(),
      ...notification
    }]
  })),
  
  removeNotification: (id) => set(state => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
  
  clearNotifications: () => set({ notifications: [] }),
  
  // Acciones para filtros
  setFilters: (filters) => set(state => ({
    filters: { ...state.filters, ...filters }
  })),
  
  clearFilters: () => set({
    filters: {
      dateRange: null,
      status: null,
      connector: null,
      searchTerm: ''
    }
  }),
  
  // Acciones para paginación
  setPagination: (pagination) => set(state => ({
    pagination: { ...state.pagination, ...pagination }
  })),
  
  resetPagination: () => set({
    pagination: { page: 1, limit: 20, total: 0 }
  })
}));

// Selectores útiles
export const useAuthSelectors = () => {
  const store = useAuthStore();
  return {
    isAuthenticated: store.isAuthenticated,
    user: store.user,
    token: store.token,
    merchantId: store.merchantId,
    profileId: store.profileId,
    hasRole: (role) => store.user?.roles?.includes(role) || false,
    hasPermission: (permission) => store.user?.permissions?.includes(permission) || false
  };
};

export const useDataSelectors = () => {
  const store = useDataStore();
  return {
    isLoading: Object.values(store.loading).some(Boolean),
    hasErrors: Object.values(store.errors).some(Boolean),
    getError: (key) => store.errors[key],
    isLoadingKey: (key) => store.loading[key]
  };
};

// Hook para limpiar todo el estado
export const useClearAllState = () => {
  const clearAuth = useAuthStore(state => state.logout);
  const clearData = useDataStore(state => state.clearData);
  const clearNotifications = useUIStore(state => state.clearNotifications);
  const closeAllModals = useUIStore(state => state.closeAllModals);
  
  return () => {
    clearAuth();
    clearData();
    clearNotifications();
    closeAllModals();
  };
};

export default {
  useAuthStore,
  useConfigStore,
  useDataStore,
  useUIStore,
  useAuthSelectors,
  useDataSelectors,
  useClearAllState
};
