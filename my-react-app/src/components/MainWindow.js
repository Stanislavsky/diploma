import React, { useState, useEffect } from 'react';
import './MainWindow.css';
import HelpModal from './HelpModal/HelpModal';
import ConfirmModal from './ConfirmModal/ConfirmModal';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Skeleton from './Skeleton/Skeleton';

const MainWindow = ({ title, children }) => {
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/api/auth/check/');
        if (response.data.user) {
          setUsername(response.data.user.username);
          setIsAdmin(response.data.user.is_staff || false);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout/');
      // Очищаем все данные сессии
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      // Перенаправляем на страницу входа
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const openHelpModal = () => {
    setIsHelpModalOpen(true);
  };

  const closeHelpModal = () => {
    setIsHelpModalOpen(false);
  };

  const openLogoutModal = () => {
    setIsLogoutModalOpen(true);
  };

  const closeLogoutModal = () => {
    setIsLogoutModalOpen(false);
  };

  return (
    <div className="main-window">
      <div className="main-container">
        {title && <h1 className="page-title">{title}</h1>}
        {children || (
          <div className="content-grid">
            <div className="content-card">
              <h2 className="card-title">Добро пожаловать в медицинскую систему</h2>
              <p className="card-content">
                Выберите раздел в меню выше для начала работы с системой.
              </p>
            </div>
            <div className="content-card">
              <h2 className="card-title">Быстрый доступ</h2>
              <div className="card-content">
                <button className="button button-primary" style={{ marginRight: '10px' }}>
                  Список пациентов
                </button>
                <button className="button button-secondary">
                  Добавить пациента
                </button>
              </div>
            </div>
            <div className="content-card help-card">
              <h2 className="card-title">Возникли проблемы?</h2>
              <p className="card-content">
                Если у вас возникли трудности при работе с системой, нажмите кнопку "Помощь" ниже.
                Наши специалисты готовы помочь вам в любое время.
              </p>
              <div className="card-footer">
                <button className="button button-primary" onClick={openHelpModal}>
                  Помощь
                </button>
              </div>
            </div>
            {isLoading ? (
              <div className="content-card greeting-card">
                <Skeleton width="100%" height="24px" className="skeleton-text" />
                <Skeleton width="80%" height="16px" className="skeleton-text" />
                <div className="card-footer">
                  <Skeleton width="100px" height="36px" className="skeleton-button" />
                </div>
              </div>
            ) : username && (
              <div className="content-card greeting-card">
                <h2 className="card-title">Здравствуйте, {username}!</h2>
                <p className="card-content">
                  Вы вошли в аккаунт под именем {username}
                </p>
                <div className="card-footer">
                  <button className="button button-secondary" onClick={openLogoutModal}>
                    Выйти
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {isHelpModalOpen && <HelpModal onClose={closeHelpModal} />}
      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={closeLogoutModal}
        onConfirm={handleLogout}
        title="Подтверждение выхода"
        message="Вы уверены, что хотите выйти из системы?"
      />
    </div>
  );
};

export default MainWindow;