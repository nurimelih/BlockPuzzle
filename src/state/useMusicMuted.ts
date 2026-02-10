import { useCallback } from 'react';
import { useAppStore } from './useAppStore';
import { SoundManager } from '../services/SoundManager';
import { GameStorage } from '../services/GameStorage';

export const useMusicMuted = () => {
  const isMusicMuted = useAppStore(state => state.isMusicMuted);

  const setMusicMuted = useCallback((muted: boolean) => {
    useAppStore.getState().setMusicMuted(muted);
    SoundManager.setMusicMuted(muted);
    GameStorage.getSoundSettings().then(settings => {
      GameStorage.saveSoundSettings({...settings, musicEnabled: !muted});
    });
  }, []);

  return { isMusicMuted, setMusicMuted };
};
