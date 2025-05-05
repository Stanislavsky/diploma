import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './components/Login/Login';
import MainWindow from './components/MainWindow/MainWindow';
import AdminPanel from './components/AdminPanel/AdminPanel';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainWindow />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminPanel />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
} 