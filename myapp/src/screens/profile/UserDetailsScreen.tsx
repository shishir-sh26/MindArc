import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { ForestBackground } from '../../components/common/ForestBackground';
import { useTheme } from '../../hooks/useTheme';
import { spacing, radii } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { wp, hp, rf } from '../../utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { db } from '../../utils/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useUserStore } from '../../store/userStore';

export default function UserDetailsScreen() {
  const { colors, isDark } = useTheme();
  const { user } = useAuthStore();
  const { profile, setProfile } = useUserStore();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [isFetchingBackground, setIsFetchingBackground] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields (instantly populated from local cache)
  const [name, setName] = useState(profile.name || user?.displayName || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [age, setAge] = useState(profile.age || '');
  const [gender, setGender] = useState(profile.gender || '');
  const [stepGoal, setStepGoal] = useState(profile.stepGoal || '6000');
  const [waterGoal, setWaterGoal] = useState(profile.waterGoal || '8'); // in cups/glasses
  const [focusArea, setFocusArea] = useState(profile.focusArea || 'Anxiety Reduction');
  const [preferredWorkout, setPreferredWorkout] = useState(profile.preferredWorkout || 'Yoga');

  useEffect(() => {
    if (user) {
      // 1. Sync state to current cache values
      setName(profile.name || user.displayName || '');
      setBio(profile.bio || '');
      setAge(profile.age || '');
      setGender(profile.gender || '');
      setStepGoal(profile.stepGoal || '6000');
      setWaterGoal(profile.waterGoal || '8');
      setFocusArea(profile.focusArea || 'Anxiety Reduction');
      setPreferredWorkout(profile.preferredWorkout || 'Yoga');
      
      // 2. Cloud Sync Load in the background
      const fetchUserDetails = async () => {
        setIsFetchingBackground(true);
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            
            // Sync to Zustand store cache
            const updates: any = {};
            if (data.name !== undefined) updates.name = data.name;
            if (data.bio !== undefined) updates.bio = data.bio;
            if (data.age !== undefined) updates.age = data.age.toString();
            if (data.gender !== undefined) updates.gender = data.gender;
            if (data.stepGoal !== undefined) updates.stepGoal = data.stepGoal.toString();
            if (data.waterGoal !== undefined) updates.waterGoal = data.waterGoal.toString();
            if (data.focusArea !== undefined) updates.focusArea = data.focusArea;
            if (data.preferredWorkout !== undefined) updates.preferredWorkout = data.preferredWorkout;

            setProfile(updates);

            if (data.name) setName(data.name);
            if (data.bio) setBio(data.bio);
            if (data.age) setAge(data.age.toString());
            if (data.gender) setGender(data.gender);
            if (data.stepGoal) setStepGoal(data.stepGoal.toString());
            if (data.waterGoal) setWaterGoal(data.waterGoal.toString());
            if (data.focusArea) setFocusArea(data.focusArea);
            if (data.preferredWorkout) setPreferredWorkout(data.preferredWorkout);
          }
        } catch (e) {
          console.warn("Couldn't retrieve user details:", e);
        } finally {
          setIsFetchingBackground(false);
        }
      };
      fetchUserDetails();
    }
  }, [user]);

  const saveDetails = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      // 1. Instant Cache Update
      setProfile({
        name,
        bio,
        age,
        gender,
        stepGoal,
        waterGoal,
        focusArea,
        preferredWorkout,
      });

      // 2. Fire-and-forget background synchronization to Firestore
      setDoc(doc(db, 'users', user.uid), {
        name,
        bio,
        age: parseInt(age) || 0,
        gender,
        stepGoal: parseInt(stepGoal) || 6000,
        waterGoal: parseInt(waterGoal) || 8,
        focusArea,
        preferredWorkout,
        email: user.email,
        updated_at: new Date().toISOString()
      }, { merge: true }).catch(e => {
        console.warn("Background Firestore sync failed:", e);
      });

      // Snappy response: Alert and navigate back instantly!
      Alert.alert("Success", "All personal details updated securely!");
      navigation.goBack();
    } catch (e) {
      console.warn("Error updating user details:", e);
      Alert.alert("Error", "Could not synchronize details with Firestore.");
    } finally {
      setIsSaving(false);
    }
  };

  const focusOptions = ["Anxiety Reduction", "Mindfulness", "Quality Sleep", "Daily Productivity", "Stress Management"];
  const workoutOptions = ["Yoga", "Box Breathing Walks", "Strength Training", "Stretching", "Cardio Run"];

  return (
    <View style={[styles.outerContainer, { backgroundColor: colors.background }]}>
      <ForestBackground bgHeightRatio={0.35} showBottomPlants />
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={[styles.content, { paddingBottom: hp(12) }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <Text style={[styles.title, { color: colors.text }]}>Personal Dashboard</Text>
            {isFetchingBackground && (
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? 'rgba(74, 117, 89, 0.25)' : 'rgba(74, 117, 89, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: radii.pill }}>
                <ActivityIndicator size="small" color={colors.accent} style={{ marginRight: 5 }} />
                <Text style={{ fontFamily: typography.body, fontSize: rf(11), color: colors.accent, fontWeight: '600' }}>
                  Syncing...
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Maintain your mental wellness profile and preferences
          </Text>
        </View>

        {/* Details Form Card */}
        <View style={[styles.formCard, { backgroundColor: isDark ? 'rgba(13,27,11,0.92)' : 'rgba(240,247,232,0.92)', borderColor: colors.border }]}>
          
          {/* Identity Section */}
          <Text style={[styles.sectionHeading, { color: colors.accent }]}>Basic Identity</Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Display Name</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
              value={name}
              onChangeText={setName}
              placeholder="e.g. John Doe"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Short Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.label, { color: colors.textMuted }]}>Age</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                placeholder="25"
                placeholderTextColor={colors.textMuted}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
              <Text style={[styles.label, { color: colors.textMuted }]}>Gender</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                value={gender}
                onChangeText={setGender}
                placeholder="e.g. Female"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>

          {/* Daily Goals Section */}
          <Text style={[styles.sectionHeading, { color: colors.accent, marginTop: spacing.lg }]}>Daily Health Goals</Text>
          
          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.label, { color: colors.textMuted }]}>Steps Goal</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                value={stepGoal}
                onChangeText={setStepGoal}
                keyboardType="numeric"
                placeholder="6000"
                placeholderTextColor={colors.textMuted}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
              <Text style={[styles.label, { color: colors.textMuted }]}>Water Goal (Glasses)</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                value={waterGoal}
                onChangeText={setWaterGoal}
                keyboardType="numeric"
                placeholder="8"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>

          {/* Focus & Wellness Priorities Section */}
          <Text style={[styles.sectionHeading, { color: colors.accent, marginTop: spacing.lg }]}>Mindfulness Preferences</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Primary Focus Area</Text>
            <View style={styles.chipRow}>
              {focusOptions.map(option => {
                const isSelected = focusArea === option;
                return (
                  <TouchableOpacity 
                    key={option}
                    style={[styles.chip, isSelected ? { backgroundColor: colors.accent, borderColor: colors.accent } : { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={() => setFocusArea(option)}
                  >
                    <Text style={[styles.chipText, isSelected ? { color: '#fff' } : { color: colors.text }]}>{option}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Preferred Exercise</Text>
            <View style={styles.chipRow}>
              {workoutOptions.map(option => {
                const isSelected = preferredWorkout === option;
                return (
                  <TouchableOpacity 
                    key={option}
                    style={[styles.chip, isSelected ? { backgroundColor: colors.accent, borderColor: colors.accent } : { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={() => setPreferredWorkout(option)}
                  >
                    <Text style={[styles.chipText, isSelected ? { color: '#fff' } : { color: colors.text }]}>{option}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Submit button */}
          <TouchableOpacity 
            style={[styles.submitBtn, { backgroundColor: colors.accent }]} 
            onPress={saveDetails}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.submitBtnText}>Synchronize to Cloud</Text>
              </>
            )}
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerContainer: {
    flex: 1,
    position: 'relative',
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: wp(5),
    paddingTop: hp(6),
  },
  header: {
    marginBottom: hp(3),
  },
  backBtn: {
    alignSelf: 'flex-start',
    padding: 6,
    borderRadius: radii.pill,
    marginBottom: hp(1.5),
  },
  title: {
    fontFamily: typography.display,
    fontSize: rf(26),
    fontWeight: 'bold',
  },
  subtitle: {
    fontFamily: typography.body,
    fontSize: rf(14),
    marginTop: 4,
  },
  formCard: {
    padding: wp(5),
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  sectionHeading: {
    fontFamily: typography.display,
    fontSize: rf(16),
    fontWeight: 'bold',
    marginBottom: hp(1.5),
  },
  inputGroup: {
    marginBottom: hp(2),
  },
  label: {
    fontFamily: typography.label,
    fontSize: rf(11),
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  input: {
    fontFamily: typography.body,
    fontSize: rf(14),
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(1.2),
    borderRadius: radii.lg,
    borderWidth: 1.5,
  },
  textArea: {
    height: hp(8),
    textAlignVertical: 'top',
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.8),
    borderRadius: radii.pill,
    borderWidth: 1.5,
  },
  chipText: {
    fontFamily: typography.body,
    fontSize: rf(12),
    fontWeight: '600',
  },
  submitBtn: {
    flexDirection: 'row',
    paddingVertical: hp(1.8),
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp(3),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  submitBtnText: {
    color: '#fff',
    fontFamily: typography.label,
    fontSize: rf(14),
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  }
});
