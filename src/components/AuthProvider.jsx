import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService, AUTH_STATES } from '../lib/auth.js';

// Contexto de autenticación
const AuthContext = createContext();

// Estados iniciales
const initialState = {
  authStatus: AUTH_STATES.CHECKING_AUTH,
  user: null,
  merchantInfo: null,
  loading: false,
  error: null,
  requires2FA: false,
  tempToken: null
};

// Reducer para manejar los estados de autenticación
const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload, error: null };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_AUTH_STATUS':
      return { ...state, authStatus: action.payload };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        authStatus: AUTH_STATES.LOGGED_IN,
        user: action.payload.user,
        merchantInfo: action.payload.merchantInfo,
        loading: false,
        error: null,
        requires2FA: false,
        tempToken: null
      };
    
    case 'REQUIRE_2FA':
      return {
        ...state,
        authStatus: AUTH_STATES.PRE_LOGIN,
        requires2FA: true,
        tempToken: action.payload.token,
        loading: false,
        error: null
      };
    
    case '2FA_SUCCESS':
      return {
        ...state,
        authStatus: AUTH_STATES.LOGGED_IN,
        user: action.payload.user,
        merchantInfo: action.payload.merchantInfo,
        requires2FA: false,
        tempToken: null,
        loading: false,
        error: null
      };
    
    case 'LOGOUT':
      return {
        ...initialState,
        authStatus: AUTH_STATES.LOGGED_OUT
      };
    
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    
    default:
      return state;
  }
};

// Proveedor de autenticación
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Verificar autenticación al cargar la aplicación
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      if (authService.isAuthenticated()) {
        const userInfo = authService.getUserInfo();
        const merchantInfo = authService.getMerchantInfo();
        
        // Verificar que el token siga siendo válido
        const result = await authService.getCurrentUser();
        
        if (result.success) {
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: result.user,
              merchantInfo
            }
          });
        } else {
          // Token inválido, limpiar datos
          authService.clearAuth();
          dispatch({ type: 'SET_AUTH_STATUS', payload: AUTH_STATES.LOGGED_OUT });
        }
      } else {
        dispatch({ type: 'SET_AUTH_STATUS', payload: AUTH_STATES.LOGGED_OUT });
      }
    } catch (error) {
      console.error('Error verificando estado de autenticación:', error);
      authService.clearAuth();
      dispatch({ type: 'SET_AUTH_STATUS', payload: AUTH_STATES.LOGGED_OUT });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const signIn = async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const result = await authService.signIn(email, password);
      
      if (result.requires2FA) {
        dispatch({
          type: 'REQUIRE_2FA',
          payload: { token: result.token }
        });
      } else if (result.success) {
        // Login exitoso sin 2FA
        const merchantInfo = authService.getMerchantInfo();
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: authService.getUserInfo(),
            merchantInfo
          }
        });
        // Redirigir al dashboard después de un login exitoso
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error en login:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Error de conexión' });
    }
  };

  const signInWithMagicLink = async (email) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const result = await authService.signInWithMagicLink(email);
      
      if (result.success) {
        dispatch({ type: 'SET_ERROR', payload: null });
        return { success: true, message: result.message };
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error });
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error enviando magic link:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error de conexión' });
      return { success: false, error: 'Error de conexión' };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const verifyTOTP = async (totp) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const result = await authService.verifyTOTP(totp);
      
      if (result.success) {
        // Obtener información actualizada del usuario
        const userResult = await authService.getCurrentUser();
        
        if (userResult.success) {
          const merchantInfo = authService.getMerchantInfo();
          dispatch({
            type: '2FA_SUCCESS',
            payload: {
              user: userResult.user,
              merchantInfo
            }
          });
        }
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error });
      }
    } catch (error) {
      console.error('Error verificando TOTP:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error de conexión' });
    }
  };

  const verifyRecoveryCode = async (recoveryCode) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const result = await authService.verifyRecoveryCode(recoveryCode);
      
      if (result.success) {
        // Obtener información actualizada del usuario
        const userResult = await authService.getCurrentUser();
        
        if (userResult.success) {
          const merchantInfo = authService.getMerchantInfo();
          dispatch({
            type: '2FA_SUCCESS',
            payload: {
              user: userResult.user,
              merchantInfo
            }
          });
        }
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error });
      }
    } catch (error) {
      console.error('Error verificando código de recuperación:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error de conexión' });
    }
  };

  const signOut = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      await authService.signOut();
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Error cerrando sesión:', error);
      // Limpiar estado local aunque falle la API
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  const value = {
    // Estado
    ...state,
    
    // Acciones
    signIn,
    signInWithMagicLink,
    verifyTOTP,
    verifyRecoveryCode,
    signOut,
    updateUser,
    clearError,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export default AuthProvider;

