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
  const [albumCoverFile, setAlbumCoverFile] = useState(null);
  const [editingAlbumId, setEditingAlbumId] = useState(null);
  const [processing, setProcessing] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const userRes = await axios.get('http://localhost:5001/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(userRes.data);

      const albumRes = await axios.get('http://localhost:5001/api/albums', {
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
      const formData = new FormData();
      formData.append('title', albumTitle);
      formData.append('description', albumDesc);
      if (albumCoverFile) {
        formData.append('coverImage', albumCoverFile);
      }

      await axios.post('http://localhost:5001/api/albums', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setShowModal(false);
      setAlbumTitle('');
      setAlbumDesc('');
      setAlbumCoverFile(null);
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
    setAlbumDesc(album.description || '');
    setEditingAlbumId(album._id);
    setAlbumCoverFile(null);
    setShowEditModal(true);
  };

  const handleUpdateAlbum = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', albumTitle);
      formData.append('description', albumDesc);
      if (albumCoverFile) {
        formData.append('coverImage', albumCoverFile);
      }

      await axios.put(`http://localhost:5001/api/albums/${editingAlbumId}`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setShowEditModal(false);
      setEditingAlbumId(null);
      setAlbumTitle('');
      setAlbumDesc('');
      setAlbumCoverFile(null);
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
      await axios.delete(`http://localhost:5001/api/albums/${id}`, {
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
            <img src="/logo.png" alt="MemoryVerse Logo" style={{ height: '48px', objectFit: 'contain' }} />
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
            {user?.role === 'admin' && (
              <button onClick={() => navigate('/admin')} className="btn-outline" style={{ background: 'rgba(168, 139, 119, 0.15)', borderColor: 'var(--primary-brown)' }}>
                🛡️ Trang Quản trị Admin
              </button>
            )}
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
              src={user?.avatar_url ? `http://localhost:5001${user.avatar_url}` : `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.email}`} 
              alt="Avatar" 
              style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)', objectFit: 'cover' }} 
            />
          </div>
        </div>

        {/* Nút Tạo Hành trình */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold' }}>Các Hành Trình Kỷ Niệm</h3>
          <button onClick={() => { setAlbumTitle(''); setAlbumDesc(''); setAlbumCoverFile(null); setShowModal(true); }} className="btn-primary">
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
                  <button title="Sửa tên & Ảnh bìa Album" onClick={(e) => handleEditClick(e, album)} style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                    ✏️
                  </button>
                  <button title="Xóa Album" onClick={(e) => handleDeleteAlbum(e, album._id)} style={{ background: 'rgba(239,68,68,0.7)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                    🗑️
                  </button>
                </div>

                <div className="album-cover" style={{ width: '100%', height: '180px', borderRadius: '12px', overflow: 'hidden', background: 'rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                  {album.coverImage ? (
                    <img 
                      src={`http://localhost:5001${album.coverImage}`} 
                      alt="Cover" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentNode.innerHTML = '<span style="opacity: 0.5; font-size: 36px;">📁</span>';
                      }}
                    />
                  ) : (
                    <span style={{ opacity: 0.5, fontSize: '36px' }}>📁</span>
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
          <div className="modal-content" style={{ width: '420px', padding: '28px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '20px' }}>
              {showEditModal ? '✏️ Chỉnh sửa Hành trình' : '✨ Tạo Hành Trình Mới'}
            </h2>
            <form onSubmit={showEditModal ? handleUpdateAlbum : handleCreateAlbum}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Tên Hành trình</label>
              <input 
                type="text" 
                value={albumTitle}
                onChange={e => setAlbumTitle(e.target.value)}
                className="form-input"
                placeholder="Ví dụ: Hành trình Cuộc đời Chủ tịch Hồ Chí Minh"
                required
                style={{ padding: '10px 12px' }}
              />
              
              <label style={{ display: 'block', marginBottom: '6px', marginTop: '12px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Mô tả (tùy chọn)</label>
              <textarea 
                value={albumDesc}
                onChange={e => setAlbumDesc(e.target.value)}
                className="form-input"
                style={{ minHeight: '80px', resize: 'vertical', padding: '10px 12px' }}
                placeholder="Ghi chú thêm về hành trình này..."
              />
              
              {/* Chọn Ảnh Bìa Cho Album */}
              <label style={{ display: 'block', marginBottom: '6px', marginTop: '12px', fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                🖼️ Chọn Ảnh Bìa đại diện (Tùy chọn)
              </label>
              <input 
                type="file" 
                id="album-cover-input" 
                accept="image/*" 
                style={{ display: 'none' }}
                onChange={e => setAlbumCoverFile(e.target.files[0])}
              />
              <label 
                htmlFor="album-cover-input"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  borderRadius: '10px',
                  background: albumCoverFile ? 'rgba(59, 130, 246, 0.2)' : 'rgba(155, 119, 92, 0.15)',
                  border: albumCoverFile ? '1.5px solid #3b82f6' : '1.5px dashed rgba(155, 119, 92, 0.4)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  marginBottom: '16px',
                  color: albumCoverFile ? '#60a5fa' : 'var(--text-primary)',
                  transition: 'all 0.2s'
                }}
              >
                {albumCoverFile ? `📁 Đã chọn: ${albumCoverFile.name}` : '📂 Bấm để chọn Ảnh bìa từ máy tính'}
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" onClick={() => { setShowModal(false); setShowEditModal(false); }} className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                  Hủy
                </button>
                <button type="submit" disabled={processing} className="btn-primary" style={{ fontWeight: 'bold' }}>
                  {processing ? '⏳ Đang lưu...' : '💾 Lưu lại'}
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
