import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { getGreeting } from '../../utils/dateHelpers';
import { AFFIRMATIONS } from '../../utils/constants';
import { useMoodStore } from '../../store/moodStore';
import { spacing, radii } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { wp, hp, rf } from '../../utils/responsive';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { BottomTabParamList, RootStackParamList } from '../../navigation/types';
import { CompositeScreenProps, useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, withDelay, Easing, runOnJS } from 'react-native-reanimated';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Haptics } from 'expo-haptics'; // Will require installing but we can omit if not strictly imported or just ignore till later, wait, prompt says "Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)". I'll import from expo-haptics
import * as HapticsAPI from 'expo-haptics';

type Props = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedView = Animated.createAnimatedComponent(View);

// Emojis for mood
const MOODS = [
  { value: 1, emoji: '😔' },
  { value: 2, emoji: '😟' },
  { value: 3, emoji: '😐' },
  { value: 4, emoji: '🙂' },
  { value: 5, emoji: '😊' },
];

export default function HomeScreen({ navigation }: Props) {
  const { colors, toggleTheme } = useTheme();
  const { entries, streak, addEntry } = useMoodStore();
  
  const today = new Date().toISOString().split('T')[0];
  const todaysMood = entries.find(e => e.date === today);
  
  // Affirmation based on day of year
  const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
  const dailyAffirmation = AFFIRMATIONS[dayOfYear % AFFIRMATIONS.length];
  const greeting = getGreeting();

  // Entrance animations
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(20);
  
  const moodOpacity = useSharedValue(1);
  const moodTranslateY = useSharedValue(0);
  
  const cardScale = useSharedValue(1);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    headerTranslateY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) });
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }]
  }));

  const moodBannerStyle = useAnimatedStyle(() => ({
    opacity: moodOpacity.value,
    transform: [{ translateY: moodTranslateY.value }]
  }));

  const handleMoodSelect = (val: number) => {
    HapticsAPI.impactAsync(HapticsAPI.ImpactFeedbackStyle.Light);
    
    // Animate out banner
    moodOpacity.value = withTiming(0, { duration: 400 });
    moodTranslateY.value = withTiming(-20, { duration: 400 }, (finished) => {
      if (finished) {
        runOnJS(addEntry)({
          id: Date.now().toString(),
          date: today,
          moodScore: val,
          symptoms: [],
          sleepHours: 7,
          notes: ''
        });
      }
    });
  };

  // Past 7 days calculation
  const past7Days = Array.from({length: 7}).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dStr = d.toISOString().split('T')[0];
    const entry = entries.find(e => e.date === dStr);
    return entry ? entry.moodScore : null;
  });

  const getMoodColor = (score: number | null) => {
    if (!score) return colors.borderLight;
    if (score >= 4) return colors.success;
    if (score === 3) return colors.warning;
    return colors.danger;
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={[styles.content, { paddingBottom: hp(12), backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <AnimatedView style={[styles.header, headerAnimatedStyle]}>
        <View style={styles.headerLeft}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.greeting, { color: colors.text }]}>good morning, friend</Text>
            {/* Tiny botanical SVG */}
            <Svg width="24" height="24" viewBox="0 0 24 24" style={{ marginLeft: 8 }}>
              <Path d="M12 22V10M12 10C8 10 4 14 4 14C4 14 8 18 12 18M12 10C16 10 20 6 20 6C20 6 16 2 12 2" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </Svg>
          </View>
          <Text style={[styles.subtext, { color: colors.textMuted }]}>{dailyAffirmation}</Text>
        </View>
        <TouchableOpacity style={styles.profileBtn} onPress={toggleTheme}>
          <Text style={{ fontFamily: typography.mono, fontSize: rf(12), color: colors.accentDeep }}>{streak} 🔥</Text>
        </TouchableOpacity>
      </AnimatedView>

      {/* Mood Banner */}
      {!todaysMood && (
        <AnimatedView style={[styles.moodBanner, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }, moodBannerStyle]}>
          <Text style={[styles.moodTitle, { color: colors.text }]}>how are you feeling today?</Text>
          <View style={styles.emojiContainer}>
            {MOODS.map(m => (
              <EmojiButton key={m.value} emoji={m.emoji} onPress={() => handleMoodSelect(m.value)} />
            ))}
          </View>
        </AnimatedView>
      )}

      {/* Daily Affirmation Card */}
      <View style={[styles.affirmationCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.borderLight }]}>
        <Text style={[styles.quoteGlyph, { color: colors.accentSoft }]}>"</Text>
        <Text style={[styles.affirmationText, { color: colors.text }]}>{dailyAffirmation}</Text>
      </View>

      {/* Quick Access Grid */}
      <View style={styles.grid}>
        <GridCard 
          title="Breathe" 
          subtitle="take a mindful pause" 
          colorLight={colors.calmLight} 
          colorDark={colors.calm} 
          delay={0}
          onPress={() => {
            HapticsAPI.impactAsync(HapticsAPI.ImpactFeedbackStyle.Light);
            navigation.navigate('Relax');
          }}
          icon={
            <Svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <Path d="M12 4C7.58 4 4 7.58 4 12c0 4.42 3.58 8 8 8s8-3.58 8-8c0-4.42-3.58-8-8-8zm-1 12.5v-3H9v-3h2V8.5h2v2h2v3h-2v3h-2z" fill={colors.calm} />
            </Svg>
          }
        />
        <GridCard 
          title="Reflect" 
          subtitle="capture your thoughts" 
          colorLight={colors.reflectLight} 
          colorDark={colors.reflect} 
          delay={60}
          onPress={() => {
            HapticsAPI.impactAsync(HapticsAPI.ImpactFeedbackStyle.Light);
            navigation.navigate('ThoughtDiary');
          }}
          icon={
            <Svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <Path d="M21 11c0 5.523-4.477 10-10 10S1 16.523 1 11 5.477 1 11 1c1.23 0 2.408.223 3.5.626-2.115 1.704-3.5 4.312-3.5 7.374 0 3.062 1.385 5.67 3.5 7.374A9.957 9.957 0 0021 11z" fill={colors.reflect} />
            </Svg>
          }
        />
        <GridCard 
          title="Move" 
          subtitle="stretch & flow" 
          colorLight={colors.upliftLight} 
          colorDark={colors.uplift} 
          delay={120}
          onPress={() => {
            HapticsAPI.impactAsync(HapticsAPI.ImpactFeedbackStyle.Light);
            navigation.navigate('Activity');
          }}
          icon={
            <Svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <Circle cx="12" cy="12" r="5" fill={colors.uplift} />
              <Path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" stroke={colors.uplift} strokeWidth="2" strokeLinecap="round" />
            </Svg>
          }
        />
        <GridCard 
          title="Learn" 
          subtitle="mental wellness tools" 
          colorLight={colors.learnLight} 
          colorDark={colors.learn} 
          delay={180}
          onPress={() => {
            HapticsAPI.impactAsync(HapticsAPI.ImpactFeedbackStyle.Light);
            navigation.navigate('Learn');
          }}
          icon={
            <Svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <Path d="M12 14.5l-9-4 9-4 9 4-9 4z" fill={colors.learn} />
              <Path d="M12 17.5l-9-4v-4l9 4 9-4v4l-9 4z" fill={colors.learn} opacity={0.6}/>
              <Path d="M12 20.5l-9-4v-4l9 4 9-4v4l-9 4z" fill={colors.learn} opacity={0.3}/>
            </Svg>
          }
        />
      </View>

      {/* Streak + Progress Row */}
      <TouchableOpacity 
        style={[styles.progressRow, { backgroundColor: colors.surface }]}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('TrackerHistory')}
      >
        <View style={styles.streakInfo}>
          <Text style={[styles.streakCount, { color: colors.text }]}>{streak} day streak</Text>
          <Text style={[styles.streakSub, { color: colors.textMuted }]}>Weekly Mood</Text>
        </View>
        <View style={styles.dotsContainer}>
          {past7Days.map((score, i) => (
            <View key={i} style={[styles.dot, { backgroundColor: getMoodColor(score) }]} />
          ))}
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

// Subcomponents

const EmojiButton = ({ emoji, onPress }: { emoji: string, onPress: () => void }) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  
  return (
    <TouchableWithoutFeedback
      onPressIn={() => { scale.value = withSpring(0.85); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      onPress={onPress}
    >
      <AnimatedView style={[styles.emojiOuter, animatedStyle]}>
        <Text style={styles.emojiText}>{emoji}</Text>
      </AnimatedView>
    </TouchableWithoutFeedback>
  );
};

const GridCard = ({ title, subtitle, colorLight, colorDark, icon, delay, onPress }: { title: string, subtitle: string, colorLight: string, colorDark: string, icon: React.ReactNode, delay: number, onPress: () => void }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 500 }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }]
  }));

  return (
    <TouchableWithoutFeedback
      onPressIn={() => { scale.value = withSpring(0.97, { damping: 15, stiffness: 200 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 200 }); }}
      onPress={onPress}
    >
      <AnimatedView style={[styles.gridItem, { backgroundColor: colorLight }, animatedStyle]}>
        <View style={styles.iconWrapper}>{icon}</View>
        <Text style={[styles.gridTitle, { color: colorDark }]}>{title}</Text>
        <Text style={[styles.gridSub, { color: colorDark, opacity: 0.8 }]}>{subtitle}</Text>
      </AnimatedView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: wp(5),
    paddingTop: hp(8),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(4),
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontFamily: typography.display,
    fontSize: rf(30),
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  subtext: {
    fontFamily: typography.body,
    fontStyle: 'italic',
    fontSize: rf(16),
    marginTop: 4,
  },
  profileBtn: {
    backgroundColor: '#F5EFE7',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.8),
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: '#E8DDD3',
  },
  moodBanner: {
    width: wp(90),
    alignSelf: 'center',
    borderRadius: 24,
    padding: hp(3),
    marginBottom: hp(3),
    borderWidth: 1,
    shadowColor: '#C4A882',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
  },
  moodTitle: {
    fontFamily: typography.display,
    fontSize: rf(20),
    fontWeight: '500',
    marginBottom: hp(2),
    textAlign: 'center',
  },
  emojiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  emojiOuter: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiText: {
    fontSize: rf(28),
  },
  affirmationCard: {
    width: wp(90),
    alignSelf: 'center',
    padding: hp(3),
    paddingVertical: hp(4),
    borderRadius: 24,
    marginBottom: hp(3),
    borderWidth: 1,
    position: 'relative',
    shadowColor: '#C4A882',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
  },
  quoteGlyph: {
    fontFamily: typography.display,
    fontSize: rf(72),
    position: 'absolute',
    top: -rf(16),
    left: wp(4),
    opacity: 0.2,
  },
  affirmationText: {
    fontFamily: typography.display,
    fontStyle: 'italic',
    fontSize: rf(18),
    textAlign: 'center',
    lineHeight: rf(24),
    marginTop: hp(1),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: wp(90),
    alignSelf: 'center',
    marginBottom: hp(3),
  },
  gridItem: {
    width: (wp(90) - wp(4)) / 2, // 2 columns with spacing
    borderRadius: 20,
    padding: hp(2.5),
    marginBottom: wp(4),
    shadowColor: '#C4A882',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
  },
  iconWrapper: {
    marginBottom: hp(1.5),
  },
  gridTitle: {
    fontFamily: typography.label,
    fontSize: rf(13),
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  gridSub: {
    fontFamily: typography.body,
    fontSize: rf(13),
    marginTop: 4,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: wp(90),
    alignSelf: 'center',
    borderRadius: 20,
    padding: hp(2.5),
    shadowColor: '#C4A882',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
  },
  streakInfo: {
    flex: 1,
  },
  streakCount: {
    fontFamily: typography.mono,
    fontSize: rf(15),
    fontWeight: '600',
  },
  streakSub: {
    fontFamily: typography.label,
    fontSize: rf(12),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  }
});
