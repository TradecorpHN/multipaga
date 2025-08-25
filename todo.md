# Lista de Tareas: Reestructuración de Multipaga

## Fase 4: Reestructuración de Multipaga alineada con Control Center

### Estructura de Archivos y Carpetas
- [x] Crear carpeta src/APIUtils con lógica de endpoints
- [x] Crear carpeta src/context para contextos de React
- [x] Crear carpeta src/hooks para hooks personalizados
- [x] Crear carpeta src/utils para utilidades
- [x] Crear carpeta src/entities para definiciones de datos
- [x] Crear carpeta src/libraries para librerías compartidas

### Lógica de API y Endpoints
- [x] Implementar APIUtils.js basado en APIUtils.res del Control Center
- [x] Crear tipos de entidades (entityTypes.js)
- [x] Implementar manejo de respuestas HTTP
- [x] Implementar manejo de errores centralizado
- [x] Configurar URLs base para Sandbox/Production

### Autenticación y Contextos
- [x] Mejorar AuthProvider con lógica del Control Center
- [x] Crear UserInfoProvider similar al Control Center
- [x] Implementar manejo de sesiones expiradas
- [x] Configurar redirecciones de autenticación

### Hooks Personalizados
- [x] Crear useGetMethod hook
- [x] Crear useUpdateMethod hook
- [x] Crear useHandleLogout hook
- [x] Implementar hooks para manejo de API

### Configuración de Entorno
- [x] Configurar variables de entorno para URLs
- [x] Implementar cambio rápido entre Sandbox/Production
- [x] Configurar headers y autenticación de API

## Fase 5: Integración de módulos y componentes del Control Center

### Componentes de Autenticación
- [ ] Actualizar AuthProvider con lógica del Control Center
- [ ] Integrar manejo de 2FA completo
- [ ] Implementar verificación de tokens
- [ ] Configurar redirecciones automáticas

### Módulos de Negocio
- [ ] Integrar módulo de Pagos (Orders)
- [ ] Integrar módulo de Reembolsos (Refunds)
- [ ] Integrar módulo de Disputas (Disputes)
- [ ] Integrar módulo de Analíticas
- [ ] Integrar módulo de Conectores
- [ ] Integrar módulo de Usuarios y Roles

### Componentes de UI
- [ ] Crear componentes de tablas de datos
- [ ] Crear componentes de filtros
- [ ] Crear componentes de gráficos
- [ ] Crear componentes de formularios
- [ ] Integrar componentes de notificaciones

### Gestión de Estado
- [ ] Configurar estados globales con Context API
- [ ] Implementar caché de datos
- [ ] Configurar sincronización de datos

## Fase 6: Configuración de SDK y entornos de conexión

### Configuración del SDK de Hyperswitch
- [x] Actualizar integración del SDK @juspay-tech/hyper-js
- [x] Configurar @juspay-tech/react-hyper-js
- [x] Implementar configuración dinámica de entornos
- [x] Configurar variables de entorno para URLs base
- [x] Implementar cambio rápido entre Sandbox/Production

### Variables de Entorno
- [x] Crear archivo .env para configuración
- [x] Configurar REACT_APP_HYPERSWITCH_ENVIRONMENT
- [x] Configurar REACT_APP_SANDBOX_URL
- [x] Configurar REACT_APP_PRODUCTION_URL
- [x] Configurar claves de API por entorno

### Integración del SDK
- [x] Configurar HyperswitchProvider mejorado
- [x] Implementar inicialización del SDK
- [x] Configurar manejo de errores del SDK
- [x] Implementar callbacks de eventos del SDK

## Fase 7: Integración del módulo de conectores con Gateway

- [x] Copiar carpeta public/hyperswitch/Gateway del Control Center
- [x] Integrar logos y activos de conectores
- [x] Configurar estructura de conectores disponibles
- [x] Crear componente ConnectorsModule
- [x] Implementar listado de conectores disponibles
- [x] Mostrar conectores habilitados para el cliente
- [x] Integrar configuración de conectores
- [x] Implementar activación/desactivación de conectores
- [x] Usar endpoints V2_CONNECTOR del Control Center
- [x] Implementar CRUD de conectores
- [x] Configurar validación de conectores
- [x] Integrar verificación de conectores

## Fase 8: Pruebas, compilación y entrega del proyecto final

### Actualización del App.jsx principal
- [ ] Integrar todos los componentes mejorados
- [ ] Configurar rutas para los nuevos módulos
- [ ] Integrar EnhancedHyperswitchProvider
- [ ] Configurar EnhancedAuthProvider

### Actualización de package.json
- [ ] Agregar dependencias del SDK de Hyperswitch
- [ ] Configurar scripts de build
- [ ] Actualizar dependencias necesarias

### Pruebas locales
- [ ] Probar la aplicación en el navegador
- [ ] Verificar integración de módulos
- [ ] Probar cambio de entornos
- [ ] Verificar conectores y pagos

### Compilación final
- [ ] Compilar el proyecto para producción
- [ ] Generar archivo comprimido
- [ ] Verificar que todos los archivos estén incluidos

