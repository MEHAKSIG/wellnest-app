import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  Pressable,
  SafeAreaView,
  ImageBackground,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

const mockRecipes = [
  {
    id: '1',
    title: 'Oats Chilla',
    category: 'Indian',
    healthCategory: 'Good',
    image: 'https://bing.com/th?id=OSK.3da4fa90b1c4c50ab169a47b7f20461b',
    rating: 4.5,
    time: '20 mins',
    servings: 2,
    calories: 150,
    carbs: 18,
    glycemicIndex: 44,
    difficulty: 'Easy',
    ingredients: ['1 cup oats', '1 onion', '1 tsp olive oil', 'Spices to taste'],
    directions: 'Grind oats into flour. Mix with water, chopped onions, and spices. Cook like a pancake on non-stick pan for 3-4 mins each side.'
  },
  {
    id: '2',
    title: 'Vegetable Upma',
    category: 'South Indian',
    healthCategory: 'Medium',
    image: 'https://1.bp.blogspot.com/-oEQ56anOoRY/XglrwBZO2qI/AAAAAAAAYWU/IlUhTOC9S4oWBW6rBnOsabEM7zcpkGO8gCLcBGAsYHQ/s1600/rava%2Bupma.JPG',
    rating: 4.6,
    time: '25 mins',
    servings: 2,
    calories: 180,
    carbs: 22,
    glycemicIndex: 50,
    difficulty: 'Easy',
    ingredients: ['1/2 cup semolina (rava)', '1 cup mixed vegetables', '1 tsp mustard seeds', 'Curry leaves', '1 tsp oil'],
    directions: 'Roast semolina, stir-fry vegetables with mustard seeds and curry leaves, add water and semolina gradually. Stir until thickened.'
  },
  {
    id: '3',
    title: 'Moong Dal Cheela',
    category: 'Breakfast',
    healthCategory: 'Good',
    image: 'https://www.funfoodfrolic.com/wp-content/uploads/2021/08/Dal-Cheela-Thumbnail-1170x1170.jpg',
    rating: 4.7,
    time: '30 mins',
    servings: 2,
    calories: 160,
    carbs: 14,
    glycemicIndex: 30,
    difficulty: 'Easy',
    ingredients: ['1 cup soaked moong dal', '1 green chili', '1 inch ginger', 'Coriander', 'Salt to taste'],
    directions: 'Grind soaked dal with ginger and chili. Pour batter on a pan and cook like pancakes. Serve hot.'
  },
  {
    id: '4',
    title: 'Besan Toast',
    category: 'Breakfast',
    healthCategory: 'Good',
    image: 'https://indianvegrecipe.com/wp-content/uploads/2019/07/besan-bread-toast.jpg',
    rating: 4.4,
    time: '15 mins',
    servings: 2,
    calories: 140,
    carbs: 16,
    glycemicIndex: 45,
    difficulty: 'Easy',
    ingredients: ['4 slices whole grain bread', '1/2 cup besan (gram flour)', 'Spices', 'Chopped onions and tomato'],
    directions: 'Mix besan with water, spices, and vegetables. Dip bread slices and shallow fry on pan.'
  },
  {
    id: '5',
    title: 'Low GI Poha',
    category: 'Breakfast',
    healthCategory: 'Good',
    image: 'https://i.ytimg.com/vi/LfH4OvIwmRs/maxresdefault.jpg',
    rating: 4.3,
    time: '20 mins',
    servings: 2,
    calories: 170,
    carbs: 19,
    glycemicIndex: 38,
    difficulty: 'Easy',
    ingredients: ['1 cup beaten rice (poha)', 'Mustard seeds', 'Curry leaves', 'Peanuts', 'Onions and green chili'],
    directions: 'Rinse poha, temper spices in oil, stir-fry onions and peanuts, add poha and mix gently.'
  },
  {
    id: '6',
    title: 'Sweet Corn Sandwich',
    category: 'Breakfast',
    healthCategory: 'Not Good',
    image: 'https://recipes.timesofindia.com/photo/57853896.cms',
    rating: 4.0,
    time: '15 mins',
    servings: 2,
    calories: 230,
    carbs: 32,
    glycemicIndex: 60,
    difficulty: 'Easy',
    ingredients: ['Sweet corn', 'Bread slices', 'Mayonnaise', 'Salt', 'Black pepper'],
    directions: 'Mix corn with mayo, season, and spread between bread slices. Grill or toast lightly.'
  },
  {
    id: '7',
    title: 'Multigrain Dosa',
    category: 'Breakfast',
    healthCategory: 'Good',
    image: 'https://i.ytimg.com/vi/HkrnS7x3fhE/maxresdefault.jpg',
    rating: 4.6,
    time: '35 mins',
    servings: 2,
    calories: 180,
    carbs: 20,
    glycemicIndex: 42,
    difficulty: 'Medium',
    ingredients: ['1/2 cup ragi', '1/2 cup oats', '1/2 cup rice', 'Fenugreek seeds', 'Salt'],
    directions: 'Soak and grind grains, ferment overnight. Spread batter and cook dosas on hot pan.'
  }
];

export default function BreakfastList() {
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const openModal = (recipe) => {
    setSelectedRecipe(recipe);
    setModalVisible(true);
  };

  return (
    <ImageBackground
      source={{ uri: 'https://images.pexels.com/photos/545313/pexels-photo-545313.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }} // Change to your own image URL
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.gridContainer}>
          {mockRecipes.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.card, { height: index % 2 === 0 ? 260 : 300 }]}
              onPress={() => openModal(item)}
            >
              <Image
                source={{ uri: item.image }}
                style={[styles.image, { height: index % 2 === 0 ? 120 : 160 }]}
              />
              <View style={styles.infoBox}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtext}>Rating: ⭐ {item.rating} | {item.time}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Modal */}
        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalContainer}>
            <View style={styles.modalSheet}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Image source={{ uri: selectedRecipe?.image }} style={styles.modalImage} />
                <View style={styles.modalHeader}>
                  <Pressable onPress={() => setModalVisible(false)}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                  </Pressable>
                  <Text style={styles.ratingBadge}>⭐ {selectedRecipe?.rating}</Text>
                </View>
                <Text style={styles.modalTitle}>{selectedRecipe?.title}</Text>
                <Text style={styles.categoryText}>{selectedRecipe?.category}</Text>

                <View style={styles.infoChips}>
                  <View style={styles.chip}>
                    <Ionicons name="time" size={16} color="#fbc02d" />
                    <Text style={styles.chipText}>{selectedRecipe?.time}</Text>
                  </View>
                  <View style={styles.chip}>
                    <Ionicons name="people" size={16} color="#fbc02d" />
                    <Text style={styles.chipText}>{selectedRecipe?.servings} Servings</Text>
                  </View>
                  <View style={styles.chip}>
                    <MaterialIcons name="local-fire-department" size={16} color="#fbc02d" />
                    <Text style={styles.chipText}>{selectedRecipe?.calories} Cal</Text>
                  </View>
                  <View style={styles.chip}>
                    <MaterialCommunityIcons name="speedometer" size={16} color="#fbc02d" />
                    <Text style={styles.chipText}>{selectedRecipe?.glycemicIndex} GI</Text>
                  </View>
                  <View style={styles.chip}>
                  <MaterialCommunityIcons name="food-variant" size={16} color="#fbc02d" />
                  <Text style={styles.chipText}>{selectedRecipe?.carbs}g Carbs</Text>
                </View>
                </View>

                <Text style={styles.section}>Ingredients</Text>
                {selectedRecipe?.ingredients.map((i, idx) => (
                  <Text key={idx} style={styles.ingredient}>• {i}</Text>
                ))}

                <Text style={styles.section}>Directions</Text>
                <Text style={styles.directions}>{selectedRecipe?.directions}</Text>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  gridContainer: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingTop: 20,
  },
  card: {
    width: '47%',
    backgroundColor: '#fff',
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
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    resizeMode: 'cover',
  },
  infoBox: {
    padding: 10,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#444',
  },
  subtext: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#00000055',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    paddingBottom: 20,
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    resizeMode: 'cover',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 12,
    alignItems: 'center',
  },
  ratingBadge: {
    backgroundColor: '#fbc02d',
    color: '#000',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginTop: 6,
    color: '#333',
  },
  categoryText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#888',
    marginHorizontal: 16,
    marginBottom: 10,
  },
  infoChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 16,
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9C4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginTop: 8,
  },
  chipText: {
    fontSize: 13,
    color: '#555',
    marginLeft: 6,
  },
  section: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 18,
    marginHorizontal: 16,
    marginBottom: 6,
    color: '#212121',
  },
  ingredient: {
    fontSize: 15,
    color: '#444',
    marginHorizontal: 16,
    marginBottom: 2,
  },
  directions: {
    fontSize: 15,
    color: '#444',
    marginHorizontal: 16,
    marginTop: 4,
    lineHeight: 22,
    marginBottom: 20,
  },
});
