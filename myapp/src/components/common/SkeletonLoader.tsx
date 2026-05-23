import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';
import { wp, hp, rf } from '../../utils/responsive';
import { spacing } from '../../../theme/spacing';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: any;
}

export const SkeletonItem = ({ width = '100%', height = 20, borderRadius = 6, style }: SkeletonProps) => {
  const { isDark } = useTheme();
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.65, { duration: 1000 }),
        withTiming(0.35, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const backgroundColor = isDark ? 'rgba(77, 191, 110, 0.12)' : 'rgba(90, 156, 58, 0.15)';

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor,
        },
        animatedStyle,
        style,
      ]}
    />
  );
};

interface SkeletonLoaderProps {
  layout?: 'home' | 'profile' | 'details' | 'list' | 'generic';
}

export const SkeletonLoader = ({ layout = 'generic' }: SkeletonLoaderProps) => {
  const { colors, isDark } = useTheme();

  const renderHomeLayout = () => (
    <View style={styles.container}>
      {/* Header Skeleton */}
      <View style={styles.rowBetween}>
        <View>
          <SkeletonItem width={wp(50)} height={28} borderRadius={8} />
          <SkeletonItem width={wp(30)} height={16} borderRadius={6} style={{ marginTop: 8 }} />
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <SkeletonItem width={36} height={36} borderRadius={18} />
          <SkeletonItem width={48} height={28} borderRadius={14} />
          <SkeletonItem width={36} height={36} borderRadius={18} />
        </View>
      </View>

      {/* Mood Banner Placeholder */}
      <View style={[styles.cardPlaceholder, { backgroundColor: isDark ? 'rgba(13,27,11,0.5)' : 'rgba(240,247,232,0.5)', borderColor: colors.border }]}>
        <SkeletonItem width={wp(60)} height={22} borderRadius={6} style={{ alignSelf: 'center', marginBottom: 16 }} />
        <View style={[styles.rowAround, { marginTop: 10 }]}>
          <SkeletonItem width={44} height={44} borderRadius={22} />
          <SkeletonItem width={44} height={44} borderRadius={22} />
          <SkeletonItem width={44} height={44} borderRadius={22} />
          <SkeletonItem width={44} height={44} borderRadius={22} />
          <SkeletonItem width={44} height={44} borderRadius={22} />
        </View>
      </View>

      {/* Affirmation Card Placeholder */}
      <View style={[styles.cardPlaceholder, { backgroundColor: isDark ? 'rgba(13,27,11,0.5)' : 'rgba(240,247,232,0.5)', borderColor: colors.border }]}>
        <SkeletonItem width={wp(80)} height={50} borderRadius={12} style={{ alignSelf: 'center' }} />
      </View>

      {/* Grid Title */}
      <SkeletonItem width={wp(45)} height={20} borderRadius={6} style={{ marginLeft: 8, marginVertical: 16 }} />

      {/* Grid Cards Placeholder */}
      <View style={styles.grid}>
        <SkeletonItem width={(wp(90) - wp(4)) / 2} height={hp(14)} borderRadius={20} style={{ marginBottom: 16 }} />
        <SkeletonItem width={(wp(90) - wp(4)) / 2} height={hp(14)} borderRadius={20} style={{ marginBottom: 16 }} />
        <SkeletonItem width={(wp(90) - wp(4)) / 2} height={hp(14)} borderRadius={20} style={{ marginBottom: 16 }} />
        <SkeletonItem width={(wp(90) - wp(4)) / 2} height={hp(14)} borderRadius={20} style={{ marginBottom: 16 }} />
      </View>
    </View>
  );

  const renderProfileLayout = () => (
    <View style={styles.container}>
      {/* Header */}
      <View style={{ marginBottom: 20 }}>
        <SkeletonItem width={wp(60)} height={30} borderRadius={8} />
        <SkeletonItem width={wp(85)} height={16} borderRadius={6} style={{ marginTop: 8 }} />
      </View>

      {/* Form Fields */}
      <View style={[styles.cardPlaceholder, { backgroundColor: isDark ? 'rgba(13,27,11,0.5)' : 'rgba(240,247,232,0.5)', borderColor: colors.border, padding: spacing.lg }]}>
        <SkeletonItem width={wp(30)} height={14} borderRadius={4} style={{ marginBottom: 8 }} />
        <SkeletonItem width="100%" height={48} borderRadius={12} style={{ marginBottom: 16 }} />

        <SkeletonItem width={wp(30)} height={14} borderRadius={4} style={{ marginBottom: 8 }} />
        <SkeletonItem width="100%" height={80} borderRadius={12} style={{ marginBottom: 16 }} />

        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          <View style={{ flex: 1 }}>
            <SkeletonItem width={wp(20)} height={14} borderRadius={4} style={{ marginBottom: 8 }} />
            <SkeletonItem width="100%" height={48} borderRadius={12} />
          </View>
          <View style={{ flex: 1 }}>
            <SkeletonItem width={wp(20)} height={14} borderRadius={4} style={{ marginBottom: 8 }} />
            <SkeletonItem width="100%" height={48} borderRadius={12} />
          </View>
        </View>

        <SkeletonItem width="100%" height={52} borderRadius={26} style={{ marginTop: 12 }} />
      </View>
    </View>
  );

  const renderListLayout = () => (
    <View style={styles.container}>
      <SkeletonItem width={wp(55)} height={28} borderRadius={8} style={{ marginBottom: 24 }} />
      <SkeletonItem width="100%" height={80} borderRadius={16} style={{ marginBottom: 16 }} />
      <SkeletonItem width="100%" height={80} borderRadius={16} style={{ marginBottom: 16 }} />
      <SkeletonItem width="100%" height={80} borderRadius={16} style={{ marginBottom: 16 }} />
      <SkeletonItem width="100%" height={80} borderRadius={16} style={{ marginBottom: 16 }} />
    </View>
  );

  const renderGenericLayout = () => (
    <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', paddingTop: hp(15) }]}>
      <SkeletonItem width={80} height={80} borderRadius={40} style={{ marginBottom: 24 }} />
      <SkeletonItem width={wp(60)} height={24} borderRadius={8} style={{ marginBottom: 12 }} />
      <SkeletonItem width={wp(80)} height={16} borderRadius={6} style={{ marginBottom: 8 }} />
      <SkeletonItem width={wp(50)} height={16} borderRadius={6} />
    </View>
  );

  switch (layout) {
    case 'home':
      return renderHomeLayout();
    case 'profile':
    case 'details':
      return renderProfileLayout();
    case 'list':
      return renderListLayout();
    default:
      return renderGenericLayout();
  }
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: wp(5),
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(4),
  },
  rowAround: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  cardPlaceholder: {
    width: wp(90),
    alignSelf: 'center',
    borderRadius: 24,
    padding: hp(3),
    marginBottom: hp(3),
    borderWidth: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: wp(90),
    alignSelf: 'center',
    marginBottom: hp(3),
  },
});
