/**
 * API Base URL configuration.
 * Reads VITE_API_URL environment variable with fallback to http://localhost:5000 for local development.
 */
export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

export default API_BASE_URL;
