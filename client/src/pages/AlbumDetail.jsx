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
  const [activeTab, setActiveTab] = useState('timeline'); // 'timeline', 'story', 'chat'

  // States cho Lightbox (Trình xem ảnh/sửa xóa ảnh)
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [memoryTitle, setMemoryTitle] = useState('');
  const [updatingMemory, setUpdatingMemory] = useState(false);
  
  // AI States
  const [isListening, setIsListening] = useState(false);
  const [isOcrRunning, setIsOcrRunning] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [isSttRunning, setIsSttRunning] = useState(false);
  const [uploadType, setUploadType] = useState('image');

  // AI Story & Chat States
  const [story, setStory] = useState('');
  const [generatingStory, setGeneratingStory] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  
  // Family Tree Draggable State (saved to LocalStorage per album/journey as an array)
  const [familyMembers, setFamilyMembers] = useState(() => {
    const saved = localStorage.getItem('family_' + id);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return [
      { id: '1', name: 'Nguyễn Văn Quân', year: '1920', role: 'Cụ Ông', x: 150, y: 50, connections: ['2', '3'] },
      { id: '2', name: 'Trần Thị Én', year: '1925', role: 'Cụ Bà', x: 400, y: 50, connections: [] },
      { id: '3', name: 'Nguyễn Văn Lửa', year: '1952', role: 'Ông Nội', x: 275, y: 220, connections: ['4'] },
      { id: '4', name: 'Hoàng Thị Ngần', year: '1956', role: 'Bà Nội', x: 520, y: 220, connections: [] }
    ];
  });

  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const addMember = (parentId = null) => {
    const newMember = {
      id: Date.now().toString(),
      name: 'Thành viên mới',
      year: '1990',
      role: parentId ? 'Con' : 'Thành viên mới',
      parentId: parentId,
      x: parentId ? 275 : 100,
      y: parentId ? 350 : 100,
      connections: []
    };
    
    // Automatically link parent to child
    const updated = familyMembers.map(m => {
      if (parentId && m.id === parentId) {
        return { ...m, connections: [...(m.connections || []), newMember.id] };
      }
      return m;
    });

    const finalUpdated = [...updated, newMember];
    setFamilyMembers(finalUpdated);
    localStorage.setItem('family_' + id, JSON.stringify(finalUpdated));
  };

  const updateMember = (memberId, field, value) => {
    const updated = familyMembers.map(m => 
      m.id === memberId ? { ...m, [field]: value } : m
    );
    setFamilyMembers(updated);
    localStorage.setItem('family_' + id, JSON.stringify(updated));
  };

  const deleteMember = (memberId) => {
    if (!window.confirm('Bạn có chắc muốn xóa thành viên này?')) return;
    const updated = familyMembers.filter(m => m.id !== memberId).map(m => {
      // Remove any connections to this node
      return {
        ...m,
        connections: (m.connections || []).filter(cId => cId !== memberId)
      };
    });
    setFamilyMembers(updated);
    localStorage.setItem('family_' + id, JSON.stringify(updated));
  };

  const linkMember = (fromId, toId) => {
    if (fromId === toId) return;
    const updated = familyMembers.map(m => {
      if (m.id === fromId) {
        const existing = m.connections || [];
        if (existing.includes(toId)) {
          // Remove link if already exists (toggle link)
          return { ...m, connections: existing.filter(id => id !== toId) };
        }
        return { ...m, connections: [...existing, toId] };
      }
      return m;
    });
    setFamilyMembers(updated);
    localStorage.setItem('family_' + id, JSON.stringify(updated));
  };

  const handleMouseDown = (e, nodeId) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON' || e.target.tagName === 'SELECT') return;
    setDraggingNodeId(nodeId);
    const node = familyMembers.find(n => n.id === nodeId);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
    if (!draggingNodeId) return;
    const containerRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - containerRect.left - dragOffset.x;
    const y = e.clientY - containerRect.top - dragOffset.y;

    const cleanX = Math.max(10, Math.min(x, containerRect.width - 200));
    const cleanY = Math.max(10, Math.min(y, containerRect.height - 200));

    setFamilyMembers(prev => prev.map(n => 
      n.id === draggingNodeId ? { ...n, x: cleanX, y: cleanY } : n
    ));
  };

  const handleMouseUp = () => {
    if (draggingNodeId) {
      setDraggingNodeId(null);
      localStorage.setItem('family_' + id, JSON.stringify(familyMembers));
    }
  };

  const [isChatting, setIsChatting] = useState(false);

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

  useEffect(() => {
    if (activeTab !== 'map' || !window.L) return;

    // Khởi tạo bản đồ thế giới Leaflet
    const map = window.L.map('map-canvas').setView([16.047, 108.206], 6);

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const markersGroup = window.L.featureGroup().addTo(map);

    memories.forEach(m => {
      if (m.location) {
        let lat = 16.047, lng = 108.206; 
        const loc = m.location.toLowerCase();
        if (loc.includes('hà nội') || loc.includes('hn')) { lat = 21.0285; lng = 105.8542; }
        else if (loc.includes('hồ chí minh') || loc.includes('sài gòn') || loc.includes('hcm')) { lat = 10.8231; lng = 106.6297; }
        else if (loc.includes('nam định') || loc.includes('nđ')) { lat = 20.4312; lng = 106.1834; }
        else if (loc.includes('hải phòng') || loc.includes('hp')) { lat = 20.8449; lng = 106.6881; }
        else if (loc.includes('đà nẵng') || loc.includes('đn')) { lat = 16.0544; lng = 108.2022; }
        else if (loc.includes('huế')) { lat = 16.4637; lng = 107.5909; }
        else if (loc.includes('nha trang')) { lat = 12.2388; lng = 109.1967; }
        else if (loc.includes('đà lạt')) { lat = 11.9404; lng = 108.4583; }
        else if (loc.includes('cần thơ')) { lat = 10.0452; lng = 105.7469; }
        else {
          lat = 10 + Math.random() * 11;
          lng = 103 + Math.random() * 6;
        }

        window.L.marker([lat, lng])
          .addTo(markersGroup)
          .bindPopup(`<b>${m.location}</b><br/>${m.title || 'Kỷ niệm'}`);
      }
    });

    if (markersGroup.getBounds().isValid()) {
      map.fitBounds(markersGroup.getBounds(), { padding: [50, 50] });
    }

    // Cho phép click vào bất kỳ đâu trên bản đồ thế giới để ghim
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      const name = prompt("Nhập tên địa danh bạn muốn ghim tại đây:");
      if (name) {
        window.L.marker([lat, lng])
          .addTo(map)
          .bindPopup(`<b>${name}</b><br/>Ghim tự tạo trên bản đồ thế giới`)
          .openPopup();
      }
    });

    return () => {
      map.remove();
    };
  }, [activeTab, memories]);

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
    formData.append('fileType', uploadType);

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
        { 
          title: memoryTitle,
          memoryDate: selectedMemory.memoryDate,
          location: selectedMemory.location
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMemories(memories.map(m => m._id === selectedMemory._id ? { ...m, title: memoryTitle, memoryDate: selectedMemory.memoryDate, location: selectedMemory.location } : m));
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
    if (!selectedMemory || (selectedMemory.fileType !== 'image' && selectedMemory.fileType !== 'letter')) return;
    
    setIsOcrRunning(true);
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

  const runSTT = async () => {
    if (!selectedMemory || selectedMemory.fileType !== 'audio') return;
    
    setIsSttRunning(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`http://localhost:5000/api/ai/stt/${selectedMemory._id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const extractedText = res.data.text;
      setMemoryTitle(prev => prev + (prev ? '\n' : '') + extractedText.trim());
    } catch (error) {
      console.error(error);
      alert('Không thể bóc băng ghi âm này. Vui lòng thử lại.');
    } finally {
      setIsSttRunning(false);
    }
  };

  const handleGenerateStory = async () => {
    setGeneratingStory(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`http://localhost:5000/api/ai/story/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStory(res.data.story);
    } catch (error) {
      alert('Lỗi khi tạo hồi ký: ' + (error.response?.data?.message || 'Có lỗi xảy ra'));
    } finally {
      setGeneratingStory(false);
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    const userMsg = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatting(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`http://localhost:5000/api/ai/chat/${id}`, { question: userMsg.content }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChatMessages(prev => [...prev, { role: 'ai', content: res.data.answer }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'ai', content: 'Lỗi: Không thể kết nối với hệ thống bộ nhớ AI.' }]);
    } finally {
      setIsChatting(false);
    }
  };



  if (loading) return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>Đang tải...</div>;

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <aside className="glass-card sidebar" style={{ width: '260px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <button 
            onClick={() => navigate('/profile')} 
            className="btn-outline"
            style={{ width: '100%', marginBottom: '16px', justifyContent: 'flex-start', border: '1px solid rgba(168, 139, 119, 0.2)' }}
          >
            🔙 Quay Lại
          </button>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button 
              onClick={() => setActiveTab('timeline')} 
              className={`btn-outline ${activeTab === 'timeline' ? 'active' : ''}`}
              style={{ width: '100%', justifyContent: 'flex-start' }}
            >
              ⏳ Dòng Thời Gian
            </button>
            <button 
              onClick={() => setActiveTab('family')} 
              className={`btn-outline ${activeTab === 'family' ? 'active' : ''}`}
              style={{ width: '100%', justifyContent: 'flex-start' }}
            >
              🌳 Sơ Đồ Gia Đình
            </button>
            <button 
              onClick={() => setActiveTab('map')} 
              className={`btn-outline ${activeTab === 'map' ? 'active' : ''}`}
              style={{ width: '100%', justifyContent: 'flex-start' }}
            >
              🗺️ Bản Đồ Ký Ức
            </button>
            <button 
              onClick={() => setActiveTab('chat')} 
              className={`btn-outline ${activeTab === 'chat' ? 'active' : ''}`}
              style={{ width: '100%', justifyContent: 'flex-start' }}
            >
              💬 Trò Chuyện AI
            </button>
            <button 
              onClick={() => setActiveTab('story')} 
              className={`btn-outline ${activeTab === 'story' ? 'active' : ''}`}
              style={{ width: '100%', justifyContent: 'flex-start' }}
            >
              📖 Cuốn Hồi Ký
            </button>
          </div>
        </div>

        <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(168, 139, 119, 0.2)', paddingTop: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
          <p>Hành trình lưu giữ bởi</p>
          <p style={{ fontWeight: 'bold', color: 'var(--primary-brown)' }}>MemoryVerse</p>
        </div>
      </aside>

      <main className="glass-card main-content" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '36px', fontWeight: '900', marginBottom: '8px', color: 'var(--primary-brown)' }}>{album?.title}</h2>
            <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>{album?.description || 'Hành trình chưa có mô tả'}</p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <select 
              value={uploadType} 
              onChange={(e) => setUploadType(e.target.value)}
              className="form-input"
              style={{ width: '130px', padding: '8px', marginBottom: 0 }}
            >
              <option value="image">🖼️ Ảnh</option>
              <option value="video">🎥 Video</option>
              <option value="audio">🎵 Ghi âm</option>
              <option value="letter">📝 Thư tay</option>
            </select>
            <div style={{ position: 'relative' }}>
              <input 
                type="file" 
                accept={uploadType === 'video' ? 'video/*' : uploadType === 'audio' ? 'audio/*' : 'image/*'}
                onChange={handleFileUpload} 
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0, cursor: 'pointer', width: '100%' }}
                disabled={uploading}
              />
              <button className="btn-primary" style={{ pointerEvents: 'none' }}>
                {uploading ? '⏳ Đang tải...' : '➕ Thêm Kỷ Niệm'}
              </button>
            </div>
          </div>
        </div>



        {/* Content Area */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
          
          {activeTab === 'timeline' && (
            <div style={{ position: 'relative', paddingLeft: '24px' }}>
              {/* Vertical Line */}
              <div style={{ position: 'absolute', left: '7px', top: 0, bottom: 0, width: '2px', background: 'var(--light-brown)', opacity: 0.3 }}></div>
              
              {memories.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  <p style={{ fontSize: '36px', marginBottom: '16px' }}>🎞️</p>
                  <p>Hành trình này chưa có kỷ niệm nào.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  {memories.map((memory, idx) => (
                    <div key={memory._id} style={{ display: 'flex', gap: '24px', position: 'relative' }}>
                      {/* Timeline Dot */}
                      <div style={{ position: 'absolute', left: '-22px', top: '24px', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary-brown)', border: '2px solid var(--bg-dark)' }}></div>
                      
                      {/* Memory Content */}
                      <div 
                        onClick={() => openLightbox(memory)}
                        style={{ flex: 1, background: '#FFFFFF', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(168, 139, 119, 0.2)', boxShadow: 'var(--shadow-soft)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', gap: '16px', alignItems: 'center' }}
                      >
                        {/* Thumbnail */}
                        <div style={{ width: '120px', height: '120px', borderRadius: '8px', overflow: 'hidden', background: '#f5f5f5', flexShrink: 0 }}>
                          {memory.fileType === 'video' ? (
                            <video src={`http://localhost:5000${memory.fileUrl}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : memory.fileType === 'audio' ? (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--light-brown)', color: 'white', fontSize: '32px' }}>🎵</div>
                          ) : (
                            <img src={`http://localhost:5000${memory.fileUrl}`} alt="Memory" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'sepia(0.2)' }} />
                          )}
                        </div>
                        
                        {/* Details */}
                        <div>
                          <div style={{ fontSize: '12px', color: 'var(--light-brown)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>
                            {new Date(memory.memoryDate || memory.createdAt).toLocaleDateString('vi-VN')} {memory.location ? `• ${memory.location}` : ''}
                          </div>
                          <h4 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '8px' }}>
                            {memory.title || (memory.fileType === 'audio' ? 'Đoạn ghi âm' : memory.fileType === 'letter' ? 'Thư tay' : 'Kỷ niệm')}
                          </h4>
                          {memory.extractedText && (
                            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              "{memory.extractedText}"
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'family' && (
            <div style={{ padding: '24px', background: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid rgba(168, 139, 119, 0.15)', boxShadow: 'var(--shadow-soft)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ textAlign: 'left' }}>
                  <h3 style={{ fontSize: '24px', color: 'var(--primary-brown)', marginBottom: '4px' }}>🌳 Sơ Đồ Gia Đình (Bảng Kéo Thả)</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Kéo các thẻ để di chuyển vị trí, nhấp trực tiếp để sửa thông tin và liên kết các thành viên.</p>
                </div>
                <button 
                  onClick={() => addMember(null)} 
                  className="btn-primary"
                  style={{ fontSize: '13px', padding: '8px 16px' }}
                >
                  ➕ Thêm Thành Viên Gốc
                </button>
              </div>

              {/* Workspace Board */}
              <div 
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{ 
                  position: 'relative', 
                  width: '100%', 
                  height: '600px', 
                  background: '#FAF6EE', 
                  border: '1px solid rgba(168, 139, 119, 0.25)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  backgroundImage: 'radial-gradient(rgba(141, 110, 99, 0.12) 1.5px, transparent 1.5px)',
                  backgroundSize: '20px 20px',
                  userSelect: 'none',
                  cursor: draggingNodeId ? 'grabbing' : 'default'
                }}
              >
                {/* Connection lines SVG overlay */}
                <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
                  {familyMembers.map(node => 
                    (node.connections || []).map(targetId => {
                      const target = familyMembers.find(n => n.id === targetId);
                      if (!target) return null;
                      // Midpoints of cards (width: 190, height: 160)
                      const x1 = (node.x || 100) + 95;
                      const y1 = (node.y || 100) + 80;
                      const x2 = (target.x || 100) + 95;
                      const y2 = (target.y || 100) + 80;
                      return (
                        <path
                          key={`${node.id}-${target.id}`}
                          d={`M ${x1} ${y1} C ${(x1+x2)/2} ${y1}, ${(x1+x2)/2} ${y2}, ${x2} ${y2}`}
                          fill="none"
                          stroke="var(--primary-brown)"
                          strokeWidth="2.5"
                          strokeDasharray="6 4"
                        />
                      );
                    })
                  )}
                </svg>

                {/* Member Cards */}
                {familyMembers.map(node => (
                  <div
                    key={node.id}
                    onMouseDown={(e) => handleMouseDown(e, node.id)}
                    style={{
                      position: 'absolute',
                      left: `${node.x || 100}px`,
                      top: `${node.y || 100}px`,
                      width: '190px',
                      background: '#FAF6F0',
                      border: '2px solid var(--primary-brown)',
                      borderRadius: '12px',
                      padding: '12px',
                      boxShadow: '0 4px 12px rgba(78, 52, 46, 0.1)',
                      zIndex: draggingNodeId === node.id ? 100 : 10,
                      cursor: draggingNodeId === node.id ? 'grabbing' : 'grab',
                      transition: draggingNodeId === node.id ? 'none' : 'transform 0.1s ease'
                    }}
                  >
                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => deleteMember(node.id)}
                      style={{ position: 'absolute', top: '4px', right: '4px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '10px' }}
                    >
                      ❌
                    </button>

                    <input 
                      type="text" 
                      value={node.role || ''} 
                      onChange={e => updateMember(node.id, 'role', e.target.value)} 
                      style={{ border: 'none', background: 'transparent', textAlign: 'center', width: '100%', fontWeight: 'bold', fontSize: '11px', color: 'var(--light-brown)', outline: 'none', textTransform: 'uppercase' }}
                      placeholder="VAI TRÒ"
                    />
                    
                    <input 
                      type="text" 
                      value={node.name || ''} 
                      onChange={e => updateMember(node.id, 'name', e.target.value)} 
                      style={{ border: 'none', borderBottom: '1px dashed var(--primary-brown)', background: 'transparent', textAlign: 'center', width: '100%', fontWeight: 'bold', fontSize: '15px', color: 'var(--text-primary)', outline: 'none', margin: '4px 0' }}
                      placeholder="Tên thành viên..."
                    />

                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      <span>Sinh năm:</span>
                      <input 
                        type="text" 
                        value={node.year || ''} 
                        onChange={e => updateMember(node.id, 'year', e.target.value)} 
                        style={{ border: 'none', borderBottom: '1px dashed var(--light-brown)', background: 'transparent', textAlign: 'center', width: '45px', fontSize: '11px', color: 'var(--text-secondary)', outline: 'none' }}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => addMember(node.id)}
                      style={{ width: '100%', background: 'var(--primary-brown)', color: 'white', border: 'none', borderRadius: '4px', padding: '4px', fontSize: '10px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      ➕ Thêm con liên kết
                    </button>

                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          linkMember(node.id, e.target.value);
                          e.target.value = "";
                        }
                      }}
                      style={{ width: '100%', marginTop: '6px', fontSize: '10px', padding: '2px', border: '1px solid rgba(168, 139, 119, 0.4)', borderRadius: '4px', outline: 'none', background: 'transparent', color: 'var(--text-secondary)' }}
                    >
                      <option value="">🔗 Nối / Hủy nối...</option>
                      {familyMembers.filter(m => m.id !== node.id).map(m => (
                        <option key={m.id} value={m.id}>Nối với {m.name}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'map' && (
            <div style={{ padding: '24px', background: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid rgba(168, 139, 119, 0.15)', boxShadow: 'var(--shadow-soft)' }}>
              <h3 style={{ fontSize: '24px', marginBottom: '8px', color: 'var(--primary-brown)' }}>🗺️ Bản Đồ Ký Ức</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Các địa điểm gắn liền với kỷ niệm của {album?.title}</p>
              
              <div style={{ display: 'flex', gap: '24px', height: '400px' }}>
                {/* Real Leaflet Map Container */}
                <div id="map-canvas" style={{ flex: 2, borderRadius: '12px', border: '1px solid rgba(168, 139, 119, 0.3)', zIndex: 5 }}></div>

                {/* Location List Panel */}
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h4 style={{ fontSize: '16px', borderBottom: '1px solid rgba(168, 139, 119, 0.2)', paddingBottom: '8px' }}>Địa điểm đã lưu</h4>
                  {memories.filter(m => m.location).length === 0 ? (
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Chưa có địa điểm nào được lưu. Hãy chỉnh sửa kỷ niệm ở Timeline để thêm địa điểm.</p>
                  ) : (
                    memories.filter(m => m.location).map((m, idx) => (
                      <div key={idx} style={{ padding: '12px', background: '#FCFBF9', border: '1px solid rgba(168, 139, 119, 0.2)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--primary-brown)' }}>{m.location}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Kỷ niệm: {m.title || 'Không tiêu đề'}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'story' && (
            <div style={{ padding: '24px', background: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid rgba(168, 139, 119, 0.15)', boxShadow: 'var(--shadow-soft)' }}>
              {!story ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <p style={{ fontSize: '48px', marginBottom: '16px' }}>📖</p>
                  <h3 style={{ fontSize: '24px', color: 'var(--primary-brown)', marginBottom: '8px' }}>Chưa có hồi ký</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Chức năng AI Storytelling sẽ đọc tất cả các kỷ niệm ở Timeline và xâu chuỗi thành một câu chuyện cuộc đời.</p>
                  <button onClick={handleGenerateStory} disabled={generatingStory} className="btn-primary">
                    {generatingStory ? '⏳ Đang viết hồi ký...' : '✨ Viết Hồi Ký (AI)'}
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '24px', color: 'var(--primary-brown)' }}>Hồi Ký Cuộc Đời</h3>
                    <button onClick={handleGenerateStory} disabled={generatingStory} className="btn-primary" style={{ fontSize: '12px', padding: '8px 16px' }}>
                      {generatingStory ? '⏳ Đang viết lại...' : '✨ Viết lại'}
                    </button>
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-primary)', lineHeight: '1.8', fontSize: '16px' }}>
                    {story}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'chat' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '500px', background: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid rgba(168, 139, 119, 0.15)', boxShadow: 'var(--shadow-soft)', overflow: 'hidden' }}>
              <div style={{ padding: '16px', borderBottom: '1px solid rgba(168, 139, 119, 0.15)', background: 'var(--bg-dark)' }}>
                <h3 style={{ fontSize: '18px', color: 'var(--primary-brown)' }}>💬 Trò chuyện với Ký ức</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Bạn có thể hỏi bất cứ thông tin gì về Hành trình này.</p>
              </div>
              
              <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {chatMessages.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '40px' }}>
                    <p style={{ fontSize: '32px', marginBottom: '8px' }}>👋</p>
                    <p>Hãy hỏi tôi một câu hỏi, ví dụ: "Bức ảnh cũ nhất được chụp ở đâu?"</p>
                  </div>
                )}
                {chatMessages.map((msg, idx) => (
                  <div key={idx} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%', background: msg.role === 'user' ? 'var(--primary-brown)' : '#F5F3F0', color: msg.role === 'user' ? '#FFFFFF' : 'var(--text-primary)', padding: '12px 16px', borderRadius: '16px', borderBottomRightRadius: msg.role === 'user' ? 0 : '16px', borderBottomLeftRadius: msg.role === 'user' ? '16px' : 0 }}>
                    {msg.content}
                  </div>
                ))}
                {isChatting && (
                  <div style={{ alignSelf: 'flex-start', background: '#F5F3F0', padding: '12px 16px', borderRadius: '16px', borderBottomLeftRadius: 0, color: 'var(--text-secondary)' }}>
                    ⏳ AI đang suy nghĩ...
                  </div>
                )}
              </div>

              <form onSubmit={handleChatSubmit} style={{ display: 'flex', padding: '16px', borderTop: '1px solid rgba(168, 139, 119, 0.15)', background: '#FFFFFF', gap: '12px' }}>
                <input 
                  type="text" 
                  value={chatInput} 
                  onChange={e => setChatInput(e.target.value)} 
                  placeholder="Nhập câu hỏi của bạn..." 
                  className="form-input" 
                  style={{ marginBottom: 0, flex: 1 }} 
                  disabled={isChatting}
                />
                <button type="submit" disabled={isChatting} className="btn-primary" style={{ marginBottom: 0 }}>Gửi</button>
              </form>
            </div>
          )}

        </div>
      </main>

      {/* Lightbox / Edit Memory Modal */}
      {selectedMemory && (
        <div className="modal-overlay" style={{ padding: '40px', boxSizing: 'border-box' }}>
          <div style={{ width: '100%', maxWidth: '1000px', height: '100%', display: 'flex', gap: '24px', position: 'relative' }}>
            
            {/* Vùng hiển thị Ảnh/Video to */}
            <div style={{ flex: 1, background: '#000', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
              {selectedMemory.fileType === 'video' ? (
                <video src={`http://localhost:5000${selectedMemory.fileUrl}`} style={{ maxHeight: '100%', maxWidth: '100%' }} controls autoPlay />
              ) : selectedMemory.fileType === 'audio' ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                  <div style={{ width: '200px', height: '200px', borderRadius: '50%', background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'spin 10s linear infinite' }}>
                    <span style={{ fontSize: '80px' }}>🎵</span>
                  </div>
                  <audio src={`http://localhost:5000${selectedMemory.fileUrl}`} controls autoPlay />
                  
                  {/* Nút STT */}
                  <button 
                    onClick={runSTT}
                    disabled={isSttRunning}
                    style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '10px 20px', borderRadius: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', backdropFilter: 'blur(10px)', fontSize: '14px', fontWeight: 'bold' }}
                  >
                    {isSttRunning ? `⏳ Đang bóc băng ghi âm...` : '✨ Trích xuất văn bản (Gemini AI)'}
                  </button>
                </div>
              ) : (
                <>
                  <img src={`http://localhost:5000${selectedMemory.fileUrl}`} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                  {/* Nút AI OCR chỉ ưu tiên cho thư tay hoặc ảnh */}
                  {(selectedMemory.fileType === 'letter' || selectedMemory.fileType === 'image') && (
                    <button 
                      onClick={runOCR}
                      disabled={isOcrRunning}
                      style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '10px 20px', borderRadius: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', backdropFilter: 'blur(10px)', fontSize: '14px', fontWeight: 'bold' }}
                    >
                      {isOcrRunning ? `⏳ Đang dùng Gemini quét ảnh...` : (selectedMemory.fileType === 'letter' ? '✨ Đọc thư tay (Gemini AI)' : '✨ Quét chữ (Gemini AI)')}
                    </button>
                  )}
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
                    style={{ background: isListening ? 'rgba(239, 68, 68, 0.2)' : 'rgba(155, 119, 92, 0.1)', color: isListening ? '#f87171' : 'var(--primary-brown)', border: 'none', padding: '6px 12px', borderRadius: '12px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.3s' }}
                  >
                    {isListening ? '🔴 Đang nghe...' : '🎙️ Nói để gõ'}
                  </button>
                </div>
                <textarea 
                  value={memoryTitle}
                  onChange={e => setMemoryTitle(e.target.value)}
                  className="form-input"
                  style={{ minHeight: '120px', resize: 'vertical', border: isListening ? '1px solid #f87171' : '1px solid rgba(155, 119, 92, 0.3)' }}
                  placeholder="Thêm câu chuyện hoặc mô tả..."
                />
                
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Thời gian</label>
                    <input 
                      type="date"
                      className="form-input"
                      style={{ padding: '10px' }}
                      value={selectedMemory.memoryDate ? selectedMemory.memoryDate.split('T')[0] : ''}
                      onChange={(e) => setSelectedMemory({...selectedMemory, memoryDate: e.target.value})}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Địa điểm</label>
                    <input 
                      type="text"
                      className="form-input"
                      style={{ padding: '10px' }}
                      placeholder="VD: Hà Nội"
                      value={selectedMemory.location || ''}
                      onChange={(e) => setSelectedMemory({...selectedMemory, location: e.target.value})}
                    />
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button type="submit" disabled={updatingMemory} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                    {updatingMemory ? '⏳' : 'Lưu lại'}
                  </button>
                  <button type="button" onClick={handleDeleteMemory} className="btn-primary" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
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
