import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TouchableWithoutFeedback, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';
import { getGreeting } from '../../utils/dateHelpers';
import { AFFIRMATIONS } from '../../utils/constants';
import { useMoodStore } from '../../store/moodStore';
import { spacing, radii } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { wp, hp, rf } from '../../utils/responsive';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { BottomTabParamList, RootStackParamList } from '../../navigation/types';
import { CompositeScreenProps, useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, withDelay, Easing, runOnJS } from 'react-native-reanimated';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import * as HapticsAPI from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import YoutubeIframe from 'react-native-youtube-iframe';
import { yogaContent } from '../../data/yogaContent';
import { ForestBackground } from '../../components/common/ForestBackground';
import { SettingsModal } from '../../components/common/SettingsModal';

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
  const { t } = useTranslation();
  const { colors, isDark, toggleTheme } = useTheme();
  const { entries, streak, addEntry } = useMoodStore();
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  
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
          date: today,
          moodLevel: val,
          symptoms: [],
          sleepHours: 7,
          sleepQuality: 'okay'
        });
      }
    });
  };

  const shadowColor = isDark ? '#4DBF7A' : '#3A6E20';

  return (
    <View style={[styles.outerContainer, { backgroundColor: colors.background }]}>
      <ForestBackground bgHeightRatio={0.42} showBottomPlants />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: hp(16) }]}
        showsVerticalScrollIndicator={false}
      >
      <AnimatedView style={[styles.header, headerAnimatedStyle]}>
        <View style={styles.headerLeft}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.greeting, { color: colors.text }]}>{t('home.greeting', { time: greeting })} {t('home.friend')}</Text>
            {/* Tiny botanical SVG */}
            <Svg width="24" height="24" viewBox="0 0 24 24" style={{ marginLeft: 8 }}>
              <Path d="M12 22V10M12 10C8 10 4 14 4 14C4 14 8 18 12 18M12 10C16 10 20 6 20 6C20 6 16 2 12 2" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </Svg>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <TouchableOpacity
            style={[styles.profileBtn, { paddingHorizontal: wp(2.5), backgroundColor: isDark ? 'rgba(17,30,15,0.85)' : 'rgba(232,242,220,0.85)', borderColor: colors.border }]}
            onPress={toggleTheme}
          >
            <Text style={{ fontSize: rf(14) }}>{isDark ? '🌙' : '🌿'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.profileBtn, { backgroundColor: isDark ? 'rgba(17,30,15,0.85)' : 'rgba(232,242,220,0.85)', borderColor: colors.border }]}
            onPress={() => navigation.navigate('TrackerHistory')}
          >
            <Text style={{ fontFamily: typography.mono, fontSize: rf(12), color: colors.accent }}>{streak} 🔥</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.profileBtn, { paddingHorizontal: wp(2.5), backgroundColor: isDark ? 'rgba(17,30,15,0.85)' : 'rgba(232,242,220,0.85)', borderColor: colors.border }]}
            onPress={() => setShowSettings(true)}
          >
            <Ionicons name="menu-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </AnimatedView>

      {/* Mood Banner */}
      {!todaysMood && (
        <AnimatedView style={[styles.moodBanner, { backgroundColor: isDark ? 'rgba(13,27,11,0.90)' : 'rgba(240,247,232,0.90)', borderColor: colors.border }, moodBannerStyle]}>
          <Text style={[styles.moodTitle, { color: colors.text }]}>🌿 {t('home.howAreYou')}</Text>
          <View style={styles.emojiContainer}>
            {MOODS.map(m => (
              <EmojiButton key={m.value} emoji={m.emoji} onPress={() => handleMoodSelect(m.value)} />
            ))}
          </View>
        </AnimatedView>
      )}

      {/* Daily Affirmation Card */}
      <View style={[styles.affirmationCard, { backgroundColor: isDark ? 'rgba(13,27,11,0.88)' : 'rgba(240,247,232,0.88)', borderColor: colors.border, shadowColor }]}>
        <Text style={[styles.quoteGlyph, { color: colors.accent, opacity: 0.25 }]}>&quot;</Text>
        <Text style={[styles.affirmationText, { color: colors.text }]}>{dailyAffirmation}</Text>
      </View>

      {/* Feature Sections */}
      <View style={{ marginBottom: hp(4) }}>
        
        <SectionTitle title={t('home.relaxationCalming')} color={colors.text} />
        <View style={styles.grid}>
          <GridCard 
            title={t('home.breathing')} subtitle={t('home.guidedExercises')} 
            colorLight={colors.calmLight} colorDark={colors.calm} delay={0} 
            onPress={() => { HapticsAPI.impactAsync(HapticsAPI.ImpactFeedbackStyle.Light); navigation.navigate('Breathing'); }}
            icon={<Svg width="40" height="40" viewBox="0 0 24 24" fill="none"><Path d="M12 4C7.58 4 4 7.58 4 12c0 4.42 3.58 8 8 8s8-3.58 8-8c0-4.42-3.58-8-8-8zm-1 12.5v-3H9v-3h2V8.5h2v2h2v3h-2v3h-2z" fill={isDark ? colors.text : colors.calm} /></Svg>}
          />
          <GridCard 
            title={t('home.natureSounds')} subtitle={t('home.calmMind')} 
            colorLight={colors.calmLight} colorDark={colors.calm} delay={30} 
            onPress={() => { HapticsAPI.impactAsync(HapticsAPI.ImpactFeedbackStyle.Light); navigation.navigate('NatureSounds'); }}
            icon={<Svg width="40" height="40" viewBox="0 0 24 24" fill="none"><Path d="M9 18V5l12-2v13" stroke={isDark ? colors.text : colors.calm} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><Circle cx="6" cy="18" r="3" fill={isDark ? colors.text : colors.calm}/><Circle cx="18" cy="16" r="3" fill={isDark ? colors.text : colors.calm}/></Svg>}
          />
          <GridCard 
            title={t('home.relaxHub')} subtitle={t('home.allRelaxingTools')} 
            colorLight={colors.calmLight} colorDark={colors.calm} delay={60} 
            onPress={() => { HapticsAPI.impactAsync(HapticsAPI.ImpactFeedbackStyle.Light); navigation.navigate('Relax'); }}
            icon={<Svg width="40" height="40" viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="12" r="9" stroke={isDark ? colors.text : colors.calm} strokeWidth="2" strokeDasharray="4 4" /></Svg>}
          />
        </View>

        <SectionTitle title={t('home.trackingJournaling')} color={colors.text} />
        <View style={styles.grid}>
          <GridCard 
            title={t('home.thoughtDiary')} subtitle={t('home.logThoughts')}
            colorLight={colors.reflectLight} colorDark={colors.reflect} delay={90} 
            onPress={() => { HapticsAPI.impactAsync(HapticsAPI.ImpactFeedbackStyle.Light); navigation.navigate('ThoughtDiary'); }}
            icon={<Svg width="40" height="40" viewBox="0 0 24 24" fill="none"><Path d="M21 11c0 5.523-4.477 10-10 10S1 16.523 1 11 5.477 1 11 1c1.23 0 2.408.223 3.5.626-2.115 1.704-3.5 4.312-3.5 7.374 0 3.062 1.385 5.67 3.5 7.374A9.957 9.957 0 0021 11z" fill={isDark ? colors.text : colors.reflect} /></Svg>}
          />
          <GridCard 
            title={t('home.dailyCheckIn')} subtitle={t('home.trackMood')} 
            colorLight={colors.reflectLight} colorDark={colors.reflect} delay={120} 
            onPress={() => { HapticsAPI.impactAsync(HapticsAPI.ImpactFeedbackStyle.Light); navigation.navigate('NewThoughtEntry'); }}
            icon={<Svg width="40" height="40" viewBox="0 0 24 24" fill="none"><Path d="M12 4v16M4 12h16" stroke={isDark ? colors.text : colors.reflect} strokeWidth="2" strokeLinecap="round" /></Svg>}
          />
          <GridCard 
            title={t('tracker.history')} subtitle={t('tracker.viewTrends')} 
            colorLight={colors.reflectLight} colorDark={colors.reflect} delay={150} 
            onPress={() => { HapticsAPI.impactAsync(HapticsAPI.ImpactFeedbackStyle.Light); navigation.navigate('TrackerHistory'); }}
            icon={<Svg width="40" height="40" viewBox="0 0 24 24" fill="none"><Path d="M4 20h16M6 16v4M12 10v10M18 4v16" stroke={isDark ? colors.text : colors.reflect} strokeWidth="2" strokeLinecap="round" /></Svg>}
          />
          <GridCard 
            title={t('tracker.hub')} subtitle={t('tracker.allTools')} 
            colorLight={colors.reflectLight} colorDark={colors.reflect} delay={180} 
            onPress={() => { HapticsAPI.impactAsync(HapticsAPI.ImpactFeedbackStyle.Light); navigation.navigate('Track'); }}
            icon={<Svg width="40" height="40" viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="12" r="8" stroke={isDark ? colors.text : colors.reflect} strokeWidth="2"/><Path d="M12 4v8l4 4" stroke={isDark ? colors.text : colors.reflect} strokeWidth="2" strokeLinecap="round"/></Svg>}
          />
        </View>

        <SectionTitle title={t('home.yogaMovement')} color={colors.text} />
        
        {yogaContent.slice(0, 2).map(yoga => (
          <View 
            key={yoga.id} 
            style={[styles.yogaCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            {activeVideoId === yoga.id ? (
              <View style={{ width: '100%' }}>
                <YoutubeIframe
                  height={220}
                  videoId={yoga.videoId}
                  play={true}
                />
                <TouchableOpacity onPress={() => setActiveVideoId(null)} style={{ padding: spacing.sm, alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border }}>
                  <Text style={{ color: colors.accent, fontWeight: '600' }}>{t('activity.closeVideo')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}
                onPress={() => setActiveVideoId(yoga.id)}
              >
                <Image source={{ uri: yoga.thumbnailUrl }} style={styles.yogaThumb} />
                <View style={styles.yogaInfo}>
                  <Text style={[styles.yogaTitle, { color: colors.text }]}>{yoga.title}</Text>
                  <View style={{ flexDirection: 'row', gap: 4 }}>
                    <Text style={[styles.yogaBadge, { backgroundColor: colors.surfaceAlt, color: colors.textMuted }]}>
                      {yoga.duration}
                    </Text>
                    <Text style={[styles.yogaBadge, { backgroundColor: colors.surfaceAlt, color: colors.textMuted }]}>
                      {yoga.level}
                    </Text>
                  </View>
                </View>
                <Ionicons name="play-circle" size={32} color={colors.accent} style={{ padding: spacing.sm }} />
              </TouchableOpacity>
            )}
          </View>
        ))}

        <TouchableOpacity 
          style={[styles.moreActivityBtn, { borderColor: colors.border, backgroundColor: colors.surface }]} 
          onPress={() => { HapticsAPI.impactAsync(HapticsAPI.ImpactFeedbackStyle.Light); navigation.navigate('Activity'); }}
        >
          <Text style={{ color: colors.text, fontWeight: '600' }}>{t('home.moreActivities')}</Text>
          <Ionicons name="arrow-forward" size={20} color={colors.text} />
        </TouchableOpacity>

        <SectionTitle title={t('home.educationSupport')} color={colors.text} />
        <View style={styles.grid}>
          <GridCard 
            title={t('home.learn')} subtitle={t('home.mentalWellness')} 
            colorLight={colors.learnLight} colorDark={colors.learn} delay={240} 
            onPress={() => { HapticsAPI.impactAsync(HapticsAPI.ImpactFeedbackStyle.Light); navigation.navigate('Learn'); }}
            icon={<Svg width="40" height="40" viewBox="0 0 24 24" fill="none"><Path d="M12 14.5l-9-4 9-4 9 4-9 4z" fill={isDark ? colors.text : colors.learn} /><Path d="M12 17.5l-9-4v-4l9 4 9-4v4l-9 4z" fill={isDark ? colors.text : colors.learn} opacity={0.6}/><Path d="M12 20.5l-9-4v-4l9 4 9-4v4l-9 4z" fill={isDark ? colors.text : colors.learn} opacity={0.3}/></Svg>}
          />
          <GridCard 
            title={t('home.crisisSupport')} subtitle={t('home.getHelpNow')} 
            colorLight={colors.danger + '22'} colorDark={colors.danger} delay={270} 
            onPress={() => { HapticsAPI.impactAsync(HapticsAPI.ImpactFeedbackStyle.Light); navigation.navigate('Crisis'); }}
            icon={<Svg width="40" height="40" viewBox="0 0 24 24" fill="none"><Path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke={isDark ? '#F87171' : colors.danger} strokeWidth="2"/><Path d="M12 8v4" stroke={isDark ? '#F87171' : colors.danger} strokeWidth="2" strokeLinecap="round"/><Circle cx="12" cy="16" r="1.5" fill={isDark ? '#F87171' : colors.danger}/></Svg>}
          />
        </View>

      </View>
      </ScrollView>
      <SettingsModal visible={showSettings} onClose={() => setShowSettings(false)} />
    </View>
  );
}

// Subcomponents

const SectionTitle = ({ title, color }: { title: string, color: string }) => (
  <Text style={{ fontFamily: typography.display, fontSize: rf(18), fontWeight: '600', color: color, marginBottom: hp(1.5), marginLeft: wp(2), marginTop: hp(2) }}>
    {title}
  </Text>
);

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
  const { colors, isDark } = useTheme();

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 500 }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }]
  }));

  const textColor = isDark ? colors.text : colorDark;
  const subTextColor = isDark ? colors.textMuted : colorDark;

  return (
    <TouchableWithoutFeedback
      onPressIn={() => { scale.value = withSpring(0.97, { damping: 15, stiffness: 200 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 200 }); }}
      onPress={onPress}
    >
      <AnimatedView style={[styles.gridItem, { backgroundColor: colorLight }, animatedStyle]}>
        <View style={styles.iconWrapper}>{icon}</View>
        <Text style={[styles.gridTitle, { color: textColor }]}>{title}</Text>
        <Text style={[styles.gridSub, { color: subTextColor, opacity: isDark ? 1 : 0.8 }]}>{subtitle}</Text>
      </AnimatedView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    position: 'relative',
  },
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
    fontWeight: '800',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  profileBtn: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.8),
    borderRadius: radii.pill,
    borderWidth: 1,
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
    fontSize: rf(22),
    fontWeight: '800',
    marginBottom: hp(2),
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
    fontSize: rf(20),
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: rf(28),
    marginTop: hp(1),
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
    shadowColor: '#3A6E20',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 4,
  },
  iconWrapper: {
    marginBottom: hp(1.5),
  },
  gridTitle: {
    fontFamily: typography.label,
    fontSize: rf(14),
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  gridSub: {
    fontFamily: typography.body,
    fontSize: rf(14),
    fontWeight: '600',
    marginTop: 4,
  },
  yogaCard: {
    flexDirection: 'column',
    alignItems: 'stretch',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: hp(2),
    width: wp(90),
    alignSelf: 'center',
  },
  yogaThumb: { width: 100, height: 100 },
  yogaInfo: { flex: 1, padding: spacing.md },
  yogaTitle: { fontSize: rf(16), fontWeight: '800', marginBottom: spacing.sm },
  yogaBadge: { fontSize: rf(11), paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, overflow: 'hidden' },
  moreActivityBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: wp(90),
    alignSelf: 'center',
    padding: hp(2),
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: hp(2),
  }
});
