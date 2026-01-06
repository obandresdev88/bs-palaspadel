// Configuración de URLs del API
// Este archivo centraliza las URLs para facilitar el cambio entre desarrollo y producción

const CONFIG = {
    // URL del API Backend
    API_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:8080/api'  // Desarrollo local
        : 'https://palaspadel.onrender.com/api',  // Producción
    
    // URL base para imágenes
    IMAGES_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:8080'  // Desarrollo local
        : 'https://palaspadel.onrender.com',  // Producción
};

// Exportar para uso en otros scripts
window.CONFIG = CONFIG;
