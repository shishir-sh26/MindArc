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
import { db } from '../../utils/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SettingsModal = ({ visible, onClose }: SettingsModalProps) => {
  const { t } = useTranslation();
  const { colors, isDark, toggleTheme } = useTheme();
  const { user } = useAuthStore();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [profileName, setProfileName] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [hasProfile, setHasProfile] = useState(false);
  const [extraDetails, setExtraDetails] = useState<any>(null);
  const [isEditingInline, setIsEditingInline] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (visible && user) {
      setProfileName(user.displayName || '');
      setProfileBio('');
      setHasProfile(false);
      setExtraDetails(null);
      setIsEditingInline(false);
      
      const loadProfile = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setExtraDetails(data);
            if (data.name) setProfileName(data.name);
            if (data.bio) setProfileBio(data.bio);
            
            // If the user has completed at least basic identity or profile goals
            if (data.name || data.bio || data.age || data.gender || data.focusArea) {
              setHasProfile(true);
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
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        name: profileName,
        bio: profileBio,
        email: user.email,
        updated_at: new Date().toISOString()
      }, { merge: true });
      
      // Update local state to reflect changes
      setHasProfile(true);
      setIsEditingInline(false);
      
      // Fetch fresh doc
      const freshDoc = await getDoc(doc(db, 'users', user.uid));
      if (freshDoc.exists()) {
        setExtraDetails(freshDoc.data());
      }

      import('react-native').then(({ Alert }) => {
        Alert.alert("Success", "Basic profile details saved!");
      });
    } catch (e) {
      console.warn('Error saving profile:', e);
      import('react-native').then(({ Alert }) => {
        Alert.alert("Error", "Could not save profile details.");
      });
    } finally {
      setIsSaving(false);
    }
  };

  const changeLanguage = (lng: string) => {
    i18next.changeLanguage(lng);
  };

  return (
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
                    <Image source={{ uri: user.photoURL }} style={styles.avatarImg} />
                  ) : (
                    <View style={[styles.avatarPlaceholder, { backgroundColor: colors.accentSoft }]}>
                      <Ionicons name="person" size={26} color={colors.accent} />
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
                        navigation.navigate('UserDetails');
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
                  // Case 2: Profile exists, display dashboard details with View/Update buttons
                  <View style={{ marginTop: spacing.xs }}>
                    {profileBio ? (
                      <Text style={[styles.bioPreviewText, { color: colors.text }]}>
                        &quot;{profileBio}&quot;
                      </Text>
                    ) : null}

                    <View style={styles.miniGrid}>
                      {extraDetails?.age ? (
                        <Text style={[styles.miniGridText, { color: colors.textMuted }]}>
                          🎂 Age: <Text style={{ color: colors.text, fontWeight: 'bold' }}>{extraDetails.age}</Text>
                        </Text>
                      ) : null}
                      {extraDetails?.gender ? (
                        <Text style={[styles.miniGridText, { color: colors.textMuted }]}>
                          👤 Gender: <Text style={{ color: colors.text, fontWeight: 'bold' }}>{extraDetails.gender}</Text>
                        </Text>
                      ) : null}
                      {extraDetails?.stepGoal ? (
                        <Text style={[styles.miniGridText, { color: colors.textMuted }]}>
                          🔥 Steps: <Text style={{ color: colors.text, fontWeight: 'bold' }}>{extraDetails.stepGoal}</Text>
                        </Text>
                      ) : null}
                      {extraDetails?.focusArea ? (
                        <Text style={[styles.miniGridText, { color: colors.textMuted }]}>
                          🎯 Focus: <Text style={{ color: colors.text, fontWeight: 'bold' }}>{extraDetails.focusArea}</Text>
                        </Text>
                      ) : null}
                    </View>

                    <View style={{ flexDirection: 'row', gap: 10, marginTop: spacing.md }}>
                      <TouchableOpacity 
                        style={[styles.saveBtn, { backgroundColor: colors.accent, flex: 1 }]}
                        onPress={() => {
                          onClose();
                          navigation.navigate('UserDetails');
                        }}
                      >
                        <Ionicons name="eye-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                        <Text style={styles.saveBtnText}>View Full</Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={[styles.saveBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, borderWidth: 1, flex: 1 }]}
                        onPress={() => setIsEditingInline(true)}
                      >
                        <Ionicons name="create-outline" size={18} color={colors.text} style={{ marginRight: 6 }} />
                        <Text style={[styles.saveBtnText, { color: colors.text }]}>Update Basic</Text>
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
                style={[styles.optionBtn, !isDark && { backgroundColor: colors.accent, borderColor: colors.accent }, { borderColor: colors.border, backgroundColor: colors.surface }]}
                onPress={() => { if (isDark) toggleTheme(); }}
              >
                <Text style={[styles.optionText, !isDark ? { color: '#fff' } : { color: colors.text }]}>{t('settings.lightMode')}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.optionBtn, isDark && { backgroundColor: colors.accent, borderColor: colors.accent }, { borderColor: colors.border, backgroundColor: colors.surface }]}
                onPress={() => { if (!isDark) toggleTheme(); }}
              >
                <Text style={[styles.optionText, isDark ? { color: '#fff' } : { color: colors.text }]}>{t('settings.darkMode')}</Text>
              </TouchableOpacity>
            </View>

            {/* Language Section */}
            <Text style={[styles.sectionTitle, { color: colors.textMuted, marginTop: spacing.xl }]}>{t('settings.language')}</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.optionBtn, i18next.language === 'en' && { backgroundColor: colors.accent, borderColor: colors.accent }, { borderColor: colors.border, backgroundColor: colors.surface }]}
                onPress={() => changeLanguage('en')}
              >
                <Text style={[styles.optionText, i18next.language === 'en' ? { color: '#fff' } : { color: colors.text }]}>{t('settings.english')}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.optionBtn, i18next.language === 'kn' && { backgroundColor: colors.accent, borderColor: colors.accent }, { borderColor: colors.border, backgroundColor: colors.surface }]}
                onPress={() => changeLanguage('kn')}
              >
                <Text style={[styles.optionText, i18next.language === 'kn' ? { color: '#fff' } : { color: colors.text }]}>{t('settings.kannada')}</Text>
              </TouchableOpacity>
            </View>

            {/* About Section */}
            <Text style={[styles.sectionTitle, { color: colors.textMuted, marginTop: spacing.xl }]}>About</Text>
            <TouchableOpacity 
              style={[styles.aboutBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
              onPress={() => {
                import('react-native').then(({ Alert }) => {
                  Alert.alert("About MindArc", "MindArc is your personal mental health companion. Built with care to help you track moods, reframe thoughts, and find moments of peace in your busy day.\n\nVersion 1.0.0");
                });
              }}
            >
              <Ionicons name="information-circle-outline" size={20} color={colors.text} style={{ marginRight: 10 }} />
              <Text style={[styles.aboutText, { color: colors.text }]}>MindArc Information</Text>
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
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    marginBottom: hp(2.5),
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1.5),
    gap: 12,
  },
  avatarImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emailContainer: {
    flex: 1,
  },
  emailLabel: {
    fontFamily: typography.body,
    fontSize: rf(14),
    fontWeight: 'bold',
  },
  userIdText: {
    fontFamily: typography.mono,
    fontSize: rf(11),
    marginTop: 2,
  },
  profileInfoText: {
    fontFamily: typography.body,
    fontSize: rf(13),
    lineHeight: rf(18),
  },
  bioPreviewText: {
    fontFamily: typography.body,
    fontStyle: 'italic',
    fontSize: rf(13.5),
    lineHeight: rf(18),
    marginBottom: hp(1),
  },
  miniGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: hp(0.5),
  },
  miniGridText: {
    fontFamily: typography.body,
    fontSize: rf(12.5),
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
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
  }
});
