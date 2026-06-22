import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedAdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role"); // ตรวจสอบว่าตอน Login หนูเซ็ตค่านี้ลงใน localStorage หรือยัง

  if (!token || userRole !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;