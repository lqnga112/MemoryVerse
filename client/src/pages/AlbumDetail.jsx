import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AlbumDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [album, setAlbum] = useState(null);
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // States cho Lightbox (Trình xem ảnh/sửa xóa ảnh)
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [memoryTitle, setMemoryTitle] = useState('');
  const [updatingMemory, setUpdatingMemory] = useState(false);

  useEffect(() => {
    fetchMemories();
  }, [id]);

  const fetchMemories = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/albums/${id}/memories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlbum(res.data.album);
      setMemories(res.data.memories);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 404) navigate('/profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/albums/${id}/memories`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      fetchMemories();
    } catch (err) {
      console.error(err);
      alert('Tải ảnh lên thất bại');
    } finally {
      setUploading(false);
    }
  };

  const openLightbox = (memory) => {
    setSelectedMemory(memory);
    setMemoryTitle(memory.title || '');
  };

  const handleUpdateMemory = async (e) => {
    e.preventDefault();
    setUpdatingMemory(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/memories/${selectedMemory._id}`, 
        { title: memoryTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Cập nhật state nội bộ để không phải fetch lại toàn bộ
      setMemories(memories.map(m => m._id === selectedMemory._id ? { ...m, title: memoryTitle } : m));
      setSelectedMemory(null);
    } catch (err) {
      alert('Cập nhật thất bại');
    } finally {
      setUpdatingMemory(false);
    }
  };

  const handleDeleteMemory = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa vĩnh viễn kỷ niệm này?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/memories/${selectedMemory._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMemories(memories.filter(m => m._id !== selectedMemory._id));
      setSelectedMemory(null);
    } catch (err) {
      alert('Xóa thất bại');
    }
  };

  if (loading) return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>Đang tải...</div>;

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <aside className="glass-card sidebar" style={{ width: '80px', alignItems: 'center', justifyContent: 'flex-start' }}>
        <button 
          onClick={() => navigate('/profile')} 
          style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' }}
        >
          🔙
        </button>
      </aside>

      <main className="glass-card main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>{album?.title}</h2>
            <p style={{ color: 'var(--text-secondary)' }}>{album?.description || 'Chưa có mô tả'}</p>
          </div>
          
          <div style={{ position: 'relative' }}>
            <input 
              type="file" 
              accept="image/*,video/*"
              onChange={handleFileUpload} 
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0, cursor: 'pointer', width: '100%' }}
              disabled={uploading}
            />
            <button className="btn-primary" style={{ background: '#3b82f6', pointerEvents: 'none' }}>
              {uploading ? '⏳ Đang tải...' : '➕ Tải Kỷ Niệm Lên'}
            </button>
          </div>
        </div>

        {memories.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '250px', border: '2px dashed rgba(255,255,255,0.2)', borderRadius: '24px' }}>
            <p style={{ fontSize: '36px', marginBottom: '16px' }}>📸</p>
            <p style={{ fontWeight: '500', marginBottom: '8px' }}>Album này chưa có ảnh nào.</p>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Bấm "Tải Kỷ Niệm Lên" để thêm ảnh đầu tiên nhé!</p>
          </div>
        ) : (
          <div className="grid-container">
            {memories.map(memory => (
              <div 
                key={memory._id} 
                onClick={() => openLightbox(memory)}
                style={{ position: 'relative', aspectRatio: '1/1', borderRadius: '16px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', cursor: 'pointer' }}
              >
                {memory.fileType === 'video' ? (
                  <video src={`http://localhost:5000${memory.fileUrl}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <img src={`http://localhost:5000${memory.fileUrl}`} alt="Memory" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
                {/* Lớp mờ đen dưới đáy để hiển thị tiêu đề nếu có */}
                {memory.title && (
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', padding: '16px 8px 8px 8px', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {memory.title}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Lightbox / Edit Memory Modal */}
      {selectedMemory && (
        <div className="modal-overlay" style={{ padding: '40px', boxSizing: 'border-box' }}>
          <div style={{ width: '100%', maxWidth: '900px', height: '100%', display: 'flex', gap: '24px', position: 'relative' }}>
            
            {/* Vùng hiển thị Ảnh/Video to */}
            <div style={{ flex: 1, background: '#000', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {selectedMemory.fileType === 'video' ? (
                <video src={`http://localhost:5000${selectedMemory.fileUrl}`} style={{ maxHeight: '100%', maxWidth: '100%' }} controls autoPlay />
              ) : (
                <img src={`http://localhost:5000${selectedMemory.fileUrl}`} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
              )}
            </div>

            {/* Cột Công cụ bên phải */}
            <div className="modal-content" style={{ width: '320px', height: 'max-content' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold' }}>Chi tiết Kỷ niệm</h3>
                <button onClick={() => setSelectedMemory(null)} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' }}>✖</button>
              </div>

              <form onSubmit={handleUpdateMemory}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Tiêu đề / Ghi chú</label>
                <textarea 
                  value={memoryTitle}
                  onChange={e => setMemoryTitle(e.target.value)}
                  className="form-input"
                  style={{ minHeight: '80px', resize: 'vertical' }}
                  placeholder="Thêm mô tả cho kỷ niệm này..."
                />
                
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  <button type="submit" disabled={updatingMemory} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                    {updatingMemory ? '⏳' : 'Lưu'}
                  </button>
                  <button type="button" onClick={handleDeleteMemory} className="btn-primary" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5' }}>
                    🗑️ Xóa
                  </button>
                </div>
              </form>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
};

export default AlbumDetail;
