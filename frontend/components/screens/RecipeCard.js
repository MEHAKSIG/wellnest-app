// components/RecipeCard.js
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

export default function RecipeCard({ recipe, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: recipe.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title}>{recipe.title}</Text>
        <Text style={styles.healthCategory}>{recipe.healthCategory} for diabetes</Text>
        <Text style={styles.details}>⭐ {recipe.rating} • {recipe.time} • {recipe.calories} kcal</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 160,
  },
  info: {
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  healthCategory: {
    fontSize: 14,
    color: '#007700',
    marginTop: 4,
  },
  details: {
    fontSize: 12,
    color: '#555',
    marginTop: 2,
  },
});
