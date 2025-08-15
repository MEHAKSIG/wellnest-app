import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
  FlatList, ImageBackground
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getActivityLogsForDate } from '../utilityV8/activityService';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../UserContext';

const ActivityScreen = () => {
  const navigation = useNavigation();
  const { user } = useUser();

  const getYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d;
  };

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activityLogs, setActivityLogs] = useState([]);
  const [totalSteps, setTotalSteps] = useState(0);

  const formatDate = (date) => date.toISOString().split('T')[0];

  const fetchLogs = async (date) => {
    setLoading(true);
    try {
      const logs = await getActivityLogsForDate(formatDate(date));
      const filtered = logs.filter(log => log.steps > 0);
      setActivityLogs(filtered);
      const total = filtered.reduce((acc, log) => acc + (log.steps || 0), 0);
      setTotalSteps(total);
    } catch (error) {
      console.error('❌ Error fetching activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (user?.fitbit_permission) {
        fetchLogs(selectedDate);
      }
    }, [user?.fitbit_permission, selectedDate])
  );

  const onChange = (event, selected) => {
    setShowPicker(false);
    if (selected) {
      setSelectedDate(selected);
    }
  };

  if (user.fitbit_permission === false) {
    return (
      <ImageBackground
        source={{ uri: 'https://images.pexels.com/photos/6846257/pexels-photo-6846257.jpeg' }}
        style={styles.background}
      >
        <TouchableOpacity style={styles.backArrow} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.centerContainer}>
          <Text style={styles.headerText}>Connect to Fitbit</Text>
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
      source={{ uri: 'https://images.pexels.com/photos/1552249/pexels-photo-1552249.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260' }}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backArrow} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>

        <View style={styles.hero}>
          <Text style={styles.headerText}>Your Movement</Text>
          <Text style={styles.subText}>Activity summary for {formatDate(selectedDate)}</Text>
        </View>

        <View style={styles.totalStepsCard}>
          <Text style={styles.totalStepsTitle}>Total Steps</Text>
          <Text style={styles.totalStepsValue}>{totalSteps}</Text>
        </View>

        <TouchableOpacity style={styles.dateSelector} onPress={() => setShowPicker(true)}>
          <Ionicons name="calendar" size={20} color="#fff" />
          <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="calendar"
            onChange={(e, selected) => {
              if (selected) {
                setSelectedDate(selected);
                fetchLogs(selected);
              }
              setShowPicker(false);
            }}
          />
        )}

        <TouchableOpacity style={styles.button} onPress={() => fetchLogs(selectedDate)}>
          <Text style={styles.buttonText}>Fetch Activity</Text>
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={activityLogs}
            keyExtractor={(item) => item.log_id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={<Text style={styles.emptyText}>No logs found.</Text>}
            renderItem={({ item }) => (
              <View style={styles.logCard}>
                <Text style={styles.logText}>🚶 Steps: {item.steps}</Text>
                <Text style={styles.logText}>⏰ Time: {new Date(item.timestamp?.seconds * 1000).toLocaleTimeString()}</Text>
              </View>
            )}
          />
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  backArrow: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hero: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subText: {
    fontSize: 14,
    color: '#e0e0e0',
    marginTop: 4,
  },
  totalStepsCard: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  totalStepsTitle: {
    fontSize: 16,
    color: '#111827',
  },
  totalStepsValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#047857',
    marginTop: 4,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    padding: 10,
    backgroundColor: '#0ea5e9',
    borderRadius: 12,
    marginBottom: 10,
  },
  dateText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#fff',
  },
  button: {
    backgroundColor: '#22c55e',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  list: {
    paddingBottom: 40,
    paddingTop: 10,
  },
  logCard: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  logText: {
    fontSize: 15,
    color: '#111827',
  },
  emptyText: {
    color: '#e5e7eb',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ActivityScreen;


// import React, { useState, useCallback } from 'react';
// import {
//   View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
//   FlatList, ImageBackground
// } from 'react-native';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { useFocusEffect, useNavigation } from '@react-navigation/native';
// import { getActivityLogsForDate } from '../utilityV8/activityService';
// import { Ionicons } from '@expo/vector-icons';

// const ActivityScreen = () => {
//   const navigation = useNavigation();

//   const getYesterday = () => {
//     const d = new Date();
//     d.setDate(d.getDate() - 1);
//     return d;
//   };

//   const [selectedDate, setSelectedDate] = useState(getYesterday());
//   const [showPicker, setShowPicker] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [activityLogs, setActivityLogs] = useState([]);
//   const [totalSteps, setTotalSteps] = useState(0);

//   const formatDate = (date) => date.toISOString().split('T')[0];

//   const fetchLogs = async (date) => {
//     setLoading(true);
//     const logs = await getActivityLogsForDate(formatDate(date));
//     const filtered = logs.filter(log => log.steps > 0);
//     setActivityLogs(filtered);
//     const total = filtered.reduce((acc, log) => acc + (log.steps || 0), 0);
//     setTotalSteps(total);
//     setLoading(false);
//   };

//   useFocusEffect(
//     useCallback(() => {
//       fetchLogs(getYesterday());
//     }, [])
//   );

//   const onChange = (event, selected) => {
//     setShowPicker(false);
//     if (selected) setSelectedDate(selected);
//   };

//   return (
//     <ImageBackground
//       source={{ uri: 'https://images.pexels.com/photos/1552249/pexels-photo-1552249.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260' }}
//       style={styles.background}
//       resizeMode="cover"
//     >
//       <View style={styles.overlay}>
//         {/* Back Button */}
//         <TouchableOpacity style={styles.backArrow} onPress={() => navigation.goBack()}>
//           <Ionicons name="arrow-back" size={26} color="#fff" />
//         </TouchableOpacity>

//         {/* Title */}
//         <View style={styles.hero}>
//           <Text style={styles.headerText}>Your Movement</Text>
//           <Text style={styles.subText}>Activity summary for {formatDate(selectedDate)}</Text>
//         </View>

//         {/* Total Steps Card */}
//         <View style={styles.totalStepsCard}>
//           <Text style={styles.totalStepsTitle}>Total Steps</Text>
//           <Text style={styles.totalStepsValue}>{totalSteps}</Text>
//         </View>

//         {/* Date Picker */}
//         <TouchableOpacity style={styles.dateSelector} onPress={() => setShowPicker(true)}>
//           <Ionicons name="calendar" size={20} color="#fff" />
//           <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
//         </TouchableOpacity>

//         {showPicker && (
//           <DateTimePicker
//             value={selectedDate}
//             mode="date"
//             display="calendar"
//             onChange={(e, selected) => {
//               if (selected) {
//                 setSelectedDate(selected);
//                 fetchLogs(selected);
//               }
//               setShowPicker(false);
//             }}
//           />
//         )}

//         {/* Fetch Button */}
//         <TouchableOpacity style={styles.button} onPress={() => fetchLogs(selectedDate)}>
//           <Text style={styles.buttonText}>Fetch Activity</Text>
//         </TouchableOpacity>

//         {/* Data List */}
//         {loading ? (
//           <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />
//         ) : (
//           <FlatList
//             data={activityLogs}
//             keyExtractor={(item) => item.log_id}
//             contentContainerStyle={styles.list}
//             ListEmptyComponent={<Text style={styles.emptyText}>No logs found.</Text>}
//             renderItem={({ item }) => (
//               <View style={styles.logCard}>
//                 <Text style={styles.logText}>🚶 Steps: {item.steps}</Text>
//                 <Text style={styles.logText}>⏰ Time: {new Date(item.timestamp?.seconds * 1000).toLocaleTimeString()}</Text>
//               </View>
//             )}
//           />
//         )}
//       </View>
//     </ImageBackground>
//   );
// };

// const styles = StyleSheet.create({
//   background: {
//     flex: 1,
//   },
//   overlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.2)',
//     paddingTop: 60,
//     paddingHorizontal: 20,
//   },
//   backArrow: {
//     position: 'absolute',
//     top: 50,
//     left: 20,
//     zIndex: 10,
//   },
//   hero: {
//     alignItems: 'center',
//     marginBottom: 20,
//     marginTop: 10,
//   },
//   headerText: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#fff',
//   },
//   subText: {
//     fontSize: 14,
//     color: '#e0e0e0',
//     marginTop: 4,
//   },
//   totalStepsCard: {
//     alignSelf: 'center',
//     backgroundColor: 'rgba(255,255,255,0.8)', // ✅ lighter card
//     padding: 16,
//     borderRadius: 16,
//     marginBottom: 16,
//     width: '80%',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//     elevation: 3,
//   },
//   totalStepsTitle: {
//     fontSize: 16,
//     color: '#111827',
//   },
//   totalStepsValue: {
//     fontSize: 36,
//     fontWeight: 'bold',
//     color: '#047857',
//     marginTop: 4,
//   },
//   dateSelector: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     alignSelf: 'center',
//     padding: 10,
//     backgroundColor: '#0ea5e9',
//     borderRadius: 12,
//     marginBottom: 10,
//   },
//   dateText: {
//     marginLeft: 10,
//     fontSize: 16,
//     color: '#fff',
//   },
//   button: {
//     backgroundColor: '#22c55e',
//     paddingVertical: 10,
//     paddingHorizontal: 30,
//     borderRadius: 20,
//     alignSelf: 'center',
//     marginBottom: 10,
//   },
//   buttonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 15,
//   },
//   list: {
//     paddingBottom: 40,
//     paddingTop: 10,
//   },
//   logCard: {
//     backgroundColor: 'rgba(255,255,255,0.8)',  // ✅ lighter log card
//     padding: 16,
//     borderRadius: 14,
//     marginBottom: 12,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//     elevation: 3,
//   },
//   logText: {
//     fontSize: 15,
//     color: '#111827',
//   },
//   emptyText: {
//     color: '#e5e7eb',
//     textAlign: 'center',
//     marginTop: 20,
//   },
// });

// export default ActivityScreen;
