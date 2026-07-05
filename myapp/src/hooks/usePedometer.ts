import { useEffect } from 'react';
import { Accelerometer } from 'expo-sensors';
import { useActivityStore } from '../store/activityStore';
import { StepDetector } from '../utils/StepDetector';

export const usePedometer = () => {
  const { 
    addSteps, 
    checkMidnightReset, 
    setPedometerAvailable 
  } = useActivityStore();

  useEffect(() => {
    checkMidnightReset();
    let accelSub: { remove: () => void } | undefined;

    const setupStepTracker = async () => {
      try {
        const isAvailable = await Accelerometer.isAvailableAsync();
        setPedometerAvailable(isAvailable ? 'available' : 'unavailable');

        if (isAvailable) {
          console.log('DSP Accelerometer steps engine starting at 50Hz (20ms interval)...');
          
          // Configure Accelerometer update interval to 20ms (50Hz)
          Accelerometer.setUpdateInterval(20);

          const detector = new StepDetector((stepsCount) => {
            addSteps(stepsCount);
          });

          accelSub = Accelerometer.addListener(data => {
            const { x, y, z } = data;
            // Process sample through DSP and rhythm state machine
            detector.processSample(x, y, z, Date.now());
          });
        } else {
          console.warn('Accelerometer is not available on this device.');
        }
      } catch (error) {
        setPedometerAvailable('error');
        console.error('Failed to initialize DSP step tracker:', error);
      }
    };

    setupStepTracker();

    return () => {
      if (accelSub && accelSub.remove) {
        accelSub.remove();
      }
    };
  }, []);

  return { isPedometerAvailable: 'available' };
};
