import { useState, useEffect, useCallback } from 'react';

export type TimerPhase = 'Normal' | 'Warning' | 'Extension' | 'WrapUp';

export interface TimerConfig {
  sessionStartedAt: string;
  scheduledEndTime: string;
  baseDurationMinutes: number;
  isNextSlotBooked?: boolean;
  primaryEndTime?: string;
  absoluteHardLimitTime?: string;
}

export function useCallTimer(timerConfig: TimerConfig | null) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [phase, setPhase] = useState<TimerPhase>('Normal');
  
  const [isExtended, setIsExtended] = useState(false);
  const [wrapUpEndTime, setWrapUpEndTime] = useState<number | null>(null);

  // Called via socket event in Scenario 3
  const startWrapUpCountdown = useCallback(() => {
    setWrapUpEndTime(Date.now() + 60 * 1000);
    setPhase('WrapUp');
  }, []);

  // Called when doctor clicks "Extend" in UI
  const extendCall = useCallback(() => {
    setIsExtended(true);
    // Recalculate remaining time immediately to prevent premature auto-disconnect
    if (timerConfig) {
      const startTime = new Date(timerConfig.sessionStartedAt).getTime();
      const scheduledEnd = new Date(timerConfig.scheduledEndTime).getTime();
      
      let absoluteHardLimit;
      if (timerConfig.absoluteHardLimitTime) {
        absoluteHardLimit = new Date(timerConfig.absoluteHardLimitTime).getTime();
      } else {
        const maxDurationEnd = startTime + timerConfig.baseDurationMinutes * 60 * 1000;
        absoluteHardLimit = timerConfig.isNextSlotBooked 
          ? Math.min(maxDurationEnd, scheduledEnd)
          : maxDurationEnd;
      }
        
      const now = Date.now();
      const remainingHardLimit = Math.max(0, Math.floor((absoluteHardLimit - now) / 1000));
      setRemainingSeconds(remainingHardLimit);
    }
  }, [timerConfig]);

  useEffect(() => {
    if (!timerConfig) {
      setElapsedSeconds(0);
      setRemainingSeconds(0);
      setPhase('Normal');
      return;
    }

    const { sessionStartedAt, scheduledEndTime, baseDurationMinutes } = timerConfig;
    const startTime = new Date(sessionStartedAt).getTime();
    const scheduledEnd = new Date(scheduledEndTime).getTime();
    
    // Standard duration from start (40 mins max)
    const standardEnd = startTime + baseDurationMinutes * 60 * 1000;

    let absoluteHardLimit;
    if (timerConfig.absoluteHardLimitTime) {
      absoluteHardLimit = new Date(timerConfig.absoluteHardLimitTime).getTime();
    } else {
      absoluteHardLimit = timerConfig.isNextSlotBooked 
        ? Math.min(standardEnd, scheduledEnd) 
        : standardEnd;
    }
    
    let primaryEndTime;
    if (timerConfig.primaryEndTime) {
      primaryEndTime = new Date(timerConfig.primaryEndTime).getTime();
    } else {
      primaryEndTime = Math.min(standardEnd, scheduledEnd);
    }

    const updateTimer = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      setElapsedSeconds(elapsed);

      // 1. Wrap-Up Phase
      if (wrapUpEndTime) {
        const remainingWrapUp = Math.max(0, Math.floor((wrapUpEndTime - now) / 1000));
        setRemainingSeconds(remainingWrapUp);
        setPhase('WrapUp');
        return;
      }

      // 2. Extension Phase or Primary Time Reached
      if (now >= primaryEndTime) {
        if (!isExtended) {
          // Can they extend? 
          // If absoluteHardLimit is effectively the same as primaryEndTime, they can't extend (prevents bleeding into next booked slot)
          if (absoluteHardLimit - primaryEndTime < 60 * 1000) {
            setWrapUpEndTime(now + 60 * 1000);
            setRemainingSeconds(60);
            setPhase('WrapUp');
            return;
          } else {
            // They CAN extend. Waiting for doctor to choose End or Extend
            setRemainingSeconds(0);
            setPhase('Extension'); 
          }
        } else {
          // They HAVE extended. Check if they hit the absolute hard limit.
          if (now >= absoluteHardLimit) {
            setWrapUpEndTime(now + 60 * 1000);
            setRemainingSeconds(60);
            setPhase('WrapUp');
            return;
          } else {
            // Counting down extension time
            const remainingHardLimit = Math.max(0, Math.floor((absoluteHardLimit - now) / 1000));
            setRemainingSeconds(remainingHardLimit);
            setPhase('Extension');
          }
        }
      } 
      // 3. Normal / Warning Phase (Before primary time)
      else {
        const remainingPrimary = Math.floor((primaryEndTime - now) / 1000);
        setRemainingSeconds(remainingPrimary);
        
        if (remainingPrimary <= 5 * 60) {
          setPhase('Warning');
        } else {
          setPhase('Normal');
        }
      }
    };

    updateTimer();
    const intervalId = setInterval(updateTimer, 1000);

    return () => clearInterval(intervalId);
  }, [timerConfig, isExtended, wrapUpEndTime]);

  const formatTime = (totalSeconds: number) => {
    const isNegative = totalSeconds < 0;
    const absSeconds = Math.abs(totalSeconds);
    const m = Math.floor(absSeconds / 60).toString().padStart(2, '0');
    const s = (absSeconds % 60).toString().padStart(2, '0');
    return `${isNegative ? '-' : ''}${m}:${s}`;
  };

  // Derived states for UI and auto-disconnect logic
  const isWarningPhase = phase === 'Warning' || phase === 'Extension' || phase === 'WrapUp';
  const shouldAutoDisconnect = (phase === 'WrapUp' || (phase === 'Extension' && isExtended)) && remainingSeconds === 0;

  return {
    elapsedSeconds,
    remainingSeconds,
    phase,
    isWarningPhase,
    isExtended,
    isWrapUpPhase: phase === 'WrapUp',
    shouldAutoDisconnect,
    formattedElapsed: formatTime(elapsedSeconds),
    formattedRemaining: formatTime(remainingSeconds),
    startWrapUpCountdown,
    extendCall
  };
}
