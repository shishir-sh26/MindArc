import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Linking, Alert } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { spacing, radii } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { wp, hp, rf } from '../../utils/responsive';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import Animated, { useSharedValue, useAnimatedStyle, useAnimatedProps, withTiming, withSpring, withDelay, withRepeat, withSequence, interpolateColor, interpolate, runOnJS, Easing, FadeInDown } from 'react-native-reanimated';
import Svg, { Rect, Circle, Path, G } from 'react-native-svg';
import { HapticFeedback as HapticsAPI } from '../../utils/HapticFeedback';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../../utils/firebase';
import { useAuthStore } from '../../store/authStore';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedView = Animated.createAnimatedComponent(View);
import { PlantStageSvg, BalloonSvg } from '../../components/relax/RelievingGames';

type ModuleDetailRouteProp = RouteProp<RootStackParamList, 'ModuleDetail'>;

// Simulations
const AnxietyMeter = ({ onLevelChange }: { onLevelChange: (level: 'low' | 'mid' | 'high') => void }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const stressVal = useSharedValue(0);
  const [level, setLevel] = useState<'low' | 'mid' | 'high'>('low');
  const [showInfo, setShowInfo] = useState(false);
  
  const handleTap = (val: number, label: 'low' | 'mid' | 'high') => {
    HapticsAPI.impactAsync(HapticsAPI.ImpactFeedbackStyle.Light);
    stressVal.value = withSpring(val, { damping: 15 });
    onLevelChange(label);
    
    if (val < 40) setLevel('low');
    else if (val < 75) setLevel('mid');
    else setLevel('high');
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

  const desc = level === 'low' 
    ? t('learn.sim.anxietyLowDesc', { defaultValue: "Calm and relaxed. Heart rate is steady, breathing is deep." }) 
    : level === 'mid' 
      ? t('learn.sim.anxietyMidDesc', { defaultValue: "Alert and focused. Mild tension, slightly elevated heart rate." }) 
      : t('learn.sim.anxietyHighDesc', { defaultValue: "High stress. Rapid breathing, muscle tension, fight-or-flight activated." });

  return (
    <View style={[simStyles.container, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.accentDeep }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: hp(1) }}>
        <Text style={[simStyles.title, { color: colors.text, flex: 1, textAlign: 'left' }]}>
          {t('learn.sim.anxietyTitle', { defaultValue: "Interactive Stress Meter" })}
        </Text>
        <TouchableOpacity onPress={() => setShowInfo(!showInfo)} style={{ padding: 4 }}>
          <Ionicons name={showInfo ? "close-circle-outline" : "information-circle-outline"} size={22} color={colors.accent} />
        </TouchableOpacity>
      </View>

      {showInfo && (
        <View style={{ backgroundColor: colors.surfaceAlt, padding: spacing.md, borderRadius: 12, borderWidth: 1, borderColor: colors.borderLight, marginBottom: hp(1.5) }}>
          <Text style={{ fontFamily: typography.label, fontWeight: '700', fontSize: rf(13), color: colors.accentDeep, marginBottom: 4 }}>
            WHAT IT IS USED FOR:
          </Text>
          <Text style={{ fontFamily: typography.body, fontSize: rf(13), color: colors.text, marginBottom: 8 }}>
            Visualizes body-mind tension ranges (low, medium, or high stress).
          </Text>
          
          <Text style={{ fontFamily: typography.label, fontWeight: '700', fontSize: rf(13), color: colors.accentDeep, marginBottom: 4 }}>
            HOW IT WORKS:
          </Text>
          <Text style={{ fontFamily: typography.body, fontSize: rf(13), color: colors.text, marginBottom: 8 }}>
            Tap LOW, MED, or HIGH. The visual column fluctuates to simulate emotional arousal, and updates the coping checklist below.
          </Text>
          
          <Text style={{ fontFamily: typography.label, fontWeight: '700', fontSize: rf(13), color: colors.accentDeep, marginBottom: 4 }}>
            WHY IT IS USEFUL:
          </Text>
          <Text style={{ fontFamily: typography.body, fontSize: rf(13), color: colors.text }}>
            Builds somatic self-awareness (interoception) and maps mental labels to physical sensations so you can choose the right coping tools.
          </Text>
        </View>
      )}

      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: hp(20), marginVertical: hp(2), width: '100%', backgroundColor: colors.surfaceAlt, borderRadius: 12, overflow: 'hidden' }}>
        <Animated.View style={[{ width: '100%', position: 'absolute', bottom: 0 }, barStyle]} />
      </View>
      <Text style={[simStyles.desc, { color: colors.textMuted }]}>{desc}</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: hp(2) }}>
        <TouchableOpacity style={simStyles.btn} onPress={() => handleTap(20, 'low')}><Text style={{fontFamily: typography.label, color: colors.text}}>{t('learn.sim.low', { defaultValue: "LOW" })}</Text></TouchableOpacity>
        <TouchableOpacity style={simStyles.btn} onPress={() => handleTap(50, 'mid')}><Text style={{fontFamily: typography.label, color: colors.text}}>{t('learn.sim.med', { defaultValue: "MED" })}</Text></TouchableOpacity>
        <TouchableOpacity style={simStyles.btn} onPress={() => handleTap(90, 'high')}><Text style={{fontFamily: typography.label, color: colors.text}}>{t('learn.sim.high', { defaultValue: "HIGH" })}</Text></TouchableOpacity>
      </View>
    </View>
  );
};

const FlipCard = ({ myth, fact }: { myth: string, fact: string }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
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
          <Text style={[simStyles.badge, { color: colors.danger }]}>{t('learn.sim.mythLabel', { defaultValue: "MYTH" })}</Text>
          <Text style={[simStyles.cardText, { color: colors.text }]}>{myth}</Text>
        </Animated.View>
        <Animated.View style={[simStyles.cardFace, simStyles.cardBack, { backgroundColor: colors.calmLight, borderColor: colors.calm }, backStyle]}>
          <Text style={[simStyles.badge, { color: colors.calm }]}>{t('learn.sim.factLabel', { defaultValue: "FACT" })}</Text>
          <Text style={[simStyles.cardText, { color: colors.text }]}>{fact}</Text>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

const TriggerRipple = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [active, setActive] = useState<string | null>(null);

  const ripples = [
    { id: 'mind', label: t('learn.sim.rippleMindLabel', { defaultValue: 'MIND' }), desc: t('learn.sim.rippleMindDesc', { defaultValue: 'Cognitive Overload: Your thoughts move faster than you can process. Focus shatters, and self-doubt begins to cloud your decision-making.' }), color: colors.reflect },
    { id: 'body', label: t('learn.sim.rippleBodyLabel', { defaultValue: 'BODY' }), desc: t('learn.sim.rippleBodyDesc', { defaultValue: 'Somatic Response: High Cortisol leads to physical "Armor"—your muscles clench, your breath becomes shallow, and you may feel constant fatigue.' }), color: colors.danger },
    { id: 'life', label: t('learn.sim.rippleLifeLabel', { defaultValue: 'LIFE' }), desc: t('learn.sim.rippleLifeDesc', { defaultValue: 'Social Erosion: The cumulative weight leads to withdrawal. You may find yourself avoiding joys and distancing from those who support you most.' }), color: colors.learn },
  ];

  const handleTriggerPress = () => {
    HapticsAPI.impactAsync(HapticsAPI.ImpactFeedbackStyle.Heavy);
    setActive(null);
  };

  return (
    <View style={[simStyles.container, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.accentDeep }]}>
      <Text style={[simStyles.title, { color: colors.text, marginBottom: hp(2) }]}>{t('learn.sim.rippleTitle', { defaultValue: "The Ripple Effect" })}</Text>
      
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
            <Text style={{ fontFamily: typography.label, fontSize: rf(12), color: 'white', fontWeight: 'bold' }}>{t('learn.sim.rippleTrigger', { defaultValue: "TRIGGER" })}</Text>
        </TouchableOpacity>
      </View>

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
            {t(`learn.sim.ripple${active.charAt(0).toUpperCase() + active.slice(1)}Label`, { defaultValue: active.toUpperCase() })} IMPACT:
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
  const { t } = useTranslation();
  const [myth, setMyth] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const checkMyth = async () => {
    if (!myth.trim()) return;
    setLoading(true);
    setResult(null);
    HapticsAPI.impactAsync(HapticsAPI.ImpactFeedbackStyle.Medium);

    // Using the detected local IP, EXPO_PUBLIC_API_URL, or falling back to live Render production backend
    const rawBaseUrl = process.env.EXPO_PUBLIC_API_URL || 'https://mentalhealthapp-11.onrender.com';
    const baseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
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
    <View style={[simStyles.container, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.accentDeep }]}>
      <Text style={[simStyles.title, { color: colors.text, marginBottom: hp(1) }]}>{t('learn.sim.mythTitle', { defaultValue: "AI Myth Buster" })}</Text>
      <Text style={[simStyles.desc, { color: colors.textMuted, marginBottom: hp(2) }]}>
        {t('learn.sim.mythDesc', { defaultValue: "Enter a common myth or a thought you're unsure about, and our AI will clarify the medical fact." })}
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
        placeholder={t('learn.sim.mythPlaceholder', { defaultValue: "Example: Anxiety is just a sign of weakness..." })}
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
          <Text style={{ color: 'white', fontFamily: typography.label, fontWeight: 'bold' }}>{t('learn.sim.mythVerifyBtn', { defaultValue: "VERIFY WITH AI" })}</Text>
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
  const { t } = useTranslation();
  const { user } = useAuthStore();

  // Custom contact states
  const [therapistNumber, setTherapistNumber] = useState('');
  const [otherNumber, setOtherNumber] = useState('');

  // Editing state toggles
  const [isEditingTherapist, setIsEditingTherapist] = useState(false);
  const [isEditingOther, setIsEditingOther] = useState(false);

  // Temporary inputs
  const [tempTherapist, setTempTherapist] = useState('');
  const [tempOther, setTempOther] = useState('');

  // Load custom numbers on mount
  useEffect(() => {
    const loadNumbers = async () => {
      try {
        // 1. Instant Offline Load
        const storedTherapist = await AsyncStorage.getItem('custom_therapist_number');
        const storedOther = await AsyncStorage.getItem('custom_other_number');
        if (storedTherapist) {
          setTherapistNumber(storedTherapist);
          setTempTherapist(storedTherapist);
        }
        if (storedOther) {
          setOtherNumber(storedOther);
          setTempOther(storedOther);
        }

        // 2. Cloud Sync Load
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.custom_therapist_number !== undefined && data.custom_therapist_number !== storedTherapist) {
              setTherapistNumber(data.custom_therapist_number);
              setTempTherapist(data.custom_therapist_number);
              await AsyncStorage.setItem('custom_therapist_number', data.custom_therapist_number);
            }
            if (data.custom_other_number !== undefined && data.custom_other_number !== storedOther) {
              setOtherNumber(data.custom_other_number);
              setTempOther(data.custom_other_number);
              await AsyncStorage.setItem('custom_other_number', data.custom_other_number);
            }
          }
        }
      } catch (e) {
        console.warn('Failed to load custom emergency contacts in library:', e);
      }
    };
    loadNumbers();
  }, [user]);

  const handleSaveTherapist = async () => {
    try {
      // 1. Offline Save
      await AsyncStorage.setItem('custom_therapist_number', tempTherapist);
      setTherapistNumber(tempTherapist);
      setIsEditingTherapist(false);

      // 2. Cloud Save
      if (user) {
        await setDoc(doc(db, 'users', user.uid), {
          custom_therapist_number: tempTherapist
        }, { merge: true });
      }

      Alert.alert(t('crisis.successSave') || "Saved", t('crisis.successSave') || "Your therapist number has been updated!");
    } catch (e) {
      Alert.alert(t('crisis.error') || "Error", "Could not save therapist number");
    }
  };

  const handleSaveOther = async () => {
    try {
      // 1. Offline Save
      await AsyncStorage.setItem('custom_other_number', tempOther);
      setOtherNumber(tempOther);
      setIsEditingOther(false);

      // 2. Cloud Save
      if (user) {
        await setDoc(doc(db, 'users', user.uid), {
          custom_other_number: tempOther
        }, { merge: true });
      }

      Alert.alert(t('crisis.successSave') || "Saved", t('crisis.successSave') || "Your custom number has been updated!");
    } catch (e) {
      Alert.alert(t('crisis.error') || "Error", "Could not save custom emergency number");
    }
  };

  const handleCall = (number: string) => {
    if (!number) return;
    HapticsAPI.impactAsync(HapticsAPI.ImpactFeedbackStyle.Heavy);
    const formattedNumber = number.replace(/[^\d+]/g, '');
    Linking.openURL(`tel:${formattedNumber}`);
  };

  // Standard professional directory + custom ones
  const standardContacts = [
    { name: t('learn.sim.contactEmergency', { defaultValue: "Emergency Services" }), phone: "112", icon: "alert-circle", color: "#FF4444" },
    { name: t('learn.sim.contactSuicide', { defaultValue: "National Suicide Prevention" }), phone: "988", icon: "heart", color: "#FF8800" },
    { name: t('learn.sim.contactTextLine', { defaultValue: "Crisis Text Line" }), phone: "741741", icon: "phone-portrait", color: "#44BBFF" }
  ];

  return (
    <View style={[simStyles.container, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.accentDeep }]}>
      <Text style={[simStyles.title, { color: colors.text, marginBottom: hp(2) }]}>
        {t('learn.sim.contactsTitle', { defaultValue: "Professional & Personal Contacts" })}
      </Text>

      {/* 1. Standard National Contacts */}
      {standardContacts.map((contact, index) => (
        <TouchableOpacity 
          key={index}
          onPress={() => handleCall(contact.phone)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.surfaceAlt,
            padding: hp(1.8),
            borderRadius: 16,
            marginBottom: hp(1.5),
            borderLeftWidth: 4,
            borderLeftColor: contact.color
          }}
        >
          <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: contact.color + '22', alignItems: 'center', justifyContent: 'center', marginRight: hp(1.8) }}>
            <Ionicons name={contact.icon as any} size={18} color={contact.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: typography.label, color: colors.text, fontSize: rf(14), fontWeight: '700' }}>{contact.name}</Text>
            <Text style={{ fontFamily: typography.body, color: colors.textMuted, fontSize: rf(12.5) }}>{contact.phone}</Text>
          </View>
          <Ionicons name="call-outline" size={18} color={colors.accent} />
        </TouchableOpacity>
      ))}

      {/* 2. Custom Personal Contacts Slot - Therapist */}
      <View style={{ marginTop: hp(1), borderTopWidth: 1, borderTopColor: colors.borderLight, paddingTop: hp(2) }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: hp(1.2) }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="medical" size={14} color={colors.accent} />
            </View>
            <Text style={{ fontFamily: typography.label, color: colors.text, fontSize: rf(13.5), fontWeight: '700' }}>
              {t('crisis.therapistLabel', { defaultValue: "My Personal Therapist" })}
            </Text>
          </View>
          {!isEditingTherapist && (
            <TouchableOpacity onPress={() => { setTempTherapist(therapistNumber); setIsEditingTherapist(true); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Ionicons name="create-outline" size={14} color={colors.accent} />
              <Text style={{ fontFamily: typography.body, color: colors.accent, fontSize: rf(12), fontWeight: '600' }}>{t('crisis.edit', { defaultValue: "Edit" })}</Text>
            </TouchableOpacity>
          )}
        </View>

        {isEditingTherapist ? (
          <View style={{ gap: 8 }}>
            <TextInput
              style={{ height: 44, borderWidth: 1.5, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 12, color: colors.text, fontSize: rf(13), fontFamily: typography.body, backgroundColor: colors.surface }}
              value={tempTherapist}
              onChangeText={setTempTherapist}
              placeholder={t('crisis.therapistPlaceholder', { defaultValue: "Enter therapist phone number" })}
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
            />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity onPress={handleSaveTherapist} style={{ flex: 1, height: 36, backgroundColor: colors.accent, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#fff', fontSize: rf(12), fontFamily: typography.label, fontWeight: 'bold' }}>{t('crisis.save', { defaultValue: "Save" })}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsEditingTherapist(false)} style={{ flex: 1, height: 36, borderWidth: 1, borderColor: colors.border, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface }}>
                <Text style={{ color: colors.textMuted, fontSize: rf(12), fontFamily: typography.label, fontWeight: 'bold' }}>{t('crisis.cancel', { defaultValue: "Cancel" })}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surfaceAlt, padding: hp(1.5), borderRadius: 16, marginBottom: hp(1.5) }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: typography.mono, color: therapistNumber ? colors.text : colors.textMuted, fontSize: rf(15), fontWeight: '700' }}>
                {therapistNumber || t('crisis.notSet', { defaultValue: "Not Set" })}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleCall(therapistNumber)}
              disabled={!therapistNumber}
              style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: therapistNumber ? colors.danger : colors.border, alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons name="call" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 3. Custom Personal Contacts Slot - Personal Emergency */}
      <View style={{ marginTop: hp(1) }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: hp(1.2) }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="people" size={14} color={colors.accent} />
            </View>
            <Text style={{ fontFamily: typography.label, color: colors.text, fontSize: rf(13.5), fontWeight: '700' }}>
              {t('crisis.otherLabel', { defaultValue: "Emergency Contact" })}
            </Text>
          </View>
          {!isEditingOther && (
            <TouchableOpacity onPress={() => { setTempOther(otherNumber); setIsEditingOther(true); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Ionicons name="create-outline" size={14} color={colors.accent} />
              <Text style={{ fontFamily: typography.body, color: colors.accent, fontSize: rf(12), fontWeight: '600' }}>{t('crisis.edit', { defaultValue: "Edit" })}</Text>
            </TouchableOpacity>
          )}
        </View>

        {isEditingOther ? (
          <View style={{ gap: 8 }}>
            <TextInput
              style={{ height: 44, borderWidth: 1.5, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 12, color: colors.text, fontSize: rf(13), fontFamily: typography.body, backgroundColor: colors.surface }}
              value={tempOther}
              onChangeText={setTempOther}
              placeholder={t('crisis.otherPlaceholder', { defaultValue: "Enter contact phone number" })}
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
            />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity onPress={handleSaveOther} style={{ flex: 1, height: 36, backgroundColor: colors.accent, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#fff', fontSize: rf(12), fontFamily: typography.label, fontWeight: 'bold' }}>{t('crisis.save', { defaultValue: "Save" })}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsEditingOther(false)} style={{ flex: 1, height: 36, borderWidth: 1, borderColor: colors.border, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface }}>
                <Text style={{ color: colors.textMuted, fontSize: rf(12), fontFamily: typography.label, fontWeight: 'bold' }}>{t('crisis.cancel', { defaultValue: "Cancel" })}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surfaceAlt, padding: hp(1.5), borderRadius: 16 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: typography.mono, color: otherNumber ? colors.text : colors.textMuted, fontSize: rf(15), fontWeight: '700' }}>
                {otherNumber || t('crisis.notSet', { defaultValue: "Not Set" })}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleCall(otherNumber)}
              disabled={!otherNumber}
              style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: otherNumber ? colors.danger : colors.border, alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons name="call" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const LifestyleAssessment = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [responses, setResponses] = useState({ sleep: '', exercise: '', diet: '', caffeine: '' });
  const [plan, setPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generatePlan = async () => {
    setLoading(true);
    HapticsAPI.impactAsync(HapticsAPI.ImpactFeedbackStyle.Heavy);
    try {
      const rawBaseUrl = process.env.EXPO_PUBLIC_API_URL || 'https://mentalhealthapp-11.onrender.com';
      const baseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
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
      <Text style={{ fontFamily: typography.label, color: colors.text, marginBottom: hp(1) }}>
        {t(`learn.sim.quest_${id}`, { defaultValue: label })}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {options.map(opt => {
          const optKey = opt.replace(/[<>\s+]+/g, '_').toLowerCase();
          return (
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
              <Text style={{ fontFamily: typography.body, color: responses[id] === opt ? 'white' : colors.text, fontSize: rf(13) }}>
                {t(`learn.sim.opt_${optKey}`, { defaultValue: opt })}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <View style={[simStyles.container, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.accentDeep }]}>
      <Text style={[simStyles.title, { color: colors.text, marginBottom: hp(2) }]}>{t('learn.sim.wellnessTitle', { defaultValue: "Wellness Assessment" })}</Text>
      
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
            {loading ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontFamily: typography.label, fontWeight: 'bold' }}>{t('learn.sim.generateSummaryBtn', { defaultValue: "GENERATE BETTER LIVING SUMMARY" })}</Text>}
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
            <Text style={{ color: colors.accent, fontFamily: typography.label }}>{t('learn.sim.retakeBtn', { defaultValue: "RETAKE ASSESSMENT" })}</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
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
    HapticsAPI.impactAsync(HapticsAPI.ImpactFeedbackStyle.Light);
    scale.value = withSequence(
      withTiming(1.3, { duration: 150 }),
      withTiming(1, { duration: 250 })
    );
    setTaps(t => t + 1);
  };

  const handleReset = () => {
    HapticsAPI.impactAsync(HapticsAPI.ImpactFeedbackStyle.Medium);
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
    HapticsAPI.impactAsync(HapticsAPI.ImpactFeedbackStyle.Heavy);
    setIsReleased(true);
    balloonY.value = withTiming(-hp(30), { duration: 3500, easing: Easing.out(Easing.quad) });
    balloonOpacity.value = withTiming(0, { duration: 3500 });
  };

  const handleReset = () => {
    HapticsAPI.impactAsync(HapticsAPI.ImpactFeedbackStyle.Light);
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

const RelievingGames = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [showGamesInfo, setShowGamesInfo] = useState(false);
  
  return (
    <View style={{ marginTop: hp(6), paddingBottom: hp(4) }}>
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

      <Text style={[styles.metaText, { color: colors.textMuted, marginBottom: hp(2) }]}>
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

const AnimatedBreathingBox = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
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
  const { colors, isDark } = useTheme();
  const route = useRoute<ModuleDetailRouteProp>();
  const navigation = useNavigation();
  const { module } = route.params;
  const [stressLevel, setStressLevel] = useState<'low' | 'mid' | 'high' | null>(null);
  const { t } = useTranslation();

  const levelSpecificTips = {
    low: [
      t('learn.levelTips.low.0', { defaultValue: "Maintenance is key: keep up with your daily mindfulness to stay balanced." }),
      t('learn.levelTips.low.1', { defaultValue: "This is a great time for a light walk or reading to reinforce calm." }),
      t('learn.levelTips.low.2', { defaultValue: "Acknowledge and appreciate your current state of mental clarity." })
    ],
    mid: [
      t('learn.levelTips.mid.0', { defaultValue: "Notice where you're holding tension—usually shoulders, jaw, or neck." }),
      t('learn.levelTips.mid.1', { defaultValue: "A 5-minute 'reset' break can prevent your stress from escalating further." }),
      t('learn.levelTips.mid.2', { defaultValue: "Take small sips of water and practice one round of box breathing." })
    ],
    high: [
      t('learn.levelTips.high.0', { defaultValue: "PRIORITY: Stop what you are doing immediately and follow the Breathing Box below." }),
      t('learn.levelTips.high.1', { defaultValue: "Splash cold water on your face—this helps trigger your body's natural relaxation reflex." }),
      t('learn.levelTips.high.2', { defaultValue: "Immediate Grounding: Name 5 things you can see and 4 things you can touch right now." })
    ]
  };

  const isAnxietyModule = module.title.toLowerCase().includes('what is anxiety');

  const currentTips = (isAnxietyModule && stressLevel) 
    ? levelSpecificTips[stressLevel] 
    : module.tips;

  const translatedTitle = t(`learn.modules.m${module.id}.title`, { defaultValue: module.title });
  const translatedCategory = t(`learn.modules.m${module.id}.category`, { defaultValue: module.category });
  const translatedReadTime = t(`learn.modules.m${module.id}.readTime`, { defaultValue: module.readTime });
  const translatedContent = t(`learn.modules.m${module.id}.content`, { defaultValue: module.content });

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.text }]}>{translatedTitle}</Text>
      
      <View style={[styles.meta, { backgroundColor: colors.surfaceAlt, borderColor: colors.borderLight }]}>
        <Text style={[styles.metaText, { color: colors.accentDeep }]}>{translatedCategory.toUpperCase()}</Text>
        <Text style={[styles.metaText, { color: colors.textMuted }]}>
          {t('learn.readLabel', { defaultValue: '{{time}} read', time: translatedReadTime })}
        </Text>
      </View>

      <Text style={[styles.contentBody, { color: colors.text }]}>
        {translatedContent}
      </Text>

      {/* Dynamic sections rendering */}
      {module.sections && module.sections.map((sec: any, sIdx: number) => {
        const translatedSecHeading = t(`learn.modules.m${module.id}.sections.s${sIdx}.heading`, { defaultValue: sec.heading });
        const translatedSecContent = t(`learn.modules.m${module.id}.sections.s${sIdx}.content`, { defaultValue: sec.content });
        return (
          <View key={sIdx} style={{ marginTop: hp(3) }}>
            <Text style={{ fontFamily: typography.display, fontSize: rf(21), fontWeight: '800', color: colors.text, marginBottom: hp(1) }}>
              {translatedSecHeading}
            </Text>
            <Text style={[styles.contentBody, { color: colors.text, lineHeight: rf(24) }]}>
              {translatedSecContent}
            </Text>
            {sec.tips && sec.tips.map((tip: string, tIdx: number) => {
              const translatedSecTip = t(`learn.modules.m${module.id}.sections.s${sIdx}.tips.${tIdx}`, { defaultValue: tip });
              return (
                <View key={tIdx} style={[
                  styles.highlightedTipCard,
                  {
                    backgroundColor: isDark ? 'rgba(93, 191, 110, 0.15)' : 'rgba(90, 156, 58, 0.12)',
                    borderColor: colors.accent,
                    borderLeftColor: colors.accentDeep || colors.accent,
                  }
                ]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                    <Ionicons name="bulb" size={20} color={colors.accentDeep || colors.accent} style={{ marginRight: 8 }} />
                    <Text style={{ fontFamily: typography.display, fontWeight: '800', fontSize: rf(13), color: colors.accentDeep || colors.accent, letterSpacing: 0.5 }}>
                      PRACTICAL INSIGHT
                    </Text>
                  </View>
                  <Text style={[styles.tipText, { color: colors.text, fontSize: rf(15), fontWeight: '700', lineHeight: rf(22) }]}>
                    {translatedSecTip}
                  </Text>
                </View>
              );
            })}
          </View>
        );
      })}

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
          <FlipCard 
            myth={t('learn.sim.myth1', { defaultValue: "Anxiety is just weakness." })} 
            fact={t('learn.sim.fact1', { defaultValue: "Anxiety is a common medical condition related to brain chemistry and environmental stress." })} 
          />
          <FlipCard 
            myth={t('learn.sim.myth2', { defaultValue: "You should just force yourself to calm down." })} 
            fact={t('learn.sim.fact2', { defaultValue: "Forcing calm often increases stress. Acceptance and breathing techniques work better." })} 
          />
        </View>
      )}

      {currentTips && currentTips.length > 0 && (
        <View style={{ marginTop: hp(4) }}>
          <Text style={[styles.tipsTitle, { color: colors.text }]}>
            {stressLevel ? `${t('learn.actionItems', { defaultValue: 'Action Items' })}: ${t('learn.sim.' + stressLevel, { defaultValue: stressLevel }).toUpperCase()}` : t('learn.keyTakeaways', { defaultValue: 'Key Takeaways' })}
          </Text>
          {currentTips.map((tip: string, idx: number) => {
            const translatedTip = (isAnxietyModule && stressLevel)
              ? tip
              : t(`learn.modules.m${module.id}.tips.${idx}`, { defaultValue: tip });
            return (
              <View key={idx} style={[styles.tipCard, { backgroundColor: isDark ? 'rgba(93, 191, 110, 0.1)' : 'rgba(90, 156, 58, 0.08)', borderLeftWidth: 4, borderLeftColor: colors.accent }]}>
                <Ionicons name="checkmark-circle-outline" size={18} color={colors.accent} style={{ marginRight: spacing.sm, marginTop: 1 }} />
                <Text style={[styles.tipText, { color: colors.text, fontWeight: '600' }]}>{translatedTip}</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* NEW: Relieving Games Section */}
      {module.title.toLowerCase().includes('what is anxiety') && <RelievingGames />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: wp(5), paddingBottom: 100 },
  title: {
    fontFamily: typography.display,
    fontSize: rf(32),
    fontWeight: '600',
    marginBottom: hp(2),
  },
  highlightedTipCard: {
    padding: hp(2.2),
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderLeftWidth: 6,
    marginVertical: hp(1.5),
    shadowColor: '#3A6E20',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
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
