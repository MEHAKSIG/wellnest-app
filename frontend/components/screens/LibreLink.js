// 📂 GlucoseDiaryScreen.jsx
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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { uploadNewCgmLogs } from '../utilityV8/cgmService';
const { width, height } = Dimensions.get('window');

export default function GlucoseDiaryScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [data, setData] = useState([]);
  const [authVisible, setAuthVisible] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchStoredCredentials = async () => {
      const savedUsername = await AsyncStorage.getItem('glucose_username');
      const savedPassword = await AsyncStorage.getItem('glucose_password');
      if (savedUsername && savedPassword) {
        setUsername(savedUsername);
        setPassword(savedPassword);
        fetchData(savedUsername, savedPassword);
        setAuthVisible(false);
      }
    };
    fetchStoredCredentials();
  }, []);

  const fetchData = async (user, pass) => {
    try {
      const response = await fetch(
        'https://librelinkup-s090.onrender.com/get-glucose',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: user,
            password: pass,
            clientVersion: '4.9.0',
          }),
        }
      );
      const result = await response.json();
      if (result.success && result.data && Array.isArray(result.data.history)) {
        console.log(result.data.history);
        uploadNewCgmLogs(result.data.history);
        const sorted = result.data.history.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        setData(result.data.history);
      } else {
        setData([]);
        Alert.alert(
          'Warning:',
          'CGM sensor not responding. Scan within 5 minutes to resume trackin',
          'No history data found or unexpected format'
        );
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const handleLogin = async () => {
    await AsyncStorage.setItem('glucose_username', username);
    await AsyncStorage.setItem('glucose_password', password);
    fetchData(username, password);
    setAuthVisible(false);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('glucose_username');
    await AsyncStorage.removeItem('glucose_password');
    setUsername('');
    setPassword('');
    setData([]);
    setAuthVisible(true);
  };

  const getArrow = (value) => {
    if (value > 180) return 'arrow-up-circle';
    if (value < 80) return 'arrow-down-circle';
    return 'remove-circle';
  };

  if (authVisible) {
    return (
      <ImageBackground
        source={{
          uri: 'https://images.squarespace-cdn.com/content/v1/5dcc065b3a3dc42110df8d3b/1606706262936-L75WL5CGA7G0R1VSC22A/freestyle+libre+sensor+singapore.png',
        }}
        style={styles.background}
        resizeMode="cover">
        <View style={styles.overlay}>
          <ScrollView contentContainerStyle={styles.authContainer}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.heading}>Connect to LibreLinkUp</Text>
            <Text style={styles.subheading}>
              To see your glucose data, please enter your LibreLinkUp
              credentials below. If you haven't connected yet, visit the
              LibreLinkUp app and enable sharing.
            </Text>
            <TextInput
              placeholder="Username"
              placeholderTextColor="#888"
              style={styles.input}
              onChangeText={setUsername}
              value={username}
            />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#888"
              secureTextEntry
              style={styles.input}
              onChangeText={setPassword}
              value={password}
            />
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.diaryHeader}>
        <Text style={styles.title}>Diabetes Diary</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>
      {data.map((entry, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.timestamp}>Timestamp: {entry.date}</Text>
          <View style={styles.glucoseRow}>
            <Text style={styles.glucose}>Glucose: {entry.value}</Text>
            <Ionicons
              name={getArrow(entry.value)}
              size={28}
              color="white"
              style={{ marginLeft: 10 }}
            />
          </View>
        </View>
      ))}
    </ScrollView>
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
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 16,
    justifyContent: 'center',
  },
  container: {
    padding: 16,
    backgroundColor: '#5e0b15',
  },
  authContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  diaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#8c1c3f',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  timestamp: {
    fontSize: 16,
    color: '#ffeaea',
  },
  glucoseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  glucose: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    width: '100%',
  },
  button: {
    backgroundColor: '#8c1c3f',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
    marginLeft: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  heading: {
    color: 'white',
    fontSize: 22,
    marginBottom: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subheading: {
    color: 'white',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
});
