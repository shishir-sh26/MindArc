import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { spacing, radii } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { wp, hp, rf } from '../../utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, withSequence, Easing } from 'react-native-reanimated';
import { HapticFeedback } from '../../utils/HapticFeedback';
import * as Haptics from 'expo-haptics';
import Svg, { Circle, Path } from 'react-native-svg';

const AnimatedBreathingBox = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);
  const rotation = useSharedValue(0);
  const [phase, setPhase] = useState('Inhale');

  useEffect(() => {
    let active = true;
    const runCycle = () => {
      if (!active) return;
      setPhase('Inhale');
      HapticFeedback.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
      scale.value = withTiming(1.8, { duration: 4000, easing: Easing.inOut(Easing.quad) });
      opacity.value = withTiming(1, { duration: 4000 });
      rotation.value = withTiming(45, { duration: 4000 });

      setTimeout(() => {
        if (!active) return;
        setPhase('Hold');
        HapticFeedback.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        
        setTimeout(() => {
          if (!active) return;
          setPhase('Exhale');
          HapticFeedback.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
          scale.value = withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.quad) });
          opacity.value = withTiming(0.6, { duration: 4000 });
          rotation.value = withTiming(0, { duration: 4000 });

          setTimeout(() => {
            if (!active) return;
            setPhase('Rest');
            HapticFeedback.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            
            setTimeout(runCycle, 4000);
          }, 4000);
        }, 4000);
      }, 4000);
    };

    runCycle();
    return () => { active = false; };
  }, []);

  const boxStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
    opacity: opacity.value,
  }));

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: 120, height: 120 }}>
      <Animated.View style={[
        {
          width: 60,
          height: 60,
          borderRadius: 8,
          borderWidth: 3,
          borderColor: colors.accent,
          alignItems: 'center',
          justifyContent: 'center',
        },
        boxStyle
      ]}>
        <Text style={{
            fontSize: rf(11),
            color: colors.text,
            fontFamily: typography.mono,
            fontWeight: 'bold',
            transform: [{ rotate: phase === 'Inhale' ? '-45deg' : '0deg' }]
        }}>
          {t('learn.sim.' + phase.toLowerCase(), { defaultValue: phase }).toUpperCase()}
        </Text>
      </Animated.View>
    </View>
  );
};

const StressBubbles = () => {
  const { colors } = useTheme();
  const [bubbles, setBubbles] = useState([1, 2, 3, 4, 5, 6]);

  const popBubble = (id: number) => {
    HapticFeedback.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setBubbles(bubbles.filter(b => b !== id));
    if (bubbles.length <= 1) {
      setTimeout(() => setBubbles([1, 2, 3, 4, 5, 6]), 1000);
    }
  };

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 15, paddingVertical: 10 }}>
      {bubbles.map(id => (
        <TouchableOpacity 
          key={id} 
          onPress={() => popBubble(id)}
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: colors.accentSoft,
            borderWidth: 2,
            borderColor: colors.accent,
            opacity: 0.8
          }}
        />
      ))}
    </View>
  );
};

export const PlantStageSvg = ({ stage, size = 64, colors }: { stage: number, size?: number, colors: any }) => {
  switch (stage) {
    case 0: // Soil Mound
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M4 20C4 20 6 15 12 15C18 15 20 20 20 20H4Z" fill="#C4A882" />
          <Circle cx="12" cy="18" r="1.5" fill="#5A9C3A" opacity={0.5} />
        </Svg>
      );
    case 1: // Baby Sprout
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          {/* Soil Mound */}
          <Path d="M4 20C4 20 6 17 12 17C18 17 20 20 20 20H4Z" fill="#C4A882" />
          {/* Stem */}
          <Path d="M12 18V10C12 10 12.5 8 15 8" stroke="#5A9C3A" strokeWidth="2.5" strokeLinecap="round" />
          {/* Leaves */}
          <Path d="M12 13C12 13 9 12 10 9C11 9 12 11 12 13Z" fill="#5A9C3A" />
          <Path d="M13.5 9.5C13.5 9.5 16 8.5 15.5 6C14.5 6.2 13.7 8 13.5 9.5Z" fill="#5DFF8B" />
        </Svg>
      );
    case 2: // Budding Leaf
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M4 20C4 20 6 17 12 17C18 17 20 20 20 20H4Z" fill="#C4A882" />
          <Path d="M12 18V8C12 8 11.5 5 15 4" stroke="#5A9C3A" strokeWidth="3" strokeLinecap="round" />
          {/* Multiple Leaves */}
          <Path d="M12 14C10 13 9 11 10 9C11 9 12 12 12 14Z" fill="#5A9C3A" />
          <Path d="M12.5 11C14.5 10 15.5 8 14.5 6C13.5 6 12.5 9 12.5 11Z" fill="#5A9C3A" />
          <Path d="M14 5.5C16 5 17 3 16 1C15 1.2 14 3.5 14 5.5Z" fill="#5DFF8B" />
        </Svg>
      );
    case 3: // Blooming Flower
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M4 20C4 20 6 17 12 17C18 17 20 20 20 20H4Z" fill="#C4A882" />
          <Path d="M12 18V8" stroke="#5A9C3A" strokeWidth="3" strokeLinecap="round" />
          {/* Leaves */}
          <Path d="M12 13C10 12.5 9.5 11 10 9.5C10.5 9.5 12 11.5 12 13Z" fill="#5A9C3A" />
          {/* Flower petals */}
          <Circle cx="12" cy="7" r="2.5" fill="#EF4444" />
          <Circle cx="9.5" cy="7" r="2" fill="#F87171" />
          <Circle cx="14.5" cy="7" r="2" fill="#F87171" />
          <Circle cx="12" cy="4.5" r="2" fill="#F87171" />
          <Circle cx="12" cy="9.5" r="2" fill="#F87171" />
        </Svg>
      );
    case 4: // Golden Lotus (glowing golden petals)
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M4 20C4 20 6 17 12 17C18 17 20 20 20 20H4Z" fill="#C4A882" />
          <Path d="M12 18V8" stroke="#5A9C3A" strokeWidth="3" strokeLinecap="round" />
          {/* Glowing lotus petals with warm colors */}
          <Path d="M12 2C8 6 10 12 12 14C14 12 16 6 12 2Z" fill="#FBBF24" />
          <Path d="M12 5C9 8 10.5 12 12 13.5C13.5 12 15 8 12 5Z" fill="#F59E0B" />
          <Path d="M9 11C6.5 11.5 7.5 14 12 14C7.5 14 6.5 11.5 9 11Z" fill="#D97706" />
          <Path d="M15 11C17.5 11.5 16.5 14 12 14C16.5 14 17.5 11.5 15 11Z" fill="#D97706" />
        </Svg>
      );
    default:
      return null;
  }
};

export const BalloonSvg = ({ size = 64, color = '#EF4444' }: { size?: number, color?: string }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Balloon Oval */}
      <Path d="M12 2C8.5 2 6 5.5 6 9.5C6 13 8 16 11 16.8V19C11 19.5 11.5 20 12 20C12.5 20 13 19.5 13 19V16.8C16 16 18 13 18 9.5C18 5.5 15.5 2 12 2Z" fill={color} />
      {/* Balloon Knot/Triangle */}
      <Path d="M10 16.5L12 15L14 16.5H10Z" fill={color} />
      {/* Balloon String */}
      <Path d="M12 16.5C12 19 10.5 20.5 12 22" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />
      {/* Shiny Highlight */}
      <Path d="M9 5C7.5 6.5 7.5 8 7.5 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity={0.6} />
    </Svg>
  );
};

const ZenSproutGame = () => {
  const { colors } = useTheme();
  const [taps, setTaps] = useState(0);
  const scale = useSharedValue(1);

  const stages = [
    { label: 'Seed in Soil', hint: 'Give it water to sprout' },
    { label: 'Baby Sprout', hint: 'Keep watering to grow leaves' },
    { label: 'Budding Leaf', hint: 'Almost ready to bloom' },
    { label: 'Blooming Flower', hint: 'Beautiful! Garden is healthy!' },
    { label: 'Golden Lotus', hint: 'Fully grown. Tap reset to start over.' },
  ];

  const currentStageIdx = Math.min(Math.floor(taps / 4), stages.length - 1);
  const currentStage = stages[currentStageIdx];

  const handleWater = () => {
    HapticFeedback.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    scale.value = withSequence(
      withTiming(1.3, { duration: 150 }),
      withTiming(1, { duration: 250 })
    );
    setTaps(t => t + 1);
  };

  const handleReset = () => {
    HapticFeedback.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setTaps(0);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const progressPercent = Math.min((taps % 4) / 4, 1) * 100;

  return (
    <View style={{ alignItems: 'center', paddingVertical: 10 }}>
      <Animated.View style={[{ width: 80, height: 80, alignItems: 'center', justifyContent: 'center', marginVertical: hp(1) }, animatedStyle]}>
        <PlantStageSvg stage={currentStageIdx} size={80} colors={colors} />
      </Animated.View>
      <Text style={{ fontFamily: typography.label, color: colors.text, fontSize: rf(16), fontWeight: 'bold' }}>
        {currentStage.label}
      </Text>
      <Text style={{ fontFamily: typography.body, color: colors.textMuted, fontSize: rf(12), marginTop: 2, textAlign: 'center' }}>
        {currentStage.hint}
      </Text>
      
      {currentStageIdx < stages.length - 1 ? (
        <View style={{ width: '80%', height: 6, backgroundColor: colors.surfaceAlt, borderRadius: 3, marginVertical: hp(2), overflow: 'hidden' }}>
          <View style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: colors.accent, borderRadius: 3 }} />
        </View>
      ) : (
        <View style={{ height: 6, marginVertical: hp(2) }} />
      )}

      {currentStageIdx < stages.length - 1 ? (
        <TouchableOpacity
          onPress={handleWater}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.accent,
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 12,
            gap: 6
          }}
        >
          <Ionicons name="water" size={18} color="white" />
          <Text style={{ color: 'white', fontFamily: typography.label, fontWeight: 'bold' }}>WATER PLANT</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={handleReset}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.accent,
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 12,
            gap: 6
          }}
        >
          <Ionicons name="refresh" size={18} color="white" />
          <Text style={{ color: 'white', fontFamily: typography.label, fontWeight: 'bold' }}>RESTART GARDEN</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const BalloonReleaseGame = () => {
  const { colors } = useTheme();
  const [text, setText] = useState('');
  const [isReleased, setIsReleased] = useState(false);
  const balloonY = useSharedValue(0);
  const balloonOpacity = useSharedValue(1);

  const handleRelease = () => {
    if (!text.trim()) return;
    HapticFeedback.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    setIsReleased(true);
    balloonY.value = withTiming(-hp(30), { duration: 3500, easing: Easing.out(Easing.quad) });
    balloonOpacity.value = withTiming(0, { duration: 3500 });
  };

  const handleReset = () => {
    HapticFeedback.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setText('');
    setIsReleased(false);
    balloonY.value = 0;
    balloonOpacity.value = 1;
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: balloonY.value }],
    opacity: balloonOpacity.value
  }));

  return (
    <View style={{ alignItems: 'center', paddingVertical: 10, width: '100%' }}>
      {!isReleased ? (
        <View style={{ width: '100%', alignItems: 'center' }}>
          <View style={{ width: 70, height: 70, alignItems: 'center', justifyContent: 'center' }}>
            <BalloonSvg size={70} color="#EF4444" />
          </View>
          <TextInput
            style={{
              width: '90%',
              height: 48,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surfaceAlt,
              borderRadius: 12,
              paddingHorizontal: 12,
              color: colors.text,
              fontFamily: typography.body,
              textAlign: 'center',
              marginTop: hp(1.5),
              marginBottom: hp(2)
            }}
            placeholder="Type your worry (e.g. Anxiety, Deadlines)"
            placeholderTextColor={colors.textMuted}
            value={text}
            onChangeText={setText}
          />
          <TouchableOpacity
            onPress={handleRelease}
            disabled={!text.trim()}
            style={{
              backgroundColor: text.trim() ? colors.danger : colors.border,
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 12,
              opacity: text.trim() ? 1 : 0.6
            }}
          >
            <Text style={{ color: 'white', fontFamily: typography.label, fontWeight: 'bold' }}>RELEASE WORRY</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ alignItems: 'center', width: '100%' }}>
          <Animated.View style={[{ alignItems: 'center', zIndex: 10 }, animatedStyle]}>
            <View style={{ padding: 8, backgroundColor: 'rgba(239, 68, 68, 0.9)', borderRadius: 10, marginBottom: 4 }}>
              <Text style={{ color: 'white', fontSize: rf(12), fontFamily: typography.mono, fontWeight: 'bold' }}>{text}</Text>
            </View>
            <BalloonSvg size={70} color="#EF4444" />
          </Animated.View>
          
          <Text style={{ fontFamily: typography.body, color: colors.text, fontSize: rf(14), fontStyle: 'italic', marginTop: hp(4), textAlign: 'center' }}>
            Watch your worry drift away into the sky...
          </Text>
          
          <TouchableOpacity
            onPress={handleReset}
            style={{
              backgroundColor: colors.accent,
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 12,
              marginTop: hp(2)
            }}
          >
            <Text style={{ color: 'white', fontFamily: typography.label, fontWeight: 'bold' }}>GET ANOTHER BALLOON</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export const RelievingGames = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [showGamesInfo, setShowGamesInfo] = useState(false);
  
  return (
    <View style={{ marginTop: hp(4), paddingBottom: hp(4) }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: hp(1) }}>
        <Text style={[styles.tipsTitle, { color: colors.text, marginBottom: 0 }]}>
          {t('learn.sim.gamesTitle', { defaultValue: "Relieving Games" })}
        </Text>
        <TouchableOpacity onPress={() => setShowGamesInfo(!showGamesInfo)} style={{ padding: 4 }}>
          <Ionicons name={showGamesInfo ? "close-circle-outline" : "help-circle-outline"} size={22} color={colors.accent} />
        </TouchableOpacity>
      </View>

      {showGamesInfo && (
        <View style={{ backgroundColor: colors.surfaceAlt, padding: spacing.md, borderRadius: 12, borderWidth: 1, borderColor: colors.borderLight, marginBottom: hp(2) }}>
          <Text style={{ fontFamily: typography.label, fontWeight: '700', fontSize: rf(13), color: colors.accentDeep, marginBottom: 4 }}>
            WHY INTERACTIVE GAMES ARE NEEDED:
          </Text>
          <Text style={{ fontFamily: typography.body, fontSize: rf(13), color: colors.text, marginBottom: 6 }}>
            • **Grounding Exercise:** Relieving games shift the brain's focus away from internal anxious worry-loops and re-direct cognitive resources to active motor and visual coordinates.
          </Text>
          <Text style={{ fontFamily: typography.body, fontSize: rf(13), color: colors.text }}>
            • **Dopamine & Calming:** Interacting with simple physics, growth vectors, and tactile haptic bubbles triggers minor dopamine releases, down-regulating the nervous system from fight-or-flight response.
          </Text>
        </View>
      )}

      <Text style={[styles.cardSub, { color: colors.textMuted, marginBottom: hp(2) }]}>
        {t('learn.sim.gamesSubtitle', { defaultValue: "Interactive activities to help ground you in the present moment." })}
      </Text>
      
      {/* 1. Breathing Box Game */}
      <View style={[simStyles.container, { marginBottom: hp(3), backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[simStyles.title, { color: colors.text, marginBottom: hp(1) }]}>{t('learn.sim.breathingBoxTitle', { defaultValue: "Breathing Box" })}</Text>
        <View style={{ alignItems: 'center', justifyContent: 'center', height: hp(15) }}>
          <AnimatedBreathingBox />
        </View>
        <Text style={[simStyles.desc, { color: colors.textMuted, marginTop: hp(1) }]}>
          {t('learn.sim.breathingBoxDesc', { defaultValue: "Follow the box to regulate your heart rate." })}
        </Text>
      </View>

      {/* 2. Pop the Stress Bubbles */}
      <View style={[simStyles.container, { marginBottom: hp(3), backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[simStyles.title, { color: colors.text, marginBottom: hp(1) }]}>{t('learn.sim.popStressTitle', { defaultValue: "Pop the Stress" })}</Text>
        <StressBubbles />
        <Text style={[simStyles.desc, { color: colors.textMuted, marginTop: hp(1) }]}>
          {t('learn.sim.popStressDesc', { defaultValue: "Tap the bubbles to release tension." })}
        </Text>
      </View>

      {/* 3. Zen Sprout Garden Game */}
      <View style={[simStyles.container, { marginBottom: hp(3), backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[simStyles.title, { color: colors.text, marginBottom: hp(1) }]}>Zen Sprout Garden</Text>
        <ZenSproutGame />
        <Text style={[simStyles.desc, { color: colors.textMuted, marginTop: hp(1) }]}>
          Tap the watering can to nurture the sprout. Watch it grow and bloom!
        </Text>
      </View>

      {/* 4. Thought Balloon Release Game */}
      <View style={[simStyles.container, { marginBottom: hp(3), backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[simStyles.title, { color: colors.text, marginBottom: hp(1) }]}>Thought Balloon Release</Text>
        <BalloonReleaseGame />
        <Text style={[simStyles.desc, { color: colors.textMuted, marginTop: hp(1) }]}>
          Write a negative thought inside the balloon and tap release to set it free.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tipsTitle: {
    fontFamily: typography.display,
    fontSize: rf(20),
    fontWeight: 'bold',
    marginBottom: hp(1.5),
    marginTop: hp(2),
  },
  cardSub: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  }
});

const simStyles = StyleSheet.create({
  container: {
    marginTop: hp(4),
    padding: hp(3),
    borderRadius: 24,
    borderWidth: 1,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  title: {
    fontFamily: typography.display,
    fontSize: rf(20),
    textAlign: 'center',
  },
  desc: {
    fontFamily: typography.body,
    fontSize: rf(14),
    textAlign: 'center',
  },
  btn: {
    padding: hp(1.5),
    backgroundColor: '#F5EFE7',
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  }
});
