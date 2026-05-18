import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { auth } from '../../utils/firebase';
import { useTheme } from '../../hooks/useTheme';
import { spacing, radii } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { wp, hp, rf } from '../../utils/responsive';
import { ForestBackground } from '../../components/common/ForestBackground';
import { Button } from '../../components/common/Button';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

// Configure Google Sign-In with Web Client ID
// (User can configure EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in their .env)
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '178725930459-07c99792f5e8ac059793fe.apps.googleusercontent.com',
  offlineAccess: true,
});

export default function AuthScreen() {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
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

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      
      const idToken = response.data?.idToken;
      if (!idToken) {
        throw new Error("Google Sign-In did not return an ID Token. Make sure your SHA-1 fingerprint is registered in the Firebase console and you are using the correct Web Client ID.");
      }

      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("Google Sign-In cancelled by user");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert("Google Sign-In", "Sign-in is already in progress.");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert("Google Sign-In", "Google Play Services are not available or outdated.");
      } else {
        Alert.alert(
          "Google Sign-In Setup Guide",
          "Google Sign-In is now fully configured in the code!\n\nTo make it work in your custom APK, remember to:\n1. Download 'google-services.json' from your Firebase Console.\n2. Place it in your project's 'myapp' folder.\n3. Add your Keystore's SHA-1 fingerprint to the Firebase Android App settings.\n\nError details: " + error.message
        );
      }
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
            <TextInput
              style={[styles.input, { backgroundColor: colors.surfaceAlt, color: colors.text, borderColor: colors.border }]}
              placeholder={t('auth.passwordPlaceholder')}
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
 
          <Button 
            title={isLogin ? t('auth.logIn') : t('auth.signUp')} 
            onPress={handleAuth} 
            disabled={loading}
            style={{ marginTop: spacing.md }}
          />
 
          <View style={styles.dividerContainer}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.textMuted }]}>{t('auth.or')}</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>
 
          <TouchableOpacity 
            style={[styles.googleButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#ffffff', borderColor: colors.border }]}
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={isDark ? '#fff' : '#444'} style={{ marginRight: 10 }} />
            ) : (
              <Ionicons name="logo-google" size={20} color={isDark ? '#fff' : '#444'} style={{ marginRight: 10 }} />
            )}
            <Text style={[styles.googleButtonText, { color: isDark ? '#fff' : '#444' }]}>
              {t('auth.continueWithGoogle')}
            </Text>
          </TouchableOpacity>

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
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    fontFamily: typography.label,
    fontSize: rf(12),
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  googleButtonText: {
    fontFamily: typography.label,
    fontSize: rf(14),
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
});
