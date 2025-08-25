import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.jsx';
import { Button } from './ui/button.jsx';
import { Input } from './ui/input.jsx';
import { Badge } from './ui/badge.jsx';
import { Alert, AlertDescription } from './ui/alert.jsx';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard,
  Banknote,
  Smartphone,
  Calculator,
  Receipt,
  Printer,
  Wifi,
  WifiOff,
  CheckCircle,
  Clock,
  User,
  Barcode,
  Search
} from 'lucide-react';

const POSModule = () => {
  const [cart, setCart] = useState([]);
  const [products] = useState([
    { id: 1, name: 'Café Americano', price: 45, category: 'Bebidas', stock: 50 },
    { id: 2, name: 'Sandwich de Pollo', price: 85, category: 'Comida', stock: 25 },
    { id: 3, name: 'Agua Embotellada', price: 15, category: 'Bebidas', stock: 100 },
    { id: 4, name: 'Pastel de Chocolate', price: 65, category: 'Postres', stock: 15 },
    { id: 5, name: 'Ensalada César', price: 95, category: 'Comida', stock: 20 },
    { id: 6, name: 'Jugo Natural', price: 35, category: 'Bebidas', stock: 30 },
    { id: 7, name: 'Pizza Personal', price: 120, category: 'Comida', stock: 18 },
    { id: 8, name: 'Helado Artesanal', price: 55, category: 'Postres', stock: 22 }
  ]);
  
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', email: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isOnline] = useState(true);

  const categories = ['all', 'Bebidas', 'Comida', 'Postres'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
    } else {
      setCart(cart.map(item => 
        item.id === id 
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    setCustomerInfo({ name: '', phone: '', email: '' });
  };

  const calculateTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.15; // 15% ISV en Honduras
    return { subtotal, tax, total: subtotal + tax };
  };

  const processPayment = async () => {
    if (cart.length === 0) return;

    setIsProcessing(true);
    
    // Simular procesamiento de pago
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const { total } = calculateTotal();
    const transactionId = `TXN-${Date.now()}`;
    
    const transaction = {
      id: transactionId,
      items: [...cart],
      customer: { ...customerInfo },
      paymentMethod,
      total,
      timestamp: new Date(),
      status: 'completed'
    };
    
    setLastTransaction(transaction);
    clearCart();
    setIsProcessing(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency: 'HNL'
    }).format(amount);
  };

  const { subtotal, tax, total } = calculateTotal();

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
            Sistema POS
          </h1>
          <p className="text-gray-600 mt-2">
            Punto de Venta - Café & Restaurante Honduras
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className={`${isOnline ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
            {isOnline ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
            {isOnline ? 'En Línea' : 'Sin Conexión'}
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Clock className="h-3 w-3 mr-1" />
            {new Date().toLocaleTimeString('es-HN')}
          </Badge>
        </div>
      </div>

      {/* Última transacción */}
      {lastTransaction && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="text-green-700">
            <strong>Transacción Exitosa:</strong> {lastTransaction.id} - {formatCurrency(lastTransaction.total)} procesado con {lastTransaction.paymentMethod === 'card' ? 'tarjeta' : lastTransaction.paymentMethod === 'cash' ? 'efectivo' : 'billetera digital'}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel de productos */}
        <div className="lg:col-span-2 space-y-6">
          {/* Búsqueda y filtros */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex space-x-2">
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category === 'all' ? 'Todos' : category}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Grid de productos */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <Card 
                key={product.id} 
                className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
                onClick={() => addToCart(product)}
              >
                <CardContent className="p-4 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ShoppingCart className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">{product.name}</h3>
                  <p className="text-lg font-bold text-blue-600 mb-2">{formatCurrency(product.price)}</p>
                  <Badge variant="outline" className="text-xs">
                    Stock: {product.stock}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Panel de carrito y pago */}
        <div className="space-y-6">
          {/* Carrito */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
                <span>Carrito de Compras</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length > 0 ? (
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                        <p className="text-xs text-gray-600">{formatCurrency(item.price)} c/u</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t pt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>ISV (15%):</span>
                      <span>{formatCurrency(tax)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total:</span>
                      <span className="text-blue-600">{formatCurrency(total)}</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearCart}
                    className="w-full mt-3"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Limpiar Carrito
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Carrito vacío</p>
                  <p className="text-sm">Agrega productos para comenzar</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Información del cliente */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-600" />
                <span>Cliente</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Nombre del cliente"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
              />
              <Input
                placeholder="Teléfono"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
              />
              <Input
                placeholder="Email (opcional)"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
              />
            </CardContent>
          </Card>

          {/* Método de pago */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <span>Método de Pago</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={paymentMethod === 'card' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPaymentMethod('card')}
                  className="flex flex-col items-center p-3 h-auto"
                >
                  <CreditCard className="h-6 w-6 mb-1" />
                  <span className="text-xs">Tarjeta</span>
                </Button>
                <Button
                  variant={paymentMethod === 'cash' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPaymentMethod('cash')}
                  className="flex flex-col items-center p-3 h-auto"
                >
                  <Banknote className="h-6 w-6 mb-1" />
                  <span className="text-xs">Efectivo</span>
                </Button>
                <Button
                  variant={paymentMethod === 'digital' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPaymentMethod('digital')}
                  className="flex flex-col items-center p-3 h-auto"
                >
                  <Smartphone className="h-6 w-6 mb-1" />
                  <span className="text-xs">Digital</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="space-y-3">
            <Button 
              onClick={processPayment}
              disabled={cart.length === 0 || isProcessing}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:transform-none"
            >
              {isProcessing ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Procesando...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Calculator className="h-4 w-4" />
                  <span>Procesar Pago - {formatCurrency(total)}</span>
                </div>
              )}
            </Button>
            
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" size="sm" disabled={cart.length === 0}>
                <Receipt className="h-4 w-4 mr-2" />
                Recibo
              </Button>
              <Button variant="outline" size="sm" disabled={cart.length === 0}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas del día */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            <span>Resumen del Día</span>
          </CardTitle>
          <CardDescription>
            Estadísticas de ventas - {new Date().toLocaleDateString('es-HN')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">47</p>
              <p className="text-sm text-gray-600">Transacciones</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">L 12,450</p>
              <p className="text-sm text-gray-600">Ventas Totales</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">L 265</p>
              <p className="text-sm text-gray-600">Ticket Promedio</p>
            </div>
            <div className="text-center p-4 bg-cyan-50 rounded-lg">
              <p className="text-2xl font-bold text-cyan-600">98%</p>
              <p className="text-sm text-gray-600">Éxito en Pagos</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default POSModule;

