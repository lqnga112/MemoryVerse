import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import AlbumDetail from './pages/AlbumDetail';
import ProtectedRoute from './components/ProtectedRoute';

function Home() {
  return (
    <div style={{ maxWidth: '1000px', margin: '60px auto', padding: '0 20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <span className="badge">AI Museum of Memories</span>
        <h1 style={{ 
          fontSize: '42px', 
          fontWeight: 800, 
          marginTop: '16px',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-heading)'
        }}>
          MemoryVerse
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '18px', fontFamily: 'var(--font-hand)' }}>
          "Every memory deserves to be remembered."
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
        
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/albums/:id" element={<AlbumDetail />} />
        </Route>

        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
