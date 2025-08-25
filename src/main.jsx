import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthProvider.jsx';

// Agregar manejo de errores global
window.addEventListener('error', (event) => {
  console.error('Error global:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Promise rechazada:', event.reason);
});

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('No se encontró el elemento root');
  }

  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </StrictMode>
  );
} catch (error) {
  console.error('Error inicializando la aplicación:', error);
  document.body.innerHTML = `
    <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
      <h1>Error cargando Multipaga</h1>
      <p>Ha ocurrido un error al cargar la aplicación.</p>
      <p style="color: red; font-family: monospace;">${error.message}</p>
      <button onclick="window.location.reload()">Recargar página</button>
    </div>
  `;
}


