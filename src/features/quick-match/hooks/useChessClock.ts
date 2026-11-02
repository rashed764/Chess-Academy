/**
 * React hook wrapping the pure timestamp-based chess clock.
 * Drives display updates, prevents timer drift, handles tab visibility, and fires timeout callbacks.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  type ChessClockState,
  commitChessMove,
  createChessClock,
  formatClockDisplay,
  getDisplayTimeMs,
  startChessClock,
  stopChessClock,
  tickChessClock,
} from '../models/clock';

export interface UseChessClockOptions {
  initialMinutes: number;
  incrementSeconds: number;
  onTimeout?: (expiredSide: 'w' | 'b') => void;
}

export function useChessClock({
  initialMinutes,
  incrementSeconds,
  onTimeout,
}: UseChessClockOptions) {
  const [clockState, setClockState] = useState<ChessClockState>(() =>
    createChessClock(initialMinutes, incrementSeconds)
  );

  // High-frequency display millisecond state for 60fps / 10Hz updates
  const [whiteDisplayMs, setWhiteDisplayMs] = useState<number>(() =>
    Math.round(initialMinutes * 60 * 1000)
  );
  const [blackDisplayMs, setBlackDisplayMs] = useState<number>(() =>
    Math.round(initialMinutes * 60 * 1000)
  );

  const stateRef = useRef(clockState);
  stateRef.current = clockState;

  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  const animationFrameRef = useRef<number | null>(null);

  // Sync display times and check timeout
  const updateDisplayTimes = useCallback(() => {
    const now = Date.now();
    const curr = stateRef.current;

    if (curr.isExpired) {
      if (curr.expiredSide === 'w') setWhiteDisplayMs(0);
      if (curr.expiredSide === 'b') setBlackDisplayMs(0);
      return;
    }

    if (!curr.activeSide || !curr.lastTimestamp) {
      setWhiteDisplayMs(curr.whiteRemainingMs);
      setBlackDisplayMs(curr.blackRemainingMs);
      return;
    }

    // Check if timeout occurred
    const ticked = tickChessClock(curr, now);
    if (ticked.isExpired && ticked.expiredSide) {
      setClockState(ticked);
      if (ticked.expiredSide === 'w') setWhiteDisplayMs(0);
      if (ticked.expiredSide === 'b') setBlackDisplayMs(0);
      onTimeoutRef.current?.(ticked.expiredSide);
      return;
    }

    setWhiteDisplayMs(getDisplayTimeMs(curr, 'w', now));
    setBlackDisplayMs(getDisplayTimeMs(curr, 'b', now));
  }, []);

  // Timer loop when active
  useEffect(() => {
    if (!clockState.activeSide || clockState.isExpired) {
      return;
    }

    const runLoop = () => {
      updateDisplayTimes();
    };

    // 100ms interval for steady CPU-friendly display updates
    const intervalId = setInterval(runLoop, 100);
    runLoop();

    // Instant update on tab visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        runLoop();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [clockState.activeSide, clockState.isExpired, updateDisplayTimes]);

  const start = useCallback((side: 'w' | 'b') => {
    setClockState((prev) => {
      const next = startChessClock(prev, side, Date.now());
      return next;
    });
  }, []);

  const commitMove = useCallback((moverSide: 'w' | 'b', nextSide: 'w' | 'b' | null) => {
    const now = Date.now();
    setClockState((prev) => {
      const next = commitChessMove(prev, moverSide, nextSide, now);
      if (next.isExpired && next.expiredSide) {
        onTimeoutRef.current?.(next.expiredSide);
      }
      setWhiteDisplayMs(next.whiteRemainingMs);
      setBlackDisplayMs(next.blackRemainingMs);
      return next;
    });
  }, []);

  const stop = useCallback(() => {
    const now = Date.now();
    setClockState((prev) => {
      const next = stopChessClock(prev, now);
      setWhiteDisplayMs(next.whiteRemainingMs);
      setBlackDisplayMs(next.blackRemainingMs);
      return next;
    });
  }, []);

  const reset = useCallback(
    (newMinutes?: number, newIncrement?: number) => {
      const mins = newMinutes ?? initialMinutes;
      const inc = newIncrement ?? incrementSeconds;
      const fresh = createChessClock(mins, inc);
      setClockState(fresh);
      setWhiteDisplayMs(fresh.whiteRemainingMs);
      setBlackDisplayMs(fresh.blackRemainingMs);
    },
    [initialMinutes, incrementSeconds]
  );

  return {
    clockState,
    whiteDisplayMs,
    blackDisplayMs,
    whiteDisplayText: formatClockDisplay(whiteDisplayMs),
    blackDisplayText: formatClockDisplay(blackDisplayMs),
    isWhiteLowTime: whiteDisplayMs < 20000 && whiteDisplayMs > 0,
    isBlackLowTime: blackDisplayMs < 20000 && blackDisplayMs > 0,
    start,
    commitMove,
    stop,
    reset,
  };
}
