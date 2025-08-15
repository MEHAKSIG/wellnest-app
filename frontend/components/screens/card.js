import React from 'react';
import { View } from 'react-native';

export const Card = ({ children, style }) => {
  return (
    <View style={[{
      backgroundColor: '#fff',
      padding: 16,
      borderRadius: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3
    }, style]}>
      {children}
    </View>
  );
};