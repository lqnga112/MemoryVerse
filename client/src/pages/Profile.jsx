import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States cho Modals
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const [albumTitle, setAlbumTitle] = useState('');
  const [albumDesc, setAlbumDesc] = useState('');
  const [editingAlbumId, setEditingAlbumId] = useState(null);
  const [processing, setProcessing] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const userRes = await axios.get('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(userRes.data);

      const albumRes = await axios.get('http://localhost:5000/api/albums', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlbums(albumRes.data);
    } catch (error) {
      console.error(error);
      localStorage.removeItem('token');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleCreateAlbum = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/albums', 
        { title: albumTitle, description: albumDesc },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowModal(false);
      setAlbumTitle('');
      setAlbumDesc('');
      fetchData();
    } catch (error) {
      alert('Tạo album thất bại');
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  const handleEditClick = (e, album) => {
    e.stopPropagation(); // Ngăn sự kiện click lan ra thẻ cha
    setAlbumTitle(album.title);
    setAlbumDesc(album.description);
    setEditingAlbumId(album._id);
    setShowEditModal(true);
  };

  const handleUpdateAlbum = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/albums/${editingAlbumId}`, 
        { title: albumTitle, description: albumDesc },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowEditModal(false);
      fetchData();
    } catch (error) {
      alert('Cập nhật album thất bại');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteAlbum = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Bạn có chắc muốn xóa vĩnh viễn album này và toàn bộ ảnh bên trong không?")) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/albums/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (error) {
      alert('Xóa album thất bại');
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>Đang tải thông tin...</div>;
  }

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
            <button className="btn-outline active">
              🏠 Trang chủ
            </button>
            <button className="btn-outline">
              🎞️ Hành trình ({albums.length})
            </button>
            <button onClick={() => navigate('/settings')} className="btn-outline">
              ⚙️ Cài đặt tài khoản
            </button>
          </div>
        </div>
        <button onClick={handleLogout} className="btn-primary" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', width: '100%', justifyContent: 'center' }}>
          🚪 Đăng xuất
        </button>
      </aside>

      {/* Main Content */}
      <main className="glass-card main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold' }}>Thư viện Kỷ niệm</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontWeight: '600' }}>{user?.full_name}</p>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{user?.email}</p>
            </div>
            <img 
              src={user?.avatar_url ? `http://localhost:5000${user.avatar_url}` : `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.email}`} 
              alt="Avatar" 
              style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)', objectFit: 'cover' }} 
            />
          </div>
        </div>

        {/* Nút Tạo Hành trình */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold' }}>Các Hành Trình Kỷ Niệm</h3>
          <button onClick={() => { setAlbumTitle(''); setAlbumDesc(''); setShowModal(true); }} className="btn-primary">
            + Bắt đầu hành trình mới
          </button>
        </div>

        {/* Danh sách Album */}
        <div className="grid-container">
          {albums.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', gridColumn: '1 / -1' }}>Chưa có album nào. Hãy tạo album đầu tiên!</p>
          ) : (
            albums.map(album => (
              <div 
                key={album._id} 
                onClick={() => navigate(`/albums/${album._id}`)}
                className="glass-card album-card"
                style={{ padding: '16px', position: 'relative' }}
              >
                {/* Nút Sửa & Xóa góc phải */}
                <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '4px', zIndex: 10 }}>
                  <button onClick={(e) => handleEditClick(e, album)} style={{ background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    ✏️
                  </button>
                  <button onClick={(e) => handleDeleteAlbum(e, album._id)} style={{ background: 'rgba(239,68,68,0.5)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    🗑️
                  </button>
                </div>

                <div className="album-cover">
                  {album.coverImage ? (
                    <img 
                      src={`http://localhost:5000${album.coverImage}`} 
                      alt="Cover" 
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentNode.innerHTML = '<span style="opacity: 0.5; font-size: 32px;">📁</span>';
                      }}
                    />
                  ) : (
                    <span style={{ opacity: 0.5, fontSize: '32px' }}>📁</span>
                  )}
                </div>
                <h3 style={{ fontWeight: '600', fontSize: '18px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{album.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{album.description || 'Không có mô tả'}</p>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Modal Tạo / Sửa Album (Dùng chung layout) */}
      {(showModal || showEditModal) && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>
              {showEditModal ? 'Chỉnh sửa Album' : 'Tạo Album Mới'}
            </h2>
            <form onSubmit={showEditModal ? handleUpdateAlbum : handleCreateAlbum}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Tên Album</label>
              <input 
                type="text" 
                value={albumTitle}
                onChange={e => setAlbumTitle(e.target.value)}
                className="form-input"
                placeholder="Ví dụ: Tết Nguyên Đán 2026"
                required
              />
              
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Mô tả (tùy chọn)</label>
              <textarea 
                value={albumDesc}
                onChange={e => setAlbumDesc(e.target.value)}
                className="form-input"
                style={{ minHeight: '100px', resize: 'vertical' }}
                placeholder="Ghi chú thêm về album này..."
              />
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => { setShowModal(false); setShowEditModal(false); }} className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--border-color)' }}>
                  Hủy
                </button>
                <button type="submit" disabled={processing} className="btn-primary">
                  {processing ? 'Đang lưu...' : 'Lưu lại'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
