import { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import Navbar             from "../components/Navbar";
import AlbumCard          from "../components/AlbumCard";
import SongCard           from "../components/SongCard";
import UploadModal        from "../components/UploadModal";
import CreateAlbumModal   from "../components/CreateAlbumModal";
import AddToPlaylistModal from "../components/AddToPlaylistModal";
import AddToAlbumModal from "../components/AddToAlbumModal";
import { useAuth } from "../context/AuthContext";

const SkeletonAlbum = () => (
  <div className="skeleton-card">
    <div className="skeleton-art" />
    <div className="skeleton-body">
      <div className="skeleton-line" style={{ width: "65%" }} />
      <div className="skeleton-line short" />
    </div>
  </div>
);

const HomePage = () => {
  const [albums,        setAlbums]        = useState([]);
  const [loadingAlbums, setLoadingAlbums] = useState(true);

  const [query,         setQuery]         = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching,     setSearching]     = useState(false);
  const [searched,      setSearched]      = useState(false); // has a search been run?

  const [activeSongId,  setActiveSongId]  = useState(null);
  const [showUpload,    setShowUpload]    = useState(false);
  const [showCreateAlbum, setShowCreateAlbum] = useState(false);
  const [addToPlaylistSong, setAddToPlaylistSong] = useState(null);
  const [addToAlbumSong, setAddToAlbumSong] = useState(null);

  const debounceRef = useRef(null);

  const { isAdmin } = useAuth();

  const fetchAlbums = async () => {
    try {
      const res = await api.get("/songs/albums");
      setAlbums(res.data);
    } catch (e) { console.error(e); }
    finally { setLoadingAlbums(false); }
  };

  useEffect(() => { fetchAlbums(); }, []);

  // Debounced search — fires 400ms after user stops typing
  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!val.trim()) {
      setSearchResults([]);
      setSearched(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      setSearched(true);
      try {
        const res = await api.get(`/songs?search=${encodeURIComponent(val.trim())}`);
        setSearchResults(res.data);
      } catch (e) {
        console.error(e);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  };

  const clearSearch = () => {
    setQuery("");
    setSearchResults([]);
    setSearched(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  };

  const showSearch = query.trim().length > 0;

  return (
    <div className="home-page">
      <Navbar
        onUploadClick={() => setShowUpload(true)}
        onCreateAlbumClick={() => setShowCreateAlbum(true)}
      />

      {/* ── Search Bar ── */}
      <div className="search-bar-wrap">
        <div className="search-bar">
          <svg className="search-bar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            className="search-bar-input"
            placeholder="Search songs by title or artist…"
            value={query}
            onChange={handleQueryChange}
            autoComplete="off"
            spellCheck="false"
          />
          {query && (
            <button className="search-bar-clear" onClick={clearSearch} aria-label="Clear search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── Search Results ── */}
      {showSearch && (
        <section className="home-section">
          <div className="home-section-header">
            <div>
              <div className="home-header-eyebrow">Search</div>
              <h2 className="home-section-title">
                {searching
                  ? "Searching…"
                  : searched && searchResults.length === 0
                  ? `No results for "${query}"`
                  : searched
                  ? `${searchResults.length} result${searchResults.length !== 1 ? "s" : ""} for "${query}"`
                  : ""}
              </h2>
            </div>
          </div>
          <div className="song-grid">
            {searching
              ? Array.from({ length: 3 }).map((_, i) => <SkeletonAlbum key={i} />)
              : searchResults.map((song, i) => {
                  const id = song._id || i;
                  return (
                    <SongCard
                      key={id}
                      song={song}
                      isActive={activeSongId === id}
                      onPlay={() => setActiveSongId(id)}
                      onPause={() => setActiveSongId(null)}
                      onAddToPlaylist={setAddToPlaylistSong}
                      onAddToAlbum={isAdmin ? () => setAddToAlbumSong(song) : undefined}
                    />
                  );
                })
            }
          </div>
        </section>
      )}

      {/* ── Albums Section ── */}
      {!showSearch && (
        <section className="home-section">
          <div className="home-section-header">
            <div>
              <div className="home-header-eyebrow">Public Albums</div>
              <h2 className="home-section-title">Albums</h2>
            </div>
          </div>
          <div className="album-grid">
            {loadingAlbums
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonAlbum key={i} />)
              : albums.length === 0
              ? <p className="section-empty">No albums yet.</p>
              : albums.map((album) => <AlbumCard key={album._id} album={album} />)
            }
          </div>
        </section>
      )}

      {showUpload && (
        <UploadModal onClose={() => setShowUpload(false)} onUploaded={() => {}} />
      )}
      {showCreateAlbum && (
        <CreateAlbumModal onClose={() => setShowCreateAlbum(false)} onCreated={fetchAlbums} />
      )}
      {addToPlaylistSong && (
        <AddToPlaylistModal song={addToPlaylistSong} onClose={() => setAddToPlaylistSong(null)} />
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

export default HomePage;