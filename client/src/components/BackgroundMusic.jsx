import React, { useState, useEffect, useRef } from 'react';

// Danh sách 10 Tuyệt Phẩm Dương Cầm (Piano êm dịu, không lời, mượt mà, thư thái tuyệt đối, zero disco)
const PLAYLIST = [
  { id: 1, title: 'Gymnopédie No. 1', artist: 'Erik Satie (Piano Êm Dịu)', src: 'https://upload.wikimedia.org/wikipedia/commons/3/34/Erik_Satie_-_gymnopedie_no_1.ogg' },
  { id: 2, title: 'Clair de Lune', artist: 'Claude Debussy (Ánh Trăng Dương Cầm)', src: 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Clair_de_lune_%2528Claude_Debussy%2529_Suite_bergamasque.ogg' },
  { id: 3, title: 'Nocturne Op. 9 No. 2', artist: 'Frédéric Chopin (Dạ Khúc Bất Hủ)', src: 'https://upload.wikimedia.org/wikipedia/commons/7/73/Chopin_Nocturne_Op_9_No_2.ogg' },
  { id: 4, title: 'Moonlight Sonata', artist: 'L.V. Beethoven (Soạn Khúc Ánh Trăng)', src: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Beethoven_Moonlight_sonata_folder.ogg' },
  { id: 5, title: 'Air on the G String', artist: 'J.S. Bach (Hòa Tấu Trầm Ấm)', src: 'https://upload.wikimedia.org/wikipedia/commons/3/30/Bach_Air_on_G_String.ogg' },
  { id: 6, title: 'Prelude in C Major', artist: 'J.S. Bach (Dương Cầm Mượt Mà)', src: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Bach_BWV_846_prelude.ogg' },
  { id: 7, title: 'Prelude in E Minor', artist: 'Frédéric Chopin (Tình Khúc Sâu Lắng)', src: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Chopin_Prelude_in_E_Minor_Op_28_No_4.ogg' },
  { id: 8, title: 'Für Elise', artist: 'L.V. Beethoven (Dương Cầm Thư Giãn)', src: 'https://upload.wikimedia.org/wikipedia/commons/1/14/Fur_Elise.ogg' },
  { id: 9, title: 'Canon in D (Piano)', artist: 'Johann Pachelbel (Giai Điệu Hạnh Phúc)', src: 'https://upload.wikimedia.org/wikipedia/commons/2/2b/Pachelbel_Canon_in_D_Major.ogg' },
  { id: 10, title: 'Relaxing Vintage Piano', artist: 'Hoài Niệm Chiều Thu', src: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3' }
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
            title="Nhấp để mở Radio Dương Cầm Êm Dịu đầy đủ"
          >
            📻
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }} onClick={() => setIsExpanded(true)}>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--primary-brown)' }}>
              {loadError ? '⏳ Đang kết nối...' : currentTrack.title}
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
              <span style={{ fontWeight: 'bold', color: 'var(--primary-brown)', fontSize: '14px' }}>Radio Dương Cầm Êm Dịu</span>
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
            <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Danh sách Tuyệt Phẩm Dương Cầm (Không lời êm dịu):</label>
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
