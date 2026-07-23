import React from 'react';

export default function App() {
  return (
    <div style={{ maxWidth: '1000px', margin: '60px auto', padding: '0 20px' }}>
      <header style={{ textContent: 'center', marginBottom: '40px' }}>
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
          Tải lên ảnh cũ, video, thư tay (AI OCR) & ghi âm (AI Speech-to-Text). Quản lý Cây gia phả & Hỏi đáp Kỷ niệm bằng AI Chatbot.
        </p>
      </header>

      <div className="glass-card">
        <h2 style={{ fontSize: '20px', marginBottom: '12px', color: 'var(--accent-blue)' }}>
          ✨ Module 1: Khởi tạo Project & Setup Git
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
          Môi trường Frontend (React + Vite) & Backend (Express) đã sẵn sàng. Bạn có thể mở dự án trên <b>VS Code</b> và thực hiện <code>git push</code> để đồng bộ code cùng đồng đội!
        </p>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-primary" onClick={() => alert('Frontend Client đang chạy mượt mà trên VS Code!')}>
            Kiểm tra Client Status
          </button>
        </div>
      </div>
    </div>
  );
}
