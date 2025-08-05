// Configuración de la API del backend
export const API_BASE_URL = 'https://invertgold-backend.wjvn91.easypanel.host';

// Helper function para construir URLs de la API
export const apiUrl = (endpoint: string) => `${API_BASE_URL}${endpoint}`;

export default API_BASE_URL;