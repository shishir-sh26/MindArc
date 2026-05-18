import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// Only real-world photography assets — no AI-phone-mockup risk
const MORNING_BG = require('../../../assets/images/forest_morning_bg.png');
const LEAVES_LIGHT = require('../../../assets/images/forest_hanging_leaves_light.png');
const LEAVES_DARK = require('../../../assets/images/forest_hanging_leaves_dark.png');
const BOTTOM_PLANTS_LIGHT = require('../../../assets/images/forest_bottom_plants.png');
const BOTTOM_PLANTS_DARK = require('../../../assets/images/forest_bottom_plants_dark.png');

interface Props {
  bgHeightRatio?: number;
  showBottomPlants?: boolean;
}

export const ForestBackground = ({ bgHeightRatio = 0.42, showBottomPlants = true }: Props) => {
  const { isDark } = useTheme();

  // ---------- sway animation for hanging leaves ----------
  const swayX = useSharedValue(0);
  const swayY = useSharedValue(0);

  useEffect(() => {
    swayX.value = withRepeat(
      withTiming(6, { duration: 4200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    swayY.value = withRepeat(
      withTiming(4, { duration: 5800, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, []);

  const swayStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: swayX.value }, { translateY: swayY.value }],
  }));

  // ---------- slow drift for bottom plants ----------
  const plantDrift = useSharedValue(0);
  useEffect(() => {
    plantDrift.value = withRepeat(
      withTiming(-5, { duration: 6000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, []);
  const plantStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: plantDrift.value }],
  }));

  const bgH = SCREEN_H * bgHeightRatio;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">

      {/* ── Background: always the real morning forest photo ── */}
      <Image
        source={MORNING_BG}
        style={[styles.bgImage, { height: bgH }]}
        resizeMode="cover"
      />

      {/*
        ── Dark mode: stack colour overlays on top of the photo
           to create a realistic forest-at-night effect without
           using any AI-generated image that might contain phone frames.
        ──────────────────────────────────────────────────────── */}
      {isDark && (
        <>
          {/* Deep black tint — makes the forest fade into black */}
          <View
            style={[
              styles.bgImage,
              {
                height: bgH,
                backgroundColor: '#000000',
                opacity: 0.85,
              },
            ]}
          />
          {/* Cool dark teal/blue vignette layer — moonlight feel */}
          <View
            style={[
              styles.bgImage,
              {
                height: bgH,
                backgroundColor: '#05101A',
                opacity: 0.20,
              },
            ]}
          />
          {/* Bioluminescent cyan glow at the very bottom of the image */}
          <View
            style={{
              position: 'absolute',
              bottom: SCREEN_H - bgH,
              left: 0,
              width: SCREEN_W,
              height: bgH * 0.25,
              backgroundColor: '#00FFB0',
              opacity: 0.04,
            }}
          />
        </>
      )}

      {/* ── Fade overlay: blends the image into the app background ── */}
      <View
        style={[
          styles.gradientOverlay,
          {
            height: bgH * 0.55,
            top: bgH * 0.45,
            backgroundColor: isDark ? '#000000' : '#F0F7E8',
          },
        ]}
      />

      {/* ── Hanging leaves top-left ── */}
      <Animated.Image
        source={isDark ? LEAVES_DARK : LEAVES_LIGHT}
        style={[styles.hangingLeavesLeft, swayStyle]}
        resizeMode="contain"
      />

      {/* ── Hanging leaves top-right (mirrored) ── */}
      <Animated.Image
        source={isDark ? LEAVES_DARK : LEAVES_LIGHT}
        style={[styles.hangingLeavesRight, swayStyle]}
        resizeMode="contain"
      />

      {/* ── Bottom plants ── */}
      {showBottomPlants && (
        <Animated.Image
          source={isDark ? BOTTOM_PLANTS_DARK : BOTTOM_PLANTS_LIGHT}
          style={[styles.bottomPlants, plantStyle, { opacity: isDark ? 0.90 : 0.7 }]}
          resizeMode="cover"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  bgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_W,
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    width: SCREEN_W,
    opacity: 0.96,
  },
  hangingLeavesLeft: {
    position: 'absolute',
    top: -30,
    left: -40,
    width: SCREEN_W * 0.55,
    height: SCREEN_H * 0.30,
    opacity: 0.92,
  },
  hangingLeavesRight: {
    position: 'absolute',
    top: -30,
    right: -40,
    width: SCREEN_W * 0.55,
    height: SCREEN_H * 0.30,
    opacity: 0.92,
    transform: [{ scaleX: -1 }],
  },
  bottomPlants: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: SCREEN_W,
    height: 140,
  },
});
