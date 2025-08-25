import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthProvider.jsx';
import { Button } from './ui/button.jsx';
import { Input } from './ui/input.jsx';
import { Label } from './ui/label.jsx';
import { Alert, AlertDescription } from './ui/alert.jsx';
import { Loader2, Shield, Smartphone, Key, ArrowLeft } from 'lucide-react';

const TwoFactorAuth = ({ onBack }) => {
  const { verifyTOTP, verifyRecoveryCode, loading, error, clearError } = useAuth();
  
  const [authMethod, setAuthMethod] = useState('totp'); // 'totp' o 'recovery'
  const [code, setCode] = useState('');
  const [digits, setDigits] = useState(['', '', '', '', '', '']);

  useEffect(() => {
    clearError();
  }, [authMethod, clearError]);

  const handleDigitChange = (index, value) => {
    if (value.length > 1) return;
    
    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);
    
    // Auto-focus al siguiente campo
    if (value && index < 5) {
      const nextInput = document.getElementById(`digit-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
    
    // Actualizar código completo
    setCode(newDigits.join(''));
    clearError();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      const prevInput = document.getElementById(`digit-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleTOTPSubmit = async (e) => {
    e.preventDefault();
    
    if (code.length !== 6) {
      return;
    }

    await verifyTOTP(code);
  };

  const handleRecoveryCodeSubmit = async (e) => {
    e.preventDefault();
    
    if (!code.trim()) {
      return;
    }

    await verifyRecoveryCode(code.trim());
  };

  const resetForm = () => {
    setCode('');
    setDigits(['', '', '', '', '', '']);
    clearError();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Efectos de fondo Web3 */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
      </div>
      
      <div className="relative w-full max-w-md">
        {/* Contenedor principal con glassmorphism mejorado */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-8 relative">
          {/* Borde brillante Web3 */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 blur-sm"></div>
          
          <div className="relative">
            {/* Botón de regreso */}
            {onBack && (
              <button
                onClick={onBack}
                className="absolute -top-2 -left-2 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}

            {/* Logo y título */}
            <div className="text-center space-y-4 mb-8">
              <div className="inline-block bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                <Shield className="h-8 w-8 text-blue-600 mx-auto" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-white">Verificación 2FA</h1>
                <p className="text-blue-200 text-sm">Ingresa tu código de autenticación</p>
              </div>
            </div>

            {/* Selector de método de autenticación */}
            <div className="flex mb-6 bg-white/5 backdrop-blur-sm rounded-xl p-1">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('totp');
                  resetForm();
                }}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  authMethod === 'totp'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-blue-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <Smartphone className="h-4 w-4" />
                <span>Código TOTP</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('recovery');
                  resetForm();
                }}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  authMethod === 'recovery'
                    ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg'
                    : 'text-blue-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <Key className="h-4 w-4" />
                <span>Código de Recuperación</span>
              </button>
            </div>

            {/* Mostrar errores */}
            {error && (
              <Alert className="mb-6 bg-red-500/20 border-red-400/30">
                <AlertDescription className="text-red-200">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
            {/* Formulario de verificación */}
            {authMethod === 'totp' ? (
              <form onSubmit={handleTOTPSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-white text-sm font-medium flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    Código de 6 dígitos
                  </Label>
                  <div className="flex space-x-2 justify-center">
                    {digits.map((digit, index) => (
                      <Input
                        key={index}
                        id={`digit-${index}`}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleDigitChange(index, e.target.value.replace(/\D/g, ''))}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-12 h-12 text-center text-lg font-bold bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 hover:bg-white/15"
                      />
                    ))}
                  </div>
                  <p className="text-xs text-blue-300 text-center mt-2">
                    Ingresa el código de 6 dígitos de tu app de autenticación
                  </p>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 hover:from-blue-600 hover:via-purple-600 hover:to-cyan-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:transform-none relative overflow-hidden"
                  disabled={loading || code.length !== 6}
                >
                  <span className="relative z-10 flex items-center justify-center space-x-2">
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    <span>
                      {loading ? 'Verificando...' : 'Verificar Código'}
                    </span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
              </form>
            ) : (
              <form onSubmit={handleRecoveryCodeSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="recovery-code" className="text-white text-sm font-medium flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                    Código de Recuperación
                  </Label>
                  <Input
                    id="recovery-code"
                    type="text"
                    placeholder="Ingresa tu código de recuperación"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      clearError();
                    }}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 hover:bg-white/15"
                    required
                  />
                  <p className="text-xs text-blue-300 text-center mt-2">
                    Usa uno de tus códigos de recuperación de respaldo
                  </p>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-purple-500 via-cyan-500 to-blue-500 hover:from-purple-600 hover:via-cyan-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:transform-none relative overflow-hidden"
                  disabled={loading || !code.trim()}
                >
                  <span className="relative z-10 flex items-center justify-center space-x-2">
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    <span>
                      {loading ? 'Verificando...' : 'Usar Código de Recuperación'}
                    </span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-cyan-600 to-blue-600 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
              </form>
            )}
            
            {/* Información adicional */}
            <div className="mt-6 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <p className="text-xs text-blue-200 text-center">
                <Shield className="h-3 w-3 inline mr-1" />
                Autenticación de Dos Factores Activa
              </p>
              <p className="text-xs text-blue-300 text-center mt-1">
                Tu cuenta está protegida con 2FA
              </p>
            </div>
            
            {/* Elementos decorativos Web3 */}
            <div className="mt-6 flex justify-center space-x-4">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-ping delay-100"></div>
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping delay-200"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorAuth;

