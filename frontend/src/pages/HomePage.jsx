import { useEffect, useState } from "react";

import api from "../api/axios";
import Navbar from "../components/Navbar";
import SongCard from "../components/SongCard";
import UploadModal from "../components/UploadModal";

const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton-art" />
    <div className="skeleton-body">
      <div className="skeleton-line" style={{ width: "70%" }} />
      <div className="skeleton-line short" />
    </div>
  </div>
);

const HomePage = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSongId, setActiveSongId] = useState(null);
  const [showUpload, setShowUpload] = useState(false);

  const fetchSongs = async () => {
    try {
      const res = await api.get("/songs");
      setSongs(res.data);
    } catch (error) {
      console.error("Failed to fetch songs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  return (
    <div className="home-page">
      <Navbar onUploadClick={() => setShowUpload(true)} />

      <div className="home-header">
        <div className="home-header-eyebrow">Your Library</div>
        <h1>
          {loading
            ? "Loading songs…"
            : songs.length > 0
            ? `${songs.length} track${songs.length !== 1 ? "s" : ""} available`
            : "No songs yet"}
        </h1>
        {!loading && songs.length > 0 && (
          <p>Stream your collection below.</p>
        )}
      </div>

      <div className="song-grid">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : songs.length === 0 ? (
          <div className="songs-empty">
            <svg width="48" height="48" fill="none" stroke="currentColor"
              strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <p>No songs have been added yet.</p>
          </div>
        ) : (
          songs.map((song, index) => {
            const id = song._id || index;
            return (
              <SongCard
                key={id}
                song={song}
                isActive={activeSongId === id}
                onPlay={() => setActiveSongId(id)}
                onPause={() => setActiveSongId(null)}
              />
            );
          })
        )}
      </div>

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onUploaded={fetchSongs}
        />
      )}
    </div>
  );
};

export default HomePage;