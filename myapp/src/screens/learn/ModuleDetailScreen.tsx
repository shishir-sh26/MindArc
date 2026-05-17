import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Linking } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { spacing, radii } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { wp, hp, rf } from '../../utils/responsive';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import Animated, { useSharedValue, useAnimatedStyle, useAnimatedProps, withTiming, withSpring, withDelay, withRepeat, withSequence, interpolateColor, interpolate, runOnJS, Easing, FadeInDown } from 'react-native-reanimated';
import Svg, { Rect, Circle, Path, G } from 'react-native-svg';
import * as HapticsAPI from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedView = Animated.createAnimatedComponent(View);

type ModuleDetailRouteProp = RouteProp<RootStackParamList, 'ModuleDetail'>;

// Simulations
const AnxietyMeter = ({ onLevelChange }: { onLevelChange: (level: 'low' | 'mid' | 'high') => void }) => {
  const { colors } = useTheme();
  const stressVal = useSharedValue(0);
  const [desc, setDesc] = useState("Calm and relaxed. Heart rate is steady.");
  
  const handleTap = (level: number, label: 'low' | 'mid' | 'high') => {
    HapticsAPI.impactAsync(HapticsAPI.ImpactFeedbackStyle.Light);
    stressVal.value = withSpring(level, { damping: 15 });
    onLevelChange(label);
    
    if (level < 40) setDesc("Calm and relaxed. Heart rate is steady, breathing is deep.");
    else if (level < 75) setDesc("Alert and focused. Mild tension, slightly elevated heart rate.");
    else setDesc("High stress. Rapid breathing, muscle tension, fight-or-flight activated.");
  };

  const maxHeight = hp(20);
  const barStyle = useAnimatedStyle(() => {
    const height = interpolate(stressVal.value, [0, 100], [0, maxHeight]);
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
        <TouchableOpacity style={simStyles.btn} onPress={() => handleTap(20, 'low')}><Text style={{fontFamily: typography.label}}>LOW</Text></TouchableOpacity>
        <TouchableOpacity style={simStyles.btn} onPress={() => handleTap(50, 'mid')}><Text style={{fontFamily: typography.label}}>MED</Text></TouchableOpacity>
        <TouchableOpacity style={simStyles.btn} onPress={() => handleTap(90, 'high')}><Text style={{fontFamily: typography.label}}>HIGH</Text></TouchableOpacity>
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

const TriggerRipple = () => {
  const { colors } = useTheme();
  const [active, setActive] = useState<string | null>(null);

  const ripples = [
    { id: 'mind', label: 'MIND', desc: 'Cognitive Overload: Your thoughts move faster than you can process. Focus shatters, and self-doubt begins to cloud your decision-making.', color: colors.reflect },
    { id: 'body', label: 'BODY', desc: 'Somatic Response: High Cortisol leads to physical "Armor"—your muscles clench, your breath becomes shallow, and you may feel constant fatigue.', color: colors.danger },
    { id: 'life', label: 'LIFE', desc: 'Social Erosion: The cumulative weight leads to withdrawal. You may find yourself avoiding joys and distancing from those who support you most.', color: colors.learn },
  ];

  const handleTriggerPress = () => {
    HapticsAPI.impactAsync(HapticsAPI.ImpactFeedbackStyle.Heavy);
    // Reset or show a generic pulse
    setActive(null);
  };

  return (
    <View style={simStyles.container}>
      <Text style={[simStyles.title, { color: colors.text, marginBottom: hp(2) }]}>The Ripple Effect</Text>
      
      <View style={{ height: hp(25), justifyContent: 'center', alignItems: 'center' }}>
        <Svg width="250" height="250" viewBox="0 0 100 100">
          <Circle 
            cx="50" 
            cy="50" 
            r="12" 
            fill={colors.accent} 
            opacity="0.3" 
            onPress={handleTriggerPress}
          />
          {ripples.map((r, i) => (
             <RippleRing 
                key={r.id} 
                index={i} 
                color={r.color} 
                isActive={active === r.id} 
                onPress={() => {
                    HapticsAPI.impactAsync(HapticsAPI.ImpactFeedbackStyle.Medium);
                    setActive(active === r.id ? null : r.id);
                }} 
             />
          ))}
        </Svg>

        <TouchableOpacity 
            onPress={handleTriggerPress}
            style={{ position: 'absolute', backgroundColor: colors.accent, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 }}
        >
            <Text style={{ fontFamily: typography.label, fontSize: rf(12), color: 'white', fontWeight: 'bold' }}>TRIGGER</Text>
        </TouchableOpacity>
      </View>

      {/* Explicit Selection Buttons for better accessibility */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: hp(4), marginBottom: hp(2) }}>
        {ripples.map(r => (
            <TouchableOpacity 
                key={r.id}
                onPress={() => { HapticsAPI.impactAsync(HapticsAPI.ImpactFeedbackStyle.Light); setActive(r.id); }}
                style={{ 
                    paddingHorizontal: 15, 
                    paddingVertical: 8, 
                    borderRadius: 20, 
                    backgroundColor: active === r.id ? r.color : colors.surfaceAlt,
                    borderWidth: 1,
                    borderColor: r.color
                }}
            >
                <Text style={{ fontFamily: typography.label, fontSize: rf(11), color: active === r.id ? 'white' : r.color }}>
                    {r.label}
                </Text>
            </TouchableOpacity>
        ))}
      </View>

      {active && (
        <Animated.View entering={FadeInDown} style={{ marginTop: hp(1), padding: hp(2), backgroundColor: colors.surfaceAlt, borderRadius: 12, borderWidth: 1, borderColor: colors.borderLight }}>
          <Text style={{ fontFamily: typography.label, color: ripples.find(r => r.id === active)?.color, marginBottom: 4 }}>
            {active.toUpperCase()} IMPACT:
          </Text>
          <Text style={{ fontFamily: typography.body, color: colors.text }}>
            {ripples.find(r => r.id === active)?.desc}
          </Text>
        </Animated.View>
      )}
    </View>
  );
};

const RippleRing = ({ index, color, isActive, onPress }: { index: number, color: string, isActive: boolean, onPress: () => void }) => {
    const radius = useSharedValue(0);
    const pulse = useSharedValue(1);
    const targetRadius = 18 + index * 10; // More compact spacing

    useEffect(() => {
        radius.value = withDelay(index * 300, withSpring(targetRadius, { damping: 12 }));
        pulse.value = withRepeat(withTiming(1.04, { duration: 2500 }), -1, true);
    }, []);

    const animatedProps = useAnimatedProps(() => ({
        r: radius.value * (isActive ? 1 : pulse.value),
        strokeWidth: isActive ? 2.5 : 1.2,
        opacity: isActive ? 1 : 0.4
    }));

    const dotProps = useAnimatedProps(() => ({
        r: isActive ? 4 : 2, // Smaller dots
        opacity: isActive ? 1 : 0.6
    }));

    return (
        <G>
            {/* LARGE Hitbox Circle for easy tapping */}
            <Circle 
                cx="50" 
                cy="50" 
                r={targetRadius + 6} 
                fill="transparent" 
                onPress={onPress}
            />
            <AnimatedCircle 
                cx="50" 
                cy="50" 
                fill="none" 
                stroke={color} 
                strokeDasharray="4,4"
                onPress={onPress}
                animatedProps={animatedProps} 
            />
            <AnimatedCircle 
                cx={50} 
                cy={50 - targetRadius}
                fill={color}
                onPress={onPress}
                animatedProps={dotProps}
            />
        </G>
    );
};


const MythChecker = () => {
  const { colors } = useTheme();
  const [myth, setMyth] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const checkMyth = async () => {
    if (!myth.trim()) return;
    setLoading(true);
    setResult(null);
    HapticsAPI.impactAsync(HapticsAPI.ImpactFeedbackStyle.Medium);

    // Using the detected local IP or EXPO_PUBLIC_API_URL
    const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.37:8000';
    const apiUrl = `${baseUrl}/api/v1/myth-check`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ myth }),
      });
      const data = await response.json();
      setResult(data.fact);
    } catch (error) {
      setResult("Error connecting to AI service. Please ensure the backend is running at " + apiUrl);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={simStyles.container}>
      <Text style={[simStyles.title, { color: colors.text, marginBottom: hp(1) }]}>AI Myth Buster</Text>
      <Text style={[simStyles.desc, { color: colors.textMuted, marginBottom: hp(2) }]}>
        Enter a common myth or a thought you're unsure about, and our AI will clarify the medical fact.
      </Text>

      <TextInput
        style={{
          backgroundColor: colors.surfaceAlt,
          borderRadius: 12,
          padding: hp(2),
          color: colors.text,
          fontFamily: typography.body,
          minHeight: hp(8),
          textAlignVertical: 'top',
          borderWidth: 1,
          borderColor: colors.borderLight
        }}
        placeholder="Example: Anxiety is just a sign of weakness..."
        placeholderTextColor={colors.textMuted}
        multiline
        value={myth}
        onChangeText={setMyth}
      />

      <TouchableOpacity 
        onPress={checkMyth}
        disabled={loading}
        style={{
          backgroundColor: colors.accent,
          padding: hp(2),
          borderRadius: 12,
          marginTop: hp(2),
          alignItems: 'center',
          opacity: loading ? 0.7 : 1
        }}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={{ color: 'white', fontFamily: typography.label, fontWeight: 'bold' }}>VERIFY WITH AI</Text>
        )}
      </TouchableOpacity>

      {result && (
        <Animated.View 
          entering={FadeInDown}
          style={{
            marginTop: hp(3),
            padding: hp(2),
            backgroundColor: colors.calmLight,
            borderRadius: 12,
            borderLeftWidth: 4,
            borderLeftColor: colors.calm
          }}
        >
          <Text style={{ fontFamily: typography.body, color: colors.text, lineHeight: rf(22) }}>
            {result}
          </Text>
        </Animated.View>
      )}
    </View>
  );
};

const SupportContacts = () => {
  const { colors } = useTheme();
  
  const contacts = [
    { name: "Emergency Services", phone: "911", icon: "alert-circle", color: "#FF4444" },
    { name: "National Suicide Prevention", phone: "988", icon: "heart", color: "#FF8800" },
    { name: "Dr. Aris (Psychiatrist)", phone: "+15550123", icon: "person", color: colors.accent },
    { name: "Dr. Sarah (Therapist)", phone: "+15550456", icon: "chatbubbles", color: colors.reflect },
    { name: "Crisis Text Line", phone: "741741", icon: "phone-portrait", color: "#44BBFF" }
  ];

  const handleCall = (number: string) => {
    HapticsAPI.impactAsync(HapticsAPI.ImpactFeedbackStyle.Heavy);
    Linking.openURL(`tel:${number}`);
  };

  return (
    <View style={simStyles.container}>
      <Text style={[simStyles.title, { color: colors.text, marginBottom: hp(2) }]}>Professional Contacts</Text>
      {contacts.map((contact, index) => (
        <TouchableOpacity 
          key={index}
          onPress={() => handleCall(contact.phone)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.surfaceAlt,
            padding: hp(2),
            borderRadius: 16,
            marginBottom: hp(1.5),
            borderLeftWidth: 4,
            borderLeftColor: contact.color
          }}
        >
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: contact.color + '22', alignItems: 'center', justifyContent: 'center', marginRight: hp(2) }}>
            <Ionicons name={contact.icon as any} size={20} color={contact.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: typography.label, color: colors.text, fontSize: rf(15) }}>{contact.name}</Text>
            <Text style={{ fontFamily: typography.body, color: colors.textMuted, fontSize: rf(13) }}>{contact.phone}</Text>
          </View>
          <Ionicons name="call-outline" size={20} color={colors.accent} />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const LifestyleAssessment = () => {
  const { colors } = useTheme();
  const [step, setStep] = useState(1);
  const [responses, setResponses] = useState({ sleep: '', exercise: '', diet: '', caffeine: '' });
  const [plan, setPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generatePlan = async () => {
    setLoading(true);
    HapticsAPI.impactAsync(HapticsAPI.ImpactFeedbackStyle.Heavy);
    try {
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.37:8000';
      const response = await fetch(`${baseUrl}/api/v1/lifestyle-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses }),
      });
      const data = await response.json();
      setPlan(data.plan);
    } catch (error) {
      setPlan("Error generating plan. Please ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const renderQuestion = (id: keyof typeof responses, label: string, options: string[]) => (
    <View style={{ marginBottom: hp(3) }}>
      <Text style={{ fontFamily: typography.label, color: colors.text, marginBottom: hp(1) }}>{label}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {options.map(opt => (
          <TouchableOpacity 
            key={opt}
            onPress={() => { HapticsAPI.impactAsync(HapticsAPI.ImpactFeedbackStyle.Light); setResponses({ ...responses, [id]: opt }); }}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 12,
              backgroundColor: responses[id] === opt ? colors.accent : colors.surfaceAlt,
              borderWidth: 1,
              borderColor: responses[id] === opt ? colors.accent : colors.borderLight
            }}
          >
            <Text style={{ fontFamily: typography.body, color: responses[id] === opt ? 'white' : colors.text, fontSize: rf(13) }}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={simStyles.container}>
      <Text style={[simStyles.title, { color: colors.text, marginBottom: hp(2) }]}>Wellness Assessment</Text>
      
      {!plan ? (
        <>
          {renderQuestion('sleep', 'How many hours do you sleep?', ['< 5 hrs', '5-7 hrs', '7-9 hrs', '9+ hrs'])}
          {renderQuestion('exercise', 'Weekly physical activity?', ['None', '1-2 days', '3-5 days', 'Athletic'])}
          {renderQuestion('diet', 'How would you describe your diet?', ['Balanced', 'Mostly Fast Food', 'Irregular', 'Vegan/Special'])}
          {renderQuestion('caffeine', 'Daily caffeine intake?', ['None', '1-2 cups', '3-5 cups', 'Heavy (5+)'])}

          <TouchableOpacity 
            onPress={generatePlan}
            disabled={loading || !responses.sleep || !responses.exercise}
            style={{
              backgroundColor: colors.accent,
              padding: hp(2),
              borderRadius: 12,
              alignItems: 'center',
              marginTop: hp(2),
              opacity: (loading || !responses.sleep || !responses.exercise) ? 0.6 : 1
            }}
          >
            {loading ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontFamily: typography.label, fontWeight: 'bold' }}>GENERATE BETTER LIVING SUMMARY</Text>}
          </TouchableOpacity>
        </>
      ) : (
        <Animated.View entering={FadeInDown}>
          <View style={{ backgroundColor: colors.accentSoft, padding: hp(2), borderRadius: 12, marginBottom: hp(2) }}>
            <Text style={{ fontFamily: typography.display, color: colors.accentDeep, fontSize: rf(18) }}>Your Personalized Plan</Text>
          </View>
          <Text style={{ fontFamily: typography.body, color: colors.text, lineHeight: rf(24) }}>{plan}</Text>
          <TouchableOpacity 
            onPress={() => { setPlan(null); setResponses({ sleep: '', exercise: '', diet: '', caffeine: '' }); }}
            style={{ marginTop: hp(3), alignSelf: 'center' }}
          >
            <Text style={{ color: colors.accent, fontFamily: typography.label }}>RETAKE ASSESSMENT</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const RelievingGames = () => {
  const { colors } = useTheme();
  
  return (
    <View style={{ marginTop: hp(6), paddingBottom: hp(4) }}>
      <Text style={[styles.tipsTitle, { color: colors.text }]}>🕹️ Relieving Games</Text>
      <Text style={[styles.metaText, { color: colors.textMuted, marginBottom: hp(2) }]}>
        Interactive activities to help ground you in the present moment.
      </Text>
      
      {/* 1. Breathing Box Game */}
      <View style={[simStyles.container, { marginBottom: hp(3) }]}>
        <Text style={[simStyles.title, { color: colors.text, marginBottom: hp(1) }]}>Breathing Box</Text>
        <View style={{ alignItems: 'center', justifyContent: 'center', height: hp(15) }}>
          <AnimatedBreathingBox />
        </View>
        <Text style={[simStyles.desc, { color: colors.textMuted, marginTop: hp(1) }]}>
          Follow the box to regulate your heart rate.
        </Text>
      </View>

      {/* 2. Pop the Stress Bubbles */}
      <View style={[simStyles.container, { marginBottom: hp(3) }]}>
        <Text style={[simStyles.title, { color: colors.text, marginBottom: hp(1) }]}>Pop the Stress</Text>
        <StressBubbles />
        <Text style={[simStyles.desc, { color: colors.textMuted, marginTop: hp(1) }]}>
          Tap the bubbles to release tension.
        </Text>
      </View>
    </View>
  );
};

const AnimatedBreathingBox = () => {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);
  const rotation = useSharedValue(0);
  const [phase, setPhase] = useState('Inhale');

  useEffect(() => {
    const runCycle = () => {
      // 1. INHALE (4s)
      setPhase('Inhale');
      HapticsAPI.impactAsync(HapticsAPI.ImpactFeedbackStyle.Heavy);
      scale.value = withTiming(1.8, { duration: 4000, easing: Easing.inOut(Easing.quad) });
      opacity.value = withTiming(1, { duration: 4000 });
      rotation.value = withTiming(45, { duration: 4000 });

      // 2. HOLD (4s)
      setTimeout(() => {
        setPhase('Hold');
        HapticsAPI.impactAsync(HapticsAPI.ImpactFeedbackStyle.Medium);
        // No scale change, just a subtle pulse
        scale.value = withSequence(
            withTiming(1.85, { duration: 2000 }),
            withTiming(1.8, { duration: 2000 })
        );
      }, 4000);

      // 3. EXHALE (4s)
      setTimeout(() => {
        setPhase('Exhale');
        HapticsAPI.impactAsync(HapticsAPI.ImpactFeedbackStyle.Heavy);
        scale.value = withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.quad) });
        opacity.value = withTiming(0.6, { duration: 4000 });
        rotation.value = withTiming(0, { duration: 4000 });
      }, 8000);

      // 4. HOLD (4s)
      setTimeout(() => {
        setPhase('Rest');
        HapticsAPI.impactAsync(HapticsAPI.ImpactFeedbackStyle.Medium);
        // subtle pulse at bottom
        scale.value = withSequence(
            withTiming(0.95, { duration: 2000 }),
            withTiming(1, { duration: 2000 })
        );
      }, 12000);
    };

    runCycle();
    const interval = setInterval(runCycle, 16000);
    return () => clearInterval(interval);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
        { scale: scale.value },
        { rotate: `${rotation.value}deg` }
    ],
    opacity: opacity.value,
    backgroundColor: interpolateColor(
        scale.value,
        [1, 1.8],
        [colors.accentSoft, colors.accent]
    )
  }));

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * 1.2 }],
    opacity: (opacity.value - 0.5) * 0.5,
  }));

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      {/* Glow Layer */}
      <Animated.View 
        style={[{ 
          position: 'absolute',
          width: 70, 
          height: 70, 
          backgroundColor: colors.accent, 
          borderRadius: 20,
          shadowColor: colors.accent,
          shadowOpacity: 0.8,
          shadowRadius: 20,
        }, glowStyle]} 
      />
      
      {/* Inner Layer */}
      <Animated.View 
        style={[{ 
          width: 60, 
          height: 60, 
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 2,
          borderColor: 'rgba(255,255,255,0.3)'
        }, animatedStyle]} 
      >
        <Text style={{ 
            color: 'white', 
            fontSize: rf(10), 
            fontFamily: typography.label,
            fontWeight: 'bold',
            transform: [{ rotate: phase === 'Inhale' ? '-45deg' : '0deg' }] // Keep text upright
        }}>
          {phase.toUpperCase()}
        </Text>
      </Animated.View>
    </View>
  );
};

const StressBubbles = () => {
  const { colors } = useTheme();
  const [bubbles, setBubbles] = useState([1, 2, 3, 4, 5, 6]);

  const popBubble = (id: number) => {
    HapticsAPI.impactAsync(HapticsAPI.ImpactFeedbackStyle.Medium);
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

export default function ModuleDetailScreen() {
  const { colors } = useTheme();
  const route = useRoute<ModuleDetailRouteProp>();
  const navigation = useNavigation();
  const { module } = route.params;
  const [stressLevel, setStressLevel] = useState<'low' | 'mid' | 'high' | null>(null);

  const levelSpecificTips = {
    low: [
      "Maintenance is key: keep up with your daily mindfulness to stay balanced.",
      "This is a great time for a light walk or reading to reinforce calm.",
      "Acknowledge and appreciate your current state of mental clarity."
    ],
    mid: [
      "Notice where you're holding tension—usually shoulders, jaw, or neck.",
      "A 5-minute 'reset' break can prevent your stress from escalating further.",
      "Take small sips of water and practice one round of box breathing."
    ],
    high: [
      "PRIORITY: Stop what you are doing immediately and follow the Breathing Box below.",
      "Splash cold water on your face—this helps trigger your body's natural relaxation reflex.",
      "Immediate Grounding: Name 5 things you can see and 4 things you can touch right now."
    ]
  };

  const currentTips = (module.title.toLowerCase().includes('what is anxiety') && stressLevel) 
    ? levelSpecificTips[stressLevel] 
    : module.tips;

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
      {module.title.toLowerCase().includes('what is anxiety') && (
        <AnxietyMeter onLevelChange={(lvl) => setStressLevel(lvl)} />
      )}

      {module.title.toLowerCase().includes('trigger') && <TriggerRipple />}

      {module.title.toLowerCase().includes('myth vs fact') && <MythChecker />}

      {module.title.toLowerCase().includes('lifestyle') && <LifestyleAssessment />}

      {module.title.toLowerCase().includes('seek help') && <SupportContacts />}
      
      {module.title.toLowerCase().includes('myth') && !module.title.toLowerCase().includes('vs fact') && (
        <View style={{ marginTop: hp(4), alignItems: 'center' }}>
          <FlipCard myth="Anxiety is just weakness." fact="Anxiety is a common medical condition related to brain chemistry and environmental stress." />
          <FlipCard myth="You should just force yourself to calm down." fact="Forcing calm often increases stress. Acceptance and breathing techniques work better." />
        </View>
      )}

      {currentTips && currentTips.length > 0 && (
        <View style={{ marginTop: hp(4) }}>
          <Text style={[styles.tipsTitle, { color: colors.text }]}>
            {stressLevel ? `Action Items: ${stressLevel.toUpperCase()}` : 'Key Takeaways'}
          </Text>
          {currentTips.map((tip: string, idx: number) => (
            <View key={idx} style={[styles.tipCard, { backgroundColor: colors.surface }]}>
              <Text style={{ color: colors.accent, marginRight: spacing.sm }}>•</Text>
              <Text style={[styles.tipText, { color: colors.text }]}>{tip}</Text>
            </View>
          ))}
        </View>
      )}

      {/* NEW: Relieving Games Section */}
      {module.title.toLowerCase().includes('what is anxiety') && <RelievingGames />}
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
