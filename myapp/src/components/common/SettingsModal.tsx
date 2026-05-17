import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';
import { spacing, radii } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { wp, hp, rf } from '../../utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import i18next from 'i18next';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SettingsModal = ({ visible, onClose }: SettingsModalProps) => {
  const { t } = useTranslation();
  const { colors, isDark, toggleTheme } = useTheme();

  const changeLanguage = (lng: string) => {
    i18next.changeLanguage(lng);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBg}>
        <View style={[styles.modalCard, { backgroundColor: isDark ? 'rgba(13,27,11,0.95)' : 'rgba(240,247,232,0.95)', borderColor: colors.border }]}>
          
          <View style={styles.headerRow}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t('settings.title')}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          {/* Theme Section */}
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('settings.theme')}</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.optionBtn, !isDark && { backgroundColor: colors.accent, borderColor: colors.accent }]}
              onPress={() => { if (isDark) toggleTheme(); }}
            >
              <Text style={[styles.optionText, !isDark ? { color: '#fff' } : { color: colors.text }]}>{t('settings.lightMode')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.optionBtn, isDark && { backgroundColor: colors.accent, borderColor: colors.accent }]}
              onPress={() => { if (!isDark) toggleTheme(); }}
            >
              <Text style={[styles.optionText, isDark ? { color: '#fff' } : { color: colors.text }]}>{t('settings.darkMode')}</Text>
            </TouchableOpacity>
          </View>

          {/* Language Section */}
          <Text style={[styles.sectionTitle, { color: colors.textMuted, marginTop: spacing.xl }]}>{t('settings.language')}</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.optionBtn, i18next.language === 'en' && { backgroundColor: colors.accent, borderColor: colors.accent }]}
              onPress={() => changeLanguage('en')}
            >
              <Text style={[styles.optionText, i18next.language === 'en' ? { color: '#fff' } : { color: colors.text }]}>{t('settings.english')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.optionBtn, i18next.language === 'kn' && { backgroundColor: colors.accent, borderColor: colors.accent }]}
              onPress={() => changeLanguage('kn')}
            >
              <Text style={[styles.optionText, i18next.language === 'kn' ? { color: '#fff' } : { color: colors.text }]}>{t('settings.kannada')}</Text>
            </TouchableOpacity>
          </View>

          {/* About Section */}
          <Text style={[styles.sectionTitle, { color: colors.textMuted, marginTop: spacing.xl }]}>About</Text>
          <TouchableOpacity 
            style={[styles.aboutBtn, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}
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

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end', // Slide up from bottom vibe
  },
  modalCard: {
    width: '100%',
    padding: hp(3),
    paddingBottom: hp(6), // Extra padding for bottom safe area
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
    backdropFilter: 'blur(15px)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(3),
  },
  modalTitle: {
    fontFamily: typography.display,
    fontSize: rf(28),
  },
  sectionTitle: {
    fontFamily: typography.label,
    fontSize: rf(12),
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: hp(1.5),
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionBtn: {
    flex: 1,
    paddingVertical: hp(1.6),
    borderWidth: 1.5,
    borderColor: '#e5e5e5',
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  optionText: {
    fontFamily: typography.body,
    fontSize: rf(14),
    fontWeight: '600',
  },
  aboutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(1.8),
    paddingHorizontal: wp(4),
    borderWidth: 1,
    borderRadius: radii.lg,
  },
  aboutText: {
    fontFamily: typography.body,
    fontSize: rf(14),
    fontWeight: '500',
  },
  signOutBtn: {
    flexDirection: 'row',
    marginTop: hp(4),
    paddingVertical: hp(2),
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
    fontSize: rf(14),
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: 'bold',
  }
});
