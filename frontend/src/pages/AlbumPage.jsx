import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Navbar            from "../components/Navbar";
import SongCard          from "../components/SongCard";
import UploadModal       from "../components/UploadModal";
import AddToPlaylistModal from "../components/AddToPlaylistModal";
import { useSongQueue } from "../hooks/useSongQueue";

const DEFAULT_COVER = "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&q=80";

const AlbumPage = () => {
  const { albumId }  = useParams();
  const navigate     = useNavigate();
  const { isAdmin }  = useAuth();
  const { activeSong, playQueue, playNext, clearQueue } = useSongQueue();

  const [album,      setAlbum]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [activeSongId, setActiveSongId] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [addToPlaylistSong, setAddToPlaylistSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // For admin: attach a loose song to this album
  const [allSongs,   setAllSongs]   = useState([]);
  const [showAttach, setShowAttach] = useState(false);
  const [attaching,  setAttaching]  = useState(false);

  const handlePlayAll = () => {
  if (!album?.songs?.length) return;
    playQueue(album.songs, 0);
    setIsPlaying(true);
  };

  const handleStopAll = () => {
    clearQueue();
    setIsPlaying(false);
  };

  const fetchAlbum = async () => {
    try {
      const res = await api.get("/songs/albums");
      const found = res.data.find((a) => a._id === albumId);
      setAlbum(found || null);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchAllSongs = async () => {
    try {
      const res = await api.get("/songs");
      setAllSongs(res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchAlbum();
    if (isAdmin) fetchAllSongs();
  }, [albumId]);

  const handleAttachSong = async (songId) => {
    setAttaching(true);
    try {
      await api.put(`/playlists/${albumId}/add-songs`, { songs: [songId] });
      await fetchAlbum();
      setShowAttach(false);
    } catch (e) {
      alert(e.response?.data?.message || "Failed to add song.");
    } finally { setAttaching(false); }
  };

  const handleUploadAndAddSong = async (uploadedSong) => {
    try {
      await api.put(`/playlists/${albumId}/add-songs`,{songs: [uploadedSong._id]});
      await fetchAllSongs();
      await fetchAlbum();
    } catch (e) {

      console.error(e);

      alert(
        e.response?.data?.message ||
        "Failed to add uploaded song to album."
      );
    }
  };

  const albumSongIds = new Set((album?.songs || []).map((s) => s._id));
  const unattachedSongs = allSongs.filter((s) => !albumSongIds.has(s._id));

  if (loading) return (
    <div className="home-page">
      <Navbar />
      <div className="album-page-hero skeleton-hero" />
    </div>
  );

  if (!album) return (
    <div className="home-page">
      <Navbar />
      <div style={{ padding: "64px 32px", textAlign: "center", color: "var(--text-muted)" }}>
        Album not found. <button className="btn-ghost" onClick={() => navigate("/")}>Go back</button>
      </div>
    </div>
  );

  const songs = album.songs ?? [];

  return (
    <div className="home-page">
      <Navbar
        onUploadClick={() => setShowUpload(true)}
        onCreateAlbumClick={() => {}}
      />

      {/* Hero */}
      <div className="album-page-hero">
        <img src={album.coverUrl || DEFAULT_COVER} alt={album.title} className="album-page-hero-img" />
        <div className="album-page-hero-overlay">
          <button className="album-page-back" onClick={() => navigate(-1)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Back
          </button>
          <div className="album-page-hero-info">
            <span className="album-page-type">Album</span>
            <h1 className="album-page-title">{album.title}</h1>
            {album.description && <p className="album-page-desc">{album.description}</p>}
            <p className="album-page-count">{album.songs?.length ?? 0} tracks</p>
            {songs.length > 0 && (
              <button
                className={`btn-play-all${isPlaying && activeSong ? " playing" : ""}`}
                onClick={isPlaying && activeSong ? handleStopAll : handlePlayAll}
              >
                <span className="play-all-icon">
                  {isPlaying && activeSong ? "■" : "▶"}
                </span>
                {isPlaying && activeSong ? "Stop" : "Play all"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Admin controls */}
      {isAdmin && (
        <div className="album-page-admin-bar">
          <button className="btn-ghost-sm" onClick={() => setShowAttach((v) => !v)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add songs to album
          </button>
          <button className="btn-upload" onClick={() => setShowUpload(true)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Upload &amp; add song
          </button>
        </div>
      )}

      {/* Attach song picker */}
      {isAdmin && showAttach && (
        <div className="attach-panel">
          <p className="attach-panel-label">Select a song to add:</p>
          {unattachedSongs.length === 0
            ? <p className="section-empty">All songs are already in this album.</p>
            : (
              <div className="attach-list">
                {unattachedSongs.map((s) => (
                  <div key={s._id} className="attach-item">
                    <div className="attach-item-info">
                      <span className="attach-item-title">{s.title}</span>
                      <span className="attach-item-artist">{s.artist}</span>
                    </div>
                    <button
                      className="btn-ghost-sm"
                      onClick={() => handleAttachSong(s._id)}
                      disabled={attaching}
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )
          }
        </div>
      )}

      {/* Songs */}
      <section className="home-section">
        <div className="song-grid">
          {album.songs?.length === 0 ? (
            <div className="songs-empty">
              <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
              </svg>
              <p>No songs in this album yet.</p>
            </div>
          ) : (
            songs.map((song, idx) => {
              const isActive = activeSong?._id === song._id;
              return (
                <SongCard
                  key={song._id}
                  song={song}
                  isActive={isActive}
                  onPlay={() => { playQueue(songs, idx); setIsPlaying(true); }}
                  onPause={() => setIsPlaying(false)}
                  onAddToPlaylist={() => setAddToPlaylistSong(song)}
                  onEnded={isActive ? () => { playNext(); setIsPlaying(true); } : undefined}
                />
              );
            })
          )}
        </div>
      </section>

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onUploaded={handleUploadAndAddSong}
        />
      )}
      {addToPlaylistSong && (
        <AddToPlaylistModal song={addToPlaylistSong} onClose={() => setAddToPlaylistSong(null)} />
      )}
    </div>
  );
};

export default AlbumPage;