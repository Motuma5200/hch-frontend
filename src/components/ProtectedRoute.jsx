import React from 'react';
import { Navigate } from 'react-router-dom';

// usage: <ProtectedRoute role={["admin"]} element={<Admin />} />
const ProtectedRoute = ({ element, roles = [] }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const role = localStorage.getItem('role') || (userStr ? JSON.parse(userStr).role : null);

  if (!token) return <Navigate to="/login" replace />;
  if (roles.length > 0 && !roles.includes(role)) return <Navigate to="/" replace />;

  return element;
};

export default ProtectedRoute;
