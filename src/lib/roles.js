// Sistema de roles y permisos basado en el análisis del control center de Hyperswitch

// Definición de roles basados en el control center
export const USER_ROLES = {
  // Roles de administración
  ADMIN: 'admin',
  ORGANIZATION_ADMIN: 'org_admin',
  
  // Roles de comerciante
  MERCHANT_ADMIN: 'merchant_admin',
  MERCHANT_OPERATOR: 'merchant_operator',
  MERCHANT_VIEWER: 'merchant_viewer',
  
  // Roles de consumidor/cliente
  CONSUMER: 'consumer',
  CONSUMER_PREMIUM: 'consumer_premium',
  
  // Roles específicos de Honduras
  AGENT_HONDURAS: 'agent_honduras',
  PARTNER_BANK: 'partner_bank'
};

// Tipos de usuario basados en el control center
export const USER_TYPES = {
  MERCHANT: 'merchant',
  CONSUMER: 'consumer',
  AGENT: 'agent',
  ADMIN: 'admin'
};

// Permisos granulares basados en el análisis del control center
export const PERMISSIONS = {
  // Permisos de dashboard
  DASHBOARD_VIEW: 'dashboard:view',
  DASHBOARD_ANALYTICS: 'dashboard:analytics',
  
  // Permisos de pagos
  PAYMENTS_VIEW: 'payments:view',
  PAYMENTS_CREATE: 'payments:create',
  PAYMENTS_REFUND: 'payments:refund',
  PAYMENTS_EXPORT: 'payments:export',
  PAYMENTS_MANAGE: 'payments:manage',
  
  // Permisos de analítica
  ANALYTICS_VIEW: 'analytics:view',
  ANALYTICS_EXPORT: 'analytics:export',
  ANALYTICS_ADVANCED: 'analytics:advanced',
  
  // Permisos de conectores
  CONNECTORS_VIEW: 'connectors:view',
  CONNECTORS_CREATE: 'connectors:create',
  CONNECTORS_EDIT: 'connectors:edit',
  CONNECTORS_DELETE: 'connectors:delete',
  
  // Permisos de reembolsos
  REFUNDS_VIEW: 'refunds:view',
  REFUNDS_CREATE: 'refunds:create',
  REFUNDS_MANAGE: 'refunds:manage',
  
  // Permisos de disputas
  DISPUTES_VIEW: 'disputes:view',
  DISPUTES_MANAGE: 'disputes:manage',
  DISPUTES_EVIDENCE: 'disputes:evidence',
  
  // Permisos de configuración
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_EDIT: 'settings:edit',
  SETTINGS_API_KEYS: 'settings:api_keys',
  SETTINGS_WEBHOOKS: 'settings:webhooks',
  
  // Permisos de usuarios
  USERS_VIEW: 'users:view',
  USERS_CREATE: 'users:create',
  USERS_EDIT: 'users:edit',
  USERS_DELETE: 'users:delete',
  USERS_ROLES: 'users:roles',
  USER_MANAGEMENT: 'user:management',
  
  // Permisos específicos de Multipaga
  POS_ACCESS: 'pos:access',
  POS_MANAGE: 'pos:manage',
  REMITTANCE_SEND: 'remittance:send',
  REMITTANCE_RECEIVE: 'remittance:receive',
  REMITTANCE_TRACK: 'remittance:track',
  
  // Permisos específicos de Honduras
  HONDURAS_BANKING: 'honduras:banking',
  HONDURAS_MOBILE_MONEY: 'honduras:mobile_money',
  HONDURAS_COMPLIANCE: 'honduras:compliance'
};

// Mapeo de roles a permisos basado en el control center
export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: [
    // Acceso completo a todo
    ...Object.values(PERMISSIONS)
  ],
  
  [USER_ROLES.ORGANIZATION_ADMIN]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.DASHBOARD_ANALYTICS,
    PERMISSIONS.PAYMENTS_VIEW,
    PERMISSIONS.PAYMENTS_EXPORT,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.ANALYTICS_EXPORT,
    PERMISSIONS.ANALYTICS_ADVANCED,
    PERMISSIONS.CONNECTORS_VIEW,
    PERMISSIONS.REFUNDS_VIEW,
    PERMISSIONS.DISPUTES_VIEW,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_EDIT,
    PERMISSIONS.USERS_ROLES,
    PERMISSIONS.USER_MANAGEMENT
  ],
  
  [USER_ROLES.MERCHANT_ADMIN]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.DASHBOARD_ANALYTICS,
    PERMISSIONS.PAYMENTS_VIEW,
    PERMISSIONS.PAYMENTS_CREATE,
    PERMISSIONS.PAYMENTS_REFUND,
    PERMISSIONS.PAYMENTS_EXPORT,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.ANALYTICS_EXPORT,
    PERMISSIONS.CONNECTORS_VIEW,
    PERMISSIONS.CONNECTORS_CREATE,
    PERMISSIONS.CONNECTORS_EDIT,
    PERMISSIONS.REFUNDS_VIEW,
    PERMISSIONS.REFUNDS_CREATE,
    PERMISSIONS.DISPUTES_VIEW,
    PERMISSIONS.DISPUTES_MANAGE,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_EDIT,
    PERMISSIONS.SETTINGS_API_KEYS,
    PERMISSIONS.SETTINGS_WEBHOOKS,
    PERMISSIONS.POS_ACCESS,
    PERMISSIONS.POS_MANAGE,
    PERMISSIONS.REMITTANCE_SEND,
    PERMISSIONS.REMITTANCE_TRACK,
    PERMISSIONS.HONDURAS_BANKING,
    PERMISSIONS.HONDURAS_MOBILE_MONEY
  ],
  
  [USER_ROLES.MERCHANT_OPERATOR]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PAYMENTS_VIEW,
    PERMISSIONS.PAYMENTS_CREATE,
    PERMISSIONS.PAYMENTS_REFUND,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.CONNECTORS_VIEW,
    PERMISSIONS.REFUNDS_VIEW,
    PERMISSIONS.REFUNDS_CREATE,
    PERMISSIONS.DISPUTES_VIEW,
    PERMISSIONS.POS_ACCESS,
    PERMISSIONS.REMITTANCE_SEND,
    PERMISSIONS.REMITTANCE_TRACK,
    PERMISSIONS.HONDURAS_BANKING,
    PERMISSIONS.HONDURAS_MOBILE_MONEY
  ],
  
  [USER_ROLES.MERCHANT_VIEWER]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PAYMENTS_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.CONNECTORS_VIEW,
    PERMISSIONS.REFUNDS_VIEW,
    PERMISSIONS.DISPUTES_VIEW,
    PERMISSIONS.REMITTANCE_TRACK
  ],
  
  [USER_ROLES.CONSUMER]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PAYMENTS_VIEW,
    PERMISSIONS.REMITTANCE_SEND,
    PERMISSIONS.REMITTANCE_RECEIVE,
    PERMISSIONS.REMITTANCE_TRACK,
    PERMISSIONS.HONDURAS_MOBILE_MONEY
  ],
  
  [USER_ROLES.CONSUMER_PREMIUM]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PAYMENTS_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.REMITTANCE_SEND,
    PERMISSIONS.REMITTANCE_RECEIVE,
    PERMISSIONS.REMITTANCE_TRACK,
    PERMISSIONS.HONDURAS_BANKING,
    PERMISSIONS.HONDURAS_MOBILE_MONEY
  ],
  
  [USER_ROLES.AGENT_HONDURAS]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PAYMENTS_VIEW,
    PERMISSIONS.PAYMENTS_CREATE,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.POS_ACCESS,
    PERMISSIONS.POS_MANAGE,
    PERMISSIONS.REMITTANCE_SEND,
    PERMISSIONS.REMITTANCE_RECEIVE,
    PERMISSIONS.REMITTANCE_TRACK,
    PERMISSIONS.HONDURAS_BANKING,
    PERMISSIONS.HONDURAS_MOBILE_MONEY,
    PERMISSIONS.HONDURAS_COMPLIANCE
  ],
  
  [USER_ROLES.PARTNER_BANK]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PAYMENTS_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.ANALYTICS_EXPORT,
    PERMISSIONS.CONNECTORS_VIEW,
    PERMISSIONS.REFUNDS_VIEW,
    PERMISSIONS.DISPUTES_VIEW,
    PERMISSIONS.HONDURAS_BANKING,
    PERMISSIONS.HONDURAS_COMPLIANCE
  ]
};

// Configuración de módulos por tipo de usuario
export const MODULE_ACCESS = {
  [USER_TYPES.MERCHANT]: {
    dashboard: true,
    payments: true,
    analytics: true,
    pos: true,
    remittance: true,
    refunds: true,
    disputes: true,
    connectors: true,
    settings: true
  },
  
  [USER_TYPES.CONSUMER]: {
    dashboard: true,
    payments: true,
    analytics: false,
    pos: false,
    remittance: true,
    refunds: false,
    disputes: false,
    connectors: false,
    settings: true
  },
  
  [USER_TYPES.AGENT]: {
    dashboard: true,
    payments: true,
    analytics: true,
    pos: true,
    remittance: true,
    refunds: true,
    disputes: false,
    connectors: false,
    settings: true
  },
  
  [USER_TYPES.ADMIN]: {
    dashboard: true,
    payments: true,
    analytics: true,
    pos: true,
    remittance: true,
    refunds: true,
    disputes: true,
    connectors: true,
    settings: true
  }
};

// Funciones de utilidad para manejo de roles y permisos
export const roleUtils = {
  // Verificar si un usuario tiene un permiso específico
  hasPermission: (userRole, permission) => {
    const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
    return rolePermissions.includes(permission);
  },

  // Verificar si un usuario tiene acceso a un módulo
  hasModuleAccess: (userType, module) => {
    const moduleAccess = MODULE_ACCESS[userType] || {};
    return moduleAccess[module] || false;
  },

  // Obtener todos los permisos de un rol
  getRolePermissions: (userRole) => {
    return ROLE_PERMISSIONS[userRole] || [];
  },

  // Verificar si un rol es de tipo comerciante
  isMerchantRole: (userRole) => {
    return [
      USER_ROLES.MERCHANT_ADMIN,
      USER_ROLES.MERCHANT_OPERATOR,
      USER_ROLES.MERCHANT_VIEWER
    ].includes(userRole);
  },

  // Verificar si un rol es de tipo consumidor
  isConsumerRole: (userRole) => {
    return [
      USER_ROLES.CONSUMER,
      USER_ROLES.CONSUMER_PREMIUM
    ].includes(userRole);
  },

  // Verificar si un rol es de administración
  isAdminRole: (userRole) => {
    return [
      USER_ROLES.ADMIN,
      USER_ROLES.ORGANIZATION_ADMIN
    ].includes(userRole);
  },

  // Obtener el tipo de usuario basado en el rol
  getUserTypeFromRole: (userRole) => {
    if (roleUtils.isMerchantRole(userRole)) return USER_TYPES.MERCHANT;
    if (roleUtils.isConsumerRole(userRole)) return USER_TYPES.CONSUMER;
    if (roleUtils.isAdminRole(userRole)) return USER_TYPES.ADMIN;
    if (userRole === USER_ROLES.AGENT_HONDURAS) return USER_TYPES.AGENT;
    return USER_TYPES.CONSUMER; // Default
  },

  // Verificar múltiples permisos
  hasAnyPermission: (userRole, permissions) => {
    return permissions.some(permission => roleUtils.hasPermission(userRole, permission));
  },

  // Verificar que tenga todos los permisos
  hasAllPermissions: (userRole, permissions) => {
    return permissions.every(permission => roleUtils.hasPermission(userRole, permission));
  },

  // Filtrar menú basado en permisos
  filterMenuItems: (userRole, userType, menuItems) => {
    return menuItems.filter(item => {
      // Verificar acceso al módulo
      if (item.module && !roleUtils.hasModuleAccess(userType, item.module)) {
        return false;
      }
      
      // Verificar permisos específicos
      if (item.permissions && item.permissions.length > 0) {
        return roleUtils.hasAnyPermission(userRole, item.permissions);
      }
      
      return true;
    });
  },

  // Simular asignación de rol basado en email (para demo)
  assignRoleFromEmail: (email) => {
    // Lógica de demostración para asignar roles
    if (email.includes('admin')) return USER_ROLES.ADMIN;
    if (email.includes('merchant')) return USER_ROLES.MERCHANT_ADMIN;
    if (email.includes('operator')) return USER_ROLES.MERCHANT_OPERATOR;
    if (email.includes('agent')) return USER_ROLES.AGENT_HONDURAS;
    if (email.includes('bank')) return USER_ROLES.PARTNER_BANK;
    
    // Para el email de sandbox, asignar rol de merchant admin
    if (email === 'andinodane2003@gmail.com') return USER_ROLES.MERCHANT_ADMIN;
    
    // Default para usuarios regulares
    return USER_ROLES.CONSUMER;
  }
};

// Hook personalizado para usar roles y permisos
export const useRoles = (userRole, userType) => {
  return {
    hasPermission: (permission) => roleUtils.hasPermission(userRole, permission),
    hasModuleAccess: (module) => roleUtils.hasModuleAccess(userType, module),
    hasAnyPermission: (permissions) => roleUtils.hasAnyPermission(userRole, permissions),
    hasAllPermissions: (permissions) => roleUtils.hasAllPermissions(userRole, permissions),
    isMerchant: roleUtils.isMerchantRole(userRole),
    isConsumer: roleUtils.isConsumerRole(userRole),
    isAdmin: roleUtils.isAdminRole(userRole),
    userType,
    userRole,
    permissions: roleUtils.getRolePermissions(userRole)
  };
};

export default roleUtils;

