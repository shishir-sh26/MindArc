import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { spacing, radii } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { wp, hp, rf } from '../../utils/responsive';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, interpolateColor, interpolate } from 'react-native-reanimated';
import Svg, { Rect, Circle, Path, G } from 'react-native-svg';
import * as HapticsAPI from 'expo-haptics';

type ModuleDetailRouteProp = RouteProp<RootStackParamList, 'ModuleDetail'>;

// Simulations
const AnxietyMeter = () => {
  const { colors } = useTheme();
  const stressVal = useSharedValue(0);
  const [desc, setDesc] = useState("Calm and relaxed. Heart rate is steady.");
  
  const handleTap = (level: number) => {
    HapticsAPI.impactAsync(HapticsAPI.ImpactFeedbackStyle.Light);
    stressVal.value = withSpring(level, { damping: 15 });
    if (level < 40) setDesc("Calm and relaxed. Heart rate is steady, breathing is deep.");
    else if (level < 75) setDesc("Alert and focused. Mild tension, slightly elevated heart rate.");
    else setDesc("High stress. Rapid breathing, muscle tension, fight-or-flight activated.");
  };

  const barStyle = useAnimatedStyle(() => {
    const height = interpolate(stressVal.value, [0, 100], [0, hp(20)]);
    const color = interpolateColor(
      stressVal.value,
      [0, 50, 100],
      [colors.calm, colors.warning, colors.danger]
    );
    return { height, backgroundColor: color };
  });

  return (
    <View style={simStyles.container}>
      <Text style={[simStyles.title, { color: colors.text }]}>Interactive Stress Meter</Text>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: hp(20), marginVertical: hp(2), width: '100%', backgroundColor: colors.surfaceAlt, borderRadius: 12, overflow: 'hidden' }}>
        <Animated.View style={[{ width: '100%', position: 'absolute', bottom: 0 }, barStyle]} />
      </View>
      <Text style={[simStyles.desc, { color: colors.textMuted }]}>{desc}</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: hp(2) }}>
        <TouchableOpacity style={simStyles.btn} onPress={() => handleTap(20)}><Text style={{fontFamily: typography.label}}>LOW</Text></TouchableOpacity>
        <TouchableOpacity style={simStyles.btn} onPress={() => handleTap(50)}><Text style={{fontFamily: typography.label}}>MED</Text></TouchableOpacity>
        <TouchableOpacity style={simStyles.btn} onPress={() => handleTap(90)}><Text style={{fontFamily: typography.label}}>HIGH</Text></TouchableOpacity>
      </View>
    </View>
  );
};

const FlipCard = ({ myth, fact }: { myth: string, fact: string }) => {
  const { colors } = useTheme();
  const [flipped, setFlipped] = useState(false);
  const flipAnim = useSharedValue(0);

  const handleFlip = () => {
    HapticsAPI.impactAsync(HapticsAPI.ImpactFeedbackStyle.Light);
    flipAnim.value = withTiming(flipped ? 0 : 180, { duration: 500 });
    setFlipped(!flipped);
  };

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${flipAnim.value}deg` }],
    opacity: flipAnim.value > 90 ? 0 : 1,
    zIndex: flipAnim.value > 90 ? 0 : 1,
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${flipAnim.value - 180}deg` }],
    opacity: flipAnim.value > 90 ? 1 : 0,
    zIndex: flipAnim.value > 90 ? 1 : 0,
  }));

  return (
    <TouchableOpacity onPress={handleFlip} activeOpacity={1}>
      <View style={{ width: wp(80), height: hp(20), marginBottom: hp(2) }}>
        <Animated.View style={[simStyles.cardFace, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }, frontStyle]}>
          <Text style={[simStyles.badge, { color: colors.danger }]}>MYTH</Text>
          <Text style={[simStyles.cardText, { color: colors.text }]}>{myth}</Text>
        </Animated.View>
        <Animated.View style={[simStyles.cardFace, simStyles.cardBack, { backgroundColor: colors.calmLight, borderColor: colors.calm }, backStyle]}>
          <Text style={[simStyles.badge, { color: colors.calm }]}>FACT</Text>
          <Text style={[simStyles.cardText, { color: colors.text }]}>{fact}</Text>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

export default function ModuleDetailScreen() {
  const { colors } = useTheme();
  const route = useRoute<ModuleDetailRouteProp>();
  const navigation = useNavigation();
  const { module } = route.params;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.text }]}>{module.title}</Text>
      
      <View style={[styles.meta, { backgroundColor: colors.surfaceAlt, borderColor: colors.borderLight }]}>
        <Text style={[styles.metaText, { color: colors.accentDeep }]}>{module.category.toUpperCase()}</Text>
        <Text style={[styles.metaText, { color: colors.textMuted }]}>{module.readTime} read</Text>
      </View>

      <Text style={[styles.contentBody, { color: colors.text }]}>
        {module.content}
      </Text>

      {/* Inject Simulations based on title */}
      {module.title.toLowerCase().includes('what is anxiety') && <AnxietyMeter />}
      
      {module.title.toLowerCase().includes('myth') && (
        <View style={{ marginTop: hp(4), alignItems: 'center' }}>
          <FlipCard myth="Anxiety is just weakness." fact="Anxiety is a common medical condition related to brain chemistry and environmental stress." />
          <FlipCard myth="You should just force yourself to calm down." fact="Forcing calm often increases stress. Acceptance and breathing techniques work better." />
        </View>
      )}

      {module.tips.length > 0 && (
        <View style={{ marginTop: hp(4) }}>
          <Text style={[styles.tipsTitle, { color: colors.text }]}>Key Takeaways</Text>
          {module.tips.map((tip: string, idx: number) => (
            <View key={idx} style={[styles.tipCard, { backgroundColor: colors.surface }]}>
              <Text style={{ color: colors.accent, marginRight: spacing.sm }}>•</Text>
              <Text style={[styles.tipText, { color: colors.text }]}>{tip}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: wp(5), paddingBottom: hp(12) },
  title: {
    fontFamily: typography.display,
    fontSize: rf(32),
    fontWeight: '600',
    marginBottom: hp(2),
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: hp(1.5),
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: hp(3),
  },
  metaText: {
    fontFamily: typography.label,
    fontSize: rf(13),
    letterSpacing: 0.5,
  },
  contentBody: {
    fontFamily: typography.body,
    fontSize: rf(16),
    lineHeight: rf(26),
  },
  tipsTitle: {
    fontFamily: typography.display,
    fontSize: rf(24),
    marginBottom: hp(2),
  },
  tipCard: {
    flexDirection: 'row',
    padding: hp(2),
    borderRadius: radii.md,
    marginBottom: hp(1.5),
    shadowColor: '#C4A882',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  tipText: {
    fontFamily: typography.body,
    fontSize: rf(15),
    flex: 1,
  }
});

const simStyles = StyleSheet.create({
  container: {
    marginTop: hp(4),
    padding: hp(3),
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E8DDD3',
    backgroundColor: '#FFFFFF',
    shadowColor: '#C4A882',
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
    height: 40,
  },
  btn: {
    padding: hp(1.5),
    backgroundColor: '#F5EFE7',
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cardFace: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    justifyContent: 'center',
    padding: hp(3),
    borderRadius: 20,
    borderWidth: 1,
  },
  cardBack: {
    top: 0, left: 0, position: 'absolute'
  },
  badge: {
    fontFamily: typography.label,
    fontSize: rf(12),
    position: 'absolute',
    top: hp(2),
    left: wp(4),
    letterSpacing: 1,
  },
  cardText: {
    fontFamily: typography.body,
    fontSize: rf(16),
    textAlign: 'center',
  }
});
