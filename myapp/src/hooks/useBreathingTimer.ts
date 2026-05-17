import { useState, useEffect, useCallback, useRef } from 'react';

export type BreathingPhase = 'Inhale' | 'Hold (Post-Inhale)' | 'Exhale' | 'Hold (Post-Exhale)';

export const useBreathingTimer = (pattern: number[]) => {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(pattern[0] || 0);
  const [isActive, setIsActive] = useState(false);
  
  // Track current state in a ref to avoid stale closures in setInterval
  const stateRef = useRef({ phaseIndex, timeLeft, pattern });
  
  useEffect(() => {
    stateRef.current = { phaseIndex, timeLeft, pattern };
  }, [phaseIndex, timeLeft, pattern]);

  // Derive current phase
  let currentPhase: BreathingPhase = 'Inhale';
  if (pattern.length === 3) {
      if (phaseIndex === 0) currentPhase = 'Inhale';
      else if (phaseIndex === 1) currentPhase = 'Hold (Post-Inhale)';
      else currentPhase = 'Exhale';
  } else {
      if (phaseIndex === 0) currentPhase = 'Inhale';
      else if (phaseIndex === 1) currentPhase = 'Hold (Post-Inhale)';
      else if (phaseIndex === 2) currentPhase = 'Exhale';
      else currentPhase = 'Hold (Post-Exhale)';
  }

  const start = useCallback(() => setIsActive(true), []);
  const pause = useCallback(() => setIsActive(false), []);
  const reset = useCallback(() => {
    setIsActive(false);
    setPhaseIndex(0);
    setTimeLeft(pattern[0] || 0);
  }, [pattern]);

  useEffect(() => {
    if (!isActive) return;

    const intervalId = setInterval(() => {
      const { phaseIndex: currentIndex, timeLeft: currentTimer, pattern: currentPattern } = stateRef.current;
      
      if (currentTimer <= 1) {
        // Transition to next phase
        const nextIndex = (currentIndex + 1) % currentPattern.length;
        setPhaseIndex(nextIndex);
        setTimeLeft(currentPattern[nextIndex]);
      } else {
        // Countdown
        setTimeLeft(currentTimer - 1);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isActive]);

  return { currentPhase, timeLeft, isActive, start, pause, reset };
};
