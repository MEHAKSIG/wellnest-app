import { useEffect, useRef } from 'react';
import { Linking, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { completeEmailLinkSignIn } from '../utilityV8/authHandler'; // ✅ v8-compatible

export const useEmailLinkAuth = (shouldActivate, emailRef) => {
  const navigation = useNavigation();
  const listenerRef = useRef(null);

  useEffect(() => {
    if (!shouldActivate || !emailRef?.current) return;

    const handleLink = async (url) => {
      const email = emailRef.current;
      if (!email || !url) return;

      try {
        const result = await completeEmailLinkSignIn(email, url);
        if (result.success) {
          Alert.alert('Signed In', 'Welcome back!');
          navigation.replace('Dashboard');
        } else {
          Alert.alert('Sign-In Error', result.error);
        }
      } catch (error) {
        Alert.alert('Error', error.message);
      } finally {
        listenerRef.current?.remove?.();
      }
    };

    // Handle cold start links
    Linking.getInitialURL()
      .then((url) => {
        if (url) handleLink(url);
      })
      .catch((err) => {
        console.warn('Error getting initial URL:', err);
      });

    // Listen to foreground link events
    listenerRef.current = Linking.addEventListener('url', ({ url }) => {
      handleLink(url);
    });

    return () => {
      listenerRef.current?.remove?.(); // use optional chaining for cleanup
    };
  }, [shouldActivate]);
};
