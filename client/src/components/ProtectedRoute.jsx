import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const token = localStorage.getItem('token');

  // Nếu không có token, người dùng chưa đăng nhập -> Đẩy về trang /login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Nếu có token, cho phép đi tiếp vào các component con (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;
