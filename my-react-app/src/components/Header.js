import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import api from '../api/api';
import Skeleton from './Skeleton/Skeleton';

const Header = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSupport, setIsSupport] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const response = await api.get('/api/auth/check/');
        if (response.data.user) {
          setIsAdmin(response.data.user.is_admin);
          setIsSupport(response.data.user.is_support);
        }
      } catch (error) {
        console.error('Error checking user role:', error);
      } finally {
        setIsLoading(false);
      }
    };
    checkUserRole();
  }, []);

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          Медицинская система
        </Link>
        
        <nav className="nav-menu">
          <ul className="nav-menu">
            <li className="nav-item">
              <Link to="/" className="nav-link">Главная</Link>
            </li>
            <li className="nav-item">
              <Link to="/patients" className="nav-link">Пациенты</Link>
            </li>
            {isLoading ? (
              <li className="nav-item">
                <Skeleton width="120px" height="24px" className="skeleton-button" />
              </li>
            ) : isAdmin && (
              <li className="nav-item">
                <Link to="/admin" className="nav-link">Админ панель</Link>
              </li>
            )}
            {isSupport && (
              <li className="nav-item">
                <Link to="/support" className="nav-link">Панель сопровождающего</Link>
              </li>
            )}
          </ul>
        </nav>

        <div className="user-menu">
          {isLoading ? (
            <Skeleton width="40px" height="40px" className="skeleton-avatar" />
          ) : (
            <img 
              src="/default-avatar.png" 
              alt="User avatar" 
              className="user-avatar"
            />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;