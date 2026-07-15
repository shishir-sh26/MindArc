import React from 'react';
import './src/i18n';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ThemeProvider } from './theme/ThemeContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LogBox, ActivityIndicator, View } from 'react-native';
import { useFonts } from 'expo-font';
import { CormorantGaramond_600SemiBold, CormorantGaramond_500Medium, CormorantGaramond_400Regular, CormorantGaramond_400Regular_Italic } from '@expo-google-fonts/cormorant-garamond';
import { Nunito_400Regular, Nunito_500Medium, Nunito_400Regular_Italic } from '@expo-google-fonts/nunito';
import { DMSans_500Medium } from '@expo-google-fonts/dm-sans';
import { DMMono_400Regular } from '@expo-google-fonts/dm-mono';
import { usePedometer } from './src/hooks/usePedometer';
import { TouchGlowOverlay } from './src/components/common/TouchGlowOverlay';

LogBox.ignoreLogs(['expo-notifications: Android Push notifications']);

function AppInitializer() {
  usePedometer();
  return null;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    CormorantGaramond: CormorantGaramond_600SemiBold,
    CormorantGaramond_Medium: CormorantGaramond_500Medium,
    CormorantGaramond_Regular: CormorantGaramond_400Regular,
    CormorantGaramond_Italic: CormorantGaramond_400Regular_Italic,
    Nunito: Nunito_400Regular,
    Nunito_Bold: Nunito_500Medium,
    Nunito_Italic: Nunito_400Regular_Italic,
    DMSans: DMSans_500Medium,
    DMMono: DMMono_400Regular,
    DancingScript_Regular: require('./Dancing_Script/static/DancingScript-Regular.ttf'),
    DancingScript_Medium: require('./Dancing_Script/static/DancingScript-Medium.ttf'),
    DancingScript_SemiBold: require('./Dancing_Script/static/DancingScript-SemiBold.ttf'),
    DancingScript_Bold: require('./Dancing_Script/static/DancingScript-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F0F7E8', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#5A9C3A" size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppInitializer />
        <StatusBar style="auto" />
        <TouchGlowOverlay>
          <RootNavigator />
        </TouchGlowOverlay>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
