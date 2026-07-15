import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  runOnJS 
} from 'react-native-reanimated';

interface TouchEvent {
  x: number;
  y: number;
  id: number;
}

function GlowParticle({ glow, onFinished }: { glow: TouchEvent; onFinished: () => void }) {
  const scale = useSharedValue(0.1);
  const opacity = useSharedValue(0.7);

  React.useEffect(() => {
    scale.value = withTiming(2.2, { duration: 400 });
    opacity.value = withTiming(0, { duration: 400 }, (finished) => {
      if (finished) {
        runOnJS(onFinished)();
      }
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.glowCircle,
        {
          left: glow.x - 30, // center the 60x60 circle at the touch point
          top: glow.y - 30,
        },
        animatedStyle,
      ]}
    />
  );
}

export function TouchGlowOverlay({ children }: { children: React.ReactNode }) {
  const [glows, setGlows] = useState<TouchEvent[]>([]);

  const handleTouch = (e: any) => {
    const touch = e.nativeEvent.touches && e.nativeEvent.touches[0];
    if (!touch) return;
    
    const { pageX, pageY } = touch;
    const newGlow: TouchEvent = {
      x: pageX,
      y: pageY,
      id: Date.now() + Math.random(),
    };
    
    // Limit to max 3 concurrent glows
    setGlows(prev => [...prev.slice(-2), newGlow]);
  };

  const removeGlow = (id: number) => {
    setGlows(prev => prev.filter(g => g.id !== id));
  };

  return (
    <View 
      style={{ flex: 1 }} 
      onTouchStart={handleTouch}
    >
      {children}
      {glows.map((glow) => (
        <GlowParticle 
          key={glow.id} 
          glow={glow} 
          onFinished={() => removeGlow(glow.id)} 
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  glowCircle: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(77, 191, 122, 0.45)', // Botanical green glow
    shadowColor: '#4DDF82',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 18,
    elevation: 8,
    zIndex: 99999, // Render on top of everything
  },
});
