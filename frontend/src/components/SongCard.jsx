import { useRef, useState } from "react";

const SongCard = ({ song }) => {

  const audioRef = useRef(null);

  const [volume, setVolume] = useState(1);

  const handleVolumeChange = (e) => {

    const newVolume = e.target.value;

    setVolume(newVolume);

    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  return (

    <div
      style={{
        border: "1px solid #ddd",
        padding: "16px",
        borderRadius: "10px",
        background: "white"
      }}
    >

      <h3>{song.title}</h3>

      <p>{song.artist}</p>

      <audio
        ref={audioRef}
        controls
        style={{ width: "100%" }}
      >
        <source
          src={song.audioUrl}
          type="audio/mpeg"
        />
      </audio>

      <div
        style={{
          marginTop: "10px",
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}
      >

        <span>🔊</span>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
        />

      </div>

    </div>
  );
};

export default SongCard;