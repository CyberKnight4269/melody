import { useState, useCallback, useRef } from "react";

export function useSongQueue() {
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const queueRef = useRef([]);  // ← always holds current queue

  const playQueue = useCallback((songs, startIndex = 0) => {
    if (!songs?.length) return;
    queueRef.current = songs;
    setQueue(songs);
    setCurrentIndex(Math.max(0, Math.min(startIndex, songs.length - 1)));
  }, []);

  const playNext = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev + 1 < queueRef.current.length) return prev + 1;
      return prev; // at end, stay
    });
  }, []); // ← no dependency needed, reads ref instead

  const playPrev = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const clearQueue = useCallback(() => {
    queueRef.current = [];
    setQueue([]);
    setCurrentIndex(-1);
  }, []);

  const activeSong =
    currentIndex >= 0 && currentIndex < queueRef.current.length
      ? queueRef.current[currentIndex]
      : null;

  return { queue, currentIndex, activeSong, playQueue, playNext, playPrev, clearQueue };
}