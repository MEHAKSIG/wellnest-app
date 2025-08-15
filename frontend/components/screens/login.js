import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';

import { loginUser, auth } from '../utilityV8/authHandler'; // V8 Firebase Auth
import ForgotPasswordModal from './ForgetPassword';
import { useUser } from '../../UserContext';
import { getUser } from '../utilityV8/userService';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [modalEmail, setModalEmail] = useState('');
  const { setUser } = useUser();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter email and password.');
      return;
    }

    const response = await loginUser(email, password);

    if (response.success) {
      alert('Login Success', 'Welcome back to WellNest!');
      const uid = auth.currentUser?.uid;
      const userDoc = await getUser(uid);
      setUser({ uid, ...userDoc });
      navigation.navigate('Dashboard');
    } else {
      alert('Login Failed', response.error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={{
          uri: 'https://images.pexels.com/photos/7653090/pexels-photo-7653090.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        }}
        style={styles.background}
      >
        <View style={styles.overlay}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.card}>
              <Text style={styles.title}>Welcome to WellNest</Text>
              <Text style={styles.subtitle}>
                Manage your health. Every step. Every reading.
              </Text>

              <TextInput
                placeholder="Email"
                placeholderTextColor="#6b7280"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />

              <TextInput
                placeholder="Password"
                placeholderTextColor="#6b7280"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
              />

              <TouchableOpacity onPress={() => setShowResetModal(true)}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
                <Text style={styles.loginButtonText}>Login</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerText}>
                  Don't have an account?{' '}
                  <Text style={styles.registerLink}>Register</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
          <Text style={styles.footer}>
            © 2025 Mehak, Nivedita, and Garima. All rights reserved.
          </Text>
        </View>
      </ImageBackground>

      <ForgotPasswordModal
        visible={showResetModal}
        onClose={() => setShowResetModal(false)}
        modalEmail={modalEmail}
        setModalEmail={setModalEmail}
      />
    </KeyboardAvoidingView>
  );
};

const styles = {
  container: { flex: 1 },
  background: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#b91c1c',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  input: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    fontSize: 16,
    borderColor: '#fca5a5',
    borderWidth: 1,
  },
  forgotText: {
    color: '#b91c1c',
    fontSize: 13,
    marginBottom: 10,
    textAlign: 'right',
  },
  loginButton: {
    backgroundColor: '#dc2626',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  registerText: {
    marginTop: 20,
    color: '#b91c1c',
    textAlign: 'center',
    fontSize: 14,
  },
  registerLink: {
    fontWeight: '600',
  },
  footer: {
    marginTop: 20,
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
  },
};

export default LoginScreen;
