// Production API Configuration
// Automatically detects environment and uses appropriate API URL

// In production (Vercel), use relative path to serverless functions
// In development (localhost), use local backend server
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.API_URL = 'http://localhost:3000/api';
} else {
    // Production: use relative path (Vercel will handle routing)
    window.API_URL = '/api';
}

console.log('API Configuration loaded. Current API URL:', window.API_URL);

