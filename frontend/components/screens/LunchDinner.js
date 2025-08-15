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

const mockLunchDinnerRecipes = [
  {
    id: '1',
    title: 'Brown Rice Khichdi',
    category: 'Indian',
    healthCategory: 'Good',
    image: 'https://goop-img.com/wp-content/uploads/2018/01/04_flu_foods_kitchari_0085-1-1024x780.jpg',
    rating: 4.6,
    time: '30 mins',
    servings: 2,
    calories: 220,
    carbs: 30,
    glycemicIndex: 48,
    difficulty: 'Easy',
    ingredients: ['1 cup brown rice', '1/2 cup moong dal', 'Cumin, turmeric', 'Vegetables'],
    directions: 'Pressure cook brown rice and moong dal with veggies and spices. Serve warm with curd or chutney.'
  },
  {
    id: '2',
    title: 'Grilled Tofu with Veggies',
    category: 'Continental',
    healthCategory: 'Good',
    image: 'https://www.ambitiouskitchen.com/wp-content/uploads/2021/06/How-to-Grill-Tofu-11.jpg',
    rating: 4.5,
    time: '25 mins',
    servings: 2,
    calories: 180,
    carbs: 12,
    glycemicIndex: 20,
    difficulty: 'Easy',
    ingredients: ['Tofu cubes', 'Bell peppers', 'Zucchini', 'Olive oil', 'Salt & pepper'],
    directions: 'Marinate tofu and veggies, grill for 5-7 minutes until crisp. Serve with lemon.'
  },
  {
    id: '3',
    title: 'Palak Paneer with Roti',
    category: 'Indian',
    healthCategory: 'Medium',
    image: 'https://latashaskitchen.com/wp-content/uploads/2019/06/SS_533073802_Palak-Paneer_500k.jpg',
    rating: 4.4,
    time: '35 mins',
    servings: 2,
    calories: 260,
    carbs: 25,
    glycemicIndex: 50,
    difficulty: 'Medium',
    ingredients: ['Palak', 'Paneer', 'Onion & tomato paste', 'Spices'],
    directions: 'Sauté spinach with onion-tomato masala and blend. Add paneer cubes and simmer.'
  },
  {
    id: '4',
    title: 'Vegetable Stir Fry',
    category: 'Asian',
    healthCategory: 'Good',
    image: 'https://therecipecritic.com/wp-content/uploads/2019/08/vegetable_stir_fry.jpg',
    rating: 4.7,
    time: '20 mins',
    servings: 2,
    calories: 140,
    carbs: 16,
    glycemicIndex: 38,
    difficulty: 'Easy',
    ingredients: ['Broccoli', 'Carrot', 'Beans', 'Soy sauce', 'Ginger garlic'],
    directions: 'Stir-fry chopped veggies in sesame oil, add sauce, and cook for 5 minutes.'
  },
  {
    id: '5',
    title: 'Quinoa Salad Bowl',
    category: 'Fusion',
    healthCategory: 'Good',
    image: 'https://th.bing.com/th/id/OIP.WIPQavGZ5QAdUwApkjeKnwHaLH?cb=iwp1&rs=1&pid=ImgDetMain',
    rating: 4.5,
    time: '15 mins',
    servings: 2,
    calories: 200,
    carbs: 22,
    glycemicIndex: 35,
    difficulty: 'Easy',
    ingredients: ['Quinoa', 'Cucumber', 'Tomato', 'Olive oil', 'Lemon'],
    directions: 'Boil quinoa. Mix with chopped veggies and dressing. Chill and serve.'
  },
  {
  id: '6',
  title: 'Tinda Masala with Bajra Roti',
  category: 'North Indian',
  healthCategory: 'Good',
  image: 'https://th.bing.com/th/id/OIP.tCmoCzBHE4OR5krnkWe7VgHaE-?cb=iwp1&rs=1&pid=ImgDetMain',
  rating: 4.3,
  time: '28 mins',
  servings: 2,
  calories: 180,
  carbs: 18,
  glycemicIndex: 40,
  difficulty: 'Easy',
  ingredients: ['Tinda (apple gourd)', 'Tomato onion gravy', 'Cumin', 'Bajra flour'],
  directions: 'Cook tinda in spicy onion-tomato gravy. Serve hot with bajra roti and salad.'
},
{
  id: '7',
  title: 'Zucchini Noodles with Pesto',
  category: 'Italian',
  healthCategory: 'Good',
  image: 'https://www.jessicagavin.com/wp-content/uploads/2018/05/zucchini-noodles-5-1024x1536.jpg',
  rating: 4.6,
  time: '20 mins',
  servings: 2,
  calories: 160,
  carbs: 10,
  glycemicIndex: 25,
  difficulty: 'Easy',
  ingredients: ['2 zucchinis (spiralized)', '2 tbsp pesto', 'Cherry tomatoes', 'Parmesan (optional)', 'Olive oil'],
  directions: 'Sauté zucchini noodles in olive oil, toss with pesto and halved cherry tomatoes. Top with cheese if desired.'
},
{
  id: '8',
  title: 'Baked Salmon with Asparagus',
  category: 'Western',
  healthCategory: 'Good',
  image: 'https://natashaskitchen.com/wp-content/uploads/2017/06/Salmon-and-Asparagus-3.jpg',
  rating: 4.8,
  time: '25 mins',
  servings: 2,
  calories: 230,
  carbs: 6,
  glycemicIndex: 0,
  difficulty: 'Easy',
  ingredients: ['2 salmon fillets', '1 bunch asparagus', 'Olive oil', 'Garlic', 'Lemon juice', 'Herbs'],
  directions: 'Place salmon and asparagus on a baking sheet. Drizzle with olive oil, lemon, garlic. Bake at 200°C for 15–18 mins.'
}



];

export default function LunchDinnerList() {
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const openModal = (recipe) => {
    setSelectedRecipe(recipe);
    setModalVisible(true);
  };

  return (
    <ImageBackground
      source={{ uri: 'https://images.pexels.com/photos/1037998/pexels-photo-1037998.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.gridContainer}>
          {mockLunchDinnerRecipes.map((item, index) => (
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
                  <View
                    style={[
                      styles.chip,
                      selectedRecipe?.healthCategory === 'Good'
                        ? styles.good
                        : selectedRecipe?.healthCategory === 'Medium'
                        ? styles.medium
                        : styles.bad,
                    ]}
                  >
                    <MaterialCommunityIcons name="heart-pulse" size={16} color="#fff" />
                    <Text style={styles.chipTextWhite}>{selectedRecipe?.healthCategory}</Text>
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
  chipTextWhite: {
    fontSize: 13,
    color: '#fff',
    marginLeft: 6,
  },
  good: {
    backgroundColor: '#66BB6A',
  },
  medium: {
    backgroundColor: '#FFA726',
  },
  bad: {
    backgroundColor: '#EF5350',
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
