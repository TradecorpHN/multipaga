import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.jsx';
import { Button } from './ui/button.jsx';
import { Input } from './ui/input.jsx';
import { Badge } from './ui/badge.jsx';
import { Alert, AlertDescription } from './ui/alert.jsx';
import { 
  Send, 
  ArrowRight, 
  User, 
  MapPin, 
  CreditCard,
  Banknote,
  Globe,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Calculator,
  Receipt,
  Phone,
  Mail,
  Building,
  Smartphone,
  QrCode,
  Copy,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';

const RemittanceModule = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [remittanceData, setRemittanceData] = useState({
    sender: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      country: 'Honduras',
      idNumber: ''
    },
    receiver: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      country: 'Estados Unidos',
      idNumber: ''
    },
    transaction: {
      sendAmount: '',
      sendCurrency: 'HNL',
      receiveAmount: '',
      receiveCurrency: 'USD',
      exchangeRate: 24.85,
      fees: 0,
      purpose: 'family_support',
      deliveryMethod: 'bank_deposit'
    }
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [completedRemittance, setCompletedRemittance] = useState(null);
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  const countries = [
    'Honduras', 'Estados Unidos', 'España', 'México', 'Guatemala', 
    'El Salvador', 'Nicaragua', 'Costa Rica', 'Panamá', 'Colombia'
  ];

  const purposes = [
    { value: 'family_support', label: 'Apoyo Familiar' },
    { value: 'education', label: 'Educación' },
    { value: 'medical', label: 'Gastos Médicos' },
    { value: 'business', label: 'Negocios' },
    { value: 'investment', label: 'Inversión' },
    { value: 'other', label: 'Otros' }
  ];

  const deliveryMethods = [
    { value: 'bank_deposit', label: 'Depósito Bancario', icon: Building, fee: 25 },
    { value: 'cash_pickup', label: 'Retiro en Efectivo', icon: Banknote, fee: 35 },
    { value: 'mobile_wallet', label: 'Billetera Móvil', icon: Smartphone, fee: 15 },
    { value: 'home_delivery', label: 'Entrega a Domicilio', icon: MapPin, fee: 50 }
  ];

  useEffect(() => {
    calculateReceiveAmount();
  }, [remittanceData.transaction.sendAmount, remittanceData.transaction.deliveryMethod]);

  const calculateReceiveAmount = () => {
    const sendAmount = parseFloat(remittanceData.transaction.sendAmount) || 0;
    const deliveryMethod = deliveryMethods.find(m => m.value === remittanceData.transaction.deliveryMethod);
    const fees = deliveryMethod ? deliveryMethod.fee : 25;
    const netAmount = sendAmount - fees;
    const receiveAmount = netAmount / remittanceData.transaction.exchangeRate;

    setRemittanceData(prev => ({
      ...prev,
      transaction: {
        ...prev.transaction,
        fees,
        receiveAmount: receiveAmount.toFixed(2)
      }
    }));
  };

  const updateSender = (field, value) => {
    setRemittanceData(prev => ({
      ...prev,
      sender: { ...prev.sender, [field]: value }
    }));
  };

  const updateReceiver = (field, value) => {
    setRemittanceData(prev => ({
      ...prev,
      receiver: { ...prev.receiver, [field]: value }
    }));
  };

  const updateTransaction = (field, value) => {
    setRemittanceData(prev => ({
      ...prev,
      transaction: { ...prev.transaction, [field]: value }
    }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return remittanceData.sender.firstName && remittanceData.sender.lastName && 
               remittanceData.sender.phone && remittanceData.sender.idNumber &&
               remittanceData.sender.address && remittanceData.sender.country;
      case 2:
        return remittanceData.receiver.firstName && remittanceData.receiver.lastName && 
               remittanceData.receiver.phone && remittanceData.receiver.country &&
               remittanceData.receiver.city && remittanceData.receiver.address;
      case 3:
        return remittanceData.transaction.sendAmount && 
               parseFloat(remittanceData.transaction.sendAmount) >= 100 &&
               remittanceData.transaction.deliveryMethod;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const processRemittance = async () => {
    setIsProcessing(true);
    
    // Simular procesamiento
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const remittanceId = `REM-${Date.now()}`;
    const trackingCode = `TRK${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    
    const completed = {
      id: remittanceId,
      trackingCode,
      ...remittanceData,
      status: 'completed',
      timestamp: new Date(),
      estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
    };
    
    setCompletedRemittance(completed);
    setIsProcessing(false);
    setCurrentStep(5);
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const steps = [
    { number: 1, title: 'Remitente', icon: User },
    { number: 2, title: 'Destinatario', icon: User },
    { number: 3, title: 'Monto', icon: DollarSign },
    { number: 4, title: 'Confirmación', icon: CheckCircle },
    { number: 5, title: 'Completado', icon: Receipt }
  ];

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
            Envío de Remesas
          </h1>
          <p className="text-gray-600 mt-2">
            Envía dinero de forma segura y rápida a cualquier parte del mundo
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Globe className="h-3 w-3 mr-1" />
            200+ Países
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Clock className="h-3 w-3 mr-1" />
            24/7 Disponible
          </Badge>
        </div>
      </div>

      {/* Indicador de pasos */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.number 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  {currentStep > step.number ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.number ? 'text-blue-600' : 'text-gray-400'
                  }`}>
                    Paso {step.number}
                  </p>
                  <p className={`text-xs ${
                    currentStep >= step.number ? 'text-gray-700' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-gray-400 mx-4" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contenido del paso actual */}
      {currentStep === 1 && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center space-x-2">
              <User className="h-6 w-6 text-blue-600" />
              <span>Información del Remitente</span>
            </CardTitle>
            <CardDescription>
              Ingresa los datos de quien envía el dinero
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombres *</label>
                <Input
                  placeholder="Nombres completos"
                  value={remittanceData.sender.firstName}
                  onChange={(e) => updateSender('firstName', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Apellidos *</label>
                <Input
                  placeholder="Apellidos completos"
                  value={remittanceData.sender.lastName}
                  onChange={(e) => updateSender('lastName', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono *</label>
                <Input
                  placeholder="+504 9999-9999"
                  value={remittanceData.sender.phone}
                  onChange={(e) => updateSender('phone', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <Input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={remittanceData.sender.email}
                  onChange={(e) => updateSender('email', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Número de Identidad *</label>
                <Input
                  placeholder="0801-1990-12345"
                  value={remittanceData.sender.idNumber}
                  onChange={(e) => updateSender('idNumber', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">País</label>
                <select
                  value={remittanceData.sender.country}
                  onChange={(e) => updateSender('country', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dirección Completa</label>
              <Input
                placeholder="Dirección completa con referencias"
                value={remittanceData.sender.address}
                onChange={(e) => updateSender('address', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 2 && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center space-x-2">
              <User className="h-6 w-6 text-green-600" />
              <span>Información del Destinatario</span>
            </CardTitle>
            <CardDescription>
              Ingresa los datos de quien recibirá el dinero
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombres *</label>
                <Input
                  placeholder="Nombres completos"
                  value={remittanceData.receiver.firstName}
                  onChange={(e) => updateReceiver('firstName', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Apellidos *</label>
                <Input
                  placeholder="Apellidos completos"
                  value={remittanceData.receiver.lastName}
                  onChange={(e) => updateReceiver('lastName', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono *</label>
                <Input
                  placeholder="+1 (555) 123-4567"
                  value={remittanceData.receiver.phone}
                  onChange={(e) => updateReceiver('phone', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <Input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={remittanceData.receiver.email}
                  onChange={(e) => updateReceiver('email', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">País de Destino</label>
                <select
                  value={remittanceData.receiver.country}
                  onChange={(e) => updateReceiver('country', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad</label>
                <Input
                  placeholder="Ciudad de destino"
                  value={remittanceData.receiver.city}
                  onChange={(e) => updateReceiver('city', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dirección de Entrega</label>
              <Input
                placeholder="Dirección completa donde se entregará el dinero"
                value={remittanceData.receiver.address}
                onChange={(e) => updateReceiver('address', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                <DollarSign className="h-6 w-6 text-purple-600" />
                <span>Monto y Método</span>
              </CardTitle>
              <CardDescription>
                Especifica el monto a enviar y método de entrega
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Monto a Enviar *</label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="1000"
                    value={remittanceData.transaction.sendAmount}
                    onChange={(e) => updateTransaction('sendAmount', e.target.value)}
                    className="pr-16"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    HNL
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Monto mínimo: L 100.00</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Propósito del Envío</label>
                <select
                  value={remittanceData.transaction.purpose}
                  onChange={(e) => updateTransaction('purpose', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {purposes.map(purpose => (
                    <option key={purpose.value} value={purpose.value}>{purpose.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Método de Entrega</label>
                <div className="grid grid-cols-1 gap-3">
                  {deliveryMethods.map(method => (
                    <div
                      key={method.value}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        remittanceData.transaction.deliveryMethod === method.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => updateTransaction('deliveryMethod', method.value)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <method.icon className="h-5 w-5 text-gray-600" />
                          <span className="font-medium">{method.label}</span>
                        </div>
                        <span className="text-sm text-gray-500">+L {method.fee}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                <Calculator className="h-6 w-6 text-cyan-600" />
                <span>Resumen de Costos</span>
              </CardTitle>
              <CardDescription>
                Desglose detallado de la transacción
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span>Monto a enviar:</span>
                  <span className="font-medium">{formatCurrency(remittanceData.transaction.sendAmount || 0, 'HNL')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Comisión:</span>
                  <span className="font-medium">-{formatCurrency(remittanceData.transaction.fees, 'HNL')}</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-lg font-bold">
                  <span>Total a pagar:</span>
                  <span className="text-blue-600">{formatCurrency(remittanceData.transaction.sendAmount || 0, 'HNL')}</span>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">El destinatario recibirá:</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(remittanceData.transaction.receiveAmount || 0, 'USD')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Tipo de cambio:</p>
                    <p className="text-sm font-medium">1 USD = {remittanceData.transaction.exchangeRate} HNL</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Tiempo de Entrega</span>
                </div>
                <p className="text-sm text-blue-700">
                  {remittanceData.transaction.deliveryMethod === 'bank_deposit' && '1-2 días hábiles'}
                  {remittanceData.transaction.deliveryMethod === 'cash_pickup' && '15-30 minutos'}
                  {remittanceData.transaction.deliveryMethod === 'mobile_wallet' && 'Inmediato'}
                  {remittanceData.transaction.deliveryMethod === 'home_delivery' && '2-4 horas'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {currentStep === 4 && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center space-x-2">
              <CheckCircle className="h-6 w-6 text-orange-600" />
              <span>Confirmación de Envío</span>
            </CardTitle>
            <CardDescription>
              Revisa todos los datos antes de procesar el envío
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 border-b pb-2">Remitente</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Nombre:</strong> {remittanceData.sender.firstName} {remittanceData.sender.lastName}</p>
                  <p><strong>Teléfono:</strong> {remittanceData.sender.phone}</p>
                  <p><strong>Email:</strong> {remittanceData.sender.email || 'No proporcionado'}</p>
                  <p><strong>País:</strong> {remittanceData.sender.country}</p>
                  <p><strong>Identidad:</strong> {showSensitiveData ? remittanceData.sender.idNumber : '****-****-*****'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 border-b pb-2">Destinatario</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Nombre:</strong> {remittanceData.receiver.firstName} {remittanceData.receiver.lastName}</p>
                  <p><strong>Teléfono:</strong> {remittanceData.receiver.phone}</p>
                  <p><strong>Email:</strong> {remittanceData.receiver.email || 'No proporcionado'}</p>
                  <p><strong>País:</strong> {remittanceData.receiver.country}</p>
                  <p><strong>Ciudad:</strong> {remittanceData.receiver.city}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">Detalles de la Transacción</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Monto a enviar:</strong> {formatCurrency(remittanceData.transaction.sendAmount, 'HNL')}</p>
                  <p><strong>Comisión:</strong> {formatCurrency(remittanceData.transaction.fees, 'HNL')}</p>
                  <p><strong>Tipo de cambio:</strong> 1 USD = {remittanceData.transaction.exchangeRate} HNL</p>
                </div>
                <div>
                  <p><strong>Monto a recibir:</strong> {formatCurrency(remittanceData.transaction.receiveAmount, 'USD')}</p>
                  <p><strong>Método de entrega:</strong> {deliveryMethods.find(m => m.value === remittanceData.transaction.deliveryMethod)?.label}</p>
                  <p><strong>Propósito:</strong> {purposes.find(p => p.value === remittanceData.transaction.purpose)?.label}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSensitiveData(!showSensitiveData)}
              >
                {showSensitiveData ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {showSensitiveData ? 'Ocultar' : 'Mostrar'} datos sensibles
              </Button>
            </div>

            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-yellow-700">
                <strong>Importante:</strong> Verifica que todos los datos sean correctos. Una vez procesado el envío, no se podrán realizar cambios.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {currentStep === 5 && completedRemittance && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-green-800 flex items-center space-x-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <span>¡Envío Completado Exitosamente!</span>
            </CardTitle>
            <CardDescription>
              Tu remesa ha sido procesada y está en camino
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 p-6 rounded-lg text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-green-800 mb-2">Transacción Exitosa</h3>
              <p className="text-green-700">ID: {completedRemittance.id}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800 border-b pb-2">Información de Seguimiento</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Código de Seguimiento:</span>
                    <div className="flex items-center space-x-2">
                      <code className="bg-white px-2 py-1 rounded text-sm font-mono">
                        {completedRemittance.trackingCode}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(completedRemittance.trackingCode)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Estado:</span>
                    <Badge className="bg-green-100 text-green-800">En Proceso</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Entrega Estimada:</span>
                    <span>{completedRemittance.estimatedDelivery.toLocaleDateString('es-HN')}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800 border-b pb-2">Resumen Final</h4>
                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span>Enviado:</span>
                    <span className="font-medium">{formatCurrency(completedRemittance.transaction.sendAmount, 'HNL')}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span>A recibir:</span>
                    <span className="font-medium text-green-600">{formatCurrency(completedRemittance.transaction.receiveAmount, 'USD')}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span>Comisión:</span>
                    <span className="font-medium">{formatCurrency(completedRemittance.transaction.fees, 'HNL')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Descargar Recibo
              </Button>
              <Button variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Enviar por Email
              </Button>
              <Button variant="outline">
                <QrCode className="h-4 w-4 mr-2" />
                Código QR
              </Button>
              <Button 
                onClick={() => {
                  setCurrentStep(1);
                  setCompletedRemittance(null);
                  setRemittanceData({
                    sender: { firstName: '', lastName: '', phone: '', email: '', address: '', city: '', country: 'Honduras', idNumber: '' },
                    receiver: { firstName: '', lastName: '', phone: '', email: '', address: '', city: '', country: 'Estados Unidos', idNumber: '' },
                    transaction: { sendAmount: '', sendCurrency: 'HNL', receiveAmount: '', receiveCurrency: 'USD', exchangeRate: 24.85, fees: 0, purpose: 'family_support', deliveryMethod: 'bank_deposit' }
                  });
                }}
              >
                <Send className="h-4 w-4 mr-2" />
                Nueva Remesa
              </Button>
            </div>

            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-blue-700">
                <strong>Próximos pasos:</strong> El destinatario recibirá una notificación con las instrucciones para retirar el dinero. Puedes rastrear el estado de tu envío en cualquier momento usando el código de seguimiento.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Botones de navegación */}
      {currentStep < 5 && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                Anterior
              </Button>
              
              {currentStep < 4 ? (
                <Button
                  onClick={nextStep}
                  disabled={!validateStep(currentStep)}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  Siguiente
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={processRemittance}
                  disabled={isProcessing || !validateStep(currentStep)}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  {isProcessing ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Procesando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Send className="h-4 w-4" />
                      <span>Procesar Envío</span>
                    </div>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RemittanceModule;

