import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';

function Home() {
  return (
    <div style={{ maxWidth: '1000px', margin: '60px auto', padding: '0 20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <span className="badge">Dự án 1 - Family Memory App MVP</span>
        <h1 style={{ 
          fontSize: '36px', 
          fontWeight: 800, 
          marginTop: '16px',
          background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Hệ thống Lưu giữ & Phân tích Kỷ niệm Gia đình
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
          Tải lên ảnh cũ, video, thư tay (AI OCR) & ghi âm (AI Speech-to-Text).
        </p>
      </header>

      <div className="glass-card" style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '12px', color: 'var(--accent-emerald)' }}>
          ✅ Module 2: Đăng nhập & Đăng ký đã sẵn sàng
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
          Hệ thống Authentication bằng JWT và MongoDB đã được thiết lập.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link to="/login" className="btn-primary">Đăng Nhập</Link>
          <Link to="/register" className="btn-primary" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid var(--border-color)' }}>Đăng Ký</Link>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}
