import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../utils/firebase';
import { useTheme } from '../../hooks/useTheme';
import { spacing, radii } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { wp, hp, rf } from '../../utils/responsive';
import { ForestBackground } from '../../components/common/ForestBackground';
import { Button } from '../../components/common/Button';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

export default function AuthScreen() {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match. Please verify your safety password.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (error: any) {
      let msg = error.message;
      if (error.code === 'auth/invalid-credential') {
         msg = "Invalid email or password.";
      } else if (error.code === 'auth/email-already-in-use') {
         msg = "This email is already in use.";
      }
      Alert.alert('Authentication Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ForestBackground bgHeightRatio={1} showBottomPlants={false} />
      
      <View style={styles.container}>
        <View style={[styles.card, { backgroundColor: isDark ? 'rgba(13,27,11,0.92)' : 'rgba(240,247,232,0.95)', borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>MindArc</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {isLogin ? t('auth.welcomeBack') : t('auth.createAccount')}
          </Text>
 
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>{t('auth.email')}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surfaceAlt, color: colors.text, borderColor: colors.border }]}
              placeholder={t('auth.emailPlaceholder')}
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
 
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>{t('auth.password')}</Text>
            <View style={[styles.passwordWrapper, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
              <TextInput
                style={[styles.passwordInput, { color: colors.text }]}
                placeholder={t('auth.passwordPlaceholder')}
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {!isLogin && (
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Confirm Password</Text>
              <View style={[styles.passwordWrapper, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.passwordInput, { color: colors.text }]}
                  placeholder={t('auth.passwordPlaceholder')}
                  placeholderTextColor={colors.textMuted}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
          )}
 
          <Button 
            title={isLogin ? t('auth.logIn') : t('auth.signUp')} 
            onPress={handleAuth} 
            disabled={loading}
            style={{ marginTop: spacing.md }}
          />
 


          <View style={styles.footer}>
            <Text style={{ color: colors.textMuted }}>
              {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}
            </Text>
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)} disabled={loading}>
              <Text style={{ color: colors.accent, fontWeight: 'bold' }}>
                {isLogin ? t('auth.signUp') : t('auth.logIn')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    padding: spacing.xl,
    borderRadius: radii.lg,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    backdropFilter: 'blur(10px)',
  },
  title: {
    fontFamily: typography.display,
    fontSize: rf(36),
    textAlign: 'center',
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontFamily: typography.body,
    fontSize: rf(14),
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    fontFamily: typography.label,
    fontSize: rf(12),
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    fontFamily: typography.body,
    fontSize: rf(16),
    borderWidth: 1.5,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radii.md,
    paddingRight: spacing.md,
  },
  passwordInput: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: rf(16),
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  eyeBtn: {
    padding: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
});
