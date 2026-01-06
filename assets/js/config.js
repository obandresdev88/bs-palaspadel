// Configuración de URLs del API
// Este archivo centraliza las URLs para facilitar el cambio entre desarrollo y producción

const CONFIG = {
    // URL del API Backend
    API_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:8080/api'  // Desarrollo local
        : 'https://palaspadel-api.onrender.com/api',  // Producción (CAMBIAR por tu URL real de Render)
    
    // URL base para imágenes
    IMAGES_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:8080'  // Desarrollo local
        : 'https://palaspadel-api.onrender.com',  // Producción
};

// Exportar para uso en otros scripts
window.CONFIG = CONFIG;
