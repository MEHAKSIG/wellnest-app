import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Modal,
  ImageBackground,
  Image,
  Linking,
  FlatList
} from 'react-native';
import axios from 'axios';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const DOCTORS = [
  {
    id: '1',
    name: 'Dr. Archana Dayal Arya',
    contact: '+91 9876543210',
    hospital: 'Sir Ganga Ram Hospital',
    experience: '15 years',
    image: 'https://sgrh.com/assets/img/profile/gaa0162.jpg',
  },
  {
    id: '2',
    name: 'Dr. Vimal Upreti',
    contact: '+91 9876501234',
    hospital: 'Safar Tibbi',
    experience: '20 years',
    image: 'https://safartibbi.com/wp-content/uploads/2023/08/Dr.-Vimal-Upreti-image.jpg',
  },
  {
    id: '3',
    name: 'Dr. Shreya Gupta',
    contact: '+91 9988776655',
    hospital: 'Pregawish Clinic',
    experience: '12 years',
    image: 'https://www.pregawish.com/uploads/doctor/thumbnail/634/dr-shreya-gupta.jpg',
  },
  {
    id: '4',
    name: 'Dr. Pooja Sharma',
    contact: '+91 9867543210',
    hospital: 'SRMS IMS Bareilly',
    experience: '14 years',
    image: 'https://www.srms.ac.in/ims/hospital/wp-content/uploads/2023/08/POOJA-SHARMA.jpg',
  },
  {
    id: '5',
    name: 'Dr. Nikhil Verma',
    contact: '+91 9845123409',
    hospital: 'Doximity Health',
    experience: '17 years',
    image: 'https://doximity-res.cloudinary.com/image/upload/v1701135159/yfm3rw61sedpv3enkveq.jpg',
  },
  {
    id: '6',
    name: 'Dr. Reena Kapoor',
    contact: '+91 9812312345',
    hospital: 'Healthgrades Clinic',
    experience: '18 years',
    image: 'https://ucmscdn.healthgrades.com/de/89/331292034cfcb36aef6c1f1d5e8e/gcsfn-reenathomas.jpg',
  },
  {
    id: '7',
    name: 'Dr. Arvind Menon',
    contact: '+91 9822098765',
    hospital: 'Skedoc Hyderabad',
    experience: '16 years',
    image: 'https://skedoccoresa.blob.core.windows.net/skedoc-images/doctorimages/Hyderabad_7e0dfb36-d15a-4f14-abd3-dcf1a36d3bc5.png',
  }
];

export default function App() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();

  const callDoctorAPI = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        'https://ai-doctor-api-ai-medical-chatbot-healthcare-ai-assistant.p.rapidapi.com/chat?noqueue=1',
        { message: input },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-RapidAPI-Key': 'facf941866msh2d55a138aa15e60p1774e9jsn9388c7697f16',
            'X-RapidAPI-Host': 'ai-doctor-api-ai-medical-chatbot-healthcare-ai-assistant.p.rapidapi.com',
          },
        }
      );
      setResponse(res.data.result.response);
    } catch (err) {
      setResponse({ message: '❌ Error: ' + (err.response?.data?.message || err.message) });
    }
    setLoading(false);
  };

  return (
    <ImageBackground
      source={{ uri: 'https://images.pexels.com/photos/5998481/pexels-photo-5998481.jpeg' }}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.hamburger}>
          <AntDesign name="menuunfold" size={28} color="#b71c1c" />
        </TouchableOpacity>

        <TouchableOpacity  onPress={() => navigation.goBack()} style={styles.backToVaultButton}>
          <Text style={styles.backToVaultText}>← Vault</Text>
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>🩺 Ask EndoBot</Text>
          <Text style={styles.subtitle}>Your AI-powered diabetes assistant</Text>

          <TextInput
            style={styles.input}
            placeholder="Ask about symptoms, diet, insulin..."
            value={input}
            onChangeText={setInput}
            multiline
          />

          <TouchableOpacity style={styles.askButton} onPress={callDoctorAPI} disabled={loading}>
            <Text style={styles.askText}>Ask</Text>
          </TouchableOpacity>

          {loading && <ActivityIndicator size="large" color="#b71c1c" style={{ marginTop: 20 }} />}

          {response && (
            <View style={styles.responseBox}>
              <Text style={styles.sectionHeader}>💬 Response</Text>
              <Text style={styles.response}>{response.message}</Text>

              {response.recommendations?.length > 0 && (
                <View style={styles.sectionGroup}>
                  <Text style={styles.sectionHeader}>✅ Recommendations</Text>
                  {response.recommendations.map((rec, idx) => (
                    <Text key={idx} style={styles.bullet}>• {rec}</Text>
                  ))}
                </View>
              )}

              {response.warnings?.length > 0 && (
                <View style={styles.sectionGroup}>
                  <Text style={styles.sectionHeader}>⚠️ Warnings</Text>
                  {response.warnings.map((warn, idx) => (
                    <Text key={idx} style={styles.bullet}>• {warn}</Text>
                  ))}
                </View>
              )}

              {response.followUp?.length > 0 && (
                <View style={styles.sectionGroup}>
                  <Text style={styles.sectionHeader}>🔄 Follow-up Questions</Text>
                  {response.followUp.map((q, idx) => (
                    <Text key={idx} style={styles.bullet}>• {q}</Text>
                  ))}
                </View>
              )}
            </View>
          )}
        </ScrollView>

        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>📋 Top Endocrinologists</Text>
              <FlatList
                data={DOCTORS}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.doctorCard}>
                    <Image source={{ uri: item.image }} style={styles.doctorImage} />
                    <View>
                      <Text style={styles.doctorName}>{item.name}</Text>
                      <Text style={styles.doctorHospital}>{item.hospital}</Text>
                      <Text style={styles.doctorExperience}>{item.experience}</Text>
                      <TouchableOpacity onPress={() => Linking.openURL(`tel:${item.contact}`)}>
                        <Text style={styles.doctorContact}>{item.contact}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <Text style={{ color: '#fff' }}>Back to EndoBot</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.88)',
  },
  backToVaultButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    zIndex: 10,
    elevation: 4,
  },
  backToVaultText: {
    color: '#b71c1c',
    fontWeight: '600',
  },
  container: {
    paddingTop: 100,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#b71c1c',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#444',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    minHeight: 80,
    textAlignVertical: 'top'
  },
  askButton: {
    backgroundColor: '#b71c1c',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  askText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  responseBox: {
    backgroundColor: '#fff8f8',
    padding: 15,
    borderRadius: 10,
  },
  sectionGroup: {
    marginTop: 15,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#b71c1c',
    marginBottom: 5,
  },
  response: {
    fontSize: 15,
    color: '#333',
    marginBottom: 10,
  },
  bullet: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    marginBottom: 4,
  },
  hamburger: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 50,
    elevation: 4,
    zIndex: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    height: '100%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#b71c1c',
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  doctorImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  doctorContact: {
    fontSize: 14,
    color: '#1e88e5',
    marginTop: 4,
  },
  doctorHospital: {
    fontSize: 13,
    color: '#777',
  },
  doctorExperience: {
    fontSize: 13,
    color: '#999',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#b71c1c',
    padding: 10,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
});
