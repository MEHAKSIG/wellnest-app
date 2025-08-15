// components/RecipeDetailModal.js
import React from 'react';
import { Modal, View, Text, StyleSheet, ScrollView, Image, Button } from 'react-native';

export default function RecipeDetailModal({ visible, recipe, onClose }) {
  if (!recipe) return null;

  return (
    <Modal visible={visible} animationType="slide">
      <ScrollView style={styles.container}>
        <Image source={{ uri: recipe.image }} style={styles.image} />
        <View style={styles.content}>
          <Text style={styles.title}>{recipe.title}</Text>
          <Text style={styles.meta}>{recipe.healthCategory} for diabetes</Text>
          <Text style={styles.meta}>⭐ {recipe.rating} • {recipe.time} • {recipe.servings} servings</Text>
          <Text style={styles.meta}>Calories: {recipe.calories} kcal | Carbs: {recipe.carbs}g | GI: {recipe.glycemicIndex}</Text>

          <Text style={styles.section}>Ingredients</Text>
          {recipe.ingredients.map((item, index) => (
            <Text key={index} style={styles.listItem}>• {item}</Text>
          ))}

          <Text style={styles.section}>Directions</Text>
          <Text style={styles.directions}>{recipe.directions}</Text>

          <View style={styles.button}><Button title="Close" onPress={onClose} /></View>
        </View>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  image: { width: '100%', height: 220 },
  content: { padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  meta: { fontSize: 14, color: '#555', marginBottom: 4 },
  section: { fontSize: 18, fontWeight: 'bold', marginTop: 16, marginBottom: 6 },
  listItem: { fontSize: 14, marginLeft: 10, marginBottom: 3 },
  directions: { fontSize: 14, marginTop: 4, lineHeight: 20 },
  button: { marginTop: 20 },
});
