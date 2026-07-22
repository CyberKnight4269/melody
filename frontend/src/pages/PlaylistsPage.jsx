import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar              from "../components/Navbar";
import SongCard            from "../components/SongCard";
import CreatePlaylistModal from "../components/CreatePlaylistModal";
import AddToPlaylistModal  from "../components/AddToPlaylistModal";
import AddToAlbumModal from "../components/AddToAlbumModal";
import { useAuth } from "../context/AuthContext";
import { useSongQueue } from "../hooks/useSongQueue";

const PlaylistsPage = () => {
  const [playlists,       setPlaylists]       = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [activePlaylistId, setActivePlaylistId] = useState(null); // store ID only
  const [activeSongId,    setActiveSongId]    = useState(null);
  const [showCreate,      setShowCreate]      = useState(false);
  const [addToPlaylistSong, setAddToPlaylistSong] = useState(null);
  const [addToAlbumSong, setAddToAlbumSong] = useState(null);
  const [removing,        setRemoving]        = useState(null);
  const { activeSong, playQueue, playNext, clearQueue } = useSongQueue();
  const [isPlaying, setIsPlaying] = useState(false);

  // Derive active playlist from playlists array — never stale
  const activePlaylist = playlists.find((p) => p._id === activePlaylistId) || null;
  const songs = activePlaylist?.songs ?? [];

  const {isAdmin} = useAuth();

  const handlePlayAll = () => {
  if (!activePlaylist?.songs?.length) return;
  playQueue(songs, 0);
  setIsPlaying(true);
  };

  const handleStopAll = () => {
  clearQueue();
  setIsPlaying(false);
  };
  
  const fetchPlaylists = async () => {
    try {
      const res = await api.get("/playlists");
      setPlaylists(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPlaylists(); }, []);

  const handleRemoveSong = async (playlistId, songId) => {
    setRemoving(songId);
    try {
      await api.put(`/playlists/${playlistId}/remove-songs`, { songs: [songId] });
      await fetchPlaylists();
    } catch (e) {
      alert(e.response?.data?.message || "Failed to remove song.");
    } finally { setRemoving(null); }
  };

  return (
    <div className="home-page">
      <Navbar onUploadClick={() => {}} onCreateAlbumClick={() => {}} />

      <div className="home-section">
        <div className="home-section-header">
          <div>
            <div className="home-header-eyebrow">My Library</div>
            <h2 className="home-section-title">My Playlists</h2>
          </div>
          <button className="btn-upload" onClick={() => setShowCreate(true)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New playlist
          </button>
        </div>

        {loading ? (
          <p className="section-empty">Loading…</p>
        ) : playlists.length === 0 ? (
          <div className="playlists-empty">
            <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-4M12 12v9m0 0-3-3m3 3 3-3"/>
            </svg>
            <p>You haven't created any playlists yet.</p>
            <button className="btn-primary" onClick={() => setShowCreate(true)}>Create your first playlist</button>
          </div>
        ) : (
          <div className="playlists-layout">
            {/* Sidebar */}
            <div className="playlists-sidebar">
              {playlists.map((pl) => (
                <div
                  key={pl._id}
                  className={`playlist-item${activePlaylistId === pl._id ? " playlist-item--active" : ""}`}
                  onClick={() => {
                  if (pl._id !== activePlaylistId) { clearQueue(); setIsPlaying(false);}
                  setActivePlaylistId(pl._id); setActiveSongId(null); }}
                >
                  <div className="playlist-item-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
                      <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
                      <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                    </svg>
                  </div>
                  <div className="playlist-item-info">
                    <span className="playlist-item-name">{pl.title}</span>
                    <span className="playlist-item-count">{pl.songs?.length ?? 0} track{pl.songs?.length !== 1 ? "s" : ""}</span>
                  </div>
                </div>
              ))}
            </div>
            {/* Content */}
            <div className="playlists-content">
              {!activePlaylist ? (
                <div className="playlists-select-hint">
                  <p>Select a playlist to view its songs.</p>
                </div>
              ) : (
                <>
                  <div className="playlists-content-header">
                    <h3 className="playlists-content-title">{activePlaylist.title}</h3>
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
                    {activePlaylist.description && (
                      <p className="playlists-content-desc">{activePlaylist.description}</p>
                    )}
                  </div>
                  {songs?.length === 0 ? (
                    <div className="songs-empty">
                      <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
                      </svg>
                      <p>No songs in this playlist yet. Add some from the home page.</p>
                    </div>
                  ) : (
                    <div className="song-list">
                      {songs.map((song, idx) => {
                        const isActive = activeSong?._id === song._id;
                        return (
                          <SongCard
                            key={song._id}
                            song={song}
                            isActive={isActive}
                            onPlay={() => { playQueue(songs, idx); setIsPlaying(true); }}
                            onPause={() => setIsPlaying(false)}
                            onAddToPlaylist={() => setAddToPlaylistSong(song)}
                            onAddToAlbum={isAdmin ? () => setAddToAlbumSong(song) : undefined}
                            onRemoveFromPlaylist={() => handleRemoveSong(activePlaylistId,song._id)}
                            onEnded={isActive ? () => { playNext(); setIsPlaying(true); } : undefined}
                          />
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {showCreate && (
        <CreatePlaylistModal onClose={() => setShowCreate(false)} onCreated={fetchPlaylists} />
      )}
      {addToPlaylistSong && (
        <AddToPlaylistModal
          song={addToPlaylistSong}
          onClose={() => setAddToPlaylistSong(null)}
          onAdded={fetchPlaylists}
        />
      )}
      {isAdmin && addToAlbumSong && (
        <AddToAlbumModal
          song={addToAlbumSong}
          onClose={() => setAddToAlbumSong(null)}
        />
      )}
    </div>
  );
};

export default PlaylistsPage;