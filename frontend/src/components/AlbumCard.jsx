import { useNavigate } from "react-router-dom";

const DEFAULT_COVER = "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&q=80";

const AlbumCard = ({ album }) => {
  const navigate = useNavigate();

  return (
    <div className="album-card" onClick={() => navigate(`/albums/${album._id}`)}>
      <div className="album-card-art">
        <img src={album.coverUrl || DEFAULT_COVER} alt={album.title} loading="lazy" />
        <div className="album-card-overlay">
          <div className="album-card-play-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,3 19,12 5,21"/>
            </svg>
          </div>
        </div>
      </div>
      <div className="album-card-body">
        <div className="album-card-title">{album.title}</div>
        <div className="album-card-meta">
          {album.songs?.length ?? 0} track{album.songs?.length !== 1 ? "s" : ""}
          {album.description ? ` · ${album.description}` : ""}
        </div>
      </div>
    </div>
  );
};

export default AlbumCard;