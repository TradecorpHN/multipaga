import React, { useState } from 'react';
import { useAuth } from '../context/AuthProvider.jsx';
import { roleUtils, PERMISSIONS, USER_TYPES } from '../lib/roles.js';
import { Button } from './ui/button.jsx';
import { Badge } from './ui/badge.jsx';
import { 
  Home, 
  CreditCard, 
  BarChart3, 
  ShoppingCart, 
  Send, 
  RefreshCw,
  AlertTriangle,
  Plug,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  MapPin,
  Users
} from 'lucide-react';

const MainLayout = ({ children, currentModule, onModuleChange }) => {
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Determinar rol y tipo de usuario
  const userRole = user?.role || roleUtils.assignRoleFromEmail(user?.email || "");
  const userType = roleUtils.getUserTypeFromRole(userRole);

  // Definir elementos del menú con permisos
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      module: "dashboard",
      permissions: [PERMISSIONS.DASHBOARD_VIEW]
    },
    {
      id: "payments",
      label: "Pagos",
      icon: CreditCard,
      module: "payments",
      permissions: [PERMISSIONS.PAYMENTS_VIEW]
    },
    {
      id: "analytics",
      label: "Analítica",
      icon: BarChart3,
      module: "analytics",
      permissions: [PERMISSIONS.ANALYTICS_VIEW]
    },
    {
      id: "pos",
      label: "Gestión POS",
      icon: ShoppingCart,
      module: "pos",
      permissions: [PERMISSIONS.POS_ACCESS]
    },
    {
      id: "remittance",
      label: "Remesas",
      icon: Send,
      module: "remittance",
      permissions: [PERMISSIONS.REMITTANCE_SEND, PERMISSIONS.REMITTANCE_RECEIVE]
    },
    {
      id: "refunds",
      label: "Reembolsos",
      icon: RefreshCw,
      module: "refunds",
      permissions: [PERMISSIONS.REFUNDS_VIEW]
    },
    {
      id: "disputes",
      label: "Disputas",
      icon: AlertTriangle,
      module: "disputes",
      permissions: [PERMISSIONS.DISPUTES_VIEW]
    },
    {
      id: "connectors",
      label: "Conectores",
      icon: Plug,
      module: "connectors",
      permissions: [PERMISSIONS.CONNECTORS_VIEW]
    },
    {
      id: "users",
      label: "Gestión de Usuarios",
      icon: Users,
      module: "users",
      permissions: [PERMISSIONS.USER_MANAGEMENT]
    },
    {
      id: "settings",
      label: "Configuración",
      icon: Settings,
      module: "settings",
      permissions: [PERMISSIONS.SETTINGS_VIEW]
    }
  ];

  // Filtrar menú basado en roles y permisos
  const filteredMenuItems = roleUtils.filterMenuItems(userRole, userType, menuItems);

  const getRoleDisplayName = (role) => {
    const roleNames = {
      admin: "Administrador",
      org_admin: "Admin. Organización",
      merchant_admin: "Admin. Comerciante",
      merchant_operator: "Operador Comerciante",
      merchant_viewer: "Visualizador Comerciante",
      consumer: "Consumidor",
      consumer_premium: "Consumidor Premium",
      agent_honduras: "Agente Honduras",
      partner_bank: "Banco Socio"
    };
    return roleNames[role] || role;
  };

  const getRoleBadgeColor = (role) => {
    if (roleUtils.isAdminRole(role)) return "bg-red-100 text-red-800";
    if (roleUtils.isMerchantRole(role)) return "bg-blue-100 text-blue-800";
    if (roleUtils.isConsumerRole(role)) return "bg-green-100 text-green-800";
    return "bg-gray-100 text-gray-800";
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 transform ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 glass-effect-dark`}>
        
        {/* Header del sidebar */}
        <div className="flex items-center justify-between h-16 px-6 bg-black/20 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="logo-container">
              <img 
                src="/logo.png" 
                alt="Multipaga" 
                className="h-8 w-auto logo-glow"
              />
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Información del usuario */}
        <div className="px-6 py-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center neon-glow">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name || user?.email || "Usuario"}
              </p>
              <Badge className={`text-xs mt-1 ${getRoleBadgeColor(userRole)}`}>
                {getRoleDisplayName(userRole)}
              </Badge>
            </div>
          </div>
          
          {/* Indicador de ubicación */}
          <div className="mt-3 flex items-center space-x-2 text-xs text-blue-200">
            <MapPin className="h-3 w-3" />
            <span>Honduras 🇭🇳</span>
            <Badge variant="outline" className="text-xs border-green-400 text-green-400 bg-green-400/10">
              En Línea
            </Badge>
          </div>
        </div>

        {/* Navegación */}
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {filteredMenuItems.map((item) => {
              const isActive = currentModule === item.id;
              const Icon = item.icon;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onModuleChange(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg neon-glow"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full pulse-slow"></div>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Información adicional */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10">
          <div className="space-y-3">
            {/* Información de conexión */}
            <div className="text-xs text-blue-200">
              <p className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Conectado a Sandbox</span>
              </p>
              <p className="mt-1">Hyperswitch API v1.0</p>
            </div>
            
            {/* Botón de cerrar sesión */}
            <Button
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className="w-full text-white border-white/20 hover:bg-white/10 button-glow"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 lg:ml-0">
        {/* Header móvil */}
        <div className="lg:hidden bg-card/80 backdrop-blur-sm border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-foreground hover:text-primary transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-3">
              <img 
                src="/logo.png" 
                alt="Multipaga" 
                className="h-6 w-auto logo-container"
              />
            </div>
            <div className="w-6"></div> {/* Spacer */}
          </div>
        </div>

        {/* Contenido */}
        <main className="flex-1 bg-background">
          {children}
        </main>
      </div>

      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default MainLayout;

