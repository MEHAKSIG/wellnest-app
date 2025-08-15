import React from 'react';
import { View } from 'react-native';

export const Progress = ({ value = 0, style }) => {
  return (
    <View style={[{ height: 8, backgroundColor: '#f3f4f6', borderRadius: 20 }, style]}>
      <View
        style={{
          width: `${value}%`,
          height: '100%',
          backgroundColor: '#b91c1c',
          borderRadius: 20,
        }}
      />
    </View>
  );
};