// 📂 MedtronicScreen.jsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ImageBackground,
  Dimensions,
  FlatList,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

export default function MedtronicScreen() {
  const [userId, setUserId] = useState('');
  const [data, setData] = useState([]);
  const [authVisible, setAuthVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchStoredUserId = async () => {
      const savedId = await AsyncStorage.getItem('medtronic_user_id');
      if (savedId) {
        setUserId(savedId);
        fetchData(savedId);
        setAuthVisible(false);
      }
    };
    fetchStoredUserId();
  }, []);

  const fetchData = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`http://131.153.231.94:100/api/Health/glucose`);
      const json = await response.json();
      if (Array.isArray(json.list)) {
        setData(json.list);
      } else {
        setData([]);
        Alert.alert('No data available');
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    await AsyncStorage.setItem('medtronic_user_id', userId);
    fetchData(userId);
    setAuthVisible(false);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.leftBlock}>
        <Text style={styles.label}>Timestamp:</Text>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
        <Text style={styles.label}>Glucose:</Text>
      </View>
      <View style={styles.glucoseBox}>
        <Text style={styles.glucoseValue}>{parseFloat(item.glucose).toFixed(2)}</Text>
      </View>
    </View>
  );

  if (authVisible) {
    return (
      <ImageBackground
        source={{ uri: 'https://images.squarespace-cdn.com/content/v1/5dcc065b3a3dc42110df8d3b/f2da2ece-859c-41c4-b2c2-6e50214e45f1/Continuous+glucose+monitor.jpg' }}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <ScrollView contentContainerStyle={styles.authContainer}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.heading}>Connect to Medtronic</Text>
            <Text style={styles.subheading}>
              Please enter your Medtronic User ID to retrieve glucose readings. If you're not connected yet, open the Medtronic app and enable sharing.
            </Text>
            <TextInput
              placeholder="Medtronic User ID"
              placeholderTextColor="#888"
              style={styles.input}
              onChangeText={setUserId}
              value={userId}
            />
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Fetch Readings</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </ImageBackground>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.diaryHeader}>
        <Text style={styles.title}>Medtronic Glucose Diary</Text>
        <TouchableOpacity
          onPress={async () => {
            await AsyncStorage.removeItem('medtronic_user_id');
            setAuthVisible(true);
            setUserId('');
            setData([]);
          }}
        >
          <Ionicons name="log-out-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#FFEEEE" />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%'
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 16,
    justifyContent: 'center'
  },
  container: {
    flex: 1,
    backgroundColor: '#5e0b15',
    padding: 16
  },
  authContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 12
  },
  diaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center'
  },
  card: {
    backgroundColor: '#8c1c3f',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  leftBlock: {
    flex: 1
  },
  label: {
    color: '#FFEEEE',
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 4
  },
  timestamp: {
    color: '#FFECEC',
    fontSize: 14,
    marginBottom: 12
  },
  glucoseBox: {
    backgroundColor: '#6B0000',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignSelf: 'center'
  },
  glucoseValue: {
    fontSize: 22,
    color: '#FFEEEE',
    fontWeight: 'bold'
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    width: '100%'
  },
  button: {
    backgroundColor: '#8c1c3f',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
    width: '100%'
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold'
  },
  heading: {
    color: 'white',
    fontSize: 22,
    marginBottom: 12,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  subheading: {
    color: 'white',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center'
  },
  listContainer: {
    paddingBottom: 30
  }
});