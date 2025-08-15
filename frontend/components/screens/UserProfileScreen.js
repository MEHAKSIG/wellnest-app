

import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView,
  Switch, Alert, Modal, FlatList, Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as AuthSession from 'expo-auth-session';

import { auth } from '../utilityV8/authHandler';
import { getUser, updateUser } from '../utilityV8/userService';

const CLIENT_ID = '23QCBZ';
const REDIRECT_URI = AuthSession.makeRedirectUri({ useProxy: true });
console.log("redirect uri: ",REDIRECT_URI)
const SCOPES = ['activity', 'heartrate', 'sleep', 'profile'];
const discovery = { authorizationEndpoint: 'https://www.fitbit.com/oauth2/authorize' };
const { width, height } = Dimensions.get('window');

const defaultAvatars = [
  'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg',
  'https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg',
  'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg',
];

export default function UserProfileScreen() {
  const navigation = useNavigation();
  const userId = auth.currentUser?.uid;

  const [showModal, setShowModal] = useState(false);
  const [fitbitToggledOn, setFitbitToggledOn] = useState(false);
  const [fitbitPendingAuth, setFitbitPendingAuth] = useState(false);
  const [userData, setUserData] = useState({
    name: '', dob: '', gender: '', email: '', phone: '',
    cgm_device_id: '', fitbit_permission: false, profile_image_url: '',
  });

  useEffect(() => {
    if (!userId) {
      navigation.reset({ index: 0, routes: [{ name: 'LoginScreen' }] });
      return;
    }
    (async () => {
      try {
        const doc = await getUser(userId);
        if (doc) {
          setUserData(doc);
          setFitbitToggledOn(doc.fitbit_permission || false);
        }
      } catch (err) {
        console.error('❌ Failed to fetch user:', err);
      }
    })();
  }, [userId]);

  const connectFitbit = async () => {
    try {
      const authRequest = new AuthSession.AuthRequest({
        clientId: CLIENT_ID,
        scopes: SCOPES,
        redirectUri: REDIRECT_URI,
        responseType: AuthSession.ResponseType.Token,
      });

      await authRequest.makeAuthUrlAsync(discovery);

      const result = await authRequest.promptAsync(discovery, { useProxy: true });
      console.log('✅ Fitbit Auth Result:', result);

      if (result.type !== 'success' || !result.authentication?.accessToken) {
        Alert.alert('❌ Fitbit Error', 'Authorization failed.');
        return null;
      }

      const accessToken = result.authentication.accessToken;

      const profileRes = await fetch('https://api.fitbit.com/1/user/-/profile.json', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const profile = await profileRes.json();
      console.log('👤 Fitbit Profile:', profile);

      if (!profile?.user?.encodedId) {
        Alert.alert('Fitbit', 'Failed to fetch Fitbit profile');
        return null;
      }

      return {
        fitbit_permission: true,
        fitbit_access_token: accessToken,
        fitbit_user_id: profile.user.encodedId,
        fitbit_scopes: SCOPES,
      };
    } catch (error) {
      console.error('❌ OAuth Error:', error);
      Alert.alert('OAuth Error', error.message || 'Something went wrong.');
      return null;
    }
  };

  const handleSave = async () => {
    try {
      if (fitbitPendingAuth) {
        const proceed = await new Promise((resolve) => {
          Alert.alert('Fitbit Permission', 'Do you want to connect your Fitbit?', [
            { text: 'No', onPress: () => resolve(false), style: 'cancel' },
            { text: 'Yes', onPress: () => resolve(true) },
          ]);
        });

        if (proceed) {
          const fitbitData = await connectFitbit();
          if (!fitbitData) return;

          const finalData = { ...userData, ...fitbitData };
          await updateUser(userId, finalData);
          setUserData(finalData);
          setFitbitToggledOn(true);
          setFitbitPendingAuth(false);
          Alert.alert('Success', 'Fitbit linked and profile updated!');
        } else {
          setFitbitToggledOn(false);
          setFitbitPendingAuth(false);
        }
        return;
      }

      if (!fitbitToggledOn && userData.fitbit_permission) {
        const updatedData = {
          ...userData,
          fitbit_permission: false,
          fitbit_access_token: '',
          fitbit_user_id: '',
          fitbit_scopes: [],
        };
        await updateUser(userId, updatedData);
        setUserData(updatedData);
        Alert.alert('Success', 'Fitbit disconnected.');
        return;
      }

      await updateUser(userId, userData);
      Alert.alert('Success', 'Profile updated!');
    } catch (error) {
      console.error('❌ Save failed:', error);
      Alert.alert('Error', error.message || 'Failed to save profile.');
    }
  };

  const handleImagePick = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return Alert.alert('Permission', 'Grant access to media.');

      const result = await ImagePicker.launchImageLibraryAsync({ quality: 1, allowsEditing: true });
      if (!result.canceled) {
        const uri = result.assets[0].uri;
        const url = await uploadImageToFirebase(uri);
        const updated = { ...userData, profile_image_url: url };
        setUserData(updated);
        await updateUser(userId, { profile_image_url: url });
      }
    } catch (error) {
      console.error('❌ Image upload failed:', error);
      Alert.alert('Error', 'Failed to upload image.');
    }
  };

  const uploadImageToFirebase = async (uri) => {
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => resolve(xhr.response);
      xhr.onerror = () => reject('Image load failed');
      xhr.responseType = 'blob';
      xhr.open('GET', uri, true);
      xhr.send(null);
    });

    const storageRef = ref(getStorage(), `profileImages/${userId}.jpg`);
    await uploadBytes(storageRef, blob);
    blob.close();
    return await getDownloadURL(storageRef);
  };

  const handleDefaultSelect = async (uri) => {
    try {
      const updated = { ...userData, profile_image_url: uri };
      setUserData(updated);
      await updateUser(userId, { profile_image_url: uri });
      setShowModal(false);
    } catch (error) {
      console.error('❌ Default avatar update failed:', error);
    }
  };

  const renderRow = (icon, label, key, keyboardType = 'default') => (
    <View style={styles.row}>
      <MaterialCommunityIcons name={icon} size={20} color="#d32f2f" style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder={label}
        value={userData[key]}
        keyboardType={keyboardType}
        onChangeText={(val) => setUserData({ ...userData, [key]: val })}
        placeholderTextColor="#9ca3af"
      />
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{userData.name || 'My Profile'}</Text>
        <TouchableOpacity onPress={() => setShowModal(true)}>
          <Image
            source={{ uri: userData.profile_image_url || 'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg' }}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        {renderRow('account', 'Full Name', 'name')}
        {renderRow('calendar', 'Date of Birth', 'dob')}
        {renderRow('gender-male-female', 'Gender', 'gender')}
        {renderRow('phone', 'Phone', 'phone', 'phone-pad')}
        {renderRow('email', 'Email', 'email', 'email-address')}
        {renderRow('devices', 'CGM Device ID', 'cgm_device_id')}

        <View style={styles.row}>
          <MaterialCommunityIcons name="watch-variant" size={20} color="#d32f2f" style={styles.icon} />
          <Text style={{ flex: 1, fontSize: 16 }}>Fitbit Permission</Text>
          <Switch
            value={fitbitToggledOn}
            onValueChange={(val) => {
              setFitbitToggledOn(val);
              setFitbitPendingAuth(val);
              Alert.alert('Fitbit', val ? 'Will request permission when you save.' : 'Permission will be removed.');
            }}
            trackColor={{ false: '#e5e7eb', true: '#d32f2f' }}
            thumbColor={fitbitToggledOn ? '#fff' : '#f4f4f5'}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleImagePick}>
          <Text style={styles.buttonText}>Upload Custom Image</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Save Profile</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose a Profile Picture</Text>
            <FlatList
              data={defaultAvatars}
              keyExtractor={(item) => item}
              numColumns={3}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleDefaultSelect(item)}>
                  <Image source={{ uri: item }} style={styles.defaultAvatar} />
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={() => setShowModal(false)} style={styles.modalClose}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: '#d32f2f', paddingTop: 60, paddingBottom: 80,
    alignItems: 'center', borderBottomLeftRadius: 40, borderBottomRightRadius: 40, position: 'relative',
  },
  backIcon: { position: 'absolute', left: 20, top: 60 },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: '#fff', backgroundColor: '#fff' },
  card: {
    backgroundColor: '#fff', marginHorizontal: 20, marginTop: -50, borderRadius: 20,
    padding: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 4,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1,
    borderColor: '#f3f4f6', paddingVertical: 12,
  },
  icon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#111827' },
  button: {
    backgroundColor: '#d32f2f', marginTop: 16, paddingVertical: 14,
    borderRadius: 12, alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  modalContainer: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20,
    width: width * 0.95, maxHeight: height * 0.85, alignItems: 'center',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#d32f2f' },
  modalClose: {
    marginTop: 20, backgroundColor: '#d32f2f',
    borderRadius: 10, paddingVertical: 10, paddingHorizontal: 20,
  },
  defaultAvatar: {
    width: width / 3.5, height: width / 3.5, margin: 10,
    borderRadius: 10, resizeMode: 'cover',
  },
});

// // import React, { useEffect, useState } from 'react';
// // import {
// //   View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView,
// //   Switch, Alert, Modal, FlatList, Dimensions
// // } from 'react-native';
// // import * as ImagePicker from 'expo-image-picker';
// // import * as AuthSession from 'expo-auth-session';
// // import { useNavigation } from '@react-navigation/native';
// // import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
// // import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// // import { auth } from '../utilityV8/authHandler';
// // import { getUser, updateUser } from '../utilityV8/userService';

// // const CLIENT_ID = '23QCBZ'; // 🔹 Replace with your Fitbit client ID
// // const REDIRECT_URI = AuthSession.makeRedirectUri({ useProxy: true });
// // console.log("redirect uri: ",REDIRECT_URI)
// // const SCOPES = ['activity', 'heartrate', 'sleep', 'profile'];
// // const { width, height } = Dimensions.get('window');

// // const defaultAvatars = [
// //   'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg',
// //   'https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg',
// //   'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg',
// // ];

// // const UserProfileScreen = () => {
// //   const navigation = useNavigation();
// //   const userId = auth.currentUser?.uid;

// //   const [showModal, setShowModal] = useState(false);
// //   const [fitbitToggledOn, setFitbitToggledOn] = useState(false);
// //   const [fitbitPendingAuth, setFitbitPendingAuth] = useState(false);
// //   const [userData, setUserData] = useState({
// //     name: '', dob: '', gender: '', email: '', phone: '',
// //     cgm_device_id: '', fitbit_permission: false, profile_image_url: '',
// //   });

// //   useEffect(() => {
// //     if (!userId) {
// //       navigation.reset({ index: 0, routes: [{ name: 'LoginScreen' }] });
// //       return;
// //     }
// //     (async () => {
// //       try {
// //         const doc = await getUser(userId);
// //         if (doc) {
// //           // console.log('✅ User fetched:', doc);
// //           setUserData(doc);
// //           setFitbitToggledOn(doc.fitbit_permission || false);
// //         }
// //       } catch (err) {
// //         console.error('❌ Failed to fetch user:', err);
// //       }
// //     })();
// //   }, [userId]);

// //   const handleFitbitOAuth = async () => {
// //     try {
// //       console.log('👉 Starting Fitbit OAuth...');
// //       const authRequest = new AuthSession.AuthRequest({
// //         clientId: CLIENT_ID,
// //         scopes: SCOPES,
// //         redirectUri: REDIRECT_URI,
// //         responseType: AuthSession.ResponseType.Token,
// //       });

// //       const result = await authRequest.promptAsync(
// //         {
// //           authorizationEndpoint: 'https://www.fitbit.com/oauth2/authorize',
// //         },
// //         { useProxy: true }
// //       );

// //       if (result.type !== 'success' || !result.authentication?.accessToken) {
// //         console.warn('❌ Fitbit auth cancelled or failed:', result);
// //         Alert.alert('Fitbit Error', 'Authorization failed.');
// //         return null;
// //       }

// //       const accessToken = result.authentication.accessToken;
// //       // console.log('✅ Fitbit Access Token:', accessToken);

// //       const res = await fetch('https://api.fitbit.com/1/user/-/profile.json', {
// //         headers: { Authorization: `Bearer ${accessToken}` },
// //       });
// //        const profile = await res.json();
// //        console.log('✅ Fitbit Profile:', profile);

// //       if (!profile?.user?.encodedId) {
// //         Alert.alert('Fitbit', 'Failed to fetch Fitbit profile');
// //         return null;
// //       }

// //       return {
// //         fitbit_permission: true,
// //         fitbit_access_token: accessToken,
// //         fitbit_user_id: profile.user.encodedId,
// //         fitbit_scopes: SCOPES,
// //       };
// //     } catch (error) {
// //       console.error('❌ OAuth Error:', error);
// //       Alert.alert('Fitbit Error', 'Something went wrong during Fitbit connection.');
// //       return null;
// //     }
// //   };

// //   const handleSave = async () => {
// //   try {
// //     if (fitbitPendingAuth) {
// //       const proceed = await new Promise((resolve) => {
// //         Alert.alert('Fitbit Permission', 'Do you want to continue with Fitbit permission?', [
// //           { text: 'No', onPress: () => resolve(false), style: 'cancel' },
// //           { text: 'Yes', onPress: () => resolve(true) }
// //         ]);
// //       });

// //       if (proceed) {
// //         const fitbitData = await handleFitbitOAuth();
// //         if (!fitbitData) return;

// //         const finalData = { ...userData, ...fitbitData };
// //         await updateUser(userId, finalData);
// //         setUserData(finalData);
// //         setFitbitToggledOn(true);
// //         setFitbitPendingAuth(false);
// //         Alert.alert('Success', 'Fitbit linked and profile updated!');
// //       } else {
// //         setFitbitToggledOn(false);
// //         setFitbitPendingAuth(false);
// //       }

// //       return;
// //     }

// //     // 👇 HANDLE REVOCATION HERE
// //     if (!fitbitToggledOn && userData.fitbit_permission) {
// //       console.log('🔁 Revoking Fitbit permission...');
// //       const updatedData = {
// //         ...userData,
// //         fitbit_permission: false,
// //         fitbit_access_token: '',
// //         fitbit_user_id: '',
// //         fitbit_scopes: [],
// //       };
// //       await updateUser(userId, updatedData);
// //       setUserData(updatedData);
// //       Alert.alert('Success', 'Fitbit disconnected!');
// //       return;
// //     }

// //     // ✅ Normal save
// //     await updateUser(userId, userData);
// //     Alert.alert('Success', 'Profile updated!');
// //   } catch (error) {
// //     console.error('❌ Save failed:', error);
// //     Alert.alert('Error', error.message || 'Failed to save profile');
// //   }
// // };


// //   const handleImagePick = async () => {
// //     try {
// //       const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
// //       if (!perm.granted) return Alert.alert('Permission', 'Grant access to media.');

// //       const result = await ImagePicker.launchImageLibraryAsync({ quality: 1, allowsEditing: true });
// //       if (!result.canceled) {
// //         const uri = result.assets[0].uri;
// //         const url = await uploadImageToFirebase(uri);
// //         const updated = { ...userData, profile_image_url: url };
// //         setUserData(updated);
// //         await updateUser(userId, { profile_image_url: url });
// //         console.log('✅ Image uploaded:', url);
// //       }
// //     } catch (error) {
// //       console.error('❌ Image upload failed:', error);
// //       Alert.alert('Error', 'Failed to upload image.');
// //     }
// //   };

// //   const uploadImageToFirebase = async (uri) => {
// //     const blob = await new Promise((resolve, reject) => {
// //       const xhr = new XMLHttpRequest();
// //       xhr.onload = () => resolve(xhr.response);
// //       xhr.onerror = () => reject('Image load failed');
// //       xhr.responseType = 'blob';
// //       xhr.open('GET', uri, true);
// //       xhr.send(null);
// //     });

// //     const storageRef = ref(getStorage(), `profileImages/${userId}.jpg`);
// //     await uploadBytes(storageRef, blob);
// //     blob.close();
// //     return await getDownloadURL(storageRef);
// //   };

// //   const handleDefaultSelect = async (uri) => {
// //     try {
// //       const updated = { ...userData, profile_image_url: uri };
// //       setUserData(updated);
// //       await updateUser(userId, { profile_image_url: uri });
// //       setShowModal(false);
// //     } catch (error) {
// //       console.error('❌ Default avatar update failed:', error);
// //     }
// //   };

// //   const renderRow = (icon, label, key, keyboardType = 'default') => (
// //     <View style={styles.row}>
// //       <MaterialCommunityIcons name={icon} size={20} color="#d32f2f" style={styles.icon} />
// //       <TextInput
// //         style={styles.input}
// //         placeholder={label}
// //         value={userData[key]}
// //         keyboardType={keyboardType}
// //         onChangeText={(val) => setUserData({ ...userData, [key]: val })}
// //         placeholderTextColor="#9ca3af"
// //       />
// //     </View>
// //   );

// //   return (
// //     <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
// //       <View style={styles.header}>
// //         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
// //           <Feather name="arrow-left" size={24} color="#fff" />
// //         </TouchableOpacity>
// //         <Text style={styles.headerTitle}>{userData.name || 'My Profile'}</Text>
// //         <TouchableOpacity onPress={() => setShowModal(true)}>
// //           <Image
// //             source={{ uri: userData.profile_image_url || 'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg' }}
// //             style={styles.avatar}
// //           />
// //         </TouchableOpacity>
// //       </View>

// //       <View style={styles.card}>
// //         {renderRow('account', 'Full Name', 'name')}
// //         {renderRow('calendar', 'Date of Birth', 'dob')}
// //         {renderRow('gender-male-female', 'Gender', 'gender')}
// //         {renderRow('phone', 'Phone', 'phone', 'phone-pad')}
// //         {renderRow('email', 'Email', 'email', 'email-address')}
// //         {renderRow('devices', 'CGM Device ID', 'cgm_device_id')}

// //         <View style={styles.row}>
// //           <MaterialCommunityIcons name="watch-variant" size={20} color="#d32f2f" style={styles.icon} />
// //           <Text style={{ flex: 1, fontSize: 16 }}>Fitbit Permission</Text>
// //           <Switch
// //             value={fitbitToggledOn}
// //             onValueChange={(val) => {
// //               setFitbitToggledOn(val);
// //               setFitbitPendingAuth(val);
// //               Alert.alert('Fitbit', val ? 'Will request permission when you save.' : 'Permission will be removed.');
// //             }}
// //             trackColor={{ false: '#e5e7eb', true: '#d32f2f' }}
// //             thumbColor={fitbitToggledOn ? '#fff' : '#f4f4f5'}
// //           />
// //         </View>

// //         <TouchableOpacity style={styles.button} onPress={handleImagePick}>
// //           <Text style={styles.buttonText}>Upload Custom Image</Text>
// //         </TouchableOpacity>

// //         <TouchableOpacity style={styles.button} onPress={handleSave}>
// //           <Text style={styles.buttonText}>Save Profile</Text>
// //         </TouchableOpacity>
// //       </View>

// //       <Modal visible={showModal} animationType="slide" transparent>
// //         <View style={styles.modalContainer}>
// //           <View style={styles.modalContent}>
// //             <Text style={styles.modalTitle}>Choose a Profile Picture</Text>
// //             <FlatList
// //               data={defaultAvatars}
// //               keyExtractor={(item) => item}
// //               numColumns={3}
// //               renderItem={({ item }) => (
// //                 <TouchableOpacity onPress={() => handleDefaultSelect(item)}>
// //                   <Image source={{ uri: item }} style={styles.defaultAvatar} />
// //                 </TouchableOpacity>
// //               )}
// //             />
// //             <TouchableOpacity onPress={() => setShowModal(false)} style={styles.modalClose}>
// //               <Text style={styles.buttonText}>Close</Text>
// //             </TouchableOpacity>
// //           </View>
// //         </View>
// //       </Modal>
// //     </ScrollView>
// //   );
// // };

// // export default UserProfileScreen;


// // const styles = StyleSheet.create({
// //   container: { flex: 1, backgroundColor: '#fff' },
// //   header: {
// //     backgroundColor: '#d32f2f', paddingTop: 60, paddingBottom: 80,
// //     alignItems: 'center', borderBottomLeftRadius: 40, borderBottomRightRadius: 40, position: 'relative',
// //   },
// //   backIcon: { position: 'absolute', left: 20, top: 60 },
// //   headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
// //   avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: '#fff', backgroundColor: '#fff' },
// //   card: {
// //     backgroundColor: '#fff', marginHorizontal: 20, marginTop: -50, borderRadius: 20,
// //     padding: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 4,
// //   },
// //   row: {
// //     flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1,
// //     borderColor: '#f3f4f6', paddingVertical: 12,
// //   },
// //   icon: { marginRight: 12 },
// //   input: { flex: 1, fontSize: 16, color: '#111827' },
// //   button: {
// //     backgroundColor: '#d32f2f', marginTop: 16, paddingVertical: 14,
// //     borderRadius: 12, alignItems: 'center',
// //   },
// //   buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
// //   modalContainer: {
// //     flex: 1, backgroundColor: 'rgba(0,0,0,0.8)',
// //     justifyContent: 'center', alignItems: 'center',
// //   },
// //   modalContent: {
// //     backgroundColor: '#fff', borderRadius: 20, padding: 20,
// //     width: width * 0.95, maxHeight: height * 0.85, alignItems: 'center',
// //   },
// //   modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#d32f2f' },
// //   modalClose: {
// //     marginTop: 20, backgroundColor: '#d32f2f',
// //     borderRadius: 10, paddingVertical: 10, paddingHorizontal: 20,
// //   },
// //   defaultAvatar: {
// //     width: width / 3.5, height: width / 3.5, margin: 10,
// //     borderRadius: 10, resizeMode: 'cover',
// //   },
// // });


