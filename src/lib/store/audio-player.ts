import { create } from "zustand";

interface AudioPlayerState {
  currentTrackUrl: string | null;
  trackTitle: string | null;
  isPlaying: boolean;
  play: (trackUrl: string, title: string) => void;
  togglePlay: () => void;
  close: () => void;
}

export const useAudioPlayerStore = create<AudioPlayerState>((set) => ({
  currentTrackUrl: null,
  trackTitle: null,
  isPlaying: false,
  play: (trackUrl, title) =>
    set({ currentTrackUrl: trackUrl, trackTitle: title, isPlaying: true }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  close: () =>
    set({ currentTrackUrl: null, trackTitle: null, isPlaying: false }),
}));
