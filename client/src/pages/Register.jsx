import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', { 
        full_name: fullName, 
        email, 
        password 
      });
      localStorage.setItem('token', res.data.token);
      alert('Đăng ký thành công!');
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ textAlign: 'center' }}>
          <span className="badge" style={{ marginBottom: '12px' }}>MemoryVerse</span>
          <h2 style={{ fontSize: '28px', fontWeight: '900', color: 'var(--primary-brown)' }}>Đăng Ký</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Tạo tài khoản để bắt đầu lưu giữ những kỷ niệm gia đình</p>
        </div>

        {error && <p style={{ color: '#ef4444', fontSize: '14px', background: 'rgba(239,68,68,0.1)', padding: '10px', borderRadius: '6px', textAlign: 'center' }}>{error}</p>}
        
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Họ và Tên</label>
            <input 
              type="text" 
              placeholder="Nguyễn Văn A" 
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="form-input"
              style={{ marginBottom: 0 }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Địa chỉ Email</label>
            <input 
              type="email" 
              placeholder="ten@email.com" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="form-input"
              style={{ marginBottom: 0 }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Mật khẩu</label>
            <input 
              type="password" 
              placeholder="Tối thiểu 6 ký tự" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="form-input"
              style={{ marginBottom: 0 }}
              required
            />
          </div>

          <button type="submit" className="btn-primary" style={{ justifyContent: 'center', width: '100%', padding: '14px', fontSize: '15px', marginTop: '8px' }}>
            Đăng Ký
          </button>
        </form>
        
        <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
          Đã có tài khoản? <a href="/login" style={{ color: 'var(--accent-gold)', fontWeight: 'bold', textDecoration: 'none' }}>Đăng nhập</a>
        </p>
      </div>
    </div>
  );
}
