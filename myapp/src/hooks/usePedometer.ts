import { useEffect } from 'react';
import { Pedometer, Accelerometer } from 'expo-sensors';
import { useActivityStore } from '../store/activityStore';

export const usePedometer = () => {
  const { 
    addSteps, 
    checkMidnightReset, 
    isPedometerAvailable, 
    setPedometerAvailable 
  } = useActivityStore();

  useEffect(() => {
    checkMidnightReset();
    let pedometerSub: Pedometer.Subscription | undefined;
    let accelSub: { remove: () => void } | undefined;

    const setupPedometer = async () => {
      try {
        const { status } = await Pedometer.requestPermissionsAsync();
        if (status !== 'granted') {
          setPedometerAvailable('denied');
          setupAccelerometerFallback();
          return;
        }

        const isAvailable = await Pedometer.isAvailableAsync();
        setPedometerAvailable(String(isAvailable));

        if (isAvailable) {
          pedometerSub = Pedometer.watchStepCount(result => {
            if (result && result.steps) {
              addSteps(result.steps);
            }
          });
        } else {
          setupAccelerometerFallback();
        }
      } catch (error) {
        setPedometerAvailable('error');
        console.warn('Pedometer failed to initialize, falling back:', error);
        setupAccelerometerFallback();
      }
    };

    const setupAccelerometerFallback = () => {
      console.log('Accelerometer fallback steps engine active...');
      let lastStepTime = 0;
      
      accelSub = Accelerometer.addListener(data => {
        const { x, y, z } = data;
        const magnitude = Math.sqrt(x * x + y * y + z * z);
        const now = Date.now();

        // 1.22 G is typical peak force for a step/shake, debounced by 360ms
        if (magnitude > 1.22 && now - lastStepTime > 360) {
          lastStepTime = now;
          addSteps(1);
        }
      });

      Accelerometer.setUpdateInterval(100);
    };

    setupPedometer();

    return () => {
      if (pedometerSub && pedometerSub.remove) {
        pedometerSub.remove();
      }
      if (accelSub && accelSub.remove) {
        accelSub.remove();
      }
    };
  }, []);

  return { isPedometerAvailable };
};
