import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const Badge = () => {
  return (
    <View style={styles.container}>
      <Text>Badge</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 }
});
