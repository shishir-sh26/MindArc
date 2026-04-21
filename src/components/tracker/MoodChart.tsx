import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableWithoutFeedback } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing, withSpring } from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { hp, wp } from '../../utils/responsive';
import * as HapticsAPI from 'expo-haptics';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface MoodChartProps {
  data: number[]; 
}

export const MoodChart = ({ data }: MoodChartProps) => {
  const { colors } = useTheme();
  const [tooltip, setTooltip] = useState<{ x: number, y: number, val: number } | null>(null);
  
  if (!data || data.length === 0) {
    return <View style={styles.empty}><Text style={{ color: colors.textMuted }}>No data to display</Text></View>;
  }

  const width = wp(80);
  const height = hp(20);
  
  const displayData = [...Array(Math.max(0, 7 - data.length)).fill(null), ...data].slice(-7);
  
  const stepX = width / 6;
  const stepY = height / 4;

  const points: {x: number, y: number, val: number}[] = [];

  displayData.forEach((val, index) => {
    if (val === null) return;
    const x = index * stepX;
    const y = height - ((val - 1) * stepY);
    points.push({ x, y, val });
  });

  // Build curved path (Catmull-Rom or simple Bezier)
  let pathData = '';
  if (points.length > 0) {
    pathData = `M ${points[0].x} ${points[0].y} `;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = i === 0 ? points[0] : points[i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = i + 2 < points.length ? points[i + 2] : p2;

      // Cubic hermite spline setup with simple tension
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      pathData += `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y} `;
    }
  }

  const areaPath = points.length > 0 
    ? `${pathData} L ${points[points.length-1].x} ${height} L ${points[0].x} ${height} Z`
    : '';

  const pathLength = 1000;
  const progress = useSharedValue(pathLength);
  const pointScale = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.cubic) });
    pointScale.value = withDelay(1200, withSpring(1, { damping: 12 }));
  }, []);

  const animatedPathStyle = useAnimatedStyle(() => ({
    strokeDashoffset: progress.value
  }));

  const animatedPointStyle = useAnimatedStyle(() => ({
    r: pointScale.value * 4,
    strokeWidth: pointScale.value * 2
  }));

  return (
    <View style={styles.container}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.accent} stopOpacity="0.4" />
            <Stop offset="1" stopColor={colors.accent} stopOpacity="0.0" />
          </LinearGradient>
        </Defs>

        {points.length > 0 && <Path d={areaPath} fill="url(#grad)" />}
        {points.length > 0 && 
          <AnimatedPath 
            d={pathData} 
            stroke={colors.accent} 
            strokeWidth="3" 
            fill="none" 
            strokeDasharray={pathLength}
            animatedProps={animatedPathStyle}
          />
        }

        {points.map((p, i) => (
          <AnimatedCircle 
            key={i} 
            cx={p.x} 
            cy={p.y} 
            fill={colors.background} 
            stroke={colors.accent} 
            animatedProps={animatedPointStyle}
            onPress={() => {
              HapticsAPI.impactAsync(HapticsAPI.ImpactFeedbackStyle.Light);
              setTooltip(tooltip?.x === p.x ? null : p);
            }}
          />
        ))}
      </Svg>

      {/* Basic manual invisible touch targets for the points */}
      {points.map((p, i) => (
        <TouchableWithoutFeedback 
          key={`touch-${i}`}
          onPress={() => {
            HapticsAPI.impactAsync(HapticsAPI.ImpactFeedbackStyle.Light);
            setTooltip(tooltip?.x === p.x ? null : p);
          }}
        >
          <View style={{ position: 'absolute', left: p.x - 15, top: p.y - 15, width: 30, height: 30, zIndex: 10 }} />
        </TouchableWithoutFeedback>
      ))}

      {tooltip && (
        <View style={[styles.tooltip, { left: tooltip.x - 30, top: tooltip.y - 45, backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
          <Text style={[styles.tooltipText, { color: colors.text }]}>Mood: {tooltip.val}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: hp(2),
    position: 'relative'
  },
  empty: {
    height: hp(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltip: {
    position: 'absolute',
    padding: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 20
  },
  tooltipText: {
    fontFamily: typography.mono,
    fontSize: 12
  }
});
