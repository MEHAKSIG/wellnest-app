import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ImageBackground
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getBolusAndBasalSortedByTimeDesc } from '../utilityV8/insulinService';
import { convertToISTString } from '../utilityV8/utility';
import { useUser } from '../../UserContext';
import { updateUser } from '../utilityV8/userService';

const parseTime = (input) => {
  const parts = input.split(':');
  if (parts.length !== 3) return null;
  const [h, m, s] = parts.map(Number);
  if (isNaN(h) || isNaN(m) || isNaN(s) || h > 23 || m > 59 || s > 59) return null;
  return { h, m, s };
};

const InsulinScreen = () => {
  const navigation = useNavigation();
  const { user, setUser } = useUser();
  const [mode, setMode] = useState(null);
  const [showDeviceScreen, setShowDeviceScreen] = useState(false);
  const [pumpId, setPumpId] = useState('');
  const [basalUnit, setBasalUnit] = useState('');
  const [startDate, setStartDate] = useState(new Date('2025-05-22T00:00:00'));
  const [endDate, setEndDate] = useState(new Date('2025-05-22T00:00:00'));
  const [startTime, setStartTime] = useState('00:00:00');
  const [endTime, setEndTime] = useState('23:59:59');
  const [results, setResults] = useState([]);
  const [progressMessage, setProgressMessage] = useState('');
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);

  const formatDate = (date) => date.toLocaleDateString();

  const handleFetch = async () => {
    const parsedStart = parseTime(startTime);
    const parsedEnd = parseTime(endTime);
    if (!parsedStart || !parsedEnd) {
      alert('Invalid Time Format');
      return;
    }
    const start = new Date(startDate);
    start.setHours(parsedStart.h, parsedStart.m, parsedStart.s);
    const end = new Date(endDate);
    end.setHours(parsedEnd.h, parsedEnd.m, parsedEnd.s);
    try {
      setProgressMessage('Fetching insulin logs...');
      const logs = await getBolusAndBasalSortedByTimeDesc(start, end);
      setResults(logs);
      setProgressMessage('');
    } catch (err) {
      alert('Failed to fetch logs: ', err);
      console.log("error message ", err)
      setProgressMessage('');
    }
  };

  const handleDeviceUpdate = async (type) => {
    // try {
    //   await updateUser(user.user_id, { therapy_type: type });
    //   setUser({ ...user, therapy_type: type });
    //   setShowDeviceScreen(false);
    // } catch (err) {
    //   alert('Failed to update user');
    // }
  };

  const renderInitialChoice = () => (
    <View style={styles.overlayCard}>
      <TouchableOpacity style={styles.navBackArrow} onPress={() => setShowDeviceScreen(false)}>
        <Ionicons name="arrow-back" size={26} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.title}>Insulin Therapy</Text>
      <TouchableOpacity style={styles.choiceBtn} onPress={() => handleDeviceUpdate('pump')}>
        <Ionicons name="hardware-chip-outline" size={20} color="#fff" />
        <Text style={styles.choiceText}>I'm using a Pump</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.choiceBtn} onPress={() => handleDeviceUpdate('manual')}>
        <Ionicons name="medical-outline" size={20} color="#fff" />
        <Text style={styles.choiceText}>I'm using Manual Insulin</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ImageBackground
      source={{ uri: 'https://images.pexels.com/photos/7653670/pexels-photo-7653670.jpeg' }}
      style={styles.background}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.fetchBtn} onPress={() => setShowDeviceScreen(true)}>
          <Text style={styles.fetchText}>➕ Update/Add Device</Text>
        </TouchableOpacity>

        {showDeviceScreen && renderInitialChoice()}

        <View style={styles.overlayCard}>
          {(!user?.therapy_type || user.therapy_type.trim() === '') && (
            <Text style={{ color: 'white', fontSize: 16, fontStyle: 'italic', marginBottom: 10 }}>
              🚫 No device connected. You can still fetch your previous insulin logs.
            </Text>
          )}

          <Text style={styles.title}>📈 Fetch Insulin Logs</Text>
          <TouchableOpacity style={styles.input} onPress={() => setShowStartDate(true)}>
            <Text style={styles.inputText}>📅 {formatDate(startDate)}</Text>
          </TouchableOpacity>
          {showStartDate && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              onChange={(e, d) => {
                setShowStartDate(false);
                if (d) setStartDate(d);
              }}
            />
          )}

          <TextInput
            style={styles.input}
            value={startTime}
            onChangeText={setStartTime}
            placeholder="Start Time (HH:MM:SS)"
            placeholderTextColor="#fff"
          />

          <TouchableOpacity style={styles.input} onPress={() => setShowEndDate(true)}>
            <Text style={styles.inputText}>📅 {formatDate(endDate)}</Text>
          </TouchableOpacity>
          {showEndDate && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="default"
              onChange={(e, d) => {
                setShowEndDate(false);
                if (d) setEndDate(d);
              }}
            />
          )}

          <TextInput
            style={styles.input}
            value={endTime}
            onChangeText={setEndTime}
            placeholder="End Time (HH:MM:SS)"
            placeholderTextColor="#fff"
          />

          <TouchableOpacity style={styles.fetchBtn} onPress={handleFetch}>
            <Text style={styles.fetchText}>Fetch Logs</Text>
          </TouchableOpacity>

          {progressMessage !== '' && <Text style={styles.progressMessage}>{progressMessage}</Text>}
          {results.length > 0 ? results.map((item, idx) => (
            <View key={idx} style={styles.resultCard}>
              <Text style={styles.resultText}>📅 {convertToISTString(item.timestamp)}</Text>
              <Text style={styles.resultText}>Bolus: {item.bolus} U</Text>
              <Text style={styles.resultText}>Basal: {item.basal_rate ?? 'N/A'} U/hr</Text>
            </View>
          )) : progressMessage === '' && (
            <Text style={styles.progressMessage}>❌ No logs for you.</Text>
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { padding: 24, paddingTop: 80, alignItems: 'center' },
  overlayCard: { width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20, padding: 24, alignItems: 'center', marginTop: 40 },
  navBackArrow: { position: 'absolute', top: -40, left: -10, zIndex: 10 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  choiceBtn: { width: '100%', flexDirection: 'row', gap: 10, backgroundColor: 'rgba(0,0,0,0.25)', padding: 14, borderRadius: 14, marginVertical: 10, alignItems: 'center', justifyContent: 'center' },
  choiceText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  input: { width: '100%', backgroundColor: 'rgba(0,0,0,0.15)', padding: 12, borderRadius: 12, color: 'white', marginBottom: 10 },
  inputText: { color: '#fff' },
  fetchBtn: { backgroundColor: '#8e24aa', padding: 14, borderRadius: 12, marginTop: 14, width: '100%' },
  fetchText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  progressMessage: { color: '#fff', marginTop: 10, fontStyle: 'italic', textAlign: 'center' },
  resultCard: { backgroundColor: '#00000040', padding: 12, borderRadius: 10, marginTop: 10, width: '100%' },
  resultText: { color: '#f0f0f0', fontSize: 14 }
});

export default InsulinScreen;

// import React, { useState } from 'react';
// import {
//   View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ImageBackground
// } from 'react-native';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { useNavigation } from '@react-navigation/native';
// import { Ionicons } from '@expo/vector-icons';
// import { getBolusAndBasalSortedByTimeDesc } from '../utilityV8/insulinService';
// import { convertToISTString } from '../utilityV8/utility';

// const parseTime = (input) => {
//   const parts = input.split(':');
//   if (parts.length !== 3) return null;
//   const [h, m, s] = parts.map(Number);
//   if (isNaN(h) || isNaN(m) || isNaN(s) || h > 23 || m > 59 || s > 59) return null;
//   return { h, m, s };
// };

// const InsulinScreen = () => {
//   const navigation = useNavigation();
//   const defaultDate = new Date('2025-05-22T00:00:00');

//   const [mode, setMode] = useState(null);
//   const [pumpId, setPumpId] = useState('');
//   const [basalUnit, setBasalUnit] = useState('');
//   const [startDate, setStartDate] = useState(defaultDate);
//   const [endDate, setEndDate] = useState(defaultDate);
//   const [startTime, setStartTime] = useState('00:00:00');
//   const [endTime, setEndTime] = useState('23:59:59');
//   const [results, setResults] = useState([]);
//   const [progressMessage, setProgressMessage] = useState('');
//   const [showStartDate, setShowStartDate] = useState(false);
//   const [showEndDate, setShowEndDate] = useState(false);

//   const formatDate = (date) => date.toLocaleDateString();

//   const handleFetch = async () => {
//     const parsedStart = parseTime(startTime);
//     const parsedEnd = parseTime(endTime);
//     if (!parsedStart || !parsedEnd) {
//       alert('Invalid Time Format');
//       return;
//     }
//     const start = new Date(startDate);
//     start.setHours(parsedStart.h, parsedStart.m, parsedStart.s);
//     const end = new Date(endDate);
//     end.setHours(parsedEnd.h, parsedEnd.m, parsedEnd.s);
//     try {
//       setProgressMessage('Fetching insulin logs...');
//       const logs = await getBolusAndBasalSortedByTimeDesc(start, end);
//       setResults(logs);
//       setProgressMessage('');
//     } catch (err) {
//       alert('Failed to fetch logs');
//       setProgressMessage('');
//     }
//   };

//   const renderInitialChoice = () => (
//     <View style={styles.overlayCard}>
//       {/* Back to previous screen */}
//       <TouchableOpacity style={styles.navBackArrow} onPress={() => navigation.goBack()}>
//         <Ionicons name="arrow-back" size={26} color="#fff" />
//       </TouchableOpacity>

//       <Text style={styles.title}>Insulin Therapy</Text>

//       <TouchableOpacity style={styles.choiceBtn} onPress={() => setMode('pump')}>
//         <Ionicons name="hardware-chip-outline" size={20} color="#fff" />
//         <Text style={styles.choiceText}>I'm using a Pump</Text>
//       </TouchableOpacity>

//       <TouchableOpacity style={styles.choiceBtn} onPress={() => setMode('manual')}>
//         <Ionicons name="medical-outline" size={20} color="#fff" />
//         <Text style={styles.choiceText}>I'm using Manual Insulin</Text>
//       </TouchableOpacity>
//     </View>
//   );

//   const renderPumpScreen = () => (
//     <View style={styles.overlayCard}>
//       {/* Back to initial choice */}
//       <TouchableOpacity style={styles.navBackArrow} onPress={() => setMode(null)}>
//         <Ionicons name="arrow-back" size={26} color="#fff" />
//       </TouchableOpacity>

//       <Text style={styles.title}>🔌 Pump ID</Text>
//       <TextInput
//         style={styles.input}
//         value={pumpId}
//         onChangeText={setPumpId}
//         placeholder="Enter Pump ID"
//         placeholderTextColor="#fff"
//       />
//       <TouchableOpacity style={styles.fetchBtn}>
//         <Text style={styles.fetchText}>Fetch Pump Data</Text>
//       </TouchableOpacity>
//     </View>
//   );

//   const renderManualScreen = () => (
//     <View style={styles.overlayCard}>
//       {/* Back to initial choice */}
//       <TouchableOpacity style={styles.navBackArrow} onPress={() => setMode(null)}>
//         <Ionicons name="arrow-back" size={26} color="#fff" />
//       </TouchableOpacity>

//       <Text style={styles.title}>💉 Basal Entry</Text>

//       <TextInput
//         style={styles.input}
//         value={basalUnit}
//         onChangeText={setBasalUnit}
//         placeholder="Enter Basal Unit"
//         placeholderTextColor="#fff"
//       />

//       <TouchableOpacity style={styles.input} onPress={() => setShowStartDate(true)}>
//         <Text style={styles.inputText}>📅 {formatDate(startDate)}</Text>
//       </TouchableOpacity>
//       {showStartDate && (
//         <DateTimePicker
//           value={startDate}
//           mode="date"
//           display="default"
//           onChange={(e, d) => {
//             setShowStartDate(false);
//             if (d) setStartDate(d);
//           }}
//         />
//       )}

//       <TextInput
//         style={styles.input}
//         value={startTime}
//         onChangeText={setStartTime}
//         placeholder="Start Time (HH:MM:SS)"
//         placeholderTextColor="#fff"
//       />

//       <TouchableOpacity style={styles.input} onPress={() => setShowEndDate(true)}>
//         <Text style={styles.inputText}>📅 {formatDate(endDate)}</Text>
//       </TouchableOpacity>
//       {showEndDate && (
//         <DateTimePicker
//           value={endDate}
//           mode="date"
//           display="default"
//           onChange={(e, d) => {
//             setShowEndDate(false);
//             if (d) setEndDate(d);
//           }}
//         />
//       )}

//       <TextInput
//         style={styles.input}
//         value={endTime}
//         onChangeText={setEndTime}
//         placeholder="End Time (HH:MM:SS)"
//         placeholderTextColor="#fff"
//       />

//       <TouchableOpacity style={styles.fetchBtn} onPress={handleFetch}>
//         <Text style={styles.fetchText}>Fetch Logs</Text>
//       </TouchableOpacity>

//       {progressMessage !== '' && <Text style={styles.progressMessage}>{progressMessage}</Text>}

//       {results.length > 0 && results.map((item, idx) => (
//         <View key={idx} style={styles.resultCard}>
//           <Text style={styles.resultText}>📅 {convertToISTString(item.timestamp)}</Text>
//           <Text style={styles.resultText}>Bolus: {item.bolus} U</Text>
//           <Text style={styles.resultText}>Basal: {item.basal_rate ?? 'N/A'} U/hr</Text>
//         </View>
//       ))}
//     </View>
//   );

//   return (
//     <ImageBackground
//       source={{ uri: 'https://images.pexels.com/photos/7653670/pexels-photo-7653670.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }}
//       style={styles.background}
//     >
//       <ScrollView contentContainerStyle={styles.container}>
//         {!mode && renderInitialChoice()}
//         {mode === 'pump' && renderPumpScreen()}
//         {mode === 'manual' && renderManualScreen()}
//       </ScrollView>
//     </ImageBackground>
//   );
// };

// const styles = StyleSheet.create({
//   background: {
//     flex: 1,
//     backgroundColor: '#000',
//   },
//   container: {
//     padding: 24,
//     paddingTop: 80,
//     alignItems: 'center',
//   },
//   overlayCard: {
//     width: '100%',
//     backgroundColor: 'rgba(0,0,0,0.3)',
//     borderRadius: 20,
//     padding: 24,
//     alignItems: 'center',
//     marginTop: 40,
//   },
//   navBackArrow: {
//     position: 'absolute',
//     top: -40,
//     left: -10,
//     zIndex: 10,
//   },
//   title: {
//     fontSize: 26,
//     fontWeight: 'bold',
//     color: '#fff',
//     marginBottom: 20,
//   },
//   choiceBtn: {
//     width: '100%',
//     flexDirection: 'row',
//     gap: 10,
//     backgroundColor: 'rgba(0,0,0,0.25)',
//     padding: 14,
//     borderRadius: 14,
//     marginVertical: 10,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   choiceText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 16,
//   },
//   input: {
//     width: '100%',
//     backgroundColor: 'rgba(0,0,0,0.15)',
//     padding: 12,
//     borderRadius: 12,
//     color: 'white',
//     marginBottom: 10,
//   },
//   inputText: {
//     color: '#fff',
//   },
//   fetchBtn: {
//     backgroundColor: '#8e24aa',
//     padding: 14,
//     borderRadius: 12,
//     marginTop: 14,
//     width: '100%',
//   },
//   fetchText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     textAlign: 'center',
//   },
//   progressMessage: {
//     color: '#fff',
//     marginTop: 10,
//     fontStyle: 'italic',
//     textAlign: 'center',
//   },
//   resultCard: {
//     backgroundColor: '#00000040',
//     padding: 12,
//     borderRadius: 10,
//     marginTop: 10,
//     width: '100%',
//   },
//   resultText: {
//     color: '#f0f0f0',
//     fontSize: 14,
//   },
// });

// export default InsulinScreen;
