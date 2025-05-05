import { Routes, Route, useLocation } from 'react-router-dom';
import React, { useEffect } from 'react';
import Client from '../apps/client';
import Admin from '../apps/adminPanel/pages/AdminPanel';
import Login from '../components/Login/Login';
import MainWindow from '../components/MainWindow';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import '../index.css'

export default function AppRoutes() {
    const location = useLocation();
    const isLoginPage = location.pathname === '/login';

    useEffect(() => {
        const body = document.body;

        if (isLoginPage) {
        body.classList.add('login-page');
        body.classList.remove('default-layout');
        } else {
        body.classList.remove('login-page');
        body.classList.add('default-layout');
        }
        return () => {
        body.classList.remove('login-page', 'default-layout');
        };
    }, [isLoginPage]);

    return (
        <Routes>
            <Route path="/login" element={<Login/>} />
            <Route path="/" element={
                <ProtectedRoute>
                    <MainWindow/>
                </ProtectedRoute>
            } />
            <Route path="/app/*" element={
                <ProtectedRoute>
                    <Client/>
                </ProtectedRoute>
            } />
            <Route path="/admin/*" element={
                <ProtectedRoute adminOnly={true}>
                    <Admin/>
                </ProtectedRoute>
            } />
        </Routes>
    )
}