import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthProvider.jsx';

// Contexto de información del usuario
const UserInfoContext = createContext({
  userInfo: null,
  merchantInfo: null,
  profileInfo: null,
  permissions: [],
  roles: [],
  updateUserInfo: () => {},
  updateMerchantInfo: () => {},
  updateProfileInfo: () => {},
  hasPermission: () => false,
  hasRole: () => false,
  isLoading: false
});

// Tipos de versión de API
export const API_VERSIONS = {
  V1: 'V1',
  V2: 'V2'
};

// Utilidades de información del usuario
export const UserInfoUtils = {
  // Obtener información del merchant desde localStorage
  getMerchantInfoFromLocalStorage: () => {
    try {
      const merchantInfo = localStorage.getItem('MERCHANT_INFO');
      return merchantInfo ? JSON.parse(merchantInfo) : null;
    } catch (error) {
      console.error('Error getting merchant info from localStorage:', error);
      return null;
    }
  },

  // Obtener información del perfil desde localStorage
  getProfileInfoFromLocalStorage: () => {
    try {
      const profileInfo = localStorage.getItem('PROFILE_INFO');
      return profileInfo ? JSON.parse(profileInfo) : null;
    } catch (error) {
      console.error('Error getting profile info from localStorage:', error);
      return null;
    }
  },

  // Guardar información del merchant en localStorage
  setMerchantInfoToLocalStorage: (merchantInfo) => {
    try {
      localStorage.setItem('MERCHANT_INFO', JSON.stringify(merchantInfo));
    } catch (error) {
      console.error('Error setting merchant info to localStorage:', error);
    }
  },

  // Guardar información del perfil en localStorage
  setProfileInfoToLocalStorage: (profileInfo) => {
    try {
      localStorage.setItem('PROFILE_INFO', JSON.stringify(profileInfo));
    } catch (error) {
      console.error('Error setting profile info to localStorage:', error);
    }
  },

  // Limpiar información del usuario
  clearUserInfo: () => {
    try {
      localStorage.removeItem('MERCHANT_INFO');
      localStorage.removeItem('PROFILE_INFO');
    } catch (error) {
      console.error('Error clearing user info:', error);
    }
  },

  // Extraer permisos del usuario
  extractPermissions: (userInfo) => {
    if (!userInfo) return [];
    
    const permissions = [];
    
    // Extraer permisos de roles
    if (userInfo.roles && Array.isArray(userInfo.roles)) {
      userInfo.roles.forEach(role => {
        if (role.permissions && Array.isArray(role.permissions)) {
          permissions.push(...role.permissions);
        }
      });
    }
    
    // Extraer permisos directos
    if (userInfo.permissions && Array.isArray(userInfo.permissions)) {
      permissions.push(...userInfo.permissions);
    }
    
    // Remover duplicados
    return [...new Set(permissions)];
  },

  // Extraer roles del usuario
  extractRoles: (userInfo) => {
    if (!userInfo || !userInfo.roles) return [];
    
    return userInfo.roles.map(role => role.name || role.role_name || role);
  },

  // Verificar si el usuario tiene un permiso específico
  hasPermission: (permissions, permission) => {
    if (!Array.isArray(permissions)) return false;
    return permissions.includes(permission);
  },

  // Verificar si el usuario tiene un rol específico
  hasRole: (roles, role) => {
    if (!Array.isArray(roles)) return false;
    return roles.includes(role);
  }
};

// Provider de información del usuario
export const UserInfoProvider = ({ children }) => {
  const { userInfo: authUserInfo, isAuthenticated } = useAuth();
  const [userInfo, setUserInfo] = useState(null);
  const [merchantInfo, setMerchantInfo] = useState(null);
  const [profileInfo, setProfileInfo] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Actualizar información del usuario
  const updateUserInfo = useCallback((newUserInfo) => {
    setUserInfo(newUserInfo);
    
    if (newUserInfo) {
      const extractedPermissions = UserInfoUtils.extractPermissions(newUserInfo);
      const extractedRoles = UserInfoUtils.extractRoles(newUserInfo);
      
      setPermissions(extractedPermissions);
      setRoles(extractedRoles);
    } else {
      setPermissions([]);
      setRoles([]);
    }
  }, []);

  // Actualizar información del merchant
  const updateMerchantInfo = useCallback((newMerchantInfo) => {
    setMerchantInfo(newMerchantInfo);
    if (newMerchantInfo) {
      UserInfoUtils.setMerchantInfoToLocalStorage(newMerchantInfo);
    }
  }, []);

  // Actualizar información del perfil
  const updateProfileInfo = useCallback((newProfileInfo) => {
    setProfileInfo(newProfileInfo);
    if (newProfileInfo) {
      UserInfoUtils.setProfileInfoToLocalStorage(newProfileInfo);
    }
  }, []);

  // Verificar permiso
  const hasPermission = useCallback((permission) => {
    return UserInfoUtils.hasPermission(permissions, permission);
  }, [permissions]);

  // Verificar rol
  const hasRole = useCallback((role) => {
    return UserInfoUtils.hasRole(roles, role);
  }, [roles]);

  // Cargar información del usuario al autenticarse
  useEffect(() => {
    if (isAuthenticated && authUserInfo) {
      updateUserInfo(authUserInfo);
      
      // Cargar información adicional desde localStorage
      const savedMerchantInfo = UserInfoUtils.getMerchantInfoFromLocalStorage();
      const savedProfileInfo = UserInfoUtils.getProfileInfoFromLocalStorage();
      
      if (savedMerchantInfo) {
        setMerchantInfo(savedMerchantInfo);
      }
      
      if (savedProfileInfo) {
        setProfileInfo(savedProfileInfo);
      }
    } else {
      // Limpiar información al cerrar sesión
      setUserInfo(null);
      setMerchantInfo(null);
      setProfileInfo(null);
      setPermissions([]);
      setRoles([]);
      UserInfoUtils.clearUserInfo();
    }
  }, [isAuthenticated, authUserInfo, updateUserInfo]);

  const contextValue = {
    userInfo,
    merchantInfo,
    profileInfo,
    permissions,
    roles,
    updateUserInfo,
    updateMerchantInfo,
    updateProfileInfo,
    hasPermission,
    hasRole,
    isLoading
  };

  return (
    <UserInfoContext.Provider value={contextValue}>
      {children}
    </UserInfoContext.Provider>
  );
};

// Hook para usar el contexto de información del usuario
export const useUserInfo = () => {
  const context = useContext(UserInfoContext);
  if (!context) {
    throw new Error('useUserInfo debe ser usado dentro de UserInfoProvider');
  }
  return context;
};

// Hook para obtener información del merchant
export const useMerchantInfo = () => {
  const { merchantInfo, updateMerchantInfo } = useUserInfo();
  return { merchantInfo, updateMerchantInfo };
};

// Hook para obtener información del perfil
export const useProfileInfo = () => {
  const { profileInfo, updateProfileInfo } = useUserInfo();
  return { profileInfo, updateProfileInfo };
};

// Hook para verificar permisos
export const usePermissions = () => {
  const { permissions, hasPermission } = useUserInfo();
  return { permissions, hasPermission };
};

// Hook para verificar roles
export const useRoles = () => {
  const { roles, hasRole } = useUserInfo();
  return { roles, hasRole };
};

export default UserInfoProvider;

