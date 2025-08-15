import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput, Image
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getCarbsAndFoodIntakeBetween, updateaddNutrient } from '../utilityV8/insulinService';

const parseTime = (input) => {
  const parts = input.split(':');
  if (parts.length !== 3) return null;
  const [h, m, s] = parts.map(Number);
  if (isNaN(h) || isNaN(m) || isNaN(s) || h > 23 || m > 59 || s > 59) return null;
  return { h, m, s };
};

const NutrientScreen = () => {
  const navigation = useNavigation();

  const [carbs, setCarbs] = useState('');
  const [foodIntake, setFoodIntake] = useState('');
  const [foodTime, setFoodTime] = useState(new Date());
  const [showFoodTimePicker, setShowFoodTimePicker] = useState(false);

  const handleManualSubmit = async () => {
    try {
      if (!carbs || !foodIntake || !foodTime) {
        Alert.alert('All fields are required.');
        return;
      }

      await updateaddNutrient({
        carb_input: parseFloat(carbs),
        food_intake: foodIntake,
        timestamp: foodTime.toISOString(),
        user_id: '2NgUdjPSfjVvBJnmEp3CkvoKkMo1',
      });

      Alert.alert('✅ Nutrient data submitted!');
      setCarbs('');
      setFoodIntake('');
    } catch (error) {
      console.error('❌ Manual nutrient submit error:', error);
      Alert.alert('Error submitting nutrient data');
    }
  };

  const [startDate, setStartDate] = useState(new Date('2025-05-19'));
  const [endDate, setEndDate] = useState(new Date('2025-05-20'));
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);
  const [startTime, setStartTime] = useState('00:00:00');
  const [endTime, setEndTime] = useState('23:59:59');
  const [results, setResults] = useState([]);

  const handleFetch = async () => {
    console.log("inside fetch")
    const parsedStart = parseTime(startTime);
    const parsedEnd = parseTime(endTime);

    if (!parsedStart || !parsedEnd) {
      Alert.alert('Invalid Time Format', 'Use HH:MM:SS (e.g., 08:30:00)');
      return;
    }

    const start = new Date(startDate);
    start.setHours(parsedStart.h, parsedStart.m, parsedStart.s);

    const end = new Date(endDate);
    end.setHours(parsedEnd.h, parsedEnd.m, parsedEnd.s);

    try {
      const logs = await getCarbsAndFoodIntakeBetween(start, end);
      setResults(logs);
    } catch (err) {
      console.error('❌ Fetch error:', err);
      Alert.alert('Error', 'Failed to fetch logs');
    }
  };

  const formatDate = (date) => date.toLocaleDateString();

  return (
    <ScrollView style={styles.container}>
      {/* Back Button */}
      <View style={styles.backContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#166534" />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>🍱 Nutrient Dashboard</Text>

      {/* Plate Image */}
      <View style={styles.plateContainer}>
        <Image
          source={require('./plate.png')}
          style={styles.plateImage}
        />
        <Text style={styles.foodTimeText}>📅 {foodTime.toLocaleString()}</Text>
      </View>

      {/* Manual Nutrient Input */}
      <TextInput
        style={styles.inputBox}
        value={carbs}
        onChangeText={setCarbs}
        keyboardType="numeric"
        placeholder="Carbs (g)"
      />
      <TextInput
        style={styles.inputBox}
        value={foodIntake}
        onChangeText={setFoodIntake}
        placeholder="Food intake (e.g. Rice + Dal)"
      />
      <TouchableOpacity style={styles.inputBox} onPress={() => setShowFoodTimePicker(true)}>
        <Text>📅 {foodTime.toLocaleString()}</Text>
      </TouchableOpacity>
      {showFoodTimePicker && (
        <DateTimePicker
          value={foodTime}
          mode="datetime"
          display="default"
          onChange={(e, date) => {
            setShowFoodTimePicker(false);
            if (date) setFoodTime(date);
          }}
        />
      )}

      <TouchableOpacity style={styles.greenButton} onPress={handleManualSubmit}>
        <Text style={styles.buttonText}>Submit Nutrient Entry</Text>
      </TouchableOpacity>

      {/* Fetch Logs */}
      <Text style={styles.sectionHeader}>📆 View Logs Between</Text>

      <View style={styles.row}>
        <TouchableOpacity style={[styles.halfInputBox, { marginRight: 5 }]} onPress={() => setShowStartDate(true)}>
          <Text>Start: {formatDate(startDate)}</Text>
        </TouchableOpacity>
        <TextInput
          style={[styles.halfInputBox, { marginLeft: 5 }]}
          value={startTime}
          onChangeText={setStartTime}
          placeholder="HH:MM:SS"
        />
      </View>
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

      <View style={styles.row}>
        <TouchableOpacity style={[styles.halfInputBox, { marginRight: 5 }]} onPress={() => setShowEndDate(true)}>
          <Text>End: {formatDate(endDate)}</Text>
        </TouchableOpacity>
        <TextInput
          style={[styles.halfInputBox, { marginLeft: 5 }]}
          value={endTime}
          onChangeText={setEndTime}
          placeholder="HH:MM:SS"
        />
      </View>
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

      <TouchableOpacity style={styles.blueButton} onPress={handleFetch}>
        <Text style={styles.buttonText}>Fetch Nutrient Logs</Text>
      </TouchableOpacity>

      {/* Results */}
      {results.length > 0 && (
        <View style={{ marginTop: 20 }}>
          <Text style={styles.sectionHeader}>📊 Results</Text>
          {results.map((item, idx) => (
            <View key={idx} style={styles.resultCard}>
              <Text>📅 {new Date(item.timestamp).toLocaleString()}</Text>
              <Text>Carbs: {item.carb_input} g</Text>
              <Text>Food: {item.food_intake}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#e6f4ea' },
  backContainer: { marginBottom: 10, paddingHorizontal: 4 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#166534', marginBottom: 20, textAlign: 'center' },
  plateContainer: { alignItems: 'center', marginBottom: 20 },
  plateImage: { width: 200, height: 200, borderRadius: 100 },
  foodTimeText: { marginTop: 8, fontWeight: '500' },
  inputBox: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginVertical: 6,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f766e',
    marginTop: 20,
    marginBottom: 10,
  },
  greenButton: {
    backgroundColor: '#16a34a',
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  blueButton: {
    backgroundColor: '#0284c7',
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  resultCard: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderColor: '#d1d5db',
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  halfInputBox: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
});

export default NutrientScreen;
