import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, TouchableOpacity, Animated as RNAnimated } from 'react-native';
import { BottomTabParamList } from './types';
import { useTheme } from '../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { hp, wp } from '../utils/responsive';
import Animated, { useAnimatedStyle, withSpring, withSequence, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';

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

interface TooltipRef {
  show: (routeName: string, text: string) => void;
}

const Tooltip = forwardRef<TooltipRef, { isDark: boolean; colors: any }>((props, ref) => {
  const { isDark, colors } = props;
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState({ routeName: '', text: '' });
  
  const fadeAnim = useRef(new RNAnimated.Value(0)).current;
  const slideAnim = useRef(new RNAnimated.Value(15)).current;
  const timeoutRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    show: (routeName: string, text: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setData({ routeName, text });
      setVisible(true);

      // Start fade/slide animation in
      RNAnimated.parallel([
        RNAnimated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        RNAnimated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 50,
          useNativeDriver: true,
        }),
      ]).start();

      // Schedule auto-hide
      timeoutRef.current = setTimeout(() => {
        RNAnimated.parallel([
          RNAnimated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          RNAnimated.timing(slideAnim, {
            toValue: 15,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(({ finished }) => {
          if (finished) {
            setVisible(false);
          }
        });
      }, 3500); // Show tooltip for 3.5 seconds
    }
  }));

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!visible) return null;

  let iconName = 'home-outline';
  if (data.routeName === 'Home') iconName = 'home';
  else if (data.routeName === 'Learn') iconName = 'book';
  else if (data.routeName === 'Track') iconName = 'pulse';
  else if (data.routeName === 'ThoughtDiary') iconName = 'journal';
  else if (data.routeName === 'Relax') iconName = 'leaf';
  else if (data.routeName === 'Activity') iconName = 'fitness';

  return (
    <RNAnimated.View
      style={[
        styles.tooltipContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          backgroundColor: isDark ? 'rgba(17, 30, 15, 0.95)' : 'rgba(250, 255, 245, 0.95)',
          borderColor: isDark ? 'rgba(93, 191, 110, 0.35)' : 'rgba(90, 156, 58, 0.35)',
          shadowColor: isDark ? '#5DBF6E' : '#3A6E20',
        }
      ]}
    >
      <View style={styles.contentRow}>
        <View style={[styles.iconWrapper, { backgroundColor: isDark ? 'rgba(93, 191, 110, 0.15)' : 'rgba(90, 156, 58, 0.12)' }]}>
          <Ionicons name={iconName as any} size={20} color={isDark ? '#5DBF6E' : '#3A6E20'} />
        </View>
        <Text style={[styles.tooltipText, { color: isDark ? '#D8EDCF' : '#1A2E10' }]}>
          {data.text}
        </Text>
      </View>
    </RNAnimated.View>
  );
});

const TabBarButton = (props: any) => {
  const { onPress, onLongPress, children, style, routeName, showTooltip } = props;

  const handlePress = (e: any) => {
    if (onPress) onPress(e);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    showTooltip(routeName);
  };

  const handleLongPress = (e: any) => {
    if (onPress) onPress(e);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    showTooltip(routeName);
  };

  return (
    <TouchableOpacity
      style={[style, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}
      activeOpacity={0.7}
      onPress={handlePress}
      onLongPress={handleLongPress}
    >
      {children}
    </TouchableOpacity>
  );
};

export const BottomTabNavigator = () => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const tooltipRef = useRef<TooltipRef>(null);

  const showTooltip = (routeName: string) => {
    const key = routeName.charAt(0).toLowerCase() + routeName.slice(1);
    const text = t(`navigation.tooltips.${key}`);
    tooltipRef.current?.show(routeName, text);
  };

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.accentDeep,
          tabBarInactiveTintColor: colors.textLight,
          tabBarShowLabel: false,
          tabBarStyle: {
            position: 'absolute',
            bottom: hp(2.2),
            left: wp(4),
            right: wp(4),
            height: 64,
            borderRadius: 24,
            backgroundColor: colors.surface,
            borderWidth: 1.5,
            borderColor: colors.borderLight,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.18,
            shadowRadius: 14,
            elevation: 8,
            paddingBottom: 0,
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
          tabBarButton: (props) => (
            <TabBarButton
              {...props}
              routeName={route.name}
              showTooltip={showTooltip}
            />
          ),
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Learn" component={LearnScreen} />
        <Tab.Screen name="Track" component={TrackerScreen} />
        <Tab.Screen name="ThoughtDiary" component={ThoughtDiaryScreen} />
        <Tab.Screen name="Relax" component={RelaxScreen} />
        <Tab.Screen name="Activity" component={ActivityScreen} />
      </Tab.Navigator>
      <Tooltip ref={tooltipRef} isDark={isDark} colors={colors} />
    </View>
  );
};

const styles = StyleSheet.create({
  tooltipContainer: {
    position: 'absolute',
    bottom: hp(2.2) + 72, // Position beautifully floating above the floating tab bar
    left: '6%',
    right: '6%',
    borderRadius: 20,
    borderWidth: 1.5,
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 8,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    zIndex: 9999,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tooltipText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
});
