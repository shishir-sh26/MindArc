import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { wp, hp } from '../../utils/responsive';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const Card = ({ children, onPress, style }: CardProps) => {
  const { colors } = useTheme();

  const cardStyle = [
    styles.card,
    {
      backgroundColor: colors.surface,
      borderColor: colors.borderLight,
    },
    style
  ];

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={cardStyle}>
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: wp(90),
    alignSelf: 'center',
    borderRadius: 24,
    padding: hp(3),
    marginBottom: hp(2),
    borderWidth: 1,
    shadowColor: '#C4A882',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  }
});
