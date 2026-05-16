import { useEffect, useState } from "react";

import api from "../api/axios";

import Navbar from "../components/Navbar";
import SongCard from "../components/SongCard";

const HomePage = () => {

  const [songs, setSongs] = useState([]);

  const fetchSongs = async () => {
    try {

      const res = await api.get("/songs");

      setSongs(res.data);

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  return (
    <div>
      <Navbar />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
          padding: "20px"
        }}
      >
        {songs.map((song, index) => (
          <SongCard
            key={index}
            song={song}
          />
        ))}
      </div>
    </div>
  );
};

export default HomePage;