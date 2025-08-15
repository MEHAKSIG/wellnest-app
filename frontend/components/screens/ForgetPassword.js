// ForgetPassword.js
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
// import { sendResetLink, sendEmailLink } from '../utility/authHandler'; //V9
import { sendResetLink, sendEmailLink } from '../utilityV8/authHandler'; //V8
import { useEmailLinkAuth } from '../hooks/useEmailLinkAuth';

const ForgotPasswordModal = ({ visible, onClose }) => {
  const [modalEmail, setModalEmail] = useState('');
  const [emailLinkMode, setEmailLinkMode] = useState(false);
  const emailRef = useRef('');
  useEmailLinkAuth(emailLinkMode, emailRef);

  const handleSendReset = async () => {
    if (!modalEmail) {
      Alert.alert('Missing Email', 'Please enter your email.');
      return;
    }
    const res = await sendResetLink(modalEmail);
    if (res.success) {
      Alert.alert('Success', 'Password reset link sent.');
      onClose();
      setModalEmail('');
    } else {
      Alert.alert('Error', res.error);
    }
  };

  const handleSendEmailLink = async () => {
    if (!modalEmail) {
      Alert.alert('Missing Email', 'Please enter your email.');
      return;
    }
    const res = await sendEmailLink(modalEmail);
    if (res.success) {
      emailRef.current = modalEmail;
      Alert.alert('Success', 'Sign-in link sent. Check your email.');
      setEmailLinkMode(true);  // 🔁 Activate listener
      onClose();
      setModalEmail('');
    } else {
      Alert.alert('Error', res.error);
    }
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Reset or Sign in</Text>

          <TextInput
            placeholder="Enter your email"
            placeholderTextColor="#6b7280"
            value={modalEmail}
            onChangeText={setModalEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          <TouchableOpacity onPress={handleSendReset} style={styles.button}>
            <Text style={styles.buttonText}>Send Password Reset Link</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSendEmailLink} style={styles.button}>
            <Text style={styles.buttonText}>Sign in with Email Link</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = {
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#b91c1c',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 10,
    borderColor: '#fca5a5',
    borderWidth: 1,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#dc2626',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelText: {
    textAlign: 'center',
    color: '#6b7280',
  },
};

export default ForgotPasswordModal;
