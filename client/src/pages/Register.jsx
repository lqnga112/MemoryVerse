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
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '0 20px' }}>
      <div className="glass-card">
        <h2 style={{ fontSize: '24px', marginBottom: '20px', textAlign: 'center' }}>Đăng Ký Tài Khoản</h2>
        {error && <p style={{ color: '#ef4444', marginBottom: '10px', fontSize: '14px' }}>{error}</p>}
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input 
            type="text" 
            placeholder="Họ và tên" 
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.1)', color: '#fff' }}
            required
          />
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
            Đăng Ký
          </button>
        </form>
        <p style={{ marginTop: '16px', textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
          Đã có tài khoản? <a href="/login" style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}>Đăng nhập</a>
        </p>
      </div>
    </div>
  );
}
