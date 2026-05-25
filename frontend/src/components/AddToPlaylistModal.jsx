import { useEffect, useState } from "react";
import api from "../api/axios";

const AddToPlaylistModal = ({ song, onClose, onAdded }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [adding,    setAdding]    = useState(null);
  const [done,      setDone]      = useState(null);
  const [error,     setError]     = useState("");

  useEffect(() => {
    api.get("/playlists")
      .then((r) => setPlaylists(r.data))
      .catch(() => setError("Could not load playlists."))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (playlistId) => {
    setAdding(playlistId); setError("");
    try {
      await api.put(`/playlists/${playlistId}/add-songs`, { songs: [song._id] });
      setDone(playlistId);
      onAdded?.();
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
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </div>
            <h2 className="modal-title">Add to playlist</h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="modal-form">
          <p className="atp-song-name">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
              <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
            </svg>
            {song.title} — <span style={{color:"var(--text-muted)"}}>{song.artist}</span>
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
            <p className="section-empty">Loading playlists…</p>
          ) : playlists.length === 0 ? (
            <p className="section-empty">No playlists yet. Create one from the Playlists page.</p>
          ) : (
            <div className="atp-list">
              {playlists.map((pl) => (
                <div key={pl._id} className="atp-item">
                  <div className="atp-item-info">
                    <span className="atp-item-name">{pl.title}</span>
                    <span className="atp-item-count">{pl.songs?.length ?? 0} tracks</span>
                  </div>
                  {done === pl._id ? (
                    <span className="atp-added">Added ✓</span>
                  ) : (
                    <button
                      className="btn-ghost-sm"
                      onClick={() => handleAdd(pl._id)}
                      disabled={adding === pl._id}
                    >
                      {adding === pl._id ? "Adding…" : "Add"}
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

export default AddToPlaylistModal;