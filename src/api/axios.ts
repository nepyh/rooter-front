import axios from 'axios';

const api = axios.create({
  baseURL: 'https://anyone-enhance-lustrous.ngrok-free.dev/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;