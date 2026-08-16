import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ShieldCheck, Users, FolderHeart, Image as ImageIcon, FileText, 
  Cpu, HardDrive, ArrowLeft, RefreshCw, UserCheck, ShieldAlert
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Lấy thông tin user hiện tại
      const profileRes = await axios.get(`${API_BASE}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (profileRes.data.success) {
        setCurrentUser(profileRes.data.user);
      }

      // Lấy thống kê admin
      const statsRes = await axios.get(`${API_BASE}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }

      // Lấy danh sách users
      const usersRes = await axios.get(`${API_BASE}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (usersRes.data.success) {
        setUsers(usersRes.data.users);
      }
    } catch (err) {
      console.error('Lỗi nạp thông tin Admin:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMakeMeAdmin = async () => {
    try {
      const res = await axios.post(`${API_BASE}/admin/make-me-admin`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setMsg('🎉 Nâng cấp thành công! Tài khoản của bạn giờ là Admin.');
        fetchData();
      }
    } catch (err) {
      setMsg('Lỗi nâng cấp tài khoản Admin.');
    }
  };

  const toggleUserRole = async (userId, currentRole) => {
    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      const res = await axios.put(`${API_BASE}/admin/users/${userId}/role`, 
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        fetchData();
      }
    } catch (err) {
      console.error('Lỗi đổi vai trò:', err);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F4EBE1 0%, #EADBC8 100%)',
      fontFamily: 'var(--font-sans)',
      padding: '24px',
      color: '#4A3E3D'
    }}>
      {/* Header */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '16px 24px',
        border: '1px solid rgba(255, 255, 255, 0.6)',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={() => navigate('/profile')}
            style={{
              background: 'var(--primary-brown)',
              color: '#FFF',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px'
            }}
          >
            <ArrowLeft size={16} /> Trang Cá Nhân
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={28} color="#A88B77" />
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Trang Quản Trị Hệ Thống (Admin Panel)</h2>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {currentUser && (
            <span style={{
              background: currentUser.role === 'admin' ? '#E8F5E9' : '#FFF3E0',
              color: currentUser.role === 'admin' ? '#2E7D32' : '#E65100',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 'bold',
              border: '1px solid currentColor'
            }}>
              Vai trò: {currentUser.role.toUpperCase()}
            </span>
          )}

          {currentUser && currentUser.role !== 'admin' && (
            <button
              onClick={handleMakeMeAdmin}
              style={{
                background: '#4CAF50',
                color: '#FFF',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
              }}
            >
              ⚡ Bấm để Trở Thành Admin
            </button>
          )}

          <button 
            onClick={fetchData}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--primary-brown)' }}
            title="Làm mới dữ liệu"
          >
            <RefreshCw size={20} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {msg && (
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto 16px',
          padding: '12px',
          background: '#E8F5E9',
          color: '#2E7D32',
          borderRadius: '8px',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          {msg}
        </div>
      )}

      {/* Main Container */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Thống kê Tổng quan (Stat Cards) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <div style={{ background: '#FFF', padding: '20px', borderRadius: '16px', border: '1px solid rgba(168, 139, 119, 0.2)', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>TỔNG NGƯỜI DÙNG</span>
              <Users size={24} color="#8D6E63" />
            </div>
            <h3 style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--primary-brown)', margin: 0 }}>{stats ? stats.totalUsers : 0}</h3>
            <p style={{ fontSize: '11px', color: '#888', marginTop: '4px', margin: 0 }}>Tài khoản đã đăng ký</p>
          </div>

          <div style={{ background: '#FFF', padding: '20px', borderRadius: '16px', border: '1px solid rgba(168, 139, 119, 0.2)', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>BỘ BỘ ALBUM KỶ NIỆM</span>
              <FolderHeart size={24} color="#8D6E63" />
            </div>
            <h3 style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--primary-brown)', margin: 0 }}>{stats ? stats.totalAlbums : 0}</h3>
            <p style={{ fontSize: '11px', color: '#888', marginTop: '4px', margin: 0 }}>Album kỷ vật đã tạo</p>
          </div>

          <div style={{ background: '#FFF', padding: '20px', borderRadius: '16px', border: '1px solid rgba(168, 139, 119, 0.2)', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>TỔNG KỶ VẬT / ẢNH</span>
              <ImageIcon size={24} color="#8D6E63" />
            </div>
            <h3 style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--primary-brown)', margin: 0 }}>{stats ? stats.totalMemories : 0}</h3>
            <p style={{ fontSize: '11px', color: '#888', marginTop: '4px', margin: 0 }}>Tệp media & hình ảnh</p>
          </div>

          <div style={{ background: '#FFF', padding: '20px', borderRadius: '16px', border: '1px solid rgba(168, 139, 119, 0.2)', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>XỬ LÝ GEMINI AI OCR</span>
              <FileText size={24} color="#8D6E63" />
            </div>
            <h3 style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--primary-brown)', margin: 0 }}>{stats ? stats.ocrMemories : 0}</h3>
            <p style={{ fontSize: '11px', color: '#888', marginTop: '4px', margin: 0 }}>Thư tay cũ đã quét chữ</p>
          </div>
        </div>

        {/* Trạng thái Máy chủ & Bảo mật CSDL */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid rgba(168, 139, 119, 0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Cpu size={32} color="#4E342E" />
            <div>
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: 'var(--primary-brown)' }}>Trạng thái CSDL MongoDB</h4>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                Động cơ: <b>{stats?.databaseEngine || 'MongoDB Persistent'}</b> • Lưu trữ: <b>{stats?.storageUsed || 'Ổ cứng cố định'}</b>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#E8F5E9', padding: '8px 16px', borderRadius: '30px', border: '1px solid #A5D6A7' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#4CAF50' }}></span>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#2E7D32' }}>Hệ thống hoạt động 100% bình thường</span>
          </div>
        </div>

        {/* Bảng Quản lý Danh sách Tài khoản Người dùng */}
        <div style={{
          background: '#FFF',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid rgba(168, 139, 119, 0.2)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--primary-brown)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck size={20} /> Danh sách Người Dùng & Phân Quyền (User Management)
            </h3>
            <span style={{ fontSize: '12px', color: '#888' }}>Tổng cộng: {users.length} tài khoản</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#FAF6EE', borderBottom: '2px solid rgba(168, 139, 119, 0.3)' }}>
                  <th style={{ padding: '12px' }}>Họ và Tên</th>
                  <th style={{ padding: '12px' }}>Email</th>
                  <th style={{ padding: '12px' }}>Vai Trò (Role)</th>
                  <th style={{ padding: '12px' }}>Ngày Tạo</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Thao Tác Phân Quyền</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: 'var(--primary-brown)' }}>{u.full_name}</td>
                    <td style={{ padding: '12px', color: 'var(--text-primary)' }}>{u.email}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        background: u.role === 'admin' ? '#E8F5E9' : '#FFF3E0',
                        color: u.role === 'admin' ? '#2E7D32' : '#E65100'
                      }}>
                        {u.role ? u.role.toUpperCase() : 'USER'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: '#888' }}>
                      {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={() => toggleUserRole(u._id, u.role)}
                        style={{
                          background: u.role === 'admin' ? '#FFEBEE' : '#E8F5E9',
                          color: u.role === 'admin' ? '#C62828' : '#2E7D32',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        {u.role === 'admin' ? 'Hạ quyền xuống User' : 'Nâng quyền lên Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
