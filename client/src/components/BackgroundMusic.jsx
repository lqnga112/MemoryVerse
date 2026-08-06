import React, { useState, useEffect, useRef } from 'react';

// Danh sách 10 Tình Khúc Bất Hủ (Piano & Acoustic Instrumental nhẹ nhàng, êm dịu, thư giãn)
const PLAYLIST = [
  { id: 1, title: 'Biển Tình', artist: 'Dương Cầm Êm Dịu', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 2, title: 'Dấu Tình Sương Gió', artist: 'Tình Khúc Dương Cầm', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 3, title: 'Bản Tình Ca Mùa Thu', artist: 'Piano Hòa Tấu Nhẹ Nhàng', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
  { id: 4, title: 'Tháng Năm Rực Rỡ', artist: 'Acoustic Piano Ballad', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
  { id: 5, title: 'Như Cánh Vạc Bay', artist: 'Giai Điệu Trầm Ấm', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
  { id: 6, title: 'Tình Nhớ', artist: 'Dương Cầm Bình Yên', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' },
  { id: 7, title: 'Mưa Trên Phố Huế', artist: 'Hòa Tấu Hoài Niệm', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3' },
  { id: 8, title: 'Tuổi Mộng Mơ', artist: 'Romantic Piano Melody', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' },
  { id: 9, title: 'Biển Nhớ', artist: 'Tiếng Dương Cầm Thư Giãn', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3' },
  { id: 10, title: 'Gửi Người Em Gái', artist: 'Tình Khúc Bất Hủ', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3' }
];

const BackgroundMusic = () => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.35);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const audioRef = useRef(null);
  const currentTrack = PLAYLIST[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Tự động kích hoạt khi người dùng click chuột lần đầu
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (audioRef.current && !isPlaying) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
          setLoadError(false);
        }).catch(err => {
          console.log("Autoplay blocked:", err);
        });
      }
      window.removeEventListener('click', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    return () => {
      window.removeEventListener('click', handleFirstInteraction);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        setLoadError(false);
      }).catch(err => {
        console.error("Playback error:", err);
      });
    }
  };

  const handleNext = () => {
    const nextIdx = (currentTrackIndex + 1) % PLAYLIST.length;
    setCurrentTrackIndex(nextIdx);
    setIsPlaying(true);
    setLoadError(false);
    setTimeout(() => {
      if (audioRef.current) audioRef.current.play();
    }, 100);
  };

  const handlePrev = () => {
    const prevIdx = (currentTrackIndex - 1 + PLAYLIST.length) % PLAYLIST.length;
    setCurrentTrackIndex(prevIdx);
    setIsPlaying(true);
    setLoadError(false);
    setTimeout(() => {
      if (audioRef.current) audioRef.current.play();
    }, 100);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e) => {
    const seekTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleAudioError = () => {
    console.warn(`Lỗi tải bài nhạc #${currentTrackIndex + 1}, đang chuyển bài tiếp theo...`);
    setLoadError(true);
    setTimeout(() => {
      handleNext();
    }, 1000);
  };

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return "00:00";
    const mins = Math.floor(timeInSeconds / 60);
    const secs = Math.floor(timeInSeconds % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      fontFamily: 'var(--font-sans)',
      transition: 'all 0.3s ease'
    }}>
      <audio 
        ref={audioRef} 
        src={currentTrack.src} 
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={handleNext}
        onError={handleAudioError}
        loop={false}
      />

      {/* Bar thu gọn */}
      {!isExpanded ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(250, 246, 238, 0.95)',
          border: '2px double var(--light-brown)',
          borderRadius: '30px',
          padding: '8px 16px',
          boxShadow: '0 8px 24px rgba(78, 52, 46, 0.15)',
          backdropFilter: 'blur(8px)',
        }}>
          {/* Đĩa hát quay */}
          <div 
            onClick={() => setIsExpanded(true)}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--primary-brown)',
              color: '#FFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '18px',
              animation: isPlaying ? 'spin 4s linear infinite' : 'none',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
            }}
            title="Nhấp để mở Radio Tình Khúc Bất Hủ đầy đủ"
          >
            📻
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }} onClick={() => setIsExpanded(true)}>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--primary-brown)' }}>
              {loadError ? '⏳ Đang chuyển bài...' : currentTrack.title}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              {isPlaying ? `${formatTime(currentTime)} / ${formatTime(duration)}` : 'Đang dừng • Nhấp để mở rộng'}
            </span>
          </div>

          <button 
            type="button"
            onClick={togglePlay}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--primary-brown)' }}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>

          <button 
            type="button"
            onClick={handleNext}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', color: 'var(--primary-brown)' }}
            title="Bài tiếp theo"
          >
            ⏭️
          </button>

          <button 
            type="button"
            onClick={() => setIsExpanded(true)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '12px', color: 'var(--light-brown)' }}
            title="Mở rộng danh sách"
          >
            ⚙️
          </button>
        </div>
      ) : (
        /* Trình phát Radio Kỷ Ức Mở Rộng */
        <div style={{
          width: '340px',
          background: '#FAF6EE',
          border: '3px double var(--light-brown)',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 12px 36px rgba(78, 52, 46, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          position: 'relative'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed var(--light-brown)', paddingBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>📻</span>
              <span style={{ fontWeight: 'bold', color: 'var(--primary-brown)', fontSize: '14px' }}>Radio Tình Khúc Bất Hủ</span>
            </div>
            <button 
              onClick={() => setIsExpanded(false)} 
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--text-secondary)' }}
            >
              ✖
            </button>
          </div>

          {/* Chi tiết bài đang phát */}
          <div style={{ textAlign: 'center', margin: '4px 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--primary-brown)',
              color: '#FFF',
              margin: '0 auto 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              animation: isPlaying ? 'spin 4s linear infinite' : 'none',
              boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
            }}>
              🎼
            </div>
            <h4 style={{ fontSize: '15px', color: 'var(--primary-brown)', fontWeight: 'bold' }}>
              {loadError ? '⏳ Đang kết nối bài nhạc...' : currentTrack.title}
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>{currentTrack.artist}</p>
          </div>

          {/* Thanh tua thời gian Seekbar */}
          <div>
            <input 
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              style={{
                width: '100%',
                accentColor: 'var(--primary-brown)',
                cursor: 'pointer'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Điều khiển Playback */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', margin: '4px 0' }}>
            <button onClick={handlePrev} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '20px' }}>⏮️</button>
            <button onClick={togglePlay} style={{ background: 'var(--primary-brown)', color: '#FFF', border: 'none', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '18px', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}>
              {isPlaying ? '⏸️' : '▶️'}
            </button>
            <button onClick={handleNext} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '20px' }}>⏭️</button>
          </div>

          {/* Danh sách 10 bản nhạc */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Danh sách Tình Khúc Bất Hủ (Piano êm dịu):</label>
            <select
              value={currentTrackIndex}
              onChange={(e) => {
                const idx = parseInt(e.target.value);
                setCurrentTrackIndex(idx);
                setIsPlaying(true);
                setLoadError(false);
                setTimeout(() => { if (audioRef.current) audioRef.current.play(); }, 100);
              }}
              style={{
                width: '100%',
                padding: '6px 10px',
                fontSize: '12px',
                border: '1px solid rgba(168, 139, 119, 0.4)',
                borderRadius: '6px',
                background: '#FFF',
                color: 'var(--text-primary)',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {PLAYLIST.map((track, idx) => (
                <option key={track.id} value={idx}>
                  {idx + 1}. {track.title} - {track.artist}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default BackgroundMusic;
