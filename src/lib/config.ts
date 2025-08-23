// Configuración de la API del backend
export const API_BASE_URL = 'https://backend.invertgold.com';

// Helper function para construir URLs de la API
export const apiUrl = (endpoint: string) => `${API_BASE_URL}${endpoint}`;

export default API_BASE_URL;