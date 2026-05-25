import { useState } from "react";
import api from "../api/axios";

const CreateAlbumModal = ({ onClose, onCreated }) => {
  const [form,   setForm]   = useState({ title: "", description: "" });
  const [coverFile, setCoverFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError("Title is required."); return; }
    setSaving(true); setError("");
    try {
      const data = new FormData();
      data.append(
        "title",
        form.title.trim()
      );
      data.append(
        "description",
        form.description.trim()
      );
      data.append(
        "type",
        "album"
      );
      // data.append(
      //   "songs",
      //   JSON.stringify([])
      // );
      if (coverFile) {
        data.append("cover", coverFile);
      }
      await api.post("/playlists",data,
        {
          headers: {
            "Content-Type":
            "multipart/form-data"
          }
        }
      );
      onCreated();
      onClose();
    } catch (err) {
        setError(err.response?.data?.message || "Failed to create album.");
      } finally { setSaving(false); }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-header">
          <div className="modal-header-left">
            <div className="modal-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M9 18V5l12-2v13"/>
              </svg>
            </div>
            <h2 className="modal-title">New Album</h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="modal-fields">
            <div className="form-group">
              <label htmlFor="alb-title">Album title</label>
              <input id="alb-title" type="text" name="title" placeholder="Album name"
                value={form.title} onChange={handleChange} disabled={saving} autoComplete="off" />
            </div>
            <div className="form-group">
              <label htmlFor="alb-desc">Description <span style={{color:"var(--text-muted)",fontWeight:400}}>(optional)</span></label>
              <input id="alb-desc" type="text" name="description" placeholder="A short description…"
                value={form.description} onChange={handleChange} disabled={saving} autoComplete="off" />
            </div>
            <div className="form-group">
              <label>Cover image <span style={{color:"var(--text-muted)",fontWeight:400}}>(optional)</span></label>
              <input type="file" accept="image/*"
                onChange={(e) => setCoverFile(e.target.files[0])}
                disabled={saving} />
            </div>
          </div>

          {error && (
            <div className="modal-error" role="alert">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Creating…" : "Create album"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAlbumModal;