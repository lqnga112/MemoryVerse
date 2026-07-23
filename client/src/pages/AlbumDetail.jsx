import React, { useState, useEffect, useRef } from 'react';
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
  
  // AI States
  const [isListening, setIsListening] = useState(false);
  const [isOcrRunning, setIsOcrRunning] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);

  const recognitionRef = useRef(null);

  useEffect(() => {
    fetchMemories();
    
    // Khởi tạo Speech Recognition
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'vi-VN';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setMemoryTitle(prev => prev + (prev ? ' ' : '') + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
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
    setIsListening(false);
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
      
      setMemories(memories.map(m => m._id === selectedMemory._id ? { ...m, title: memoryTitle } : m));
      setSelectedMemory(null);
      if (isListening) recognitionRef.current.stop();
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
      if (isListening) recognitionRef.current.stop();
    } catch (err) {
      alert('Xóa thất bại');
    }
  };

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const runOCR = async () => {
    if (!selectedMemory || selectedMemory.fileType !== 'image') return;
    
    setIsOcrRunning(true);
    setOcrProgress(0);
    
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`http://localhost:5000/api/ai/ocr/${selectedMemory._id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const extractedText = res.data.text;
      setMemoryTitle(prev => prev + (prev ? '\\n' : '') + extractedText.trim());
    } catch (error) {
      console.error(error);
      alert('Không thể đọc được chữ từ ảnh này. Vui lòng thử lại.');
    } finally {
      setIsOcrRunning(false);
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
          <div style={{ width: '100%', maxWidth: '1000px', height: '100%', display: 'flex', gap: '24px', position: 'relative' }}>
            
            {/* Vùng hiển thị Ảnh/Video to */}
            <div style={{ flex: 1, background: '#000', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
              {selectedMemory.fileType === 'video' ? (
                <video src={`http://localhost:5000${selectedMemory.fileUrl}`} style={{ maxHeight: '100%', maxWidth: '100%' }} controls autoPlay />
              ) : (
                <>
                  <img src={`http://localhost:5000${selectedMemory.fileUrl}`} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                  {/* Nút AI OCR đè lên ảnh */}
                  <button 
                    onClick={runOCR}
                    disabled={isOcrRunning}
                    style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '10px 20px', borderRadius: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', backdropFilter: 'blur(10px)', fontSize: '14px', fontWeight: 'bold' }}
                  >
                    {isOcrRunning ? `⏳ Đang dùng Gemini quét ảnh...` : '✨ Quét chữ bằng Gemini AI'}
                  </button>
                </>
              )}
            </div>

            {/* Cột Công cụ bên phải */}
            <div className="modal-content" style={{ width: '350px', height: 'max-content' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold' }}>Kỷ niệm</h3>
                <button onClick={() => { setSelectedMemory(null); if(isListening) recognitionRef.current.stop(); }} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' }}>✖</button>
              </div>

              <form onSubmit={handleUpdateMemory}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Nội dung / Câu chuyện</label>
                  {/* Nút Mic Nhận diện giọng nói */}
                  <button 
                    type="button" 
                    onClick={toggleListen}
                    style={{ background: isListening ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.1)', color: isListening ? '#f87171' : 'white', border: 'none', padding: '6px 12px', borderRadius: '12px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.3s' }}
                  >
                    {isListening ? '🔴 Đang nghe...' : '🎙️ Nói để gõ'}
                  </button>
                </div>
                <textarea 
                  value={memoryTitle}
                  onChange={e => setMemoryTitle(e.target.value)}
                  className="form-input"
                  style={{ minHeight: '120px', resize: 'vertical', border: isListening ? '1px solid #f87171' : '1px solid var(--border-color)' }}
                  placeholder="Thêm mô tả cho kỷ niệm này..."
                />
                
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  <button type="submit" disabled={updatingMemory} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                    {updatingMemory ? '⏳' : 'Lưu lại'}
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
