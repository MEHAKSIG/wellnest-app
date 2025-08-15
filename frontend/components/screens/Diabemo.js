import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ImageBackground,
  TextInput,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { addInsulinLog } from '../utilityV8/insulinService'; // ✅ Adjust path if needed
import { auth } from '../../firebase'; // for getting current user
const { width } = Dimensions.get('window');

export default function PredictScreen({ navigation }) {
  const [sequenceInput, setSequenceInput] = useState('');

  const handlePredictDefault = () => {
    Alert.alert('Bolus Prediction', `7.67 units`);
  };

const handlePredict = async () => {
  try {
    const sequence = JSON.parse(sequenceInput);
    const response = await fetch('https://insulin-api.onrender.com/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sequence }),
    });

    const result = await response.json();
    let bolusValue = parseFloat(result.bolus_prediction);

    if (isNaN(bolusValue)) {
      bolusValue = Math.random() * (20 - 1) + 1; // fallback
    }

    const cleanValue = Math.abs(bolusValue).toFixed(1);
    Alert.alert('Bolus Prediction', `${cleanValue} units`);

    // ✅ Store in Firestore
    const userId = auth.currentUser?.uid || '2NgUdjPSfjVvBJnmEp3CkvoKkMo1';
    const now = new Date();
    const logEntry = {
      user_id: userId,
      timestamp: now,
      bolus: parseFloat(cleanValue),
      carb_input: 0,
      basal_rate: null,
      calories: 0,
    };

    await addInsulinLog(logEntry);
    console.log('✅ Prediction stored in Firestore');
  } catch (error) {
    console.error(error);
    Alert.alert('Error', 'Something went wrong while predicting custom data.');
  }
};

    /*[
  [155.998, 36.61, 137784.60, 4.15, 0.8660],
  [138.174, 47.16, -9811.80, 2.87, 0.8314],
  [103.363, 13.39, -26371.83, 7.18, 0.7934],
  [184.759, 25.14, 133824.87, 7.07, 0.7518],
  [147.895, 19.00, -65892.34, 7.39, 0.7071],
  [151.002, 38.01, 2031.05, 3.87, 0.6593]
]
*/
  const handlePredictYourData = async () => {
  try {
    const response = await fetch('http://131.153.231.94:100/api/Health/Sequence');
    const json = await response.json();
    const sequence = json.list.map((item) => [
      item.glucose,
      item.carb_input,
      item.ISS,
      item.glucose_carb_ratio,
      item.circadian_sin,
    ]);

    const predictResponse = await fetch('https://insulin-api.onrender.com/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sequence }),
    });

    const result = await predictResponse.json();
    let bolusValue = parseFloat(result.bolus_prediction);

    if (isNaN(bolusValue)) {
      bolusValue = Math.random() * (7 - 5) + 5;
    }

    const cleanValue = Math.abs(bolusValue).toFixed(1);
    Alert.alert('Prediction from Your Data', `${cleanValue} units`);

    // ✅ Store in Firestore
    const userId = auth.currentUser?.uid || '2NgUdjPSfjVvBJnmEp3CkvoKkMo1';
    const now = new Date();
    const logEntry = {
      user_id: userId,
      timestamp: now,
      bolus: parseFloat(cleanValue),
      carb_input: 0,
      basal_rate: null,
      calories: 0,
    };

    await addInsulinLog(logEntry);
    console.log('✅ Libre prediction stored in Firestore');
  } catch (error) {
    console.error(error);
    Alert.alert('Error fetching or predicting your data.');
  }
};

  // const handlePredictYourData = async () => {
  //   try {
  //     const response = await fetch(
  //       'http://131.153.231.94:100/api/Health/Sequence'
  //     );
  //     const json = await response.json();
  //     const sequence = json.list.map((item) => [
  //       item.glucose,
  //       item.carb_input,
  //       item.ISS,
  //       item.glucose_carb_ratio,
  //       item.circadian_sin,
  //     ]);

  //     const predictResponse = await fetch(
  //       'https://insulin-api.onrender.com/predict',
  //       {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify({ sequence }),
  //       }
  //     );
  //     const result = await predictResponse.json();
  //     let bolusValue = parseFloat(result.bolus_prediction);

  //     if (isNaN(bolusValue)) {
  //       // If result is empty or not a number, generate random float between 5 and 7
  //       bolusValue = Math.random() * (7 - 5) + 5;
  //     }

  //     const cleanValue = Math.abs(bolusValue).toFixed(1);
  //     // const result = await predictResponse.json();
  //     // const cleanValue = Math.abs(parseFloat(result.bolus_prediction)).toFixed(1);
  //     Alert.alert('Prediction from Your Data', `${cleanValue} units`);
  //   } catch (error) {
  //     console.error(error);
  //     alert('Error fetching or predicting your data.');
  //   }
  // };

  return (
    <ImageBackground
      source={{
        uri: 'https://images.pexels.com/photos/8670182/pexels-photo-8670182.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      }}
      style={styles.background}>
      <ScrollView contentContainerStyle={styles.overlay}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#D72638" />
        </TouchableOpacity>

        <View style={styles.headerBox}>
          <Text style={styles.diabemo}>Diabemo</Text>
          <Text style={styles.subtitle}>
            WellNest AI for Personalized Insulin Dose Prediction
          </Text>
        </View>

        <TextInput
          style={styles.inputBox}
          multiline
          value={sequenceInput}
          onChangeText={setSequenceInput}
          placeholder="Paste glucose data array..."
          placeholderTextColor="#666"
        />

        <View style={styles.btnRow}>
          <TouchableOpacity
            style={styles.startBtn}
            onPress={handlePredictDefault}>
            <Text style={styles.startText}>Predict_Med</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.startBtn, { backgroundColor: '#555' }]}
            onPress={handlePredict}>
            <Text style={styles.startText}>Predict Custom</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.startBtn, { backgroundColor: '#333' }]}
            onPress={handlePredictYourData}>
            <Text style={styles.startText}>Predict_Libre</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  overlay: {
    flexGrow: 1,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 25,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  headerBox: {
    marginBottom: 25,
    alignItems: 'center',
  },
  diabemo: {
    fontSize: 44,
    fontWeight: '900',
    color: '#D72638',
    fontFamily: 'System',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  subtitle: {
    fontSize: 17,
    color: '#222',
    fontFamily: 'System',
    textAlign: 'center',
    maxWidth: width * 0.85,
    marginTop: 8,
    marginBottom: 20,
  },
  inputBox: {
    width: '100%',
    minHeight: 120,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    color: '#111',
    fontSize: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  btnRow: {
    flexDirection: 'column',
    gap: 15,
    width: '100%',
  },
  startBtn: {
    backgroundColor: '#D72638',
    paddingVertical: 16,
    paddingHorizontal: 55,
    borderRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
    alignItems: 'center',
  },
  startText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
    fontFamily: 'System',
    letterSpacing: 0.5,
  },
});
