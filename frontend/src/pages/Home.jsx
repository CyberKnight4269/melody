import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <div>
      <Navbar />
      <div className="home">
        <h1>Welcome to MusicApp 🎵</h1>

        <div className="song-list">
          <div className="song-card">
            <p>Song 1</p>
            <audio controls src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" />
          </div>

          <div className="song-card">
            <p>Song 2</p>
            <audio controls src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" />
          </div>
        </div>
      </div>
    </div>
  );
}
