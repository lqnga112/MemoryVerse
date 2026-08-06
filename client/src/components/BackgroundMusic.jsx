import React, { useState, useEffect, useRef } from 'react';

const BackgroundMusic = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.35);
  const audioRef = useRef(null);

  // Nhạc piano hoài cổ không lời không bản quyền (Royalty Free Chill Vintage Piano)
  const musicSrc = "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=relaxing-piano-113485.mp3";

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Tự động phát khi người dùng nhấp vào trang lần đầu tiên (theo chính sách duyệt web)
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (audioRef.current && !isPlaying) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(err => {
          console.log("Autoplay prevented:", err);
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
      }).catch(err => {
        console.error("Playback error:", err);
      });
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      background: 'rgba(250, 246, 238, 0.95)',
      border: '2px double var(--light-brown)',
      borderRadius: '30px',
      padding: '8px 16px',
      boxShadow: '0 8px 24px rgba(78, 52, 46, 0.15)',
      backdropFilter: 'blur(8px)',
      fontFamily: 'var(--font-sans)',
      transition: 'all 0.3s ease'
    }}>
      <audio 
        ref={audioRef} 
        src={musicSrc} 
        loop 
        preload="auto" 
      />
      
      {/* Biểu tượng đĩa hát quay */}
      <div 
        onClick={togglePlay}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'var(--primary-brown)',
          color: '#FFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: '16px',
          animation: isPlaying ? 'spin 4s linear infinite' : 'none',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
        }}
        title={isPlaying ? "Bấm để tạm dừng nhạc" : "Bấm để phát nhạc hoài cổ chill"}
      >
        📻
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--primary-brown)' }}>
          {isPlaying ? '🎵 Nhạc Hoài Cổ Chill' : '🔇 Nhạc Nền Tạm Dừng'}
        </span>
        <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
          {isPlaying ? 'Piano không lời êm dịu...' : 'Nhấp 📻 hoặc ▶️ để bật'}
        </span>
      </div>

      {/* Nút Bật/Tắt */}
      <button 
        type="button"
        onClick={togglePlay}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: '14px',
          color: 'var(--primary-brown)',
          marginLeft: '4px'
        }}
        title={isPlaying ? "Tạm dừng" : "Phát nhạc"}
      >
        {isPlaying ? '⏸️' : '▶️'}
      </button>

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
