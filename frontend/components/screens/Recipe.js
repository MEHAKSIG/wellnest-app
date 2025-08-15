import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';

const categories = [
  {
    title: 'Breakfast',
    screen: 'Breakfast', // ✅ Updated to match App.js
    image: { uri: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092' },
  },
  {
    title: 'Lunch & Dinner',
    screen: 'LunchDinner', // Future screen
    image: { uri: 'https://images.unsplash.com/photo-1551218808-94e220e084d2' },
  },
  {
    title: 'Desserts',
    screen: 'Desserts', // Future screen
    image: { uri: 'https://images.unsplash.com/photo-1551024506-0bccd828d307' },
  },
];

const RecipeBook = ({ navigation }) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.header}>🍽️ Diabetic-Friendly Recipes</Text>

      {categories.map((cat, index) => (
        <TouchableOpacity
          key={index}
          style={styles.card}
          onPress={() => navigation.navigate(cat.screen)}
        >
          <Image source={cat.image} style={styles.image} />
          <View style={styles.infoBox}>
            <Text style={styles.title}>{cat.title}</Text>
            <Text style={styles.text}>Tap to explore {cat.title.toLowerCase()} recipes</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDE7',
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#388e3c',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 180,
  },
  infoBox: {
    padding: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#2e7d32',
  },
  text: {
    fontSize: 14,
    color: '#555',
  },
});

export default RecipeBook;
