import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
  ScrollView, ImageBackground
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getActivityLogsForDate } from '../utilityV8/activityService';
import { useUser } from '../../UserContext';

const HeartRateScreen = () => {
  const navigation = useNavigation();
  const { user, setUser } = useUser();

  const [selectedDate, setSelectedDate] = useState(new Date('2025-05-27'));
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [heartRateLogs, setHeartRateLogs] = useState([]);

  const formatDate = (date) => date.toISOString().split('T')[0];

  const fetchLogs = async (date) => {
    setLoading(true);
    try {
      const logs = await getActivityLogsForDate(formatDate(date));
      const filtered = logs.filter(log => log.heart_rate && log.heart_rate > 0);
      setHeartRateLogs(filtered);
    } catch (err) {
      console.error('❌ Error fetching heart rate logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const onChange = (event, selected) => {
    setShowPicker(false);
    if (selected) {
      setSelectedDate(selected);
    }
  };

  useFocusEffect(
    useCallback(() => {
      console.log('👤 User context inside useFocusEffect:', user);
      if (user?.fitbit_permission) {
        console.log('🔁 Screen focused, fetching logs for', formatDate(selectedDate));
        fetchLogs(selectedDate);
      }
    }, [user?.fitbit_permission, selectedDate])
  );

  if (user.fitbit_permission === false) {
    return (
      <ImageBackground
        source={{ uri: 'https://images.pexels.com/photos/6846257/pexels-photo-6846257.jpeg' }}
        style={styles.bg}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.promptContainer}>
          <Text style={styles.title}>Connect to Fitbit</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('UserProfile')}
          >
            <Text style={styles.buttonText}>Connect</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={{ uri: 'https://images.pexels.com/photos/7653670/pexels-photo-7653670.jpeg' }}
      style={styles.bg}
    >
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={26} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.title}>Heart Rate Logs</Text>

      <TouchableOpacity style={styles.dateSelector} onPress={() => setShowPicker(true)}>
        <Ionicons name="calendar" size={20} color="#fff" />
        <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="calendar"
          onChange={onChange}
        />
      )}

      <TouchableOpacity style={styles.button} onPress={() => fetchLogs(selectedDate)}>
        <Text style={styles.buttonText}>Fetch Logs</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />
      ) : (
        <View style={{ flex: 1 }}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.scrollWrap}
            showsVerticalScrollIndicator={true}
          >
            <View style={styles.cardWrap}>
              {heartRateLogs.length > 0 ? heartRateLogs.map(item => (
                <View key={item.log_id} style={styles.card}>
                  <Text style={styles.cardRate}>{item.heart_rate} bpm</Text>
                  <Text style={styles.cardTime}>
                    {new Date(item.timestamp?.seconds * 1000).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
              )) : (
                <Text style={styles.noData}>No heart rate logs found.</Text>
              )}
            </View>
          </ScrollView>
        </View>
      )}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  bg: { flex: 1, resizeMode: 'cover', paddingTop: 60 },
  backButton: {
    position: 'absolute', top: 40, left: 20, zIndex: 10,
    backgroundColor: '#991b1b', padding: 10, borderRadius: 30
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 60
  },
  promptContainer: {
    marginTop: 120,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 20,
    borderRadius: 16,
    marginHorizontal: 30,
    alignItems: 'center'
  },
  dateSelector: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'center',
    padding: 10, backgroundColor: '#991b1b', borderRadius: 8, paddingHorizontal: 16
  },
  dateText: { marginLeft: 10, fontSize: 16, color: '#fff' },
  button: {
    backgroundColor: '#dc2626', padding: 12, borderRadius: 30,
    marginTop: 20, alignSelf: 'center', paddingHorizontal: 32
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  scrollWrap: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  cardWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    paddingTop: 20,
  },
  card: {
    backgroundColor: '#7f1d1d',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 14,
    alignItems: 'center',
    width: 80,
    height: 80,
    justifyContent: 'center',
  },
  cardRate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  cardTime: {
    fontSize: 10,
    color: '#fca5a5',
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 12,
  },
  noData: { color: '#fcd34d', marginTop: 10, textAlign: 'center' },
});

export default HeartRateScreen;

// import React, { useState, useCallback } from 'react';
// import {
//   View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
//   ScrollView, ImageBackground
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { useNavigation, useFocusEffect } from '@react-navigation/native';
// import { getActivityLogsForDate } from '../utilityV8/activityService';
// import { useUser } from '../../UserContext';

// const HeartRateScreen = () => {
//   const navigation = useNavigation();
//   const { user, setUser } = useUser();

//   const [selectedDate, setSelectedDate] = useState(new Date('2025-05-24'));
//   const [showPicker, setShowPicker] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [heartRateLogs, setHeartRateLogs] = useState([]);

//   const formatDate = (date) => date.toISOString().split('T')[0];

//   const fetchLogs = async (date) => {
//     setLoading(true);
//     try {
//       const logs = await getActivityLogsForDate(formatDate(date));
//       const filtered = logs.filter(log => log.heart_rate && log.heart_rate > 0);
//       setHeartRateLogs(filtered);
//     } catch (err) {
//       console.error('❌ Error fetching heart rate logs:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const onChange = (event, selected) => {
//     setShowPicker(false);
//     if (selected) {
//       setSelectedDate(selected);
//     }
//   };

//   // ✅ Automatically fetch logs when screen is shown and permission is true
//   useFocusEffect(
//     useCallback(() => {
//        //console.log('👤 User context inside useFocusEffect:', user);
//       if (user?.fitbit_permission === true) {
//         console.log('🔁 Screen focused, fetching logs for', formatDate(selectedDate));
//         fetchLogs(selectedDate);
//       }
//     }, [user?.fitbit_permission, selectedDate])
//   );

//   // 🚫 Screen 1: Show "Connect to Fitbit" if permission is false
//   if (user.fitbit_permission === false) {
//     return (
//       <ImageBackground
//         source={{ uri: 'https://images.pexels.com/photos/6846257/pexels-photo-6846257.jpeg' }}
//         style={styles.bg}
//       >
//         <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
//           <Ionicons name="arrow-back" size={24} color="#fff" />
//         </TouchableOpacity>

//         <View style={styles.promptContainer}>
//           <Text style={styles.title}>Connect to Fitbit</Text>
//           <TouchableOpacity
//             style={styles.button}
//             onPress={async () => {
//               // 🔐 Placeholder for Fitbit auth
//               console.log('🔗 Authenticating with Fitbit...');
//               setUser({ ...user, fitbit_permission: 'true' });
//             }}
//           >
//             <Text style={styles.buttonText}>Connect</Text>
//           </TouchableOpacity>
//         </View>
//       </ImageBackground>
//     );
//   }

//   // ✅ Screen 2: Show logs
//   return (
//     <ImageBackground
//       source={{ uri: 'https://images.pexels.com/photos/7653670/pexels-photo-7653670.jpeg' }}
//       style={styles.bg}
//     >
//       <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
//         <Ionicons name="arrow-back" size={26} color="#fff" />
//       </TouchableOpacity>

//       <Text style={styles.title}>Heart Rate Logs</Text>

//       <TouchableOpacity style={styles.dateSelector} onPress={() => setShowPicker(true)}>
//         <Ionicons name="calendar" size={20} color="#fff" />
//         <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
//       </TouchableOpacity>

//       {showPicker && (
//         <DateTimePicker
//           value={selectedDate}
//           mode="date"
//           display="calendar"
//           onChange={onChange}
//         />
//       )}

//       <TouchableOpacity style={styles.button} onPress={() => fetchLogs(selectedDate)}>
//         <Text style={styles.buttonText}>Fetch Logs</Text>
//       </TouchableOpacity>

//       {loading ? (
//         <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />
//       ) : (
//         <View style={{ flex: 1 }}>
//           <ScrollView
//             style={{ flex: 1 }}
//             contentContainerStyle={styles.scrollWrap}
//             showsVerticalScrollIndicator={true}
//           >
//             <View style={styles.cardWrap}>
//               {heartRateLogs.length > 0 ? heartRateLogs.map(item => (
//                 <View key={item.log_id} style={styles.card}>
//                   <Text style={styles.cardRate}>{item.heart_rate} bpm</Text>
//                   <Text style={styles.cardTime}>
//                     {new Date(item.timestamp?.seconds * 1000).toLocaleTimeString([], {
//                       hour: '2-digit',
//                       minute: '2-digit'
//                     })}
//                   </Text>
//                 </View>
//               )) : (
//                 <Text style={styles.noData}>No heart rate logs found.</Text>
//               )}
//             </View>
//           </ScrollView>
//         </View>
//       )}
//     </ImageBackground>
//   );
// };

// const styles = StyleSheet.create({
//   bg: { flex: 1, resizeMode: 'cover', paddingTop: 60 },
//   backButton: {
//     position: 'absolute', top: 40, left: 20, zIndex: 10,
//     backgroundColor: '#991b1b', padding: 10, borderRadius: 30
//   },
//   title: {
//     fontSize: 26,
//     fontWeight: 'bold',
//     color: '#fff',
//     textAlign: 'center',
//     marginBottom: 20,
//     marginTop: 60
//   },
//   promptContainer: {
//     marginTop: 120,
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     padding: 20,
//     borderRadius: 16,
//     marginHorizontal: 30,
//     alignItems: 'center'
//   },
//   dateSelector: {
//     flexDirection: 'row', alignItems: 'center', alignSelf: 'center',
//     padding: 10, backgroundColor: '#991b1b', borderRadius: 8, paddingHorizontal: 16
//   },
//   dateText: { marginLeft: 10, fontSize: 16, color: '#fff' },
//   button: {
//     backgroundColor: '#dc2626', padding: 12, borderRadius: 30,
//     marginTop: 20, alignSelf: 'center', paddingHorizontal: 32
//   },
//   buttonText: { color: '#fff', fontWeight: 'bold' },
//   scrollWrap: {
//     paddingHorizontal: 16,
//     paddingBottom: 40,
//   },
//   cardWrap: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'center',
//     gap: 12,
//     paddingTop: 20,
//   },
//   card: {
//     backgroundColor: '#7f1d1d',
//     paddingVertical: 12,
//     paddingHorizontal: 10,
//     borderRadius: 14,
//     alignItems: 'center',
//     width: 80,
//     height: 80,
//     justifyContent: 'center',
//   },
//   cardRate: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#fff',
//     textAlign: 'center',
//   },
//   cardTime: {
//     fontSize: 10,
//     color: '#fca5a5',
//     marginTop: 6,
//     textAlign: 'center',
//     lineHeight: 12,
//   },
//   noData: { color: '#fcd34d', marginTop: 10, textAlign: 'center' },
// });

// export default HeartRateScreen;

// import React, { useState } from 'react';
// import {
//   View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
//   ScrollView, ImageBackground
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { useNavigation } from '@react-navigation/native';
// import { getActivityLogsForDate } from '../utilityV8/activityService';
// import { useUser } from '../../UserContext';

// const HeartRateScreen = () => {
//   const navigation = useNavigation();
//   const { user, setUser } = useUser();

//   const [selectedDate, setSelectedDate] = useState(new Date('2025-05-24'));
//   const [showPicker, setShowPicker] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [heartRateLogs, setHeartRateLogs] = useState([]);

//   const formatDate = (date) => date.toISOString().split('T')[0];

//   const fetchLogs = async (date) => {
//     setLoading(true);
//     try {
//       const logs = await getActivityLogsForDate(formatDate(date));
//       const filtered = logs.filter(log => log.heart_rate && log.heart_rate > 0);
//       setHeartRateLogs(filtered);
//     } catch (err) {
//       console.error('❌ Error fetching heart rate logs:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const onChange = (event, selected) => {
//     setShowPicker(false);
//     if (selected) {
//       setSelectedDate(selected);
//     }
//   };

//   // Auto-fetch when permission is granted and no logs fetched yet
//   if (user.fitbit_permission === 'true' && heartRateLogs.length === 0 && !loading) {
//     fetchLogs(selectedDate);
//   }

//   // 🚫 Show connect prompt if permission not granted
//   if (user.fitbit_permission === 'false') {
//     return (
//       <ImageBackground
//         source={{ uri: 'https://images.pexels.com/photos/6846257/pexels-photo-6846257.jpeg' }}
//         style={styles.bg}
//       >
//         <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
//           <Ionicons name="arrow-back" size={24} color="#fff" />
//         </TouchableOpacity>

//         <View style={styles.promptContainer}>
//           <Text style={styles.title}>Connect to Fitbit</Text>
//           <TouchableOpacity
//             style={styles.button}
//             onPress={() => {
//               setUser({ ...user, fitbit_permission: 'true' });
//             }}
//           >
//             <Text style={styles.buttonText}>Connect</Text>
//           </TouchableOpacity>
//         </View>
//       </ImageBackground>
//     );
//   }

//   // ✅ Main screen
//   return (
//     <ImageBackground
//       source={{ uri: 'https://images.pexels.com/photos/7653670/pexels-photo-7653670.jpeg' }}
//       style={styles.bg}
//     >
//       <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
//         <Ionicons name="arrow-back" size={26} color="#fff" />
//       </TouchableOpacity>

//       <Text style={styles.title}>Heart Rate Logs</Text>

//       <TouchableOpacity style={styles.dateSelector} onPress={() => setShowPicker(true)}>
//         <Ionicons name="calendar" size={20} color="#fff" />
//         <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
//       </TouchableOpacity>

//       {showPicker && (
//         <DateTimePicker
//           value={selectedDate}
//           mode="date"
//           display="calendar"
//           onChange={onChange}
//         />
//       )}

//       <TouchableOpacity style={styles.button} onPress={() => fetchLogs(selectedDate)}>
//         <Text style={styles.buttonText}>Fetch Logs</Text>
//       </TouchableOpacity>

//       {loading ? (
//         <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />
//       ) : (
//         <View style={{ flex: 1 }}>
//           <ScrollView
//             style={{ flex: 1 }}
//             contentContainerStyle={styles.scrollWrap}
//             showsVerticalScrollIndicator={true}
//           >
//             <View style={styles.cardWrap}>
//               {heartRateLogs.length > 0 ? heartRateLogs.map(item => (
//                 <View key={item.log_id} style={styles.card}>
//                   <Text style={styles.cardRate}>{item.heart_rate} bpm</Text>
//                   <Text style={styles.cardTime}>
//                     {new Date(item.timestamp?.seconds * 1000).toLocaleTimeString([], {
//                       hour: '2-digit',
//                       minute: '2-digit'
//                     })}
//                   </Text>
//                 </View>
//               )) : (
//                 <Text style={styles.noData}>No heart rate logs found.</Text>
//               )}
//             </View>
//           </ScrollView>
//         </View>
//       )}
//     </ImageBackground>
//   );
// };

// const styles = StyleSheet.create({
//   bg: { flex: 1, resizeMode: 'cover', paddingTop: 60 },
//   backButton: {
//     position: 'absolute', top: 40, left: 20, zIndex: 10,
//     backgroundColor: '#991b1b', padding: 10, borderRadius: 30
//   },
//   title: {
//     fontSize: 26,
//     fontWeight: 'bold',
//     color: '#fff',
//     textAlign: 'center',
//     marginBottom: 20,
//     marginTop: 60
//   },
//   promptContainer: {
//     marginTop: 120,
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     padding: 20,
//     borderRadius: 16,
//     marginHorizontal: 30,
//     alignItems: 'center'
//   },
//   dateSelector: {
//     flexDirection: 'row', alignItems: 'center', alignSelf: 'center',
//     padding: 10, backgroundColor: '#991b1b', borderRadius: 8, paddingHorizontal: 16
//   },
//   dateText: { marginLeft: 10, fontSize: 16, color: '#fff' },
//   button: {
//     backgroundColor: '#dc2626', padding: 12, borderRadius: 30,
//     marginTop: 20, alignSelf: 'center', paddingHorizontal: 32
//   },
//   buttonText: { color: '#fff', fontWeight: 'bold' },
//   scrollWrap: {
//     paddingHorizontal: 16,
//     paddingBottom: 40,
//   },
//   cardWrap: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'center',
//     gap: 12,
//     paddingTop: 20,
//   },
//   card: {
//     backgroundColor: '#7f1d1d',
//     paddingVertical: 12,
//     paddingHorizontal: 10,
//     borderRadius: 14,
//     alignItems: 'center',
//     width: 80,
//     height: 80,
//     justifyContent: 'center',
//   },
//   cardRate: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#fff',
//     textAlign: 'center',
//   },
//   cardTime: {
//     fontSize: 10,
//     color: '#fca5a5',
//     marginTop: 6,
//     textAlign: 'center',
//     lineHeight: 12,
//   },
//   noData: { color: '#fcd34d', marginTop: 10, textAlign: 'center' },
// });

// export default HeartRateScreen;


// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, ImageBackground
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { useNavigation, useFocusEffect } from '@react-navigation/native';
// import { getActivityLogsForDate } from '../utilityV8/activityService';
// import { useUser } from '../../UserContext';

// const HeartRateScreen = () => {
//   const navigation = useNavigation();
//   const { user, setUser } = useUser();

//   const [selectedDate, setSelectedDate] = useState(new Date('2025-05-24'));
//   const [showPicker, setShowPicker] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [heartRateLogs, setHeartRateLogs] = useState([]);

//   const formatDate = (date) => date.toISOString().split('T')[0];

//   const fetchLogs = async (date) => {
//     setLoading(true);
//     try {
//       const logs = await getActivityLogsForDate(formatDate(date));
//       const filtered = logs.filter(log => log.heart_rate && log.heart_rate > 0);
//       setHeartRateLogs(filtered);
//     } catch (err) {
//       console.error('❌ Error fetching heart rate logs:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const onChange = (event, selected) => {
//     setShowPicker(false);
//     if (selected) {
//       setSelectedDate(selected);
//     }
//   };

//   useFocusEffect(
//     useCallback(() => {
//       if (user.fitbit_permission === 'true') {
//         fetchLogs(selectedDate);
//       }
//     }, [user.fitbit_permission])
//   );

//   if (user.fitbit_permission === 'false') {
//     return (
//       <ImageBackground
//         source={{ uri: 'https://images.pexels.com/photos/6846257/pexels-photo-6846257.jpeg' }}
//         style={styles.bg}
//       >
//         <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
//           <Ionicons name="arrow-back" size={24} color="#fff" />
//         </TouchableOpacity>

//         <View style={styles.promptContainer}>
//           <Text style={styles.title}>Connect to Fitbit</Text>
//           <TouchableOpacity
//             style={styles.button}
//             onPress={() => {
//               setUser({ ...user, fitbit_permission: 'true' });
//             }}
//           >
//             <Text style={styles.buttonText}>Connect</Text>
//           </TouchableOpacity>
//         </View>
//       </ImageBackground>
//     );
//   }

//   return (
//     <ImageBackground
//       source={{ uri: 'https://images.pexels.com/photos/7653670/pexels-photo-7653670.jpeg' }}
//       style={styles.bg}
//     >
//       <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
//         <Ionicons name="arrow-back" size={26} color="#fff" />
//       </TouchableOpacity>

//       <Text style={styles.title}>Heart Rate Logs</Text>

//       <TouchableOpacity style={styles.dateSelector} onPress={() => setShowPicker(true)}>
//         <Ionicons name="calendar" size={20} color="#fff" />
//         <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
//       </TouchableOpacity>

//       {showPicker && (
//         <DateTimePicker
//           value={selectedDate}
//           mode="date"
//           display="calendar"
//           onChange={onChange}
//         />
//       )}

//       <TouchableOpacity style={styles.button} onPress={() => fetchLogs(selectedDate)}>
//         <Text style={styles.buttonText}>Fetch Logs</Text>
//       </TouchableOpacity>

//       {loading ? (
//         <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />
//       ) : (
//         <FlatList
//           data={heartRateLogs}
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           contentContainerStyle={{ paddingHorizontal: 16, marginTop: 16 }}
//           keyExtractor={(item) => item.log_id}
//           snapToInterval={88} // width 80 + marginRight 8
//           decelerationRate="fast"
//           ListEmptyComponent={<Text style={styles.noData}>No heart rate logs found.</Text>}
//           renderItem={({ item }) => (
//             <View style={styles.card}>
//               <Text style={styles.cardRate}>{item.heart_rate} bpm</Text>
//               <Text style={styles.cardTime}>
//                 {new Date(item.timestamp?.seconds * 1000).toLocaleTimeString([], {
//                   hour: '2-digit',
//                   minute: '2-digit'
//                 })}
//               </Text>
//             </View>
//           )}
//         />
//       )}
//     </ImageBackground>
//   );
// };

// const styles = StyleSheet.create({
//   bg: { flex: 1, resizeMode: 'cover', paddingTop: 60 },
//   backButton: {
//     position: 'absolute', top: 40, left: 20, zIndex: 10,
//     backgroundColor: '#991b1b', padding: 10, borderRadius: 30
//   },
//   title: {
//     fontSize: 26,
//     fontWeight: 'bold',
//     color: '#fff',
//     textAlign: 'center',
//     marginBottom: 20,
//     marginTop: 60
//   },
//   promptContainer: {
//     marginTop: 120,
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     padding: 20,
//     borderRadius: 16,
//     marginHorizontal: 30,
//     alignItems: 'center'
//   },
//   dateSelector: {
//     flexDirection: 'row', alignItems: 'center', alignSelf: 'center',
//     padding: 10, backgroundColor: '#991b1b', borderRadius: 8, paddingHorizontal: 16
//   },
//   dateText: { marginLeft: 10, fontSize: 16, color: '#fff' },
//   button: {
//     backgroundColor: '#dc2626', padding: 12, borderRadius: 30,
//     marginTop: 20, alignSelf: 'center', paddingHorizontal: 32
//   },
//   buttonText: { color: '#fff', fontWeight: 'bold' },
//   card: {
//     backgroundColor: '#7f1d1d',
//     paddingVertical: 12,
//     paddingHorizontal: 10,
//     borderRadius: 14,
//     marginRight: 8,
//     alignItems: 'center',
//     width: 80,
//     height: 80,
//     justifyContent: 'center',
//   },
//   cardRate: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#fff',
//     textAlign: 'center',
//   },
//   cardTime: {
//     fontSize: 10,
//     color: '#fca5a5',
//     marginTop: 6,
//     textAlign: 'center',
//     lineHeight: 12,
//   },
//   noData: { color: '#fcd34d', marginTop: 10, textAlign: 'center' },
// });

// export default HeartRateScreen;

// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, ImageBackground
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { useNavigation, useFocusEffect } from '@react-navigation/native';
// import { getActivityLogsForDate } from '../utilityV8/activityService';
// import { useUser } from '../../UserContext';

// const HeartRateScreen = () => {
//   const navigation = useNavigation();
//   const { user, setUser } = useUser();

//   const [selectedDate, setSelectedDate] = useState(new Date('2025-05-24'));
//   const [showPicker, setShowPicker] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [heartRateLogs, setHeartRateLogs] = useState([]);

//   const formatDate = (date) => date.toISOString().split('T')[0];

//   const fetchLogs = async (date) => {
//     setLoading(true);
//     try {
//       const logs = await getActivityLogsForDate(formatDate(date));
//       const filtered = logs.filter(log => log.heart_rate && log.heart_rate > 0);
//       setHeartRateLogs(filtered);
//     } catch (err) {
//       console.error('❌ Error fetching heart rate logs:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const onChange = (event, selected) => {
//     setShowPicker(false);
//     if (selected) {
//       setSelectedDate(selected);
//     }
//   };

//   // ✅ Always run on screen focus
//   useFocusEffect(
//     useCallback(() => {
//       if (user.fitbit_permission === 'true') {
//         fetchLogs(selectedDate);
//       }
//     }, [user.fitbit_permission, selectedDate])
//   );

//   // ❌ If Fitbit not connected, show prompt screen
//   if (user.fitbit_permission === 'false') {
//     return (
//       <ImageBackground
//         source={{ uri: 'https://images.pexels.com/photos/6846257/pexels-photo-6846257.jpeg' }}
//         style={styles.bg}
//       >
//         <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
//           <Ionicons name="arrow-back" size={24} color="#fff" />
//         </TouchableOpacity>

//         <View style={styles.promptContainer}>
//           <Text style={styles.title}>Connect to Fitbit</Text>
//           <TouchableOpacity
//             style={styles.button}
//             onPress={() => {
//               setUser({ ...user, fitbit_permission: 'true' });
//             }}
//           >
//             <Text style={styles.buttonText}>Connect</Text>
//           </TouchableOpacity>
//         </View>
//       </ImageBackground>
//     );
//   }

//   return (
//     <ImageBackground
//       source={{ uri: 'https://images.pexels.com/photos/7653670/pexels-photo-7653670.jpeg' }}
//       style={styles.bg}
//     >
//       <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
//         <Ionicons name="arrow-back" size={26} color="#fff" />
//       </TouchableOpacity>

//       <Text style={styles.title}>Heart Rate Logs</Text>

//       <TouchableOpacity style={styles.dateSelector} onPress={() => setShowPicker(true)}>
//         <Ionicons name="calendar" size={20} color="#fff" />
//         <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
//       </TouchableOpacity>

//       {showPicker && (
//         <DateTimePicker
//           value={selectedDate}
//           mode="date"
//           display="calendar"
//           onChange={onChange}
//         />
//       )}

//       <TouchableOpacity style={styles.button} onPress={() => fetchLogs(selectedDate)}>
//         <Text style={styles.buttonText}>Fetch Logs</Text>
//       </TouchableOpacity>

//       {loading ? (
//         <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />
//       ) : (
//         <FlatList
//           data={heartRateLogs}
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           contentContainerStyle={{ paddingHorizontal: 16, marginTop: 16 }}
//           keyExtractor={(item) => item.log_id}
//           ListEmptyComponent={<Text style={styles.noData}>No heart rate logs found.</Text>}
//           renderItem={({ item }) => (
//             <View style={styles.card}>
//               <Text style={styles.cardRate}>{item.heart_rate} bpm</Text>
//               <Text style={styles.cardTime}>
//                 {new Date(item.timestamp?.seconds * 1000).toLocaleTimeString()}
//               </Text>
//             </View>
//           )}
//         />
//       )}
//     </ImageBackground>
//   );
// };

// const styles = StyleSheet.create({
//   bg: { flex: 1, resizeMode: 'cover', paddingTop: 60 },
//   backButton: {
//     position: 'absolute', top: 40, left: 20, zIndex: 10,
//     backgroundColor: '#991b1b', padding: 10, borderRadius: 30
//   },
//   title: {
//     fontSize: 26,
//     fontWeight: 'bold',
//     color: '#fff',
//     textAlign: 'center',
//     marginBottom: 20,
//     marginTop: 60
//   },
//   promptContainer: {
//     marginTop: 120,
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     padding: 20,
//     borderRadius: 16,
//     marginHorizontal: 30,
//     alignItems: 'center'
//   },
//   dateSelector: {
//     flexDirection: 'row', alignItems: 'center', alignSelf: 'center',
//     padding: 10, backgroundColor: '#991b1b', borderRadius: 8, paddingHorizontal: 16
//   },
//   dateText: { marginLeft: 10, fontSize: 16, color: '#fff' },
//   button: {
//     backgroundColor: '#dc2626', padding: 12, borderRadius: 30,
//     marginTop: 20, alignSelf: 'center', paddingHorizontal: 32
//   },
//   buttonText: { color: '#fff', fontWeight: 'bold' },
//   card: {
//     backgroundColor: '#7f1d1d', padding: 16, borderRadius: 16,
//     marginRight: 10, alignItems: 'center', width: 120
//   },
//   cardRate: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
//   cardTime: { fontSize: 12, color: '#fca5a5', marginTop: 4 },
//   noData: { color: '#fcd34d', marginTop: 10, textAlign: 'center' },
// });

// export default HeartRateScreen;

// import React, { useState, useEffect } from 'react';
// import {
//   View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, ImageBackground
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { useNavigation } from '@react-navigation/native';
// import { getActivityLogsForDate } from '../utilityV8/activityService';
// import { useUser } from '../../UserContext'; 

// const HeartRateScreen = () => {
//   const navigation = useNavigation();
//   const { user, setUser } = useUser(); // ✅ Access UserContext

//   const [selectedDate, setSelectedDate] = useState(new Date('2025-05-23'));
//   const [showPicker, setShowPicker] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [heartRateLogs, setHeartRateLogs] = useState([]);

//   const formatDate = (date) => date.toISOString().split('T')[0];

//   const fetchLogs = async (date) => {
//     setLoading(true);
//     const logs = await getActivityLogsForDate(formatDate(date));
//     const filtered = logs.filter(log => log.heart_rate && log.heart_rate > 0);
//     setHeartRateLogs(filtered);
//     setLoading(false);
//   };

//   const onChange = (event, selected) => {
//     setShowPicker(false);
//     if (selected) {
//       setSelectedDate(selected);
//       fetchLogs(selected);
//     }
//   };

//   // ✅ 1. SHOW CONNECT SCREEN if fitbit_permission is 'false'
//   if (user.fitbit_permission === 'false') {
//     return (
//       <ImageBackground
//         source={{ uri: 'https://images.pexels.com/photos/6846257/pexels-photo-6846257.jpeg' }}
//         style={styles.bg}
//       >
//         <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
//           <Ionicons name="arrow-back" size={24} color="#fff" />
//         </TouchableOpacity>

//         <View style={styles.promptContainer}>
//           <Text style={styles.title}>Connect to Fitbit</Text>
//           <TouchableOpacity
//             style={styles.button}
//             onPress={() => {
//               setUser({ ...user, fitbit_permission: 'true' }); // simulate connection
//               fetchLogs(selectedDate); // optional
//             }}
//           >
//             <Text style={styles.buttonText}>Connect</Text>
//           </TouchableOpacity>
//         </View>
//       </ImageBackground>
//     );
//   }

//   // ✅ 2. MAIN HEART RATE SCREEN if fitbit_permission is 'true'
//   return (
//     <ImageBackground
//       source={{ uri: 'https://images.pexels.com/photos/7653670/pexels-photo-7653670.jpeg' }}
//       style={styles.bg}
//     >
//       <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
//         <Ionicons name="arrow-back" size={26} color="#fff" />
//       </TouchableOpacity>

//       <Text style={styles.title}>Heart Rate Logs</Text>

//       <TouchableOpacity style={styles.dateSelector} onPress={() => setShowPicker(true)}>
//         <Ionicons name="calendar" size={20} color="#fff" />
//         <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
//       </TouchableOpacity>

//       {showPicker && (
//         <DateTimePicker
//           value={selectedDate}
//           mode="date"
//           display="calendar"
//           onChange={onChange}
//         />
//       )}

//       <TouchableOpacity style={styles.button} onPress={() => fetchLogs(selectedDate)}>
//         <Text style={styles.buttonText}>Fetch Logs</Text>
//       </TouchableOpacity>

//       {loading ? (
//         <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />
//       ) : (
//         <FlatList
//           data={heartRateLogs}
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           contentContainerStyle={{ paddingHorizontal: 16, marginTop: 16 }}
//           keyExtractor={(item) => item.log_id}
//           ListEmptyComponent={<Text style={styles.noData}>No heart rate logs found.</Text>}
//           renderItem={({ item }) => (
//             <View style={styles.card}>
//               <Text style={styles.cardRate}>{item.heart_rate} bpm</Text>
//               <Text style={styles.cardTime}>
//                 {new Date(item.timestamp?.seconds * 1000).toLocaleTimeString()}
//               </Text>
//             </View>
//           )}
//         />
//       )}
//     </ImageBackground>
//   );
// };

// const styles = StyleSheet.create({
//   bg: { flex: 1, resizeMode: 'cover', paddingTop: 60 },
//   backButton: {
//     position: 'absolute', top: 40, left: 20, zIndex: 10,
//     backgroundColor: '#991b1b', padding: 10, borderRadius: 30
//   },
//   title: {
//     fontSize: 26,
//     fontWeight: 'bold',
//     color: '#fff',
//     textAlign: 'center',
//     marginBottom: 20,
//     marginTop: 60
//   },
//   promptContainer: {
//     marginTop: 120,
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     padding: 20,
//     borderRadius: 16,
//     marginHorizontal: 30,
//     alignItems: 'center'
//   },
//   dateSelector: {
//     flexDirection: 'row', alignItems: 'center', alignSelf: 'center',
//     padding: 10, backgroundColor: '#991b1b', borderRadius: 8, paddingHorizontal: 16
//   },
//   dateText: { marginLeft: 10, fontSize: 16, color: '#fff' },
//   button: {
//     backgroundColor: '#dc2626', padding: 12, borderRadius: 30,
//     marginTop: 20, alignSelf: 'center', paddingHorizontal: 32
//   },
//   buttonText: { color: '#fff', fontWeight: 'bold' },
//   card: {
//     backgroundColor: '#7f1d1d', padding: 16, borderRadius: 16,
//     marginRight: 10, alignItems: 'center', width: 120
//   },
//   cardRate: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
//   cardTime: { fontSize: 12, color: '#fca5a5', marginTop: 4 },
//   noData: { color: '#fcd34d', marginTop: 10, textAlign: 'center' },
// });

// export default HeartRateScreen;

// // Cleaned and Simplified Heart Rate Screen with Connection Prompt
// import React, { useState } from 'react';
// import {
//   View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, ImageBackground
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { useNavigation } from '@react-navigation/native';
// import { getActivityLogsForDate } from '../utilityV8/activityService';

// const HeartRateScreen = () => {
//   const navigation = useNavigation();
//   const [connected, setConnected] = useState(null);
//   const [selectedDate, setSelectedDate] = useState(new Date('2025-05-23'));
//   const [showPicker, setShowPicker] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [heartRateLogs, setHeartRateLogs] = useState([]);

//   const formatDate = (date) => date.toISOString().split('T')[0];

//   const fetchLogs = async (date) => {
//     setLoading(true);
//     const logs = await getActivityLogsForDate(formatDate(date));
//     const filtered = logs.filter(log => log.heart_rate && log.heart_rate > 0);
//     setHeartRateLogs(filtered);
//     setLoading(false);
//   };

//   const onChange = (event, selected) => {
//     setShowPicker(false);
//     if (selected) {
//       setSelectedDate(selected);
//       fetchLogs(selected);
//     }
//   };

//   if (connected === null) {
//     return (
//       <ImageBackground
//         source={{ uri: 'https://images.pexels.com/photos/6846257/pexels-photo-6846257.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }}
//         style={styles.bg}
//       >
//         <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
//           <Ionicons name="arrow-back" size={24} color="#fff" />
//         </TouchableOpacity>

//         <View style={styles.promptContainer}>
//           <Text style={styles.title}>Connect to Fitbit or Wearable</Text>
//           <TouchableOpacity style={styles.button} onPress={() => {
//             setConnected(true);
//             fetchLogs(selectedDate);
//           }}>
//             <Text style={styles.buttonText}>Connect</Text>
//           </TouchableOpacity>
//         </View>
//       </ImageBackground>
//     );
//   }

//   return (
//     <ImageBackground
//       source={{ uri: 'https://images.pexels.com/photos/7653670/pexels-photo-7653670.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }}
//       style={styles.bg}
//     >
//       <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
//         <Ionicons name="arrow-back" size={26} color="#fff" />
//       </TouchableOpacity>

//       <Text style={styles.title}>Heart Rate Logs</Text>

//       <TouchableOpacity style={styles.dateSelector} onPress={() => setShowPicker(true)}>
//         <Ionicons name="calendar" size={20} color="#fff" />
//         <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
//       </TouchableOpacity>

//       {showPicker && (
//         <DateTimePicker
//           value={selectedDate}
//           mode="date"
//           display="calendar"
//           onChange={onChange}
//         />
//       )}

//       <TouchableOpacity style={styles.button} onPress={() => fetchLogs(selectedDate)}>
//         <Text style={styles.buttonText}>Fetch Logs</Text>
//       </TouchableOpacity>

//       {loading ? (
//         <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />
//       ) : (
//         <FlatList
//           data={heartRateLogs}
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           contentContainerStyle={{ paddingHorizontal: 16, marginTop: 16 }}
//           keyExtractor={(item) => item.log_id}
//           ListEmptyComponent={<Text style={styles.noData}>No heart rate logs found.</Text>}
//           renderItem={({ item }) => (
//             <View style={styles.card}>
//               <Text style={styles.cardRate}>{item.heart_rate} bpm</Text>
//               <Text style={styles.cardTime}>
//                 {new Date(item.timestamp?.seconds * 1000).toLocaleTimeString()}
//               </Text>
//             </View>
//           )}
//         />
//       )}
//     </ImageBackground>
//   );
// };

// const styles = StyleSheet.create({
//   bg: { flex: 1, resizeMode: 'cover', paddingTop: 60 },
//   backButton: {
//     position: 'absolute', top: 40, left: 20, zIndex: 10,
//     backgroundColor: '#991b1b', padding: 10, borderRadius: 30
//   },
//   title: {
//     fontSize: 26,
//     fontWeight: 'bold',
//     color: '#fff',
//     textAlign: 'center',
//     marginBottom: 20,
//     marginTop: 60
//   },
//   promptContainer: {
//     marginTop: 120,
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     padding: 20,
//     borderRadius: 16,
//     marginHorizontal: 30,
//     alignItems: 'center'
//   },
//   dateSelector: {
//     flexDirection: 'row', alignItems: 'center', alignSelf: 'center',
//     padding: 10, backgroundColor: '#991b1b', borderRadius: 8, paddingHorizontal: 16
//   },
//   dateText: { marginLeft: 10, fontSize: 16, color: '#fff' },
//   button: {
//     backgroundColor: '#dc2626', padding: 12, borderRadius: 30,
//     marginTop: 20, alignSelf: 'center', paddingHorizontal: 32
//   },
//   buttonText: { color: '#fff', fontWeight: 'bold' },
//   card: {
//     backgroundColor: '#7f1d1d', padding: 16, borderRadius: 16,
//     marginRight: 10, alignItems: 'center', width: 120
//   },
//   cardRate: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
//   cardTime: { fontSize: 12, color: '#fca5a5', marginTop: 4 },
//   noData: { color: '#fcd34d', marginTop: 10, textAlign: 'center' },
// });

// export default HeartRateScreen;
