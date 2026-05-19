import { useRef, useEffect, useState, useCallback } from "react";

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&q=80";

const formatTime = (secs) => {
  if (isNaN(secs) || secs < 0) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const SongCard = ({ song, isActive, onPlay, onPause }) => {
  const audioRef = useRef(null);
  const progressRef = useRef(null);

  const [playing, setPlaying]       = useState(false);
  const [current, setCurrent]       = useState(0);
  const [duration, setDuration]     = useState(0);
  const [volume, setVolume]         = useState(0.8);
  const [muted, setMuted]           = useState(false);
  const [dragging, setDragging]     = useState(false);

  /* ── pause when another card goes active ── */
  useEffect(() => {
    if (!isActive && audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    }
  }, [isActive]);

  /* ── sync audio volume ── */
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume;
    }
  }, [volume, muted]);

  const handleTimeUpdate = useCallback(() => {
    if (!dragging && audioRef.current) {
      setCurrent(audioRef.current.currentTime);
    }
  }, [dragging]);

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const handleEnded = () => {
    setPlaying(false);
    setCurrent(0);
    onPause();
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const handleAudioPlay = () => {
    setPlaying(true);
    onPlay();
  };

  const handleAudioPause = () => {
    setPlaying(false);
    onPause();
  };

  /* ── progress bar scrubbing ── */
  const scrubTo = (e) => {
    if (!progressRef.current || !audioRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = ratio * duration;
    audioRef.current.currentTime = newTime;
    setCurrent(newTime);
  };

  const handleProgressMouseDown = (e) => {
    setDragging(true);
    scrubTo(e);
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => scrubTo(e);
    const onUp   = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging, duration]);

  const progress = duration > 0 ? (current / duration) * 100 : 0;
  const volPct   = muted ? 0 : volume * 100;

  const VolumeIcon = () => {
    if (muted || volume === 0) return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/>
      </svg>
    );
    if (volume < 0.5) return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
      </svg>
    );
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
      </svg>
    );
  };

  return (
    <div className={`song-card${isActive ? " song-card--active" : ""}`}>
      {/* Cover Art */}
      <div className="song-card-art">
        <img
          src={song.coverUrl || DEFAULT_COVER}
          alt={`${song.title} cover`}
          loading="lazy"
        />
        {/* Play overlay button on art */}
        <button
          className={`song-card-art-btn${playing ? " song-card-art-btn--playing" : ""}`}
          onClick={togglePlay}
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? (
            /* pause icon */
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1"/>
              <rect x="14" y="4" width="4" height="16" rx="1"/>
            </svg>
          ) : (
            /* play icon */
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,3 19,12 5,21"/>
            </svg>
          )}
        </button>

        {/* Animated bars when playing */}
        {playing && (
          <div className="song-card-bars" aria-hidden="true">
            <span /><span /><span /><span />
          </div>
        )}
      </div>

      {/* Info + Controls */}
      <div className="song-card-body">
        <div className="song-card-meta">
          <div className="song-card-title" title={song.title}>{song.title}</div>
          <div className="song-card-artist" title={song.artist}>{song.artist}</div>
        </div>

        {/* Progress Bar */}
        <div className="song-card-progress-area">
          <span className="song-card-time">{formatTime(current)}</span>
          <div
            className="song-card-progress-track"
            ref={progressRef}
            onMouseDown={handleProgressMouseDown}
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

        {/* Bottom controls row — only when active */}
        {isActive && (
          <div className="song-card-controls">
            {/* Play / Pause */}
            <button
              className="song-card-play-btn"
              onClick={togglePlay}
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1"/>
                  <rect x="14" y="4" width="4" height="16" rx="1"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5,3 19,12 5,21"/>
                </svg>
              )}
            </button>

            {/* Volume */}
            <div className="song-card-volume">
              <button
                className="song-card-vol-icon"
                onClick={() => setMuted((m) => !m)}
                aria-label={muted ? "Unmute" : "Mute"}
              >
                <VolumeIcon />
              </button>
              <div className="song-card-vol-track">
                <div
                  className="song-card-vol-fill"
                  style={{ width: `${volPct}%` }}
                />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={muted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(parseFloat(e.target.value));
                    setMuted(false);
                  }}
                  aria-label="Volume"
                  className="song-card-vol-input"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={handleAudioPlay}
        onPause={handleAudioPause}
        onEnded={handleEnded}
      >
        <source src={song.audioUrl} type="audio/mpeg" />
      </audio>
    </div>
  );
};

export default SongCard;