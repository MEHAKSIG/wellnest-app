import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ImageBackground,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../UserContext';
const VaultMain = () => {
  const navigation = useNavigation();
const { user } = useUser();
  return (
    <ImageBackground
      source={{ uri: 'https://i.pinimg.com/736x/72/cf/02/72cf02b63414ae872539479d0143c152.jpg' }}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.userHeader}>{user?.name ||"Mehak"}</Text>
          <Text style={styles.userSubtext}>  26 years · Female</Text>

          <View style={styles.gridContainer}>
            <TouchableOpacity
              style={styles.gridBox}
              onPress={() => navigation.navigate('Prescription')}
            >
              <Image
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2921/2921822.png' }}
                style={styles.icon}
              />
              <Text style={styles.label}>Prescriptions</Text>
            </TouchableOpacity>

            <TouchableOpacity
  style={styles.gridBox}
  onPress={() => navigation.navigate('PdfReportUploader')}
>
  <Image
    source={{ uri: 'https://cdn-icons-png.flaticon.com/512/942/942748.png' }}
    style={styles.icon}
  />
  <Text style={styles.label}>Reports</Text>
</TouchableOpacity>


            <TouchableOpacity
              style={styles.gridBox}
              onPress={() => navigation.navigate('DoctorBot')}
            >
              <Image
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3771/3771518.png' }}
                style={styles.icon}
              />
              <Text style={styles.label}>My Doctor</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridBox}
              onPress={() => navigation.navigate('HealthDiary')}
            >
              <Image
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4825/4825009.png' }}
                style={styles.icon}
              />
              <Text style={styles.label}>Health Diary</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 30,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    alignItems: 'center',
  },
  userHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#b71c1c',
  },
  userSubtext: {
    fontSize: 14,
    color: '#555',
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    marginBottom: 20,
  },
  actionBtn: {
    backgroundColor: '#f8d7da',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  actionText: {
    color: '#b71c1c',
    fontWeight: 'bold',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 20,
  },
  gridBox: {
    backgroundColor: '#fcebea',
    width: '42%',
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  icon: {
    width: 40,
    height: 40,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#b71c1c',
    textAlign: 'center',
  },
  nextBtn: {
    backgroundColor: '#b71c1c',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    marginTop: 10,
  },
  nextText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default VaultMain;
