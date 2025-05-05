import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../../api/api';
import './Inlet.css';

export default function Inlet() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await api.post('/api/auth/login/', {
        username,
        password
      });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        // Перенаправляем на страницу, с которой пришел пользователь, или на главную
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      }
    } catch (error) {
      setError('Неверное имя пользователя или пароль');
      console.error('Login error:', error);
    }
  };

  return (
    <div className="form-container">
      <div className="registration-form">
        <h2>Всеобщая диспансеризация</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Имя пользователя:</label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Пароль:</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="register-btn">
            войти
          </button>
        </form>
      </div>
    </div>
  );
}