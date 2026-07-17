// ================================================================
// CONFIG · CONFIGURACIÓN DE LA APLICACIÓN
// ================================================================

// Detectar entorno: local o producción (Render)
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// URL base de la API
const API_BASE_URL = isDevelopment
    ? 'http://localhost:3000/api'                // Desarrollo local
    : 'https://foodloop-backend-ij1k.onrender.com/api'; // Producción (Render)

// ===== EXPORTAR PARA USO GLOBAL =====
window.API_BASE_URL = API_BASE_URL;
window.isDevelopment = isDevelopment;

console.log(`🌐 Entorno: ${isDevelopment ? 'Desarrollo (local)' : 'Producción (Render)'}`);
console.log(`📡 API Base URL: ${API_BASE_URL}`);