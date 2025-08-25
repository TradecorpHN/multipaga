import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

// Estados de autenticación
export const AUTH_STATUS = {
  CHECKING: 'CheckingAuthStatus',
  LOGGED_OUT: 'LoggedOut',
  PRE_LOGIN: 'PreLogin',
  LOGGED_IN: 'LoggedIn'
};

// Tipos de información de autenticación
export const AUTH_INFO_TYPES = {
  AUTH: 'Auth',
  PRE_LOGIN: 'PreLogin'
};

// Contexto de autenticación
const AuthContext = createContext({
  authStatus: AUTH_STATUS.CHECKING,
  setAuthStatus: () => {},
  setAuthStateToLogout: () => {},
  setAuthMethods: () => {},
  authMethods: [],
  userInfo: null,
  isAuthenticated: false,
  token: null
});

// Utilidades de autenticación
export const AuthUtils = {
  // Obtener información del usuario desde localStorage
  getUserInfoFromLocalStorage: () => {
    try {
      const userInfo = localStorage.getItem('USER_INFO');
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      console.error('Error getting user info from localStorage:', error);
      return null;
    }
  },

  // Obtener información de pre-login desde localStorage
  getPreLoginInfoFromLocalStorage: () => {
    try {
      const preLoginInfo = localStorage.getItem('PRE_LOGIN_INFO');
      return preLoginInfo ? JSON.parse(preLoginInfo) : null;
    } catch (error) {
      console.error('Error getting pre-login info from localStorage:', error);
      return null;
    }
  },

  // Guardar detalles en localStorage
  setDetailsToLocalStorage: (details, key) => {
    try {
      localStorage.setItem(key, JSON.stringify(details));
    } catch (error) {
      console.error('Error setting details to localStorage:', error);
    }
  },

  // Limpiar localStorage
  clearLocalStorage: () => {
    try {
      localStorage.removeItem('USER_INFO');
      localStorage.removeItem('PRE_LOGIN_INFO');
      localStorage.removeItem('login_token');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },

  // Redirigir a login
  redirectToLogin: () => {
    window.location.href = '/login';
  },

  // Verificar si el token es válido
  isTokenValid: (token) => {
    if (!token) return false;
    
    try {
      // Decodificar JWT básico (sin verificación de firma)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      return payload.exp > currentTime;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  },

  // Métodos de autenticación por defecto
  defaultListOfAuth: [
    {
      auth_id: 'password',
      name: 'Password',
      description: 'Login with email and password'
    }
  ]
};

// Utilidades comunes de autenticación
export const CommonAuthUtils = {
  clearLocalStorage: AuthUtils.clearLocalStorage,
  
  // Eliminar cookie
  deleteCookie: (cookieName, domain = window.location.hostname) => {
    try {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`;
    } catch (error) {
      console.error('Error deleting cookie:', error);
    }
  }
};

// Provider de autenticación
export const AuthProvider = ({ children }) => {
  const [authStatus, setAuth] = useState(AUTH_STATUS.CHECKING);
  const [authMethods, setAuthMethods] = useState(AuthUtils.defaultListOfAuth);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Llamada real a la API de Hyperswitch para login
  const signIn = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const result = await import('../lib/auth.js').then(m => m.authService.signIn(email, password));
      setLoading(false);
      if (result.requires2FA) {
        setAuthStatus({ type: AUTH_STATUS.PRE_LOGIN, info: { type: AUTH_INFO_TYPES.PRE_LOGIN, data: { email } } });
      } else if (result.success) {
        setAuthStatus({ type: AUTH_STATUS.LOGGED_IN, info: { type: AUTH_INFO_TYPES.AUTH, data: { email } } });
      }
      return result;
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Error de autenticación');
      throw err;
    }
  };

  // Llamada real a la API de Hyperswitch para magic link
  const signInWithMagicLink = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const result = await import('../lib/auth.js').then(m => m.authService.signInWithMagicLink(email));
      setLoading(false);
      return result.success;
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Error enviando magic link');
      throw err;
    }
  };

  // Función para establecer el estado de autenticación
  const setAuthStatus = useCallback((newAuthStatus) => {
    switch (newAuthStatus.type || newAuthStatus) {
      case AUTH_STATUS.LOGGED_IN:
        const loginInfo = newAuthStatus.info;
        if (loginInfo && loginInfo.type === AUTH_INFO_TYPES.AUTH) {
          const totpInfo = loginInfo.data;
          if (totpInfo.token && AuthUtils.isTokenValid(totpInfo.token)) {
            setAuth(newAuthStatus);
            setUserInfo(totpInfo);
            AuthUtils.setDetailsToLocalStorage(totpInfo, 'USER_INFO');
          } else {
            setAuth(AUTH_STATUS.LOGGED_OUT);
            setUserInfo(null);
            CommonAuthUtils.clearLocalStorage();
          }
        }
        break;

      case AUTH_STATUS.PRE_LOGIN:
        const preLoginInfo = newAuthStatus.info;
        setAuth(newAuthStatus);
        AuthUtils.setDetailsToLocalStorage(preLoginInfo, 'PRE_LOGIN_INFO');
        break;

      case AUTH_STATUS.LOGGED_OUT:
        setAuth(AUTH_STATUS.LOGGED_OUT);
        setUserInfo(null);
        CommonAuthUtils.clearLocalStorage();
        break;

      case AUTH_STATUS.CHECKING:
        setAuth(AUTH_STATUS.CHECKING);
        break;

      default:
        setAuth(AUTH_STATUS.CHECKING);
    }
  }, []);

  // Función para cerrar sesión
  const setAuthStateToLogout = useCallback(() => {
    setAuth(AUTH_STATUS.LOGGED_OUT);
    setUserInfo(null);
    CommonAuthUtils.clearLocalStorage();
    CommonAuthUtils.deleteCookie('login_token');
  }, []);

  // Verificar autenticación al cargar
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const savedUserInfo = AuthUtils.getUserInfoFromLocalStorage();
        const savedPreLoginInfo = AuthUtils.getPreLoginInfoFromLocalStorage();

        if (savedUserInfo && savedUserInfo.token && AuthUtils.isTokenValid(savedUserInfo.token)) {
          setAuth(AUTH_STATUS.LOGGED_IN);
          setUserInfo(savedUserInfo);
        } else if (savedPreLoginInfo) {
          setAuth(AUTH_STATUS.PRE_LOGIN);
        } else {
          setAuth(AUTH_STATUS.LOGGED_OUT);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setAuth(AUTH_STATUS.LOGGED_OUT);
      }
    };

    checkAuthStatus();
  }, []);

  // Valores derivados
  const isAuthenticated = authStatus === AUTH_STATUS.LOGGED_IN;
  const token = userInfo?.token || null;

  const contextValue = {
  authStatus,
  setAuthStatus,
  setAuthStateToLogout,
  setAuthMethods,
  authMethods,
  userInfo,
  isAuthenticated,
  token,
  signIn,
  signInWithMagicLink,
  loading,
  error
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

// Hook para obtener información del usuario
export const useUserInfo = () => {
  const { userInfo, isAuthenticated } = useAuth();
  return { userInfo, isAuthenticated };
};

export default AuthProvider;

