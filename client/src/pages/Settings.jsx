import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Settings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
      setFullName(res.data.full_name);
      setBio(res.data.bio || '');
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put('http://localhost:5000/api/users/profile', 
        { full_name: fullName, bio },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(res.data);
      alert('Cập nhật hồ sơ thành công!');
    } catch (err) {
      alert('Cập nhật thất bại');
    } finally {
      setProcessing(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/users/avatar', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setUser(res.data);
      alert('Tải ảnh đại diện thành công!');
    } catch (err) {
      alert('Tải ảnh thất bại');
    } finally {
      setProcessing(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return alert('Mật khẩu mới phải có ít nhất 6 ký tự');
    
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/users/password', 
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
      localStorage.removeItem('token');
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setProcessing(false);
      setOldPassword('');
      setNewPassword('');
    }
  };

  if (loading) return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>Đang tải...</div>;

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <aside className="glass-card sidebar">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>✨</div>
            <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>MemoryVerse</h1>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button onClick={() => navigate('/profile')} className="btn-outline">
              🏠 Trang chủ
            </button>
            <button className="btn-outline active">
              ⚙️ Cài đặt tài khoản
            </button>
          </div>
        </div>
      </aside>

      <main className="glass-card main-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '32px' }}>Cài đặt Tài khoản</h2>

        <div style={{ display: 'flex', gap: '40px' }}>
          {/* Cột trái: Ảnh đại diện */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '200px' }}>
            <div style={{ width: '150px', height: '150px', borderRadius: '50%', overflow: 'hidden', border: '4px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', position: 'relative' }}>
              <img 
                src={user?.avatar_url ? `http://localhost:5000${user.avatar_url}` : `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.email}`} 
                alt="Avatar" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', padding: '8px', textAlign: 'center', cursor: 'pointer' }}>
                <label style={{ color: 'white', fontSize: '12px', cursor: 'pointer' }}>
                  📷 Đổi ảnh
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} disabled={processing} />
                </label>
              </div>
            </div>
            <p style={{ fontWeight: 'bold', fontSize: '18px' }}>{user?.full_name}</p>
            <span className="badge">{user?.role}</span>
          </div>

          {/* Cột phải: Form thông tin */}
          <div style={{ flex: 1 }}>
            <form onSubmit={handleUpdateProfile} style={{ marginBottom: '40px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>Hồ sơ cá nhân</h3>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Email (không thể đổi)</label>
                <input type="text" value={user?.email} className="form-input" disabled style={{ opacity: 0.5 }} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Họ và Tên</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="form-input" required />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Tiểu sử / Châm ngôn gia đình</label>
                <textarea 
                  value={bio} 
                  onChange={e => setBio(e.target.value)} 
                  className="form-input" 
                  style={{ minHeight: '80px', resize: 'vertical' }}
                  placeholder="Viết một vài dòng về bạn hoặc gia đình..."
                />
              </div>

              <button type="submit" disabled={processing} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                {processing ? '⏳ Đang lưu...' : 'Lưu Thay Đổi'}
              </button>
            </form>

            <form onSubmit={handleChangePassword}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>Đổi mật khẩu</h3>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Mật khẩu hiện tại</label>
                <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} className="form-input" required />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Mật khẩu mới</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="form-input" required minLength="6" />
              </div>

              <button type="submit" disabled={processing} className="btn-primary" style={{ width: '100%', justifyContent: 'center', background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5' }}>
                {processing ? '⏳ Đang xử lý...' : '🔑 Cập nhật Mật khẩu'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
