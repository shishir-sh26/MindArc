import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const ProgressBar = () => {
  return (
    <View style={styles.container}>
      <Text>ProgressBar</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 }
});
