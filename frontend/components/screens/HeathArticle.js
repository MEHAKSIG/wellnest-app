import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
  Linking,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useUser } from '../../UserContext';
const { height } = Dimensions.get('window');

const NewsScreen = () => {
  const navigation = useNavigation();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [apiNews, setApiNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const articles = [
    {
      id: 1,
      title: "Breakthrough in Diabetes Treatment",
      image: "https://scitechdaily.com/images/Insulin-Injection-Diabetes.jpg",
      date: "Dec 15, 2023",
      content: "A new treatment method aims to regulate insulin production in Type 1 diabetes patients by using cutting-edge gene therapy. This could drastically reduce the need for insulin injections and improve long-term control over blood glucose levels.",
      readMoreLink: "https://www.forbes.com/sites/juergeneckhardt/2025/03/18/emerging-breakthroughs-in-diabetes-treatment-a-new-era-of-hope/",
    },
    {
      id: 2,
      title: "FDA Approves New Diabetes Drug",
      image: "https://th.bing.com/th/id/OIP.Oq4fsBgu9IJ89ldcu_X9GQAAAA?rs=1&pid=ImgDetMain",
      date: "Jan 5, 2024",
      content: "The FDA has approved a new oral medication for Type 2 diabetes. The drug improves insulin sensitivity and helps manage blood sugar levels by targeting the body’s response to insulin.",
      readMoreLink: "https://www.astrazeneca.com/media-centre/press-releases/2024/farxiga-approved-in-the-us-for-the-treatment-of-paediatric-type-2-diabetes.html",
    },
    {
      id: 3,
      title: "Innovative Glucose Monitoring System Unveiled",
      image: "https://www.notebookcheck.net/fileadmin/Notebooks/News/_nc3/KWatch_Glucose_blood_sugar_monitor_smartwatch_drdNBC.jpg",
      date: "Feb 20, 2024",
      content: "The new wearable glucose monitoring system provides real-time data, allowing diabetic patients to monitor their blood sugar levels continuously throughout the day.",
      readMoreLink: "https://gadgetsandwearables.com/2021/12/03/kwatch/",
    },
  ];

  const newsUpdates = [
    {
      id: 4,
      title: "New Diabetes Research Finds Promising Results",
      image: "https://diabetesresearch.org/wp-content/uploads/2023/06/ACM7045-1024x738.jpg",
      date: "Mar 1, 2024",
      content: "A new study reveals promising results for early-stage Type 1 diabetes prevention using advanced immunotherapy treatments.",
      readMoreLink: "https://www.jci.org/articles/view/152085",
    },
    {
      id: 5,
      title: "Wearable Devices Revolutionize Diabetes Management",
      image: "https://th.bing.com/th/id/OIP.aAM94CCOK3LpNRxdYOOA3QHaE8?rs=1&pid=ImgDetMain",
      date: "Apr 10, 2024",
      content: "Wearable devices are revolutionizing diabetes management by allowing patients to track glucose levels in real-time.",
      readMoreLink: "https://www.diabetes.co.uk/news/2024/Apr/wearable-devices-revolutionize-diabetes-management-9521.html",
    },
  ];

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await axios.get(
          'https://gnews.io/api/v4/search?q=diabetes&lang=en&token=723af51fa417e694b559fa1247a8c246'
        );
        const formatted = res.data.articles.map((item, index) => ({
          id: `api-${index}`,
          title: item.title,
          image: item.image || 'https://via.placeholder.com/150',
          date: new Date(item.publishedAt).toDateString(),
          content: item.description || "No description available.",
          readMoreLink: item.url,
        }));
        setApiNews(formatted);
      } catch (error) {
        console.error("API error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const handleArticlePress = (article) => {
    setSelectedArticle(article);
    setModalVisible(true);
  };

  const handleReadMore = (url) => {
    Linking.openURL(url);
  };

  return (
    <LinearGradient colors={['#8B0000', '#B22222']} style={styles.container}>
      {/* ✅ Back Arrow */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Dashboard')}
        style={{
          position: 'absolute',
          top: 40,
          left: 28,
          zIndex: 999,
          backgroundColor: 'rgba(255,255,255,0.2)',
          padding: 8,
          borderRadius: 20,
        }}
      >
        <Feather name="arrow-left" size={24} color="#fff" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ✅ Welcome Banner */}
        <View style={styles.bannerContainer}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/2013701/pexels-photo-2013701.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }}
            style={styles.bannerImage}
          />
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerText}>👋 Welcome back, {user?.name ||"Mehak"}</Text>
            <Text style={styles.bannerSubtext}>☕ Stay informed with the latest in diabetes care!</Text>
          </View>
        </View>

        {/* ✅ Featured Articles */}
        <Text style={styles.header}>Featured Articles</Text>
        <FlatList
          data={articles}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.articleCard} onPress={() => handleArticlePress(item)}>
              <Image source={{ uri: item.image }} style={styles.articleImage} />
              <View style={styles.articleContent}>
                <Text style={styles.articleTitle}>{item.title}</Text>
                <Text style={styles.articleDate}>{item.date}</Text>
              </View>
            </TouchableOpacity>
          )}
        />

        {/* ✅ Latest News */}
        <Text style={styles.header}>Latest Updates & News</Text>
        <FlatList
          data={[...newsUpdates, ...apiNews]}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          ListEmptyComponent={loading ? <ActivityIndicator color="#fff" size="large" /> : null}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.newsCard} onPress={() => handleArticlePress(item)}>
              <Image source={{ uri: item.image }} style={styles.newsImage} />
              <View style={styles.newsContent}>
                <Text style={styles.newsTitle}>{item.title}</Text>
                <Text style={styles.newsDate}>{item.date}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </ScrollView>

      {/* ✅ Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <LinearGradient colors={['#8B0000', '#B22222']} style={styles.modalFullContainer}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <Text style={styles.modalTitle}>{selectedArticle?.title}</Text>
            <Text style={styles.modalDate}>{selectedArticle?.date}</Text>
            <Image source={{ uri: selectedArticle?.image }} style={styles.modalImage} />
            <Text style={styles.modalDescription}>{selectedArticle?.content}</Text>

            <TouchableOpacity style={styles.readMoreButton} onPress={() => handleReadMore(selectedArticle?.readMoreLink)}>
              <Text style={styles.readMoreText}>Read Full Article</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </ScrollView>
        </LinearGradient>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  bannerContainer: {
    position: 'relative',
    height: 300,
    overflow: 'hidden',
    marginBottom: 20,
    width: '100%',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  bannerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
    textAlign: 'center',
  },
  bannerSubtext: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
  articleCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginRight: 20,
    width: 270,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  articleImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
  },
  articleContent: {
    paddingTop: 10,
  },
  articleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  articleDate: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  newsCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    flexDirection: 'row',
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  newsImage: {
    width: 100,
    height: 100,
    borderRadius: 15,
    marginRight: 15,
  },
  newsContent: {
    flex: 1,
    justifyContent: 'center',
  },
  newsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  newsDate: {
    fontSize: 14,
    color: '#888',
  },
  modalFullContainer: {
    flex: 1,
    padding: 20,
  },
  modalScroll: {
    paddingBottom: 50,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#fff',
    textAlign: 'center',
  },
  modalDate: {
    fontSize: 16,
    color: '#ffcccc',
    marginBottom: 10,
  },
  modalImage: {
    width: '100%',
    height: 250,
    borderRadius: 15,
    marginBottom: 20,
  },
  modalDescription: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'justify',
    paddingHorizontal: 10,
    marginBottom: 30,
  },
  readMoreButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  readMoreText: {
    color: '#8B0000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 10,
  },
  closeText: {
    color: '#fff',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default NewsScreen;
