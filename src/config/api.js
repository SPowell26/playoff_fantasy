// API configuration for environment variable support
// Allows the same code to work in local development and production

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default API_URL;
