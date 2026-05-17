import React, { useEffect } from 'react';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { BottomTabNavigator } from './BottomTabNavigator';
import { useTheme } from '../hooks/useTheme';
import { View, ActivityIndicator } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { useAuthStore } from '../store/authStore';
import { syncUserDataFromFirestore } from '../utils/syncService';

import AuthScreen from '../screens/auth/AuthScreen';
import ModuleDetailScreen from '../screens/learn/ModuleDetailScreen';
import TrackerHistoryScreen from '../screens/tracker/TrackerHistoryScreen';
import ThoughtDiaryScreen from '../screens/thoughtDiary/ThoughtDiaryScreen';
import NewThoughtEntryScreen from '../screens/thoughtDiary/NewThoughtEntryScreen';
import BreathingScreen from '../screens/relax/BreathingScreen';
import NatureSoundsScreen from '../screens/relax/NatureSoundsScreen';
import YogaPlayerScreen from '../screens/activity/YogaPlayerScreen';
import CrisisScreen from '../screens/crisis/CrisisScreen';
import UserDetailsScreen from '../screens/profile/UserDetailsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const { colors } = useTheme();
  const { user, isLoading, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        syncUserDataFromFirestore(currentUser.uid);
      }
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <NavigationIndependentTree>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.text,
            contentStyle: { backgroundColor: colors.background }
          }}
        >
          {user ? (
            // Authenticated Stack
            <>
              <Stack.Screen name="Tabs" component={BottomTabNavigator} options={{ headerShown: false }} />
              <Stack.Screen name="ModuleDetail" component={ModuleDetailScreen} options={{ title: 'Module' }} />
              <Stack.Screen name="TrackerHistory" component={TrackerHistoryScreen} options={{ title: 'Mood History' }} />
              <Stack.Screen name="ThoughtDiary" component={ThoughtDiaryScreen} options={{ title: 'Thought Diary' }} />
              <Stack.Screen name="NewThoughtEntry" component={NewThoughtEntryScreen} options={{ title: 'New Entry', presentation: 'modal' }} />
              <Stack.Screen name="Breathing" component={BreathingScreen} options={{ title: 'Box Breathing' }} />
              <Stack.Screen name="NatureSounds" component={NatureSoundsScreen} options={{ title: 'Nature Sounds' }} />
              <Stack.Screen name="YogaPlayer" component={YogaPlayerScreen} options={({ route }) => ({ title: route.params.title })} />
              <Stack.Screen name="Crisis" component={CrisisScreen} options={{ title: 'Emergency Contacts', presentation: 'modal' }} />
              <Stack.Screen name="UserDetails" component={UserDetailsScreen} options={{ headerShown: false }} />
            </>
          ) : (
            // Unauthenticated Stack
            <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </NavigationIndependentTree>
  );
};
