import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../../services/authService';

const AdminRoute = ({ children }) => {
  const currentUser = authService.getCurrentUser();

  if (!currentUser) {
    return <Navigate to="/admin/login" replace />;
  }

  if (currentUser.role !== 'admin') {
    alert('Bạn không có quyền truy cập trang quản trị!');
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
