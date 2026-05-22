import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ForestBackground } from '../../components/common/ForestBackground';
import { useTheme } from '../../hooks/useTheme';
import { Card } from '../../components/common/Card';
import { spacing, radii } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { wp, hp, rf } from '../../utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export default function CrisisScreen() {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();

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
      } catch (e) {
        console.warn('Failed to load custom emergency contacts:', e);
      }
    };
    loadNumbers();
  }, []);

  const handleSaveTherapist = async () => {
    try {
      await AsyncStorage.setItem('custom_therapist_number', tempTherapist);
      setTherapistNumber(tempTherapist);
      setIsEditingTherapist(false);
      Alert.alert(t('crisis.successSave') || "Saved", t('crisis.successSave') || "Your therapist number has been updated!");
    } catch (e) {
      Alert.alert(t('crisis.error'), "Could not save therapist number");
    }
  };

  const handleSaveOther = async () => {
    try {
      await AsyncStorage.setItem('custom_other_number', tempOther);
      setOtherNumber(tempOther);
      setIsEditingOther(false);
      Alert.alert(t('crisis.successSave') || "Saved", t('crisis.successSave') || "Your custom number has been updated!");
    } catch (e) {
      Alert.alert(t('crisis.error'), "Could not save custom emergency number");
    }
  };

  const handleCall = (number: string) => {
    if (!number) return;
    // Standardize number format by removing non-digits for tel: scheme
    const formattedNumber = number.replace(/[^\d+]/g, '');
    const url = `tel:${formattedNumber}`;
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert(t('crisis.error'), t('crisis.noCallSupport'));
      }
    });
  };

  // 5 Indian Helpline Options
  const IndianHelplines = [
    {
      id: 'e112',
      name: t('crisis.helplines.e112.name'),
      desc: t('crisis.helplines.e112.desc'),
      number: '112',
      hours: t('crisis.helplines.e112.hours')
    },
    {
      id: 'telemanas',
      name: t('crisis.helplines.telemanas.name'),
      desc: t('crisis.helplines.telemanas.desc'),
      number: '14416', // routes to 14416 / 1-800-891-4416
      hours: t('crisis.helplines.telemanas.hours')
    },
    {
      id: 'kiran',
      name: t('crisis.helplines.kiran.name'),
      desc: t('crisis.helplines.kiran.desc'),
      number: '1800-599-0019',
      hours: t('crisis.helplines.kiran.hours')
    },
    {
      id: 'vandrevala',
      name: t('crisis.helplines.vandrevala.name'),
      desc: t('crisis.helplines.vandrevala.desc'),
      number: '91 9999 666 555',
      hours: t('crisis.helplines.vandrevala.hours')
    },
    {
      id: 'aasra',
      name: t('crisis.helplines.aasra.name'),
      desc: t('crisis.helplines.aasra.desc'),
      number: '9820466728',
      hours: t('crisis.helplines.aasra.hours')
    }
  ];

  return (
    <View style={[styles.outerContainer, { backgroundColor: colors.background }]}>
      <ForestBackground bgHeightRatio={0.34} showBottomPlants={false} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="heart" size={48} color={colors.danger} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>{t('crisis.notAlone')}</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {t('crisis.reachOut')}
          </Text>
        </View>

        {/* Section 1: Personal Support Numbers */}
        <Text style={[styles.sectionHeading, { color: colors.accent }]}>
          {t('crisis.personalTitle')}
        </Text>

        {/* Card 1: Therapist Number */}
        <Card style={styles.contactCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderLeft}>
              <View style={[styles.avatarBadge, { backgroundColor: colors.accentSoft }]}>
                <Ionicons name="medical" size={18} color={colors.accent} />
              </View>
              <Text style={[styles.contactLabel, { color: colors.text }]}>
                {t('crisis.therapistLabel')}
              </Text>
            </View>
            {!isEditingTherapist && (
              <TouchableOpacity
                onPress={() => {
                  setTempTherapist(therapistNumber);
                  setIsEditingTherapist(true);
                }}
                style={styles.editBtn}
              >
                <Ionicons name="create-outline" size={16} color={colors.accent} />
                <Text style={[styles.editBtnText, { color: colors.accent }]}>{t('crisis.edit')}</Text>
              </TouchableOpacity>
            )}
          </View>

          {isEditingTherapist ? (
            <View style={styles.editorRow}>
              <TextInput
                style={[styles.phoneInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                value={tempTherapist}
                onChangeText={setTempTherapist}
                placeholder={t('crisis.therapistPlaceholder')}
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
              />
              <View style={styles.actionButtonGroup}>
                <TouchableOpacity onPress={handleSaveTherapist} style={[styles.saveBtn, { backgroundColor: colors.accent }]}>
                  <Text style={styles.saveBtnText}>{t('crisis.save')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsEditingTherapist(false)} style={[styles.cancelBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                  <Text style={[styles.cancelBtnText, { color: colors.textMuted }]}>{t('crisis.cancel')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.displayRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.phoneDisplay, { color: therapistNumber ? colors.text : colors.textMuted }]}>
                  {therapistNumber || t('crisis.notSet')}
                </Text>
                {!therapistNumber && (
                  <Text style={[styles.tapHint, { color: colors.textMuted }]}>{t('crisis.tapToEdit')}</Text>
                )}
              </View>
              <TouchableOpacity
                style={[styles.callIconBtn, { backgroundColor: therapistNumber ? colors.danger : colors.border }]}
                onPress={() => handleCall(therapistNumber)}
                disabled={!therapistNumber}
              >
                <Ionicons name="call" size={18} color="#fff" />
                <Text style={styles.callIconBtnText}>{t('crisis.call')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </Card>

        {/* Card 2: Other Emergency Contact */}
        <Card style={styles.contactCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderLeft}>
              <View style={[styles.avatarBadge, { backgroundColor: colors.accentSoft }]}>
                <Ionicons name="people" size={18} color={colors.accent} />
              </View>
              <Text style={[styles.contactLabel, { color: colors.text }]}>
                {t('crisis.otherLabel')}
              </Text>
            </View>
            {!isEditingOther && (
              <TouchableOpacity
                onPress={() => {
                  setTempOther(otherNumber);
                  setIsEditingOther(true);
                }}
                style={styles.editBtn}
              >
                <Ionicons name="create-outline" size={16} color={colors.accent} />
                <Text style={[styles.editBtnText, { color: colors.accent }]}>{t('crisis.edit')}</Text>
              </TouchableOpacity>
            )}
          </View>

          {isEditingOther ? (
            <View style={styles.editorRow}>
              <TextInput
                style={[styles.phoneInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                value={tempOther}
                onChangeText={setTempOther}
                placeholder={t('crisis.otherPlaceholder')}
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
              />
              <View style={styles.actionButtonGroup}>
                <TouchableOpacity onPress={handleSaveOther} style={[styles.saveBtn, { backgroundColor: colors.accent }]}>
                  <Text style={styles.saveBtnText}>{t('crisis.save')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsEditingOther(false)} style={[styles.cancelBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                  <Text style={[styles.cancelBtnText, { color: colors.textMuted }]}>{t('crisis.cancel')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.displayRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.phoneDisplay, { color: otherNumber ? colors.text : colors.textMuted }]}>
                  {otherNumber || t('crisis.notSet')}
                </Text>
                {!otherNumber && (
                  <Text style={[styles.tapHint, { color: colors.textMuted }]}>{t('crisis.tapToEdit')}</Text>
                )}
              </View>
              <TouchableOpacity
                style={[styles.callIconBtn, { backgroundColor: otherNumber ? colors.danger : colors.border }]}
                onPress={() => handleCall(otherNumber)}
                disabled={!otherNumber}
              >
                <Ionicons name="call" size={18} color="#fff" />
                <Text style={styles.callIconBtnText}>{t('crisis.call')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </Card>

        {/* Section 2: National Assistance (India) */}
        <Text style={[styles.sectionHeading, { color: colors.accent, marginTop: spacing.xl }]}>
          {t('crisis.nationalTitle')}
        </Text>

        {IndianHelplines.map(helpline => (
          <Card key={helpline.id} style={styles.helplineCard}>
            <View style={styles.helplineTop}>
              <View style={{ flex: 1, paddingRight: spacing.sm }}>
                <Text style={[styles.helplineName, { color: colors.text }]}>{helpline.name}</Text>
                <View style={styles.timeBadgeRow}>
                  <Ionicons name="time-outline" size={12} color={colors.textMuted} style={{ marginRight: 4 }} />
                  <Text style={[styles.helplineTime, { color: colors.textMuted }]}>{helpline.hours}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.callBtn, { backgroundColor: colors.danger }]}
                onPress={() => handleCall(helpline.number)}
              >
                <Ionicons name="call" size={16} color="#fff" />
                <Text style={styles.callBtnText}>{t('crisis.call')}</Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.helplineDesc, { color: colors.textMuted }]}>{helpline.desc}</Text>
          </Card>
        ))}

        <View style={styles.footer}>
          <Text style={{ color: colors.textMuted, textAlign: 'center', fontSize: 13, lineHeight: 20 }}>
            {t('crisis.warning')}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    position: 'relative',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 26,
    fontFamily: typography.display,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    lineHeight: 22,
    fontFamily: typography.body,
  },
  sectionHeading: {
    fontSize: 16,
    fontFamily: typography.label,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: spacing.md,
    paddingLeft: spacing.xs,
  },
  contactCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactLabel: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: typography.body,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 4,
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: typography.body,
  },
  editorRow: {
    marginTop: 4,
    gap: 10,
  },
  phoneInput: {
    height: 48,
    borderWidth: 1.5,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    fontSize: 14,
    fontFamily: typography.body,
  },
  actionButtonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  saveBtn: {
    flex: 1,
    height: 38,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    fontFamily: typography.label,
  },
  cancelBtn: {
    flex: 1,
    height: 38,
    borderWidth: 1,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    fontFamily: typography.label,
  },
  displayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  phoneDisplay: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: typography.mono,
  },
  tapHint: {
    fontSize: 12,
    marginTop: 2,
    fontStyle: 'italic',
    fontFamily: typography.body,
  },
  callIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    height: 40,
    borderRadius: radii.pill,
    gap: 6,
  },
  callIconBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
    fontFamily: typography.label,
  },
  helplineCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  helplineTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  helplineName: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: typography.body,
    lineHeight: 20,
  },
  timeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  helplineTime: {
    fontSize: 12,
    fontFamily: typography.body,
  },
  helplineDesc: {
    fontSize: 13.5,
    lineHeight: 18,
    fontFamily: typography.body,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    height: 36,
    borderRadius: radii.pill,
    gap: 4,
  },
  callBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12.5,
    fontFamily: typography.label,
  },
  footer: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  }
});
