import { useRef, useEffect, useState, useCallback } from "react";
import { usePlayer } from "../context/PlayerContext";

const DEFAULT_COVER = "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&q=80";

const formatTime = (secs) => {
  if (isNaN(secs) || secs < 0) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const SongCard = ({ song, isActive, onPlay, onPause, onEnded, onAddToPlaylist, onRemoveFromPlaylist }) => {
  const audioRef    = useRef(null);
  const progressRef = useRef(null);
  const menuRef     = useRef(null);

  const [playing,  setPlaying]  = useState(false);
  const [current,  setCurrent]  = useState(0);
  const [duration, setDuration] = useState(0);
  const { volume, setVolume, muted, setMuted } = usePlayer();
  const [dragging, setDragging] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
  if (isActive) {
    audioRef.current?.play().catch(() => {});
  } else {
    audioRef.current?.pause();
  }
}, [isActive]);

  useEffect(() => {
    if (!isActive && audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    }
  }, [isActive]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = muted ? 0 : volume;
  }, [volume, muted]);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const handleTimeUpdate = useCallback(() => {
    if (!dragging && audioRef.current) setCurrent(audioRef.current.currentTime);
  }, [dragging]);

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const handleEnded = () => { setPlaying(false); setCurrent(0); onEnded?.(); };

  const togglePlay = () => {
    if (!audioRef.current) return;
    playing ? audioRef.current.pause() : audioRef.current.play();
  };

  const scrubTo = (e) => {
    if (!progressRef.current || !audioRef.current) return;
    const rect  = progressRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const t     = ratio * duration;
    audioRef.current.currentTime = t;
    setCurrent(t);
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => scrubTo(e);
    const onUp   = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onUp);
    };
  }, [dragging, duration]);

  const progress = duration > 0 ? (current / duration) * 100 : 0;
  const volPct   = muted ? 0 : volume * 100;

  const VolumeIcon = () => {
    if (muted || volume === 0) return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="1" y1="1" x2="23" y2="23"/>
        <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
        <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/>
      </svg>
    );
    if (volume < 0.5) return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
      </svg>
    );
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
      </svg>
    );
  };

  return (
    <div className={`song-card${isActive ? " song-card--active" : ""}`}
      onClick={togglePlay}
      style={{ cursor: "pointer" }}
    >

      {/* ── Left: thumbnail + play btn ── */}
      <div className="song-card-thumb">
        <img src={song.coverUrl || DEFAULT_COVER} alt={song.title} loading="lazy" />
        <button
          className={`song-card-thumb-btn${playing ? " song-card-thumb-btn--playing" : ""}`}
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing
            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
            : <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
          }
        </button>
        {playing && (
          <div className="song-card-bars" aria-hidden="true">
            <span /><span /><span /><span />
          </div>
        )}
      </div>

      {/* ── Centre: title + artist + progress ── */}
      <div className="song-card-body">
        <div className="song-card-meta">
          <span className="song-card-title" title={song.title}>{song.title}</span>
          <span className="song-card-artist" title={song.artist}>{song.artist}</span>
        </div>

        {/* Progress bar — expands when active */}
        <div className={`song-card-progress-area${isActive ? " song-card-progress-area--visible" : ""}`}>
          <span className="song-card-time">{formatTime(current)}</span>
          <div
            className="song-card-progress-track"
            ref={progressRef}
            onMouseDown={(e) => { setDragging(true); scrubTo(e); }}
            role="slider"
            aria-label="Seek"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="song-card-progress-fill" style={{ width: `${progress}%` }}>
              <div className="song-card-progress-thumb" />
            </div>
          </div>
          <span className="song-card-time">{formatTime(duration)}</span>
        </div>
      </div>

      {/* ── Right: volume (active only) + duration + menu ── */}
      <div className="song-card-right">

        {/* Volume — only when active */}
        {isActive && (
          <div className="song-card-volume">
            <button className="song-card-vol-icon" onClick={() => setMuted(m => !m)} aria-label={muted ? "Unmute" : "Mute"}>
              <VolumeIcon />
            </button>
            <div className="song-card-vol-track">
              <div className="song-card-vol-fill" style={{ width: `${volPct}%` }} />
              <input
                type="range" min="0" max="1" step="0.01"
                value={muted ? 0 : volume}
                onChange={(e) => { setVolume(parseFloat(e.target.value)); setMuted(false); }}
                aria-label="Volume"
                className="song-card-vol-input"
              />
            </div>
          </div>
        )}

        <span className="song-card-duration">{formatTime(duration)}</span>

        {/* Three-dot menu */}
        <div className="song-card-menu-wrap" ref={menuRef}>
          <button
            className="song-card-menu-btn"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="More options"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5"  r="1.5"/>
              <circle cx="12" cy="12" r="1.5"/>
              <circle cx="12" cy="19" r="1.5"/>
            </svg>
          </button>

          {menuOpen && (
            <div className="song-card-menu">
              {onAddToPlaylist && (
                <button
                  className="song-card-menu-item"
                  onClick={() => { setMenuOpen(false); onAddToPlaylist(song); }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 17H3M11 12H3M11 7H3"/>
                    <line x1="17" y1="4" x2="17" y2="10"/>
                    <line x1="14" y1="7" x2="20" y2="7"/>
                  </svg>
                  Add to playlist
                </button>
              )}
              {onRemoveFromPlaylist && (
                <button
                  className="song-card-menu-item song-card-menu-item--danger"
                  onClick={() => { setMenuOpen(false); onRemoveFromPlaylist(song); }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6m4-6v6"/>
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                  Remove from playlist
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <audio
        ref={audioRef}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => { setPlaying(true); onPlay(); }}
        onPause={() => { setPlaying(false); onPause(); }}
        onEnded={handleEnded}
      >
        <source src={song.audioUrl} type="audio/mpeg" />
      </audio>
    </div>
  );
};

export default SongCard;