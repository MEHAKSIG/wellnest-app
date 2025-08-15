import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Alert, TextInput, ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getCgmLogsByUserAndTime } from '../utilityV8/cgmService';
import { convertToISTString } from '../utilityV8/utility';

const parseTime = (input) => {
  const parts = input.split(':');
  if (parts.length !== 3) return null;
  const [h, m, s] = parts.map(Number);
  return isNaN(h) || isNaN(m) || isNaN(s) ? null : { h, m, s };
};

const HistoryScreen = () => {
  const navigation = useNavigation();
  const [startDate, setStartDate] = useState(new Date(2025, 3, 19));
  const [endDate, setEndDate] = useState(new Date(2025, 3, 20));
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);
  const [startTime, setStartTime] = useState('00:00:00');
  const [endTime, setEndTime] = useState('23:59:59');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFetch = async () => {
    const parsedStart = parseTime(startTime);
    const parsedEnd = parseTime(endTime);
    if (!parsedStart || !parsedEnd) {
      return Alert.alert('Invalid Time Format', 'Use HH:MM:SS format');
    }

    const start = new Date(
      Date.UTC(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate(),
        parsedStart.h,
        parsedStart.m,
        parsedStart.s
      )
    );

    const end = new Date(
      Date.UTC(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate() + 1,
        0, 0, 0
      )
    );

    try {
      setLoading(true);
      const logs = await getCgmLogsByUserAndTime(start, end);
      setResults(logs || []);
    } catch (err) {
      Alert.alert('Fetch Error', 'Failed to fetch glucose data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => date.toLocaleDateString('en-GB');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#5c1a1b" />
          </TouchableOpacity>

          <Text style={styles.header}>Glucose History</Text>

          <View style={styles.iconRow}>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('LibreLinkScreen')}>
              <MaterialCommunityIcons name="blood-bag" size={20} color="#5c1a1b" />
              <Text style={styles.iconLabel}>Libre</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('MedtronicScreen')}>
              <FontAwesome5 name="heartbeat" size={20} color="#5c1a1b" />
              <Text style={styles.iconLabel}>Medtronic</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('VerioScreen')}>
              <FontAwesome5 name="vial" size={20} color="#5c1a1b" />
              <Text style={styles.iconLabel}>Verio</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.datePickerBox}>
            <Text style={styles.label}>Start Date</Text>
            <TouchableOpacity onPress={() => setShowStartDate(true)} style={styles.dateBtn}>
              <Text style={styles.dateText}>{formatDate(startDate)}</Text>
            </TouchableOpacity>
            {showStartDate && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                onChange={(e, d) => {
                  setShowStartDate(false);
                  if (d) {
                    const corrected = new Date(d);
                    corrected.setHours(0, 0, 0);
                    setStartDate(corrected);
                  }
                }}
              />
            )}
          </View>

          <View style={styles.datePickerBox}>
            <Text style={styles.label}>End Date</Text>
            <TouchableOpacity onPress={() => setShowEndDate(true)} style={styles.dateBtn}>
              <Text style={styles.dateText}>{formatDate(endDate)}</Text>
            </TouchableOpacity>
            {showEndDate && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display="default"
                onChange={(e, d) => {
                  setShowEndDate(false);
                  if (d) {
                    const corrected = new Date(d);
                    corrected.setHours(23, 59, 59);
                    setEndDate(corrected);
                  }
                }}
              />
            )}
          </View>
        </View>

        <TextInput
          style={styles.input}
          value={startTime}
          onChangeText={setStartTime}
          placeholder="Start Time (HH:MM:SS)"
          placeholderTextColor="#a77474"
        />
        <TextInput
          style={styles.input}
          value={endTime}
          onChangeText={setEndTime}
          placeholder="End Time (HH:MM:SS)"
          placeholderTextColor="#a77474"
        />

        <TouchableOpacity style={styles.fetchBtn} onPress={handleFetch}>
          <Text style={styles.fetchText}>Apply Filter</Text>
        </TouchableOpacity>

        {loading ? <ActivityIndicator size="large" color="#5c1a1b" style={{ marginTop: 20 }} /> : null}

        {results.length > 0 ? (
          results.map((item, index) => {
            const time = item?.timestamp ? convertToISTString(item.timestamp) : 'Unknown';
            const glucose = item?.glucose !== undefined ? Math.round(item.glucose) : 'N/A';
            return (
              <View key={index} style={styles.card}>
                <Text style={styles.cardText}>🕒 {time}</Text>
                <Text style={styles.cardGlucose}>Glucose: {glucose} mg/dL</Text>
              </View>
            );
          })
        ) : !loading ? (
          <Text style={styles.noData}>No data to display</Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff1f3', // full soft pink background
  },
  container: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 4,
    marginTop: 8,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#a83246',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  iconLabel: {
    fontSize: 10,
    marginTop: 4,
    color: '#5c1a1b',
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  datePickerBox: {
    width: '48%',
  },
  dateBtn: {
    backgroundColor: '#ffe4e6',
    padding: 10,
    borderRadius: 8,
    marginTop: 6,
    alignItems: 'center',
  },
  dateText: {
    color: '#5c1a1b',
    fontWeight: '600',
  },
  label: {
    fontWeight: '600',
    color: '#a83246',
  },
  input: {
    backgroundColor: '#ffe4e6',
    borderColor: '#fda4af',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
    color: '#5c1a1b',
  },
  fetchBtn: {
    backgroundColor: '#b91c1c',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  fetchText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#ffe4e6',
    borderColor: '#fda4af',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginTop: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardText: {
    fontSize: 14,
    color: '#5c1a1b',
  },
  cardGlucose: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 6,
    color: '#a83246',
  },
  noData: {
    marginTop: 20,
    color: '#a83246',
    textAlign: 'center',
  },
});

export default HistoryScreen;
