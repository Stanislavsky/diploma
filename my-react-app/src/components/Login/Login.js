import React, { useState, useEffect } from 'react';
import styles from './Login.module.css'; // Импортируем стили
import api from '../../api/api';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Получаем CSRF токен при монтировании компонента
  useEffect(() => {
    const getCSRFToken = async () => {
      try {
        await api.get('/api/auth/csrf/');
      } catch (error) {
        console.error('Error getting CSRF token:', error);
      }
    };
    getCSRFToken();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await api.post('/api/auth/login/', { 
        username, 
        password 
      });
      
      if (response.data.user) {
        // Проверяем аутентификацию после входа
        const authCheck = await api.get('/api/auth/check/');
        if (authCheck.data.user) {
          navigate('/', { replace: true });
        } else {
          setError('Ошибка аутентификации');
        }
      }
    } catch (error) {
      setError('Неверное имя пользователя или пароль');
      console.error('Login error:', error);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <form className={styles.loginForm} onSubmit={handleSubmit}>
        <h2>Вход в систему</h2>
        {error && <div className={styles.error}>{error}</div>}
        <div>
          <label htmlFor="username">Имя пользователя:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Пароль:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Войти</button>
      </form>
    </div>
  );
}

export default Login; 