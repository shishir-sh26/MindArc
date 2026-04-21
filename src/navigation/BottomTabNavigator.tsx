import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View } from 'react-native';
import { BottomTabParamList } from './types';
import { useTheme } from '../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { hp } from '../utils/responsive';
import Animated, { useAnimatedStyle, withSpring, withSequence, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from '../screens/home/HomeScreen';
import LearnScreen from '../screens/learn/LearnScreen';
import TrackerScreen from '../screens/tracker/TrackerScreen';
import RelaxScreen from '../screens/relax/RelaxScreen';
import ActivityScreen from '../screens/activity/ActivityScreen';
import ThoughtDiaryScreen from '../screens/thoughtDiary/ThoughtDiaryScreen';

const Tab = createBottomTabNavigator<BottomTabParamList>();

const TabIcon = ({ name, color, focused }: { name: any; color: string; focused: boolean }) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (focused) {
      scale.value = withSequence(withSpring(1.2), withSpring(1.0));
    }
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={animatedStyle}>
        <Ionicons name={name} size={24} color={color} />
      </Animated.View>
      {focused && (
        <Animated.View 
          style={{ 
            width: 16, 
            height: 4, 
            borderRadius: 2, 
            backgroundColor: color, 
            marginTop: 4,
            position: 'absolute',
            bottom: -8
          }} 
        />
      )}
    </View>
  );
};

export const BottomTabNavigator = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accentDeep,
        tabBarInactiveTintColor: colors.textLight,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.borderLight,
          height: hp(9) + insets.bottom,
          paddingBottom: insets.bottom,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarIcon: ({ color, focused }) => {
          let iconName: any = 'home-outline';
          
          if (route.name === 'Home') iconName = focused ? "home" : "home-outline";
          else if (route.name === 'Learn') iconName = focused ? "book" : "book-outline";
          else if (route.name === 'Track') iconName = focused ? "pulse" : "pulse-outline";
          else if (route.name === 'ThoughtDiary') iconName = focused ? "journal" : "journal-outline";
          else if (route.name === 'Relax') iconName = focused ? "leaf" : "leaf-outline";
          else if (route.name === 'Activity') iconName = focused ? "fitness" : "fitness-outline";

          return <TabIcon name={iconName} color={color} focused={focused} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Learn" component={LearnScreen} />
      <Tab.Screen name="Track" component={TrackerScreen} />
      <Tab.Screen name="ThoughtDiary" component={ThoughtDiaryScreen} />
      <Tab.Screen name="Relax" component={RelaxScreen} />
      <Tab.Screen name="Activity" component={ActivityScreen} />
    </Tab.Navigator>
  );
};
