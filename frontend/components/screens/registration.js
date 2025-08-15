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

import { registerUser } from '../utilityV8/authHandler';
import { addUser } from '../utilityV8/userService';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [cgmDeviceId, setCgmDeviceId] = useState('');
  const [therapyType, setTherapyType] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }

    if (cgmDeviceId && !therapyType) {
      Alert.alert('Missing Therapy Type', 'Please select a therapy type if CGM Device ID is provided.');
      return;
    }

    const userObject = {
      name,
      email,
      phone,
      dob,
      gender,
      cgm_device_id: cgmDeviceId,
      therapy_type: cgmDeviceId ? therapyType : '',
      fitbit_permission: false,
    };

    try {
      const response = await registerUser(email, password);

      if (response.success) {
        const firebaseUid = response.firebase_uid;

        try {
          await addUser(userObject, firebaseUid);
          Alert.alert('Success', 'Account created successfully.');
          navigation.navigate('Dashboard');
        } catch (error) {
          Alert.alert('Error', error.message || 'Something went wrong while saving user data.');
        }
      } else {
        Alert.alert('Registration Failed', response.error);
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Something went wrong.');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={{
          uri: 'https://images.pexels.com/photos/7653093/pexels-photo-7653093.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        }}
        style={{ flex: 1, resizeMode: 'cover' }}
      >
        <View style={styles.overlay}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <View style={styles.card}>
              <Text style={styles.title}>Create your WellNest Account</Text>

              {/* Required Fields */}
              <Text style={styles.label}>Full Name*</Text>
              <TextInput placeholder="Enter your name" value={name} onChangeText={setName} style={inputStyle} />

              <Text style={styles.label}>Email*</Text>
              <TextInput
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={inputStyle}
              />

              <Text style={styles.label}>Password*</Text>
              <TextInput
                placeholder="Enter password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={inputStyle}
              />

              <Text style={styles.label}>Confirm Password*</Text>
              <TextInput
                placeholder="Confirm password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                style={inputStyle}
              />

              {/* Optional Fields */}
              <Text style={styles.label}>Phone</Text>
              <TextInput
                placeholder="Enter phone number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                style={inputStyle}
              />

              <Text style={styles.label}>Date of Birth</Text>
              <TextInput
                placeholder="YYYY-MM-DD"
                value={dob}
                onChangeText={setDob}
                style={inputStyle}
              />

              <Text style={styles.label}>Gender</Text>
              <TextInput
                placeholder="Male/Female/Other"
                value={gender}
                onChangeText={setGender}
                style={inputStyle}
              />

              <Text style={styles.label}>CGM Device ID</Text>
              <TextInput
                placeholder="Enter CGM Device ID"
                value={cgmDeviceId}
                onChangeText={setCgmDeviceId}
                style={inputStyle}
              />

              {cgmDeviceId !== '' && (
                <>
                  <Text style={styles.label}>Therapy Type*</Text>
                  <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                    <TouchableOpacity
                      style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}
                      onPress={() => setTherapyType('pump')}
                    >
                      <View style={styles.radioOuter}>
                        {therapyType === 'pump' && <View style={styles.radioInner} />}
                      </View>
                      <Text style={{ color: '#111827' }}>Pump</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                      onPress={() => setTherapyType('insulin')}
                    >
                      <View style={styles.radioOuter}>
                        {therapyType === 'insulin' && <View style={styles.radioInner} />}
                      </View>
                      <Text style={{ color: '#111827' }}>Insulin</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              <TouchableOpacity onPress={handleRegister} style={styles.registerButton}>
                <Text style={styles.registerButtonText}>Register</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginRedirect}>
                  Already have an account? <Text style={styles.loginLink}>Login</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

const inputStyle = {
  backgroundColor: '#fff',
  paddingVertical: 10,
  paddingHorizontal: 12,
  borderRadius: 8,
  marginBottom: 8,
  fontSize: 14,
  borderColor: '#fca5a5',
  borderWidth: 1,
  color: '#111827',
};

const styles = {
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 30,
  },
  card: {
    width: '90%',
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#b91c1c',
    textAlign: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    marginBottom: 3,
    marginTop: 8,
    color: '#1f2937',
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  registerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  loginRedirect: {
    marginTop: 18,
    color: '#b91c1c',
    textAlign: 'center',
    fontSize: 13,
  },
  loginLink: {
    fontWeight: '600',
  },
  radioOuter: {
    height: 18,
    width: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#b91c1c',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  radioInner: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#b91c1c',
  },
};

export default RegisterScreen;

// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Alert,
//   ScrollView,
//   ImageBackground,
//   KeyboardAvoidingView,
//   Platform,
//   StatusBar,
// } from 'react-native';

// import { registerUser } from '../utilityV8/authHandler';
// import { addUser } from '../utilityV8/userService';

// const RegisterScreen = ({ navigation }) => {
//   // Required fields
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');

//   // Optional fields
//   const [phone, setPhone] = useState('');
//   const [dob, setDob] = useState('');
//   const [gender, setGender] = useState('');
//   const [cgmDeviceId, setCgmDeviceId] = useState('');

// const handleRegister = async () => {
//   if (!name || !email || !password || !confirmPassword) {
//     Alert.alert('Missing Fields', 'Please fill in all required fields.');
//     return;
//   }

//   if (password !== confirmPassword) {
//     Alert.alert('Password Mismatch', 'Passwords do not match.');
//     return;
//   }

//   const userObject = {
//     name,
//     email,
//     phone,
//     dob,
//     gender,
//     cgm_device_id: cgmDeviceId,
//     fitbit_permission: false,
//   };

//   try {
//     const response = await registerUser(email, password);

//     if (response.success) {
//       const firebaseUid = response.firebase_uid;

//       try {
//         await addUser(userObject, firebaseUid); // ✅ use Firebase UID
//         Alert.alert('Success', 'Account created successfully.');
//         navigation.navigate('Dashboard');
//       } catch (error) {
//         Alert.alert('Error', error.message || 'Something went wrong while saving user data.');
//       }
//     } else {
//       Alert.alert('Registration Failed', response.error);
//     }
//   } catch (err) {
//     Alert.alert('Error', err.message || 'Something went wrong.');
//   }
// };

//   return (
//     <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
//       <StatusBar barStyle="light-content" />
//       <ImageBackground
//         source={{
//           uri: 'https://images.pexels.com/photos/7653093/pexels-photo-7653093.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
//         }}
//         style={{ flex: 1, resizeMode: 'cover' }}
//       >
//         <View style={styles.overlay}>
//           <ScrollView contentContainerStyle={styles.scroll}>
//             <View style={styles.card}>
//               <Text style={styles.title}>Create your WellNest Account</Text>

//               {/* Required Fields */}
//               <Text style={styles.label}>Full Name*</Text>
//               <TextInput placeholder="Enter your name" value={name} onChangeText={setName} style={inputStyle} />

//               <Text style={styles.label}>Email*</Text>
//               <TextInput
//                 placeholder="Enter your email"
//                 value={email}
//                 onChangeText={setEmail}
//                 keyboardType="email-address"
//                 autoCapitalize="none"
//                 style={inputStyle}
//               />

//               <Text style={styles.label}>Password*</Text>
//               <TextInput
//                 placeholder="Enter password"
//                 value={password}
//                 onChangeText={setPassword}
//                 secureTextEntry
//                 style={inputStyle}
//               />

//               <Text style={styles.label}>Confirm Password*</Text>
//               <TextInput
//                 placeholder="Confirm password"
//                 value={confirmPassword}
//                 onChangeText={setConfirmPassword}
//                 secureTextEntry
//                 style={inputStyle}
//               />

//               {/* Optional Fields */}
//               <Text style={styles.label}>Phone</Text>
//               <TextInput
//                 placeholder="Enter phone number"
//                 value={phone}
//                 onChangeText={setPhone}
//                 keyboardType="phone-pad"
//                 style={inputStyle}
//               />

//               <Text style={styles.label}>Date of Birth</Text>
//               <TextInput
//                 placeholder="YYYY-MM-DD"
//                 value={dob}
//                 onChangeText={setDob}
//                 style={inputStyle}
//               />

//               <Text style={styles.label}>Gender</Text>
//               <TextInput
//                 placeholder="Male/Female/Other"
//                 value={gender}
//                 onChangeText={setGender}
//                 style={inputStyle}
//               />

//               <Text style={styles.label}>CGM Device ID</Text>
//               <TextInput
//                 placeholder="Enter CGM Device ID"
//                 value={cgmDeviceId}
//                 onChangeText={setCgmDeviceId}
//                 style={inputStyle}
//               />

//               <TouchableOpacity onPress={handleRegister} style={styles.registerButton}>
//                 <Text style={styles.registerButtonText}>Register</Text>
//               </TouchableOpacity>

//               <TouchableOpacity onPress={() => navigation.navigate('Login')}>
//                 <Text style={styles.loginRedirect}>
//                   Already have an account? <Text style={styles.loginLink}>Login</Text>
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </ScrollView>
//         </View>
//       </ImageBackground>
//     </KeyboardAvoidingView>
//   );
// };

// const inputStyle = {
//   backgroundColor: '#fff',
//   paddingVertical: 10,
//   paddingHorizontal: 12,
//   borderRadius: 8,
//   marginBottom: 8,
//   fontSize: 14,
//   borderColor: '#fca5a5',
//   borderWidth: 1,
//   color: '#111827',
// };

// const styles = {
//   overlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.3)',
//     paddingHorizontal: 16,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   scroll: {
//     flexGrow: 1,
//     justifyContent: 'center',
//     paddingVertical: 30,
//   },
//   card: {
//     width: '90%',
//     backgroundColor: 'rgba(255,255,255,0.95)',
//     padding: 16,
//     borderRadius: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 6,
//     elevation: 6,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#b91c1c',
//     textAlign: 'center',
//     marginBottom: 12,
//   },
//   label: {
//     fontSize: 13,
//     marginBottom: 3,
//     marginTop: 8,
//     color: '#1f2937',
//     fontWeight: '600',
//   },
//   registerButton: {
//     backgroundColor: '#dc2626',
//     paddingVertical: 12,
//     borderRadius: 10,
//     alignItems: 'center',
//     marginTop: 16,
//   },
//   registerButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 15,
//   },
//   loginRedirect: {
//     marginTop: 18,
//     color: '#b91c1c',
//     textAlign: 'center',
//     fontSize: 13,
//   },
//   loginLink: {
//     fontWeight: '600',
//   },
// };

// export default RegisterScreen;
