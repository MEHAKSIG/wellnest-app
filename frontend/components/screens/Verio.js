// 📂 ComingSoonScreen.jsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  ImageBackground,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function ComingSoonScreen({ navigation }) {
  return (
    <ImageBackground
      source={{ uri: 'https://www.transparenttextures.com/patterns/green-dust-and-scratches.png' }}
      style={styles.container}
      resizeMode="repeat"
    >
      <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack?.()}>
        <Ionicons name="arrow-back" size={28} color="#A8E6CF" />
      </TouchableOpacity>

      <View style={styles.overlay}>
        <Image
          source={{ uri: 'https://www.onetouch.com/sites/onetouch_us/files/2023-10/onetouch_app_monogram_tm_reveal_1col_1024px_rgb_12x.png' }}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Coming Soon</Text>
        <Text style={styles.subtitle}>Verio Glucometer Connectivity</Text>
        <Text style={styles.message}>We’re working hard to bring you real-time glucose tracking and seamless syncing. Stay tuned!</Text>
      </View>

     
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#014421',
    justifyContent: 'center',
    alignItems: 'center',
    width: width,
    height: height
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center'
  },
  logo: {
    width: width * 0.4,
    height: 100,
    marginBottom: 25
  },
  title: {
    fontSize: 36,
    color: '#A8E6CF',
    fontWeight: '900',
    marginBottom: 10,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 20,
    color: '#DFFFE0',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center'
  },
  message: {
    fontSize: 16,
    color: '#E1FBE5',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20
  },
  
});
