import React, { useState } from 'react';
import { useAuth } from '../context/AuthProvider.jsx';
import { AUTH_STATES } from '../lib/auth.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.jsx';
import { Button } from './ui/button.jsx';
import { Input } from './ui/input.jsx';
import { Badge } from './ui/badge.jsx';
import { Alert, AlertDescription } from './ui/alert.jsx';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle,
  Globe,
  Shield
} from 'lucide-react';

const LoginPage = () => {
  const { signIn, error, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const isLoading = loading;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return;
    await signIn(formData.email, formData.password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Card className="glass-effect-dark border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            {/* Logo */}
            <div className="flex justify-center">
              <div className="logo-container">
                <img 
                  src="/logo.png" 
                  alt="Multipaga" 
                  className="h-16 w-auto logo-glow"
                />
              </div>
            </div>
            
            <div>
              <CardTitle className="text-2xl font-bold text-white gradient-text">
                Multipaga
              </CardTitle>
              <CardDescription className="text-blue-200 mt-2">
                Plataforma de Pagos
              </CardDescription>
              <div className="flex items-center justify-center space-x-2 mt-3">
                <Badge variant="outline" className="text-xs border-green-400 text-green-400 bg-green-400/10">
                  <Globe className="h-3 w-3 mr-1" />
                  Entorno Sandbox
                </Badge>
                <Badge variant="outline" className="text-xs border-blue-400 text-blue-400 bg-blue-400/10">
                  <Shield className="h-3 w-3 mr-1" />
                  Hyperswitch
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Login por correo y contraseña */}



            <form onSubmit={handlePasswordLogin} className="space-y-4">
              {/* Campo de email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-200">
                  Correo Electrónico
                </label>
                <div className="relative form-input-enhanced">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="usuario@ejemplo.com"
                    className="pl-10 bg-black/20 border-white/20 text-white placeholder-gray-400 focus:border-blue-400"
                    required
                  />
                </div>
              </div>

              {/* Campo de contraseña */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-200">
                  Contraseña
                </label>
                <div className="relative form-input-enhanced">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="pl-10 pr-10 bg-black/20 border-white/20 text-white placeholder-gray-400 focus:border-blue-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Mensaje de error */}
              {error && (
                <Alert className="bg-red-900/20 border-red-500/50 error-shake">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-200">
                    {error}
                  </AlertDescription>
                </Alert>
              )}


              {/* Botón de submit */}
              <Button
                type="submit"
                disabled={isLoading || !formData.email || !formData.password}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:transform-none button-glow"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Iniciando sesión...</span>
                  </div>
                ) : (
                  <span>Iniciar Sesión</span>
                )}
              </Button>
            </form>

            {/* Información adicional */}
            <div className="text-center space-y-2">
              <p className="text-xs text-gray-400">
                🔒 Entorno Sandbox • Hyperswitch
              </p>
              <p className="text-xs text-gray-500">
                Credenciales para pruebas (no precargadas)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Indicadores de estado */}
        <div className="mt-6 flex justify-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

