import axios from 'axios';

// Aquí le decimos a React a qué puerto debe enviarle los datos a C#
const api = axios.create({
  baseURL: 'http://localhost:5270/api', 
});

// Este interceptor asegura que el JWT (Token) viaje en cada petición para los CU01 y CU02
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;