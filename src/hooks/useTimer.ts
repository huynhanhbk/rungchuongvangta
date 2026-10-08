import { useState, useEffect, useRef, useCallback } from 'react';
import { useSound } from './useSound';

interface UseTimerProps {
  initialSeconds: number;
  onTimeUp?: () => void;
}

export const useTimer = ({ initialSeconds, onTimeUp }: UseTimerProps) => {
  const [totalSeconds, setTotalSeconds] = useState<number>(initialSeconds);
  const [timeLeft, setTimeLeft] = useState<number>(initialSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const { playTick, playUrgentTick, playTimeUp } = useSound();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  // Cập nhật khi initialSeconds thay đổi (chuyển câu hoặc đổi cài đặt)
  useEffect(() => {
    setTotalSeconds(initialSeconds);
    setTimeLeft(initialSeconds);
    setIsRunning(false);
    setIsFinished(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [initialSeconds]);

  const tick = useCallback(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsRunning(false);
        setIsFinished(true);
        playTimeUp();
        if (onTimeUpRef.current) onTimeUpRef.current();
        return 0;
      }

      const nextVal = prev - 1;
      // Phát âm thanh: 3 giây cuối kêu tích tắc khẩn cấp
      if (nextVal <= 3 && nextVal > 0) {
        playUrgentTick();
      } else {
        playTick();
      }

      return nextVal;
    });
  }, [playTick, playUrgentTick, playTimeUp]);

  const start = useCallback(() => {
    if (timeLeft <= 0) return;
    setIsRunning(true);
    setIsFinished(false);
  }, [timeLeft]);

  const pause = useCallback(() => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const toggle = useCallback(() => {
    if (isRunning) {
      pause();
    } else {
      start();
    }
  }, [isRunning, pause, start]);

  const reset = useCallback((newSec?: number) => {
    const sec = newSec !== undefined ? newSec : totalSeconds;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimeLeft(sec);
    setIsRunning(false);
    setIsFinished(false);
  }, [totalSeconds]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(tick, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, tick]);

  const progressPercent = totalSeconds > 0 ? (timeLeft / totalSeconds) * 100 : 0;

  return {
    timeLeft,
    totalSeconds,
    isRunning,
    isFinished,
    progressPercent,
    start,
    pause,
    toggle,
    reset,
  };
};
