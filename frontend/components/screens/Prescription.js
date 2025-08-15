import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ImageBackground,
  Alert
} from 'react-native';
import { pickDocument, openReport } from '../utilityV8/utility';
import { AntDesign, Entypo } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getVaultFilesByType, addVaultFile, deleteVaultFile } from '../utilityV8/vaultService';
import { useUser } from '../../UserContext';

const background =
  'https://images.pexels.com/photos/7723389/pexels-photo-7723389.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';

const Prescription = () => {
  const [reports, setReports] = useState([]);
  const [progressMessage, setProgressMessage] = useState('');
  const navigation = useNavigation();
  const { user } = useUser();

  const fetchPrescriptions = async () => {
    if (!user?.uid) return;
    const data = await getVaultFilesByType(user.uid, 'prescription');
    setReports(
      data.map((file) => ({
        id: file.id,
        uri: file.file_url,
        name: file.file_name,
        time: file.uploaded_at,
      }))
    );
  };

  const handleUpload = async () => {
    const result = await pickDocument(user.uid,'prescription',setReports,setProgressMessage);
    if (!result || !result.uri) return;
    setProgressMessage('Uploading...');

    const newFile = {
      file_url: result.uri,
      file_name: result.name,
      file_type: 'prescription',
      uploaded_at: new Date().toISOString(),
    };
    setProgressMessage('Upload successful!');
    await fetchPrescriptions();
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Prescription',
      'Are you sure you want to delete this prescription?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteVaultFile(id);
            setReports((prev) => prev.filter((item) => item.id !== id));
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  return (
    <ImageBackground
      source={{ uri: background }}
      style={styles.background}
      resizeMode="cover">
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <AntDesign name="arrowleft" size={24} color="#b71c1c" />
        </TouchableOpacity>

        <View style={styles.innerCard}>
          <Text style={styles.title}>📄 Prescription Vault</Text>
          <Text style={styles.subtitle}>
            Securely upload and view your prescriptions
          </Text>

          <TouchableOpacity
            style={styles.uploadBtn}
            onPress={handleUpload}>
            <AntDesign name="addfile" size={22} color="#fff" />
            <Text style={styles.uploadText}>Upload Prescription</Text>
          </TouchableOpacity>
          {progressMessage ? (
            <Text style={{ marginTop: 10, color: '#b71c1c' }}>
              {progressMessage}
            </Text>
          ) : null}

          <Text style={styles.sectionTitle}>Uploaded Prescriptions</Text>
          {reports.length === 0 && (
            <Text style={{ color: '#888', fontStyle: 'italic' }}>
              No prescriptions uploaded yet.
            </Text>
          )}

          <FlatList
            data={reports}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.reportCardContainer}>
                <TouchableOpacity
                  style={styles.reportCard}
                  onPress={() => openReport(item.uri)}>
                  <AntDesign name="pdffile1" size={20} color="#b71c1c" />
                  <View>
                    <Text style={styles.reportText}>{item.name}</Text>
                    <Text style={styles.reportTime}>{new Date(item.time).toLocaleString()}</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <Entypo name="cross" size={20} color="#b71c1c" style={{ marginLeft: 8 }} />
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: {
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 50,
    elevation: 3,
  },
  innerCard: {
    backgroundColor: 'rgba(255,255,255,0.93)',
    borderRadius: 16,
    padding: 20,
    marginTop: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#b71c1c',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 20,
  },
  uploadBtn: {
    flexDirection: 'row',
    backgroundColor: '#b71c1c',
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  uploadText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  reportCardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  reportCard: {
    backgroundColor: '#fbecec',
    padding: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  reportText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
  },
  reportTime: {
    fontSize: 12,
    color: '#777',
  },
});

export default Prescription;

// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   FlatList,
//   ImageBackground,
// } from 'react-native';
// import { pickDocument, openReport } from '../utilityV8/utility';
// import { AntDesign } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import { getVaultFilesByType, addVaultFile } from '../utilityV8/vaultService';
// import { useUser } from '../../UserContext';

// const background =
//   'https://images.pexels.com/photos/7723389/pexels-photo-7723389.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';

// const Prescription = () => {
//   const [reports, setReports] = useState([]);
//   const [progressMessage, setProgressMessage] = useState('');
//   const navigation = useNavigation();
//   const { user } = useUser();

//   const fetchPrescriptions = async () => {
//     if (!user?.uid) return;
//     const data = await getVaultFilesByType(user.uid, 'prescription');
//     setReports(
//       data.map((file) => ({
//         id: file.id,
//         uri: file.file_url,
//         name: file.file_name,
//         time: file.uploaded_at,
//       }))
//     );
//   };

//   const handleUpload = async () => {
//     const result = await pickDocument(user.uid,'prescription',setReports,setProgressMessage);
//     if (!result || !result.uri) return;
//     setProgressMessage('Uploading...');

//     const newFile = {
//       file_url: result.uri,
//       file_name: result.name,
//       file_type: 'prescription',
//       uploaded_at: new Date().toISOString(),
//     };
//     //await addVaultFile(user.uid, newFile);
//     setProgressMessage('Upload successful!');
//     await fetchPrescriptions();
//   };

//   useEffect(() => {
//     fetchPrescriptions();
//   }, []);

//   return (
//     <ImageBackground
//       source={{ uri: background }}
//       style={styles.background}
//       resizeMode="cover">
//       <ScrollView contentContainerStyle={styles.container}>
//         <TouchableOpacity
//           onPress={() => navigation.goBack()}
//           style={styles.backButton}>
//           <AntDesign name="arrowleft" size={24} color="#b71c1c" />
//         </TouchableOpacity>

//         <View style={styles.innerCard}>
//           <Text style={styles.title}>📄 Prescription Vault</Text>
//           <Text style={styles.subtitle}>
//             Securely upload and view your prescriptions
//           </Text>

//           <TouchableOpacity
//             style={styles.uploadBtn}
//             onPress={handleUpload}>
//             <AntDesign name="addfile" size={22} color="#fff" />
//             <Text style={styles.uploadText}>Upload Prescription</Text>
//           </TouchableOpacity>
//           {progressMessage ? (
//             <Text style={{ marginTop: 10, color: '#b71c1c' }}>
//               {progressMessage}
//             </Text>
//           ) : null}

//           <Text style={styles.sectionTitle}>Uploaded Prescriptions</Text>
//           {reports.length === 0 && (
//             <Text style={{ color: '#888', fontStyle: 'italic' }}>
//               No prescriptions uploaded yet.
//             </Text>
//           )}

//           <FlatList
//             data={reports}
//             keyExtractor={(item) => item.id.toString()}
//             renderItem={({ item }) => (
//               <TouchableOpacity
//                 style={styles.reportCard}
//                 onPress={() => openReport(item.uri)}>
//                 <AntDesign name="pdffile1" size={20} color="#b71c1c" />
//                 <View>
//                   <Text style={styles.reportText}>{item.name}</Text>
//                   <Text style={styles.reportTime}>{new Date(item.time).toLocaleString()}</Text>
//                 </View>
//               </TouchableOpacity>
//             )}
//           />
//         </View>
//       </ScrollView>
//     </ImageBackground>
//   );
// };

// const styles = StyleSheet.create({
//   background: { flex: 1 },
//   container: {
//     paddingTop: 60,
//     paddingHorizontal: 16,
//   },
//   backButton: {
//     position: 'absolute',
//     top: 20,
//     left: 20,
//     backgroundColor: '#fff',
//     padding: 8,
//     borderRadius: 50,
//     elevation: 3,
//   },
//   innerCard: {
//     backgroundColor: 'rgba(255,255,255,0.93)',
//     borderRadius: 16,
//     padding: 20,
//     marginTop: 40,
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: '#b71c1c',
//     marginBottom: 8,
//   },
//   subtitle: {
//     fontSize: 14,
//     color: '#555',
//     marginBottom: 20,
//   },
//   uploadBtn: {
//     flexDirection: 'row',
//     backgroundColor: '#b71c1c',
//     paddingVertical: 12,
//     borderRadius: 10,
//     justifyContent: 'center',
//     alignItems: 'center',
//     gap: 8,
//     marginBottom: 24,
//   },
//   uploadText: {
//     color: '#fff',
//     fontWeight: 'bold',
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 8,
//     color: '#333',
//   },
//   reportCard: {
//     backgroundColor: '#fbecec',
//     padding: 12,
//     borderRadius: 10,
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 10,
//     marginBottom: 10,
//   },
//   reportText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#444',
//   },
//   reportTime: {
//     fontSize: 12,
//     color: '#777',
//   },
// });

// export default Prescription;

// // import React, { useState } from 'react';
// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   TouchableOpacity,
// //   ScrollView,
// //   FlatList,
// //   ImageBackground,
// // } from 'react-native';
// // import { pickDocument, openReport } from '../utilityV8/utility';
// // import { AntDesign } from '@expo/vector-icons';
// // import { useNavigation } from '@react-navigation/native';

// // const background =
// //   'https://images.pexels.com/photos/7723389/pexels-photo-7723389.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';

// // const Prescription = () => {
// //   const [reports, setReports] = useState([]);
// //   const [progressMessage, setProgressMessage] = useState('');
// //   const navigation = useNavigation();

// //   return (
// //     <ImageBackground
// //       source={{ uri: background }}
// //       style={styles.background}
// //       resizeMode="cover">
// //       <ScrollView contentContainerStyle={styles.container}>
// //         <TouchableOpacity
// //           onPress={() => navigation.goBack()}
// //           style={styles.backButton}>
// //           <AntDesign name="arrowleft" size={24} color="#b71c1c" />
// //         </TouchableOpacity>

// //         <View style={styles.innerCard}>
// //           <Text style={styles.title}>📄 Prescription Vault</Text>
// //           <Text style={styles.subtitle}>
// //             Securely upload and view your prescriptions
// //           </Text>

// //           <TouchableOpacity
// //             style={styles.uploadBtn}
// //             onPress={() => pickDocument('Prescription', setReports,setProgressMessage)}>
// //             <AntDesign name="addfile" size={22} color="#fff" />
// //             <Text style={styles.uploadText}>Upload Prescription</Text>
// //           </TouchableOpacity>
// //           {progressMessage ? (
// //             <Text style={{ marginTop: 10, color: '#b71c1c' }}>
// //               {progressMessage}
// //             </Text>
// //           ) : null}

// //           <Text style={styles.sectionTitle}>Uploaded Prescriptions</Text>
// //           {reports.length === 0 && (
// //             <Text style={{ color: '#888', fontStyle: 'italic' }}>
// //               No prescriptions uploaded yet.
// //             </Text>
// //           )}

// //           <FlatList
// //             data={reports}
// //             keyExtractor={(item) => item.id.toString()}
// //             renderItem={({ item }) => (
// //               <TouchableOpacity
// //                 style={styles.reportCard}
// //                 onPress={() => openReport(item.uri)}>
// //                 <AntDesign name="pdffile1" size={20} color="#b71c1c" />
// //                 <Text style={styles.reportText}>{item.name}</Text>
// //               </TouchableOpacity>
// //             )}
// //           />
// //         </View>
// //       </ScrollView>
// //     </ImageBackground>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   background: { flex: 1 },
// //   container: {
// //     paddingTop: 60,
// //     paddingHorizontal: 16,
// //   },
// //   backButton: {
// //     position: 'absolute',
// //     top: 20,
// //     left: 20,
// //     backgroundColor: '#fff',
// //     padding: 8,
// //     borderRadius: 50,
// //     elevation: 3,
// //   },
// //   innerCard: {
// //     backgroundColor: 'rgba(255,255,255,0.93)',
// //     borderRadius: 16,
// //     padding: 20,
// //     marginTop: 40,
// //   },
// //   title: {
// //     fontSize: 22,
// //     fontWeight: 'bold',
// //     color: '#b71c1c',
// //     marginBottom: 8,
// //   },
// //   subtitle: {
// //     fontSize: 14,
// //     color: '#555',
// //     marginBottom: 20,
// //   },
// //   uploadBtn: {
// //     flexDirection: 'row',
// //     backgroundColor: '#b71c1c',
// //     paddingVertical: 12,
// //     borderRadius: 10,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     gap: 8,
// //     marginBottom: 24,
// //   },
// //   uploadText: {
// //     color: '#fff',
// //     fontWeight: 'bold',
// //   },
// //   sectionTitle: {
// //     fontSize: 16,
// //     fontWeight: '600',
// //     marginBottom: 8,
// //     color: '#333',
// //   },
// //   reportCard: {
// //     backgroundColor: '#fbecec',
// //     padding: 12,
// //     borderRadius: 10,
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     gap: 10,
// //     marginBottom: 10,
// //   },
// //   reportText: {
// //     fontSize: 14,
// //     fontWeight: '600',
// //     color: '#444',
// //   },
// // });

// // export default Prescription;
