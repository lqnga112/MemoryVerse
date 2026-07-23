import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      alert('Đăng nhập thành công!');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '0 20px' }}>
      <div className="glass-card">
        <h2 style={{ fontSize: '24px', marginBottom: '20px', textAlign: 'center' }}>Đăng Nhập</h2>
        {error && <p style={{ color: '#ef4444', marginBottom: '10px', fontSize: '14px' }}>{error}</p>}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.1)', color: '#fff' }}
            required
          />
          <input 
            type="password" 
            placeholder="Mật khẩu" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.1)', color: '#fff' }}
            required
          />
          <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}>
            Đăng Nhập
          </button>
        </form>
        <p style={{ marginTop: '16px', textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
          Chưa có tài khoản? <a href="/register" style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}>Đăng ký ngay</a>
        </p>
      </div>
    </div>
  );
}
