import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { typography } from '../../theme/typography';
import { hp, wp, rf } from '../../utils/responsive';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  style?: ViewStyle;
  textStyle?: TextStyle;
  loading?: boolean;
  disabled?: boolean;
}

export const Button = ({ title, onPress, variant = 'primary', style, textStyle, loading, disabled }: ButtonProps) => {
  const { colors } = useTheme();

  let bg = colors.accent;
  let textCol = colors.surface;
  let borderCol = 'transparent';

  if (variant === 'secondary') {
    bg = colors.surfaceAlt;
    textCol = colors.text;
  } else if (variant === 'outline') {
    bg = 'transparent';
    textCol = colors.accent;
    borderCol = colors.accent;
  } else if (variant === 'danger') {
    bg = colors.danger;
    textCol = '#FFFFFF';
  }

  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={[
        styles.button, 
        { backgroundColor: bg, borderColor: borderCol, borderWidth: variant === 'outline' ? 1 : 0 },
        style,
        { opacity: disabled ? 0.5 : 1 }
      ]}
      disabled={loading || disabled}
    >
      {loading ? (
        <ActivityIndicator color={textCol} />
      ) : (
        <Text style={[styles.text, { color: textCol }, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: wp(90),
    alignSelf: 'center',
    paddingVertical: hp(2),
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C4A882',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: hp(2),
  },
  text: {
    fontFamily: typography.bodyBold,
    fontSize: rf(16),
  },
});
