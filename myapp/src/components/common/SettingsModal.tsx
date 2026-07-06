import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';
import { spacing, radii } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { wp, hp, rf } from '../../utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import i18next from 'i18next';
import { useAuthStore } from '../../store/authStore';
import { useUserStore } from '../../store/userStore';
import { db } from '../../utils/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import Svg, { Path } from 'react-native-svg';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onNavigateToUserDetails?: () => void;
}

export const SettingsModal = ({ visible, onClose, onNavigateToUserDetails }: SettingsModalProps) => {
  const { t } = useTranslation();
  const { colors, isDark, toggleTheme } = useTheme();
  const { user } = useAuthStore();
  const { profile, setProfile, vibrationEnabled, setVibrationEnabled } = useUserStore();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [profileName, setProfileName] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [hasProfile, setHasProfile] = useState(false);
  const [extraDetails, setExtraDetails] = useState<any>(null);
  const [isEditingInline, setIsEditingInline] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAboutInfo, setShowAboutInfo] = useState(false);

  useEffect(() => {
    if (visible && user) {
      // 1. Instant Cache Load
      setProfileName(profile.name || user.displayName || '');
      setProfileBio(profile.bio || '');
      setHasProfile(!!(profile.name || profile.bio || profile.age || profile.gender || profile.focusArea));
      setExtraDetails(profile);
      setIsEditingInline(false);
      
      // 2. Background Cloud Sync Load
      const loadProfile = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            
            // Sync to Zustand cache if data changed
            const updates: any = {};
            if (data.name !== undefined && data.name !== profile.name) updates.name = data.name;
            if (data.bio !== undefined && data.bio !== profile.bio) updates.bio = data.bio;
            if (data.age !== undefined && data.age.toString() !== profile.age) updates.age = data.age.toString();
            if (data.gender !== undefined && data.gender !== profile.gender) updates.gender = data.gender;
            if (data.stepGoal !== undefined && data.stepGoal.toString() !== profile.stepGoal) updates.stepGoal = data.stepGoal.toString();
            if (data.waterGoal !== undefined && data.waterGoal.toString() !== profile.waterGoal) updates.waterGoal = data.waterGoal.toString();
            if (data.focusArea !== undefined && data.focusArea !== profile.focusArea) updates.focusArea = data.focusArea;
            if (data.preferredWorkout !== undefined && data.preferredWorkout !== profile.preferredWorkout) updates.preferredWorkout = data.preferredWorkout;
            
            if (Object.keys(updates).length > 0) {
              setProfile(updates);
              setProfileName(data.name || '');
              setProfileBio(data.bio || '');
              setHasProfile(!!(data.name || data.bio || data.age || data.gender || data.focusArea));
              setExtraDetails({ ...profile, ...data });
            }
          }
        } catch (e) {
          console.warn('Error loading user profile:', e);
        }
      };
      loadProfile();
    }
  }, [visible, user]);

  const saveProfile = async () => {
    if (!user) return;
    try {
      // 1. Instant Cache Update
      setProfile({
        name: profileName,
        bio: profileBio,
      });

      // Update local state instantly (Optimistic UI updates)
      setHasProfile(true);
      setIsEditingInline(false);
      setExtraDetails((prev: any) => ({
        ...prev,
        name: profileName,
        bio: profileBio,
        updated_at: new Date().toISOString()
      }));

      // 2. Save to Firestore in background (Optimistic background sync)
      setDoc(doc(db, 'users', user.uid), {
        name: profileName,
        bio: profileBio,
        email: user.email,
        updated_at: new Date().toISOString()
      }, { merge: true }).catch(e => {
        console.warn('Background Firestore sync failed:', e);
      });

      import('react-native').then(({ Alert }) => {
        Alert.alert("Success", "Basic profile details saved!");
      });
    } catch (e) {
      console.warn('Error saving profile:', e);
      import('react-native').then(({ Alert }) => {
        Alert.alert("Error", "Could not save profile details.");
      });
    }
  };

  const changeLanguage = (lng: string) => {
    i18next.changeLanguage(lng);
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBg}>
        <View style={[styles.modalCard, { backgroundColor: isDark ? 'rgba(13,27,11,0.95)' : 'rgba(240,247,232,0.95)', borderColor: colors.border }]}>
          
          <View style={styles.headerRow}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t('settings.title')}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: hp(65) }} contentContainerStyle={{ paddingBottom: spacing.xl }}>
            
            {/* User Profile Section */}
            {user && (
              <View style={[styles.profileSection, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Personal Profile</Text>
                
                <View style={styles.avatarRow}>
                  {user.photoURL ? (
                    <Image source={{ uri: user.photoURL }} style={[styles.avatarImg, { borderColor: colors.accent }]} />
                  ) : (
                    <View style={[styles.avatarPlaceholder, { backgroundColor: isDark ? 'rgba(77, 191, 110, 0.12)' : 'rgba(90, 156, 58, 0.12)', borderColor: colors.accent }]}>
                      {profileName ? (
                        <Text style={[styles.avatarInitial, { color: colors.accent }]}>
                          {profileName.trim().charAt(0).toUpperCase()}
                        </Text>
                      ) : (
                        <Ionicons name="person" size={26} color={colors.accent} />
                      )}
                    </View>
                  )}
                  <View style={styles.emailContainer}>
                    <Text style={[styles.emailLabel, { color: colors.text }]} numberOfLines={1}>
                      {profileName || user.displayName || user.email}
                    </Text>
                    <Text style={[styles.userIdText, { color: colors.textMuted }]}>ID: {user.uid.slice(0, 12)}...</Text>
                  </View>
                </View>

                {!hasProfile && !isEditingInline ? (
                  // Case 1: No profile found
                  <View style={{ marginTop: spacing.xs }}>
                    <Text style={[styles.profileInfoText, { color: colors.textMuted, marginBottom: spacing.md }]}>
                      Maintain your fitness goals, mental focus areas, age, gender, and personal bio securely in Firestore!
                    </Text>
                    <TouchableOpacity 
                      style={[styles.primaryActionBtn, { backgroundColor: colors.accent }]}
                      onPress={() => {
                        onClose();
                        if (onNavigateToUserDetails) {
                          onNavigateToUserDetails();
                        } else {
                          setTimeout(() => {
                            navigation.navigate('UserDetails');
                          }, 150);
                        }
                      }}
                    >
                      <Ionicons name="create-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                      <Text style={styles.actionBtnText}>Fill Profile Details</Text>
                    </TouchableOpacity>
                  </View>
                ) : isEditingInline ? (
                  // Inline editing form
                  <View style={{ marginTop: spacing.xs }}>
                    <View style={styles.inputContainer}>
                      <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Display Name</Text>
                      <TextInput
                        style={[styles.textInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                        value={profileName}
                        onChangeText={setProfileName}
                        placeholder="Enter your name"
                        placeholderTextColor={colors.textMuted}
                      />
                    </View>

                    <View style={styles.inputContainer}>
                      <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Bio / Personal Note</Text>
                      <TextInput
                        style={[styles.textInput, styles.textArea, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                        value={profileBio}
                        onChangeText={setProfileBio}
                        placeholder="E.g., Seeking daily mindfulness"
                        placeholderTextColor={colors.textMuted}
                        multiline
                        numberOfLines={3}
                      />
                    </View>

                    <View style={{ flexDirection: 'row', gap: 10, marginTop: spacing.sm }}>
                      <TouchableOpacity 
                        style={[styles.saveBtn, { backgroundColor: colors.accent, flex: 1 }]} 
                        onPress={saveProfile}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <>
                            <Ionicons name="checkmark-circle-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                            <Text style={styles.saveBtnText}>Save</Text>
                          </>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.saveBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, borderWidth: 1, flex: 1 }]} 
                        onPress={() => setIsEditingInline(false)}
                      >
                        <Text style={[styles.saveBtnText, { color: colors.text }]}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  // Case 2: Profile exists, display dashboard details with clean grid and vertical premium edit buttons
                  <View style={{ marginTop: spacing.xs }}>
                    {profileBio ? (
                      <View style={[styles.bioCard, { backgroundColor: isDark ? 'rgba(77, 191, 110, 0.05)' : 'rgba(90, 156, 58, 0.06)', borderLeftColor: colors.accent }]}>
                        <Text style={[styles.bioPreviewText, { color: colors.text, fontStyle: 'italic' }]}>
                          &quot;{profileBio}&quot;
                        </Text>
                      </View>
                    ) : null}

                    <View style={styles.infoGrid}>
                      <View style={[styles.gridItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Ionicons name="calendar-outline" size={20} color={colors.accent} />
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.gridItemLabel, { color: colors.textMuted }]}>Age</Text>
                          <Text style={[styles.gridItemValue, { color: colors.text }]} numberOfLines={1}>
                            {extraDetails?.age || '—'}
                          </Text>
                        </View>
                      </View>

                      <View style={[styles.gridItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Ionicons name="person-outline" size={20} color={colors.accent} />
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.gridItemLabel, { color: colors.textMuted }]}>Gender</Text>
                          <Text style={[styles.gridItemValue, { color: colors.text }]} numberOfLines={1}>
                            {extraDetails?.gender || '—'}
                          </Text>
                        </View>
                      </View>

                      <View style={[styles.gridItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Ionicons name="footsteps-outline" size={20} color={colors.accent} />
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.gridItemLabel, { color: colors.textMuted }]}>Steps Goal</Text>
                          <Text style={[styles.gridItemValue, { color: colors.text }]} numberOfLines={1}>
                            {extraDetails?.stepGoal || '6000'}
                          </Text>
                        </View>
                      </View>

                      <View style={[styles.gridItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Ionicons name="locate-outline" size={20} color={colors.accent} />
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.gridItemLabel, { color: colors.textMuted }]}>Focus Area</Text>
                          <Text style={[styles.gridItemValue, { color: colors.text }]} numberOfLines={1}>
                            {extraDetails?.focusArea || 'Mindfulness'}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={{ gap: 10, marginTop: spacing.lg }}>
                      <TouchableOpacity 
                        style={[styles.premiumEditBtn, { backgroundColor: colors.accent, shadowColor: colors.accent }]}
                        onPress={() => {
                          onClose();
                          if (onNavigateToUserDetails) {
                            onNavigateToUserDetails();
                          } else {
                            setTimeout(() => {
                              navigation.navigate('UserDetails');
                            }, 150);
                          }
                        }}
                      >
                        <Ionicons name="settings-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.premiumEditBtnText}>Edit Goals & Wellness</Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={[styles.premiumEditBtnSecondary, { borderColor: colors.border, backgroundColor: colors.surface }]}
                        onPress={() => setIsEditingInline(true)}
                      >
                        <Ionicons name="create-outline" size={18} color={colors.accent} style={{ marginRight: 8 }} />
                        <Text style={[styles.premiumEditBtnText, { color: colors.text }]}>Update Name & Bio</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Theme Section */}
            <Text style={[styles.sectionTitle, { color: colors.textMuted, marginTop: spacing.md }]}>{t('settings.theme')}</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.optionBtn, !isDark ? { backgroundColor: colors.accent, borderColor: colors.accent } : { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => { if (isDark) toggleTheme(); }}
              >
                <Text style={[styles.optionText, !isDark ? { color: '#fff' } : { color: colors.text }]}>{t('settings.lightMode')}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.optionBtn, isDark ? { backgroundColor: colors.accent, borderColor: colors.accent } : { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => { if (!isDark) toggleTheme(); }}
              >
                <Text style={[styles.optionText, isDark ? { color: '#fff' } : { color: colors.text }]}>{t('settings.darkMode')}</Text>
              </TouchableOpacity>
            </View>

            {/* Haptic Vibration Section */}
            <Text style={[styles.sectionTitle, { color: colors.textMuted, marginTop: spacing.xl }]}>Haptic Vibration</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.optionBtn, vibrationEnabled ? { backgroundColor: colors.accent, borderColor: colors.accent } : { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => setVibrationEnabled(true)}
              >
                <Text style={[styles.optionText, vibrationEnabled ? { color: '#fff' } : { color: colors.text }]}>Vibration On</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.optionBtn, !vibrationEnabled ? { backgroundColor: colors.accent, borderColor: colors.accent } : { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => setVibrationEnabled(false)}
              >
                <Text style={[styles.optionText, !vibrationEnabled ? { color: '#fff' } : { color: colors.text }]}>Vibration Off</Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.sectionTitle, { color: colors.textMuted, marginTop: spacing.xl }]}>{t('settings.language')}</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.optionBtn, i18next.language === 'en' ? { backgroundColor: colors.accent, borderColor: colors.accent } : { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => changeLanguage('en')}
              >
                <Text style={[styles.optionText, i18next.language === 'en' ? { color: '#fff' } : { color: colors.text }]}>{t('settings.english')}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.optionBtn, i18next.language === 'kn' ? { backgroundColor: colors.accent, borderColor: colors.accent } : { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => changeLanguage('kn')}
              >
                <Text style={[styles.optionText, i18next.language === 'kn' ? { color: '#fff' } : { color: colors.text }]}>{t('settings.kannada')}</Text>
              </TouchableOpacity>
            </View>

            {/* About Section */}
            <Text style={[styles.sectionTitle, { color: colors.textMuted, marginTop: spacing.xl }]}>About</Text>
            <TouchableOpacity 
              style={[styles.aboutBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
              onPress={() => setShowAboutInfo(true)}
            >
              <Ionicons name="information-circle-outline" size={20} color={colors.text} style={{ marginRight: 10 }} />
              <Text style={[styles.aboutText, { color: colors.text }]}>Mind Matrix Information</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.signOutBtn, { backgroundColor: colors.danger }]} 
              onPress={async () => { 
                try {
                  const { signOut } = await import('firebase/auth');
                  const { auth } = await import('../../utils/firebase');
                  await signOut(auth);
                  onClose();
                } catch (e) {
                  console.error(e);
                }
              }}
            >
              <Ionicons name="log-out-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.signOutText}>{t('settings.signOut')}</Text>
            </TouchableOpacity>
          </ScrollView>

        </View>
      </View>
    </Modal>

    {/* Premium Visual About Modal */}
    <Modal visible={showAboutInfo} transparent animationType="fade" onRequestClose={() => setShowAboutInfo(false)}>
      <View style={styles.aboutModalBg}>
        <View style={[styles.aboutModalCard, { backgroundColor: isDark ? 'rgba(11,26,9,0.98)' : 'rgba(235,245,225,0.98)', borderColor: colors.border }]}>
          
          <View style={[styles.aboutHeaderBadge, { backgroundColor: colors.accentSoft }]}>
            {/* Botanical Premium Svg Logo inside About Modal */}
            <Svg width="56" height="56" viewBox="0 0 24 24">
              <Path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2M12 18V10M12 6H12.01" stroke={colors.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </Svg>
          </View>

          <Text style={[styles.aboutTitleText, { color: colors.text }]}>Mind Matrix</Text>
          <Text style={[styles.aboutSubtitleText, { color: colors.accent }]}>Your Botanical Mind Companion</Text>
          <Text style={[styles.aboutVersionText, { color: colors.textMuted }]}>Version 1.2.0 (Build 302)</Text>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <ScrollView style={styles.aboutScroll} showsVerticalScrollIndicator={false}>
            <Text style={[styles.aboutDescription, { color: colors.text }]}>
              Mind Matrix is designed to help you nurture mental clarity, track holistic patterns, and find deep relaxation in your daily life. It features evidence-based Cognitive Behavioral tools, customizable daily check-in triggers, immersive breathing and nature soundtracks, and an interactive Anxiety Meter with a dynamic Coping Strategies checklist. It also includes a battery-optimized, orientation-independent physical step counter sandbox utilizing raw accelerometer DSP for precise footstep tracking.
            </Text>

            <Text style={[styles.featuresHeader, { color: colors.text }]}>KEY COMPANION FEATURES</Text>
            
            <View style={styles.featureItem}>
              <Ionicons name="flame-outline" size={16} color={colors.accent} style={{ marginRight: 8 }} />
              <Text style={[styles.featureText, { color: colors.text }]}>Daily Mood Tracker & Streak Retention</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="journal-outline" size={16} color={colors.accent} style={{ marginRight: 8 }} />
              <Text style={[styles.featureText, { color: colors.text }]}>CBT Reframing Thought Diary</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="radio-button-off-outline" size={16} color={colors.accent} style={{ marginRight: 8 }} />
              <Text style={[styles.featureText, { color: colors.text }]}>Box Breathing Guided Meditation</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="musical-notes-outline" size={16} color={colors.accent} style={{ marginRight: 8 }} />
              <Text style={[styles.featureText, { color: colors.text }]}>Immersive Nature Soundscapes</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="walk-outline" size={16} color={colors.accent} style={{ marginRight: 8 }} />
              <Text style={[styles.featureText, { color: colors.text }]}>Interactive Step Counter & Activity Goals</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="restaurant-outline" size={16} color={colors.accent} style={{ marginRight: 8 }} />
              <Text style={[styles.featureText, { color: colors.text }]}>Personalized Appetite Guidelines</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="pulse-outline" size={16} color={colors.accent} style={{ marginRight: 8 }} />
              <Text style={[styles.featureText, { color: colors.text }]}>Interactive Stress Meter & Coping Checklist</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="notifications-outline" size={16} color={colors.accent} style={{ marginRight: 8 }} />
              <Text style={[styles.featureText, { color: colors.text }]}>Custom Repeating Check-in Triggers & Reminders</Text>
            </View>
            
            <Text style={[styles.creditsText, { color: colors.textMuted }]}>
              Designed and built with care by the Mind Matrix Developer Team. Incorporating high-fidelity botanical styling, orientation-independent accelerometer DSP, and responsive native modules.
            </Text>
          </ScrollView>

          <TouchableOpacity 
            style={[styles.aboutCloseBtn, { backgroundColor: colors.accent }]}
            onPress={() => setShowAboutInfo(false)}
          >
            <Ionicons name="close" size={18} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.aboutCloseBtnText}>{t('settings.close')}</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    width: '100%',
    padding: hp(3),
    paddingBottom: hp(5),
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(2.5),
  },
  modalTitle: {
    fontFamily: typography.display,
    fontSize: rf(26),
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontFamily: typography.label,
    fontSize: rf(11),
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: hp(1.2),
  },
  profileSection: {
    padding: spacing.lg,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: hp(2.5),
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(2),
    gap: 14,
  },
  avatarImg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarInitial: {
    fontFamily: typography.display,
    fontSize: rf(20),
    fontWeight: 'bold',
  },
  emailContainer: {
    flex: 1,
  },
  emailLabel: {
    fontFamily: typography.body,
    fontSize: rf(16),
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
  userIdText: {
    fontFamily: typography.mono,
    fontSize: rf(10),
    marginTop: 3,
    letterSpacing: 0.5,
    opacity: 0.8,
  },
  profileInfoText: {
    fontFamily: typography.body,
    fontSize: rf(13),
    lineHeight: rf(19),
  },
  bioCard: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    borderLeftWidth: 4,
    marginBottom: hp(2),
    marginTop: hp(0.5),
  },
  bioPreviewText: {
    fontFamily: typography.body,
    fontSize: rf(13),
    lineHeight: rf(19),
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: hp(0.5),
  },
  gridItem: {
    width: '48%',
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  gridItemIcon: {
    fontSize: rf(18),
  },
  gridItemLabel: {
    fontFamily: typography.label,
    fontSize: rf(9),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  gridItemValue: {
    fontFamily: typography.body,
    fontSize: rf(12),
    fontWeight: 'bold',
  },
  premiumEditBtn: {
    flexDirection: 'row',
    paddingVertical: hp(1.6),
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  premiumEditBtnSecondary: {
    flexDirection: 'row',
    paddingVertical: hp(1.6),
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    borderWidth: 1.5,
  },
  premiumEditBtnText: {
    color: '#fff',
    fontFamily: typography.label,
    fontSize: rf(12.5),
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    paddingVertical: hp(1.5),
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: '#fff',
    fontFamily: typography.label,
    fontSize: rf(13),
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  inputContainer: {
    marginBottom: hp(1.5),
  },
  inputLabel: {
    fontFamily: typography.label,
    fontSize: rf(10),
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  textInput: {
    fontFamily: typography.body,
    fontSize: rf(13),
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(1.2),
    borderRadius: radii.lg,
    borderWidth: 1.5,
  },
  textArea: {
    height: hp(8),
    textAlignVertical: 'top',
  },
  saveBtn: {
    flexDirection: 'row',
    paddingVertical: hp(1.3),
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  saveBtnText: {
    color: '#fff',
    fontFamily: typography.label,
    fontSize: rf(12),
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: hp(1.5),
  },
  optionBtn: {
    flex: 1,
    paddingVertical: hp(1.4),
    borderWidth: 1.5,
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  optionText: {
    fontFamily: typography.body,
    fontSize: rf(13),
    fontWeight: '600',
  },
  aboutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(1.6),
    paddingHorizontal: wp(4),
    borderWidth: 1,
    borderRadius: radii.lg,
    marginBottom: hp(1.5),
  },
  aboutText: {
    fontFamily: typography.body,
    fontSize: rf(13),
    fontWeight: '500',
  },
  signOutBtn: {
    flexDirection: 'row',
    marginTop: hp(3),
    paddingVertical: hp(1.8),
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  signOutText: {
    color: '#fff',
    fontFamily: typography.label,
    fontSize: rf(13),
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: 'bold',
  },
  aboutModalBg: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  aboutModalCard: {
    width: '92%',
    maxHeight: '80%',
    padding: spacing.xl,
    borderRadius: 28,
    borderWidth: 1.5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 24,
  },
  aboutHeaderBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  aboutTitleText: {
    fontFamily: typography.display,
    fontSize: rf(26),
    fontWeight: 'bold',
    marginBottom: 2,
  },
  aboutSubtitleText: {
    fontFamily: typography.body,
    fontSize: rf(14),
    fontWeight: '600',
    marginBottom: 4,
  },
  aboutVersionText: {
    fontFamily: typography.mono,
    fontSize: rf(11),
    marginBottom: spacing.md,
  },
  divider: {
    width: '100%',
    height: 1,
    marginBottom: spacing.md,
  },
  aboutScroll: {
    width: '100%',
    flexGrow: 0,
    marginBottom: spacing.lg,
  },
  aboutDescription: {
    fontFamily: typography.body,
    fontSize: rf(13.5),
    lineHeight: rf(19),
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  featuresHeader: {
    fontFamily: typography.label,
    fontSize: rf(11),
    fontWeight: 'bold',
    letterSpacing: 1,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
  },
  featureText: {
    fontFamily: typography.body,
    fontSize: rf(13),
  },
  creditsText: {
    fontFamily: typography.body,
    fontSize: rf(11.5),
    lineHeight: rf(17),
    textAlign: 'center',
    marginTop: spacing.md,
  },
  aboutCloseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(1.6),
    paddingHorizontal: spacing.xl,
    borderRadius: radii.pill,
    width: '100%',
  },
  aboutCloseBtnText: {
    color: '#fff',
    fontFamily: typography.label,
    fontSize: rf(13),
    fontWeight: 'bold',
    textTransform: 'uppercase',
  }
});
