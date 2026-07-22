import { useEffect, useState } from "react";
import api from "../api/axios";

const AddToAlbumModal = ({ song, onClose }) => {
  const [albums,  setAlbums]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding,  setAdding]  = useState(null);
  const [done,    setDone]    = useState(null);
  const [error,   setError]   = useState("");

  useEffect(() => {
    api.get("/songs/albums")
      .then((r) => setAlbums(r.data))
      .catch(() => setError("Could not load albums."))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (albumId) => {
    setAdding(albumId); setError("");
    try {
      await api.put(`/playlists/${albumId}/add-songs`, { songs: [song._id] });
      setDone(albumId);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to add song.");
    } finally { setAdding(null); }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-header">
          <div className="modal-header-left">
            <div className="modal-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
              </svg>
            </div>
            <h2 className="modal-title">Add to album</h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="modal-form">
          <p className="atp-song-name">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
            </svg>
            {song.title} — <span style={{ color: "var(--text-muted)" }}>{song.artist}</span>
          </p>

          {error && (
            <div className="modal-error" role="alert">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {loading ? (
            <p className="section-empty">Loading albums…</p>
          ) : albums.length === 0 ? (
            <p className="section-empty">No albums available.</p>
          ) : (
            <div className="atp-list">
              {albums.map((album) => (
                <div key={album._id} className="atp-item">
                  <div className="atp-item-info">
                    <span className="atp-item-name">{album.title}</span>
                    <span className="atp-item-count">{album.songs?.length ?? 0} tracks</span>
                  </div>
                  {done === album._id ? (
                    <span className="atp-added">Added ✓</span>
                  ) : (
                    <button
                      className="btn-ghost-sm"
                      onClick={() => handleAdd(album._id)}
                      disabled={adding === album._id}
                    >
                      {adding === album._id ? "Adding…" : "Add"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="modal-actions">
            <button className="btn-ghost" onClick={onClose}>Done</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddToAlbumModal;