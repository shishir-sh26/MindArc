import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Pedometer } from 'expo-sensors';
import Svg, { Circle, G } from 'react-native-svg';

const THEME = {
  background: '#0F172A',
  card: '#1E293B',
  text: '#E2E8F0',
  accent: '#8FBC8F', // Sage Green
  radius: 20,
};

export const PedometerWidget = ({ dailyGoal = 5000 }) => {
  const [isPedometerAvailable, setIsPedometerAvailable] = useState<string>('checking');
  const [pastStepCount, setPastStepCount] = useState(0);
  const [currentStepCount, setCurrentStepCount] = useState(0);

  const subscribe = async () => {
    try {
      const isAvailable = await Pedometer.isAvailableAsync();
      setIsPedometerAvailable(String(isAvailable));

      if (isAvailable) {
        // Fetch steps from midnight to now
        const end = new Date();
        const start = new Date();
        start.setHours(0, 0, 0, 0);

        const pastSteps = await Pedometer.getStepCountAsync(start, end);
        if (pastSteps) {
          setPastStepCount(pastSteps.steps);
        }

        // Subscribe to live updates
        return Pedometer.watchStepCount(result => {
          setCurrentStepCount(result.steps);
        });
      }
    } catch (error) {
      setIsPedometerAvailable('error');
      console.error('Pedometer Error:', error);
    }
  };

  useEffect(() => {
    let subscription: Pedometer.Subscription | undefined;
    subscribe().then(sub => {
      subscription = sub;
    });

    return () => {
      if (subscription && subscription.remove) {
        subscription.remove();
      }
    };
  }, []);

  const totalSteps = pastStepCount + currentStepCount;
  const progress = Math.min(totalSteps / dailyGoal, 1);
  
  // Circular progress math
  const size = 160;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Activity</Text>
      
      {isPedometerAvailable === 'error' || isPedometerAvailable === 'false' ? (
        <View style={styles.fallbackContainer}>
          <Text style={styles.fallbackText}>
            Motion tracking is unavailable or disabled. Allow physical activity access to track steps.
          </Text>
        </View>
      ) : (
        <View style={styles.progressContainer}>
          <Svg width={size} height={size}>
            <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
              <Circle
                stroke="#334155" // Muted Slate Track
                fill="none"
                cx={size / 2}
                cy={size / 2}
                r={radius}
                strokeWidth={strokeWidth}
              />
              <Circle
                stroke={THEME.accent}
                fill="none"
                cx={size / 2}
                cy={size / 2}
                r={radius}
                strokeWidth={strokeWidth}
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </G>
          </Svg>
          <View style={styles.innerContent}>
            <Text style={styles.stepText}>{totalSteps}</Text>
            <Text style={styles.goalText}>/ {dailyGoal}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.card,
    borderRadius: THEME.radius,
    padding: 24,
    marginVertical: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  title: {
    color: THEME.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  progressContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    color: THEME.text,
    fontSize: 32,
    fontWeight: 'bold',
  },
  goalText: {
    color: '#94A3B8', // Slate 400
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },
  fallbackContainer: {
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    width: '100%',
  },
  fallbackText: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
});
