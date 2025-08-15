import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  ImageBackground,
  StyleSheet,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const quotes = [
  "Your health is your wealth.",
  "Every step counts toward a healthier you.",
  "Wellness is a daily commitment.",
  "Small habits make big changes.",
  "Take care of your body—it's the only place you live.",
];

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const currentMonthIndex = new Date().getMonth();

const Dashboard = () => {
  const navigation = useNavigation();
  const [quoteIndex, setQuoteIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const animateQuote = useCallback(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.delay(2500),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    });
  }, [fadeAnim]);

  useEffect(() => {
    animateQuote();
    const interval = setInterval(animateQuote, 4000);
    return () => clearInterval(interval);
  }, [animateQuote]);

  const data = [
    { title: 'Heart Rate', value: '60 bpm', icon: require('../../assets/heart.png'), bgColor: '#C5E4E7', screen: 'HeartScreen' },
    { title: 'Blood Sugar', value: '97 mg/dL', icon: require('../../assets/glucose.png'), bgColor: '#FAD4D4', screen: 'SugarScreen' },
    { title: 'Insulin', value: '22 units', icon: require('../../assets/insulin.png'), bgColor: '#FFE0B2', screen: 'InsulinScreen' },
    { title: 'Activity', value: '120 cal', icon: require('../../assets/activity.png'), bgColor: '#E1BEE7', screen: 'ActivityScreen' },
    { title: 'Nutrition', value: '3 Meals', icon: require('../../assets/apple.png'), bgColor: '#C8E6C9', screen: 'NutritionScreen' },
    { title: 'Menstrual', value: '3 days left', icon: require('../../assets/menses.png'), bgColor: '#F8BBD0', screen: 'MenstrualScreen' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={{ position: 'relative' }}>
          <ImageBackground
            source={require('../../assets/girl.png')}
            style={styles.imageBg}
            imageStyle={{
              width: '100%',
              height: undefined,
              aspectRatio: 1.2,
              borderBottomLeftRadius: 20,
              borderBottomRightRadius: 20,
              resizeMode: 'cover',
              alignSelf: 'center',
            }}
          >
            <View style={styles.headerTextBox}>
              <Text style={styles.headerText}>WellNest</Text>
            </View>
            <View style={styles.overlay}>
              <View style={styles.glucoseBanner}>
                <Text style={styles.glucoseBannerText}>Keep your glucose below 150 mg/dL</Text>
              </View>
              <Animated.Text style={[styles.quote, { opacity: fadeAnim }]}>
                {quotes[quoteIndex]}
              </Animated.Text>
            </View>
          </ImageBackground>
        </View>

        {/* Month Scroll */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthScroll}>
          {months.map((month, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.monthButton,
                index === currentMonthIndex && { backgroundColor: '#FF6E6E' },
              ]}
            >
              <Text
                style={[
                  styles.monthText,
                  index === currentMonthIndex && { color: '#fff' },
                ]}
              >
                {month}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Cards */}
        <View style={styles.grid}>
          {data.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.card, { backgroundColor: item.bgColor }]}
              onPress={() => navigation.navigate(item.screen)}
            >
              <Image source={item.icon} style={styles.cardIcon} />
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardValue}>{item.value}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0F1C',
  },
  container: {
    paddingBottom: 30,
  },
  imageBg: {
    height: 320,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerTextBox: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
  headerText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
  },
  overlay: {
    alignItems: 'center',
  },
  glucoseBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6E6E',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
  },
  glucoseBannerText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  quote: {
    color: '#EEE',
    marginTop: 10,
    fontStyle: 'italic',
    fontSize: 13,
    textAlign: 'center',
  },
  monthScroll: {
    marginTop: 10,
    paddingHorizontal: 16,
  },
  monthButton: {
    backgroundColor: '#1f2937',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 10,
  },
  monthText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    marginTop: 20,
  },
  card: {
    width: '42%',
    height: 130,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    padding: 10,
  },
  cardIcon: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  cardValue: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
});
