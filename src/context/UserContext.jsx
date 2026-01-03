import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // เพิ่ม loading เพื่อป้องกันหน้า Guest แว๊บขึ้นมา

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // บังคับส่ง Token ไปเช็คกับ Server ทุกครั้งที่เปิดแอป/รีเฟรช
        const res = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data);
      } catch (err) {
        console.error("Session expired");
        // ถ้า Token ใช้ไม่ได้ ให้ล้างทิ้งและดีดไป Login
        localStorage.removeItem('token');
        localStorage.removeItem('userAvatar');
        setUser(null);
        window.location.href = '/login';
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // เพิ่ม Interceptor ดักจับกรณี Token หมดอายุระหว่างใช้งาน
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userAvatar');
          setUser(null);
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {!loading && children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};