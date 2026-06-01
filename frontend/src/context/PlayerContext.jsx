import { createContext, useContext, useState } from "react";

const PlayerContext = createContext(null);

export const PlayerProvider = ({ children }) => {
  const [volume, setVolume] = useState(0.5);
  const [muted, setMuted]   = useState(false);
  return (
    <PlayerContext.Provider value={{ volume, setVolume, muted, setMuted }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);