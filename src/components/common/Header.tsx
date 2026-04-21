import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const Header = () => {
  return (
    <View style={styles.container}>
      <Text>Header</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 }
});
