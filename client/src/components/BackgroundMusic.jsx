import React, { useState, useEffect, useRef } from 'react';

const PLAYLIST = [
  { id: 1, title: 'Bản Luân Vũ Ký Ức', artist: 'Hà Nội Mùa Thu 1980', src: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3' },
  { id: 2, title: 'Sợi Nắng Thời Bao Cấp', artist: 'Phố Cổ Chiều Mưa', src: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3' },
  { id: 3, title: 'Bức Thư Tay Năm 1985', artist: 'Dương Cầm Lặng Lẽ', src: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3' },
  { id: 4, title: 'Kỷ Vật Thời Gian', artist: 'Hoàng Hôn Xưa', src: 'https://cdn.pixabay.com/download/audio/2022/02/07/audio_4047dfb242.mp3' },
  { id: 5, title: 'Dòng Thời Gian Lặng Lẽ', artist: 'Nhớ Về Nguồn Cội', src: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f7ee08.mp3' },
  { id: 6, title: 'Tiếng Dương Cầm Mùa Thu', artist: 'Góc Sân Trường Cũ', src: 'https://cdn.pixabay.com/download/audio/2022/11/06/audio_c764e5d878.mp3' },
  { id: 7, title: 'Ký Ức Tuổi Thơ', artist: 'Tiếng Sáo Trăng Rằm', src: 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_db658097b6.mp3' },
  { id: 8, title: 'Khoảnh Khắc Bình Yên', artist: 'Trà Chiều Gia Đình', src: 'https://cdn.pixabay.com/download/audio/2021/11/24/audio_3313936081.mp3' },
  { id: 9, title: 'Hoàng Hôn Trên Mái Phố', artist: 'Mùa Hoa Mới', src: 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_03d9d3000b.mp3' },
  { id: 10, title: 'Lẻ Loi Tiếng Vĩ Cầm', artist: 'Tháng Năm Rực Rỡ', src: 'https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe92c21.mp3' }
];

const BackgroundMusic = () => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const audioRef = useRef(null);
  const currentTrack = PLAYLIST[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Autoplay attempt on user interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (audioRef.current && !isPlaying) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
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
      }).catch(err => {
        console.error("Playback error:", err);
      });
    }
  };

  const handleNext = () => {
    const nextIdx = (currentTrackIndex + 1) % PLAYLIST.length;
    setCurrentTrackIndex(nextIdx);
    setIsPlaying(true);
    setTimeout(() => {
      if (audioRef.current) audioRef.current.play();
    }, 100);
  };

  const handlePrev = () => {
    const prevIdx = (currentTrackIndex - 1 + PLAYLIST.length) % PLAYLIST.length;
    setCurrentTrackIndex(prevIdx);
    setIsPlaying(true);
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
        loop={false}
      />

      {/* Mini Player Bar when collapsed */}
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
          {/* Rotating Vinyl Icon */}
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
            title="Nhấp để mở Radio Kỷ Ức đầy đủ"
          >
            📻
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }} onClick={() => setIsExpanded(true)}>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--primary-brown)' }}>
              {currentTrack.title}
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
        /* Expanded Vintage Radio Player Card */
        <div style={{
          width: '320px',
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
              <span style={{ fontWeight: 'bold', color: 'var(--primary-brown)', fontSize: '14px' }}>Radio Kỷ Ức</span>
            </div>
            <button 
              onClick={() => setIsExpanded(false)} 
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--text-secondary)' }}
            >
              ✖
            </button>
          </div>

          {/* Current Playing Track Info */}
          <div style={{ textAlign: 'center', margin: '4px 0' }}>
            <div style={{
              width: '60px',
              height: '60px',
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
              🎵
            </div>
            <h4 style={{ fontSize: '15px', color: 'var(--primary-brown)', fontWeight: 'bold' }}>{currentTrack.title}</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>{currentTrack.artist}</p>
          </div>

          {/* Progress Seekbar */}
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

          {/* Player Controls */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', margin: '4px 0' }}>
            <button onClick={handlePrev} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '20px' }}>⏮️</button>
            <button onClick={togglePlay} style={{ background: 'var(--primary-brown)', color: '#FFF', border: 'none', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '18px', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}>
              {isPlaying ? '⏸️' : '▶️'}
            </button>
            <button onClick={handleNext} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '20px' }}>⏭️</button>
          </div>

          {/* Playlist Dropdown */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Danh sách 10 bản nhạc hoài cổ:</label>
            <select
              value={currentTrackIndex}
              onChange={(e) => {
                const idx = parseInt(e.target.value);
                setCurrentTrackIndex(idx);
                setIsPlaying(true);
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
                  {idx + 1}. {track.title} ({track.artist})
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
