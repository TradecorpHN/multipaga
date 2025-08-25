// LogicUtils.js - Utilidades lógicas para el manejo de datos

export const LogicUtils = {
  // Función para obtener entero de un objeto
  getInt: (obj, key, defaultValue = 0) => {
    try {
      const value = obj[key];
      if (value === null || value === undefined) return defaultValue;
      
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? defaultValue : parsed;
    } catch (error) {
      return defaultValue;
    }
  },

  // Función para obtener float de un objeto
  getFloat: (obj, key, defaultValue = 0.0) => {
    try {
      const value = obj[key];
      if (value === null || value === undefined) return defaultValue;
      
      const parsed = parseFloat(value);
      return isNaN(parsed) ? defaultValue : parsed;
    } catch (error) {
      return defaultValue;
    }
  },

  // Función para obtener string de un objeto
  getString: (obj, key, defaultValue = "") => {
    try {
      const value = obj[key];
      if (value === null || value === undefined) return defaultValue;
      
      return String(value);
    } catch (error) {
      return defaultValue;
    }
  },

  // Función para obtener boolean de un objeto
  getBool: (obj, key, defaultValue = false) => {
    try {
      const value = obj[key];
      if (value === null || value === undefined) return defaultValue;
      
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') {
        return value.toLowerCase() === 'true';
      }
      
      return Boolean(value);
    } catch (error) {
      return defaultValue;
    }
  },

  // Función para obtener array de un objeto
  getArray: (obj, key, defaultValue = []) => {
    try {
      const value = obj[key];
      if (value === null || value === undefined) return defaultValue;
      
      return Array.isArray(value) ? value : defaultValue;
    } catch (error) {
      return defaultValue;
    }
  },

  // Función para obtener objeto de un objeto
  getObject: (obj, key, defaultValue = {}) => {
    try {
      const value = obj[key];
      if (value === null || value === undefined) return defaultValue;
      
      return typeof value === 'object' && !Array.isArray(value) ? value : defaultValue;
    } catch (error) {
      return defaultValue;
    }
  },

  // Función para verificar si un valor existe
  isNonEmpty: (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return Object.keys(value).length > 0;
    
    return true;
  },

  // Función para formatear moneda
  formatCurrency: (amount, currency = 'USD', locale = 'en-US') => {
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
      }).format(amount);
    } catch (error) {
      return `${currency} ${amount}`;
    }
  },

  // Función para formatear fecha
  formatDate: (date, format = 'short') => {
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return 'Invalid Date';
      
      const options = {
        short: { year: 'numeric', month: 'short', day: 'numeric' },
        long: { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' },
        time: { hour: '2-digit', minute: '2-digit', second: '2-digit' }
      };
      
      return dateObj.toLocaleDateString('en-US', options[format] || options.short);
    } catch (error) {
      return 'Invalid Date';
    }
  },

  // Función para generar ID único
  generateId: (prefix = 'id') => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  // Función para debounce
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Función para throttle
  throttle: (func, limit) => {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Función para deep clone
  deepClone: (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => LogicUtils.deepClone(item));
    if (typeof obj === 'object') {
      const clonedObj = {};
      Object.keys(obj).forEach(key => {
        clonedObj[key] = LogicUtils.deepClone(obj[key]);
      });
      return clonedObj;
    }
  },

  // Función para merge objects
  mergeObjects: (...objects) => {
    return objects.reduce((result, obj) => {
      if (obj && typeof obj === 'object') {
        Object.keys(obj).forEach(key => {
          if (typeof obj[key] === 'object' && !Array.isArray(obj[key]) && obj[key] !== null) {
            result[key] = LogicUtils.mergeObjects(result[key] || {}, obj[key]);
          } else {
            result[key] = obj[key];
          }
        });
      }
      return result;
    }, {});
  },

  // Función para validar email
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Función para validar URL
  isValidUrl: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  // Función para capitalizar string
  capitalize: (str) => {
    if (!str || typeof str !== 'string') return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  // Función para convertir a camelCase
  toCamelCase: (str) => {
    return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
  },

  // Función para convertir a snake_case
  toSnakeCase: (str) => {
    return str.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
  }
};

export default LogicUtils;

