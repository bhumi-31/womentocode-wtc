// API Configuration
// This file ensures the correct API URL is used in production
const isProduction = window.location.hostname !== 'localhost';

export const API_URL = isProduction
    ? 'https://womentocode-wtc.onrender.com'
    : 'http://localhost:5001';

export default API_URL;
