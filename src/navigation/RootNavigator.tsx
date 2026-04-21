import React from 'react';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { BottomTabNavigator } from './BottomTabNavigator';
import { useTheme } from '../hooks/useTheme';

import ModuleDetailScreen from '../screens/learn/ModuleDetailScreen';
import TrackerHistoryScreen from '../screens/tracker/TrackerHistoryScreen';
import ThoughtDiaryScreen from '../screens/thoughtDiary/ThoughtDiaryScreen';
import NewThoughtEntryScreen from '../screens/thoughtDiary/NewThoughtEntryScreen';
import BreathingScreen from '../screens/relax/BreathingScreen';
import NatureSoundsScreen from '../screens/relax/NatureSoundsScreen';
import YogaPlayerScreen from '../screens/activity/YogaPlayerScreen';
import CrisisScreen from '../screens/crisis/CrisisScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const { colors } = useTheme();

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
          <Stack.Screen name="Tabs" component={BottomTabNavigator} options={{ headerShown: false }} />
          <Stack.Screen name="ModuleDetail" component={ModuleDetailScreen} options={{ title: 'Module' }} />
          <Stack.Screen name="TrackerHistory" component={TrackerHistoryScreen} options={{ title: 'Mood History' }} />
          <Stack.Screen name="ThoughtDiary" component={ThoughtDiaryScreen} options={{ title: 'Thought Diary' }} />
          <Stack.Screen name="NewThoughtEntry" component={NewThoughtEntryScreen} options={{ title: 'New Entry', presentation: 'modal' }} />
          <Stack.Screen name="Breathing" component={BreathingScreen} options={{ title: 'Box Breathing' }} />
          <Stack.Screen name="NatureSounds" component={NatureSoundsScreen} options={{ title: 'Nature Sounds' }} />
          <Stack.Screen name="YogaPlayer" component={YogaPlayerScreen} options={({ route }) => ({ title: route.params.title })} />
          <Stack.Screen name="Crisis" component={CrisisScreen} options={{ title: 'Emergency Contacts', presentation: 'modal' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </NavigationIndependentTree>
  );
};
