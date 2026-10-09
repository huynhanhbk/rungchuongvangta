import { useState, useCallback, useEffect } from 'react';
import { sound } from '../services/sound';
import { getSettings, saveSettings } from '../services/storage';

export const useSound = () => {
  const [enabled, setEnabled] = useState<boolean>(() => getSettings().soundEnabled);
  const [volume, setVolumeState] = useState<number>(() => getSettings().volume);

  useEffect(() => {
    sound.setSoundEnabled(enabled);
    sound.setVolume(volume);
  }, [enabled, volume]);

  const toggleSound = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      sound.setSoundEnabled(next);
      saveSettings({ soundEnabled: next });
      return next;
    });
  }, []);

  const changeVolume = useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    sound.setVolume(clamped);
    saveSettings({ volume: clamped });
  }, []);

  return {
    soundEnabled: enabled,
    volume,
    toggleSound,
    changeVolume,
    playTick: () => sound.playTick(),
    playUrgentTick: () => sound.playUrgentTick(),
    playTimeUp: () => sound.playTimeUp(),
    playCorrect: () => sound.playCorrect(),
    playWrong: () => sound.playWrong(),
    playGoldenBell: () => sound.playGoldenBell(),
    playFanfare: () => sound.playFanfare(),
    playCelebrationChime: () => sound.playCelebrationChime(),
    stopCelebrationChime: () => sound.stopCelebrationChime(),
    playSlotSpin: () => sound.playSlotSpin(),
    playSlotWin: () => sound.playSlotWin(),
  };
};
