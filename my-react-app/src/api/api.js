import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000', // URL вашего Django-сервера
  withCredentials: true, // для отправки cookies
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  }
});

// Добавляем CSRF токен к каждому запросу
api.interceptors.request.use(
  (config) => {
    const csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1];
    
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Перехватчик для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Обработка ошибок от сервера
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // Обработка ошибок сети
      console.error('Network Error:', error.request);
    } else {
      // Обработка других ошибок
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api; 