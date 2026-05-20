import { useRef, useState } from "react";
import api from "../api/axios";

const UploadModal = ({ onClose, onUploaded }) => {
  const fileRef = useRef(null);

  const [form, setForm] = useState({ title: "", artist: "" });
  const [file, setFile] = useState(null);
  const [draggingFile, setDraggingFile] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const pickFile = (picked) => {
    if (!picked) return;
    if (!picked.type.startsWith("audio/")) {
      setError("Please select an audio file.");
      return;
    }
    setError("");
    setFile(picked);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDraggingFile(false);
    pickFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setError("Please select an audio file."); return; }
    if (!form.title.trim()) { setError("Title is required."); return; }
    if (!form.artist.trim()) { setError("Artist is required."); return; }

    setUploading(true);
    setError("");

    try {
      const data = new FormData();
      data.append("title", form.title.trim());
      data.append("artist", form.artist.trim());
      data.append("audio", file);

      await api.post("/songs/upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) =>
          setProgress(Math.round((e.loaded / e.total) * 100)),
      });

      onUploaded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  // Close on backdrop click
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdrop}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-left">
            <div className="modal-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <h2 id="modal-title" className="modal-title">Upload Song</h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          {/* Drop Zone */}
          <div
            className={`drop-zone${draggingFile ? " drop-zone--over" : ""}${file ? " drop-zone--filled" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDraggingFile(true); }}
            onDragLeave={() => setDraggingFile(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
            aria-label="Select audio file"
          >
            <input
              ref={fileRef}
              type="file"
              accept="audio/*"
              style={{ display: "none" }}
              onChange={(e) => pickFile(e.target.files[0])}
            />

            {file ? (
              <>
                <div className="drop-zone-icon drop-zone-icon--filled">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18V5l12-2v13"/>
                    <circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                  </svg>
                </div>
                <p className="drop-zone-filename">{file.name}</p>
                <span className="drop-zone-hint">
                  {(file.size / 1024 / 1024).toFixed(2)} MB · click to change
                </span>
              </>
            ) : (
              <>
                <div className="drop-zone-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <p className="drop-zone-label">
                  {draggingFile ? "Drop it here" : "Drag & drop audio"}
                </p>
                <span className="drop-zone-hint">or click to browse · MP3, WAV, AAC</span>
              </>
            )}
          </div>

          {/* Fields */}
          <div className="modal-fields">
            <div className="form-group">
              <label htmlFor="upload-title">Title</label>
              <input
                id="upload-title"
                type="text"
                name="title"
                placeholder="Song title"
                value={form.title}
                onChange={handleChange}
                disabled={uploading}
                autoComplete="off"
              />
            </div>

            <div className="form-group">
              <label htmlFor="upload-artist">Artist</label>
              <input
                id="upload-artist"
                type="text"
                name="artist"
                placeholder="Artist name"
                value={form.artist}
                onChange={handleChange}
                disabled={uploading}
                autoComplete="off"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="modal-error" role="alert">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {/* Upload progress */}
          {uploading && (
            <div className="modal-progress">
              <div className="modal-progress-header">
                <span>Uploading…</span>
                <span>{progress}%</span>
              </div>
              <div className="modal-progress-track">
                <div
                  className="modal-progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="modal-actions">
            <button
              type="button"
              className="btn-ghost"
              onClick={onClose}
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={uploading || !file}
            >
              {uploading ? "Uploading…" : "Upload song"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;