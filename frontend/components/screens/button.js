import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export function Button({ title, onPress }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#7c3aed', // Purple tone like WellNest
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  text: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});
