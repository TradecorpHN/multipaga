import React, { useState, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthProvider.jsx';
import { UserInfoProvider } from './context/UserInfoProvider.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import HyperswitchProvider from './context/HyperswitchProvider.jsx';
import { AUTH_STATUS } from './context/AuthProvider.jsx';
import { Loader2, Shield } from 'lucide-react';
import './App.css';

// Lazy loading de componentes para mejor rendimiento
const LoginPage = React.lazy(() => import('./components/LoginPage.jsx'));
const TwoFactorAuth = React.lazy(() => import('./components/TwoFactorAuth.jsx'));
const MainLayout = React.lazy(() => import('./components/MainLayout.jsx'));
const Dashboard = React.lazy(() => import('./components/Dashboard.jsx'));
const PaymentsModule = React.lazy(() => import('./components/PaymentsModule.jsx'));
const AnalyticsModule = React.lazy(() => import('./components/AnalyticsModule.jsx'));
const POSModule = React.lazy(() => import('./components/POSModule.jsx'));
const RemittanceModule = React.lazy(() => import('./components/RemittanceModule.jsx'));
const UserManagement = React.lazy(() => import(
  './components/UserManagementModule.jsx'
));
const OrdersModule = React.lazy(() => import(
  './components/OrdersModule.jsx'
));
const ConnectorsModule = React.lazy(() => import(
    './components/ConnectorsModule.jsx'
));
const ConnectorSummary = React.lazy(() => import(
    './components/ConnectorSummary.jsx'
));
const SettingsModule = React.lazy(() => import(
  './components/SettingsModule.jsx'
));
const DeveloperToolsModule = React.lazy(() => import(
  './components/DeveloperToolsModule.jsx'
));
const LoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
    <div className="text-center">
      <div className="inline-block bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-2xl mb-6">
        <Shield className="h-12 w-12 text-blue-600 mx-auto" />
      </div>
      <div className="flex items-center space-x-3 text-white">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="text-lg">Cargando Multipaga...</span>
      </div>
      <p className="text-blue-200 text-sm mt-2">Inicializando aplicación...</p>
    </div>
  </div>
);

// Componente de error
const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const handleError = (event) => {
      console.error('Error capturado:', event.error);
      setHasError(true);
      setError(event.error);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center">
        <div className="text-center text-white p-8">
          <Shield className="h-16 w-16 mx-auto mb-4 text-red-300" />
          <h1 className="text-2xl font-bold mb-4">Error en Multipaga</h1>
          <p className="text-red-200 mb-4">Ha ocurrido un error inesperado</p>
          <p className="text-sm text-red-300 mb-6 font-mono">{error?.message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg transition-colors"
          >
            Recargar Aplicación
          </button>
        </div>
      </div>
    );
  }

  return children;
};

// Componente de ruta protegida
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, authStatus } = useAuth();

  if (authStatus === AUTH_STATUS.CHECKING) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Componente principal de la aplicación autenticada
const AuthenticatedApp = () => {
  const [currentModule, setCurrentModule] = useState('dashboard');

  const renderModule = () => {
    try {
      switch (currentModule) {
        case 'dashboard':
          return <Dashboard />;
        case 'payments':
          return <PaymentsModule />;
        case 'orders':
          return <OrdersModule />;
        case 'analytics':
          return <AnalyticsModule />;
        case 'pos':
          return <POSModule />;
        case 'remittance':
          return <RemittanceModule />;
        case 'refunds':
          return <RefundsModule />;
        case 'disputes':
          return <DisputesModule />;
        case 'connectors':
          return <ConnectorsModule />;
        case 'users':
          return <UserManagement />;
        case 'routing':
          return <RoutingModule />;
        case 'settings':
          return <SettingsModule />;
        case 'developer':
          return <DeveloperToolsModule />;
        default:
          return <Dashboard />;
      }
    } catch (error) {
      console.error('Error renderizando módulo:', error);
      return (
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-gray-600 mt-2">Error cargando el módulo {currentModule}</p>
          <button 
            onClick={() => setCurrentModule('dashboard')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Volver al Dashboard
          </button>
        </div>
      );
    }
  };

  return (
    <Suspense fallback={<LoadingScreen />}>
      <MainLayout 
        currentModule={currentModule} 
        onModuleChange={setCurrentModule}
      >
        <Suspense fallback={<LoadingScreen />}>
          {renderModule()}
        </Suspense>
      </MainLayout>
    </Suspense>
  );
};

// Componente de enrutamiento principal
const AppRouter = () => {
  const { authStatus, isAuthenticated } = useAuth();

  console.log('AppRouter - Estado actual:', { authStatus, isAuthenticated });

  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Suspense fallback={<LoadingScreen />}>
                <LoginPage />
              </Suspense>
            )
          } 
        />
        
        <Route 
          path="/2fa" 
          element={
            <Suspense fallback={<LoadingScreen />}>
              <TwoFactorAuth />
            </Suspense>
          } 
        />

        {/* Rutas protegidas */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <HyperswitchProvider>
                <AuthenticatedApp />
              </HyperswitchProvider>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/orders" 
          element={
            <ProtectedRoute>
              <HyperswitchProvider>
                <Suspense fallback={<LoadingScreen />}>
                  <OrdersModule />
                </Suspense>
              </HyperswitchProvider>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/connectors" 
          element={
            <ProtectedRoute>
              <HyperswitchProvider>
                <Suspense fallback={<LoadingScreen />}>
                  <ConnectorsModule />
                </Suspense>
              </HyperswitchProvider>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/connectors/:connectorId" 
          element={
            <ProtectedRoute>
              <HyperswitchProvider>
                <Suspense fallback={<LoadingScreen />}>
                  <ConnectorSummary />
                </Suspense>
              </HyperswitchProvider>
            </ProtectedRoute>
          } 
        />

        {/* Ruta por defecto */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        {/* Ruta 404 */}
        <Route 
          path="*" 
          element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-gray-600 mb-4">Página no encontrada</p>
                <button 
                  onClick={() => window.location.href = '/'}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Volver al inicio
                </button>
              </div>
            </div>
          } 
        />
      </Routes>
    </Router>
  );
};

// Componente principal de la aplicación
const App = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <UserInfoProvider>
            <div className="App">
              <AppRouter />
            </div>
          </UserInfoProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;