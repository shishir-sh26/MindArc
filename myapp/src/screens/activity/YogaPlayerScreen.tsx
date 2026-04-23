import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '../../hooks/useTheme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'YogaPlayer'>;

export default function YogaPlayerScreen({ route }: Props) {
  const { colors } = useTheme();
  const { videoUrl } = route.params;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <WebView
        source={{ uri: videoUrl }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsFullscreenVideo={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  }
});
