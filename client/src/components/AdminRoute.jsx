import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import axios from 'axios';

const AdminRoute = () => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        const res = await axios.get('http://localhost:5001/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data && res.data.role === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>Đang kiểm tra quyền Admin...</div>;
  }

  if (!isAdmin) {
    alert('🚫 TỪ CHỐI TRUY CẬP: Chỉ tài khoản có quyền Quản trị viên (Admin) mới có thể vào trang này!');
    return <Navigate to="/profile" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
