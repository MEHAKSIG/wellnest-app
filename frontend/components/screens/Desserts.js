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



const mockDessertRecipes = [
  {
    id: '1', title: 'Chia Pudding with Berries', category: 'Continental', healthCategory: 'Good',
    image: 'https://www.rainbowinmykitchen.com/wp-content/uploads/2018/10/chia-pudding-1-731x1024.jpg', rating: 4.6,
    time: '10 mins + chill', servings: 2, calories: 120, carbs: 12, glycemicIndex: 30, difficulty: 'Easy',
    ingredients: ['2 tbsp chia seeds', '1 cup almond milk', 'Stevia or erythritol', 'Fresh berries'],
    directions: 'Mix chia seeds with milk and sweetener. Chill overnight. Top with berries before serving.'
  },
  {
    id: '2', title: 'Low GI Apple Crumble', category: 'Baked', healthCategory: 'Medium',
    image: 'https://www.modernhoney.com/wp-content/uploads/2022/09/Apple-Crumble-Recipe-1-scaled.jpg', rating: 4.4,
    time: '30 mins', servings: 2, calories: 180, carbs: 20, glycemicIndex: 45, difficulty: 'Medium',
    ingredients: ['1 apple (sliced)', 'Oats', 'Almond flour', 'Cinnamon', 'Stevia'],
    directions: 'Layer apples in dish. Mix topping with oats, flour, cinnamon, and stevia. Bake until golden.'
  },
  {
    id: '3', title: 'Avocado Cocoa Mousse', category: 'No-Bake', healthCategory: 'Good',
    image: 'https://i.pinimg.com/originals/72/d3/05/72d305e4cbffd7ff2e55455ec894b3c7.jpg', rating: 4.7,
    time: '15 mins', servings: 2, calories: 140, carbs: 10, glycemicIndex: 25, difficulty: 'Easy',
    ingredients: ['1 ripe avocado', '2 tbsp cocoa powder', 'Vanilla', 'Sweetener (erythritol)'],
    directions: 'Blend all ingredients until creamy. Chill and serve with grated dark chocolate.'
  },
  {
    id: '4', title: 'Greek Yogurt Parfait', category: 'Fruit-Based', healthCategory: 'Good',
    image: 'https://feelgoodfoodie.net/wp-content/uploads/2021/05/fruit-and-yogurt-parfait-08-768x1151.jpg', rating: 4.5,
    time: '10 mins', servings: 2, calories: 130, carbs: 14, glycemicIndex: 35, difficulty: 'Easy',
    ingredients: ['Greek yogurt', 'Granola (low sugar)', 'Strawberries', 'Blueberries'],
    directions: 'Layer yogurt with fruit and granola in a glass. Serve chilled.'
  },
  {
    id: '5', title: 'Ragi Laddu', category: 'Traditional', healthCategory: 'Good',
    image: 'https://www.archanaskitchen.com/images/archanaskitchen/1-Author/Madhuli_Ajay/NagliRagi_Laddu.jpg', rating: 4.3,
    time: '20 mins', servings: 2, calories: 160, carbs: 15, glycemicIndex: 40, difficulty: 'Easy',
    ingredients: ['Ragi flour', 'Dates paste', 'Ghee', 'Nuts'],
    directions: 'Roast ragi, mix with dates paste and ghee. Roll into laddus with chopped nuts.'
  },
  {
    id: '6', title: 'Stuffed Dates with Nuts', category: 'No-Bake', healthCategory: 'Good',
    image: 'https://th.bing.com/th/id/OIP.OwRLnHy6GJ5ODUkHR5fhqAHaGL?cb=iwp1&rs=1&pid=ImgDetMain', rating: 4.8,
    time: '5 mins', servings: 2, calories: 100, carbs: 11, glycemicIndex: 42, difficulty: 'Easy',
    ingredients: ['Medjool dates', 'Almonds', 'Walnuts', 'Pistachios'],
    directions: 'Remove pits, fill dates with nuts. Serve as is.'
  },
  {
    id: '7', title: 'Coconut Almond Energy Balls', category: 'No-Bake', healthCategory: 'Good',
    image: 'https://th.bing.com/th/id/OIP.c0LNO29knI1-gHyqrRY6MQHaLG?cb=iwp1&rs=1&pid=ImgDetMain', rating: 4.6,
    time: '10 mins', servings: 2, calories: 150, carbs: 13, glycemicIndex: 35, difficulty: 'Easy',
    ingredients: ['Almonds', 'Coconut flakes', 'Dates', 'Chia seeds'],
    directions: 'Blend ingredients, form balls, and chill.'
  },
  {
    id: '8', title: 'Baked Pear with Cinnamon', category: 'Baked', healthCategory: 'Good',
    image: 'https://runningonrealfood.com/wp-content/uploads/2021/03/Vegan-Healthy-Baked-Pears-Recipe-9-1-1365x2048.jpg', rating: 4.7,
    time: '25 mins', servings: 2, calories: 130, carbs: 18, glycemicIndex: 38, difficulty: 'Easy',
    ingredients: ['2 pears', 'Cinnamon', 'Walnuts', 'Honey (optional)'],
    directions: 'Slice pears, top with cinnamon and nuts. Bake until soft.'
  },
  {
    id: '9', title: 'Pumpkin Seed Bars', category: 'No-Bake', healthCategory: 'Good',
    image: 'https://th.bing.com/th/id/OIP.1u5ap6zRc5ETV-Av13Y_5QHaHa?cb=iwp1&rs=1&pid=ImgDetMain', rating: 4.4,
    time: '20 mins + chill', servings: 2, calories: 170, carbs: 16, glycemicIndex: 40, difficulty: 'Easy',
    ingredients: ['Pumpkin seeds', 'Oats', 'Nut butter', 'Stevia'],
    directions: 'Mix all, press into tray, chill until firm.'
  },
  {
    id: '10', title: 'Banana Oat Cookies', category: 'Baked', healthCategory: 'Medium',
    image: 'https://th.bing.com/th/id/OIP.UZ9EvJXSp0T2LHoZ6SqmOQHaKD?cb=iwp1&rs=1&pid=ImgDetMain', rating: 4.2,
    time: '25 mins', servings: 2, calories: 180, carbs: 22, glycemicIndex: 50, difficulty: 'Easy',
    ingredients: ['Mashed banana', 'Oats', 'Cinnamon', 'Dark chocolate chips'],
    directions: 'Mix all, form cookies, bake at 180°C for 15 mins.'
  }
];

export default function DessertList() {
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
          {mockDessertRecipes.map((item, index) => (
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
