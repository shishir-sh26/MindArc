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
        <RootNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
