// firestoreHandlers.js (Firebase v8 compatible)
import firebase from 'firebase';
import { firebase as firebaseApp } from '../../firebase'; // Ensures initialization

const db = firebase.firestore();
const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp;

// General Firestore Add or Update (by documentId if provided)
export const pushToFirestore = async (collectionName, dataMap, documentId = null) => {
  try {
    await db.collection(collectionName).doc(documentId).set(dataMap);
    console.log(`Document set in ${collectionName} with ID: `, documentId);
  } catch (error) {
    console.error(`Error writing to ${collectionName}: `, error);
  }
};

// General Firestore Fetch with onSnapshot
export const fetchFromFirestore = (collectionName, user_id, callback) => {
  return db
    .collection(collectionName)
    .where('user_id', '==', user_id)
    .orderBy('timestamp', 'desc')
    .onSnapshot((snapshot) => {
      const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      callback(docs);
    });
};

// --- Collection-Specific Functions ---

export const addOrUpdateUser = (userObject) => {
  const data = {
    user_id: userObject.id,
    name: userObject.name,
    email: userObject.email,
    phone: userObject.phone,
    dob: userObject.dob,
    gender: userObject.gender,
    cgm_device_id: userObject.cgm_device_id || '',
    fitbit_permission: userObject.fitbit_permission || false,
    updated_at: serverTimestamp(),
    created_at: serverTimestamp(),
  };
  pushToFirestore('users', data, userObject.id);
};

export const getUserById = async (userId) => {
  try {
    const doc = await db.collection('users').doc(userId).get();
    return doc.exists ? doc.data() : null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

export const addCGMLog = (log) => {
  const data = {
    user_id: log.userId,
    glucose: log.glucoseValue,
    timestamp: log.timestamp || serverTimestamp(),
  };
  pushToFirestore('cgm_logs', data, log.id);
};

export const getCGMLogs = (user_id, callback) =>
  fetchFromFirestore('cgm_logs', user_id, callback);

export const addActivityLog = (log) => {
  const data = {
    user_id: log.userId,
    steps: log.steps || 0,
    distance_km: log.distance_km || 0.0,
    heart_rate: log.heart_rate || null,
    timestamp: log.timestamp || serverTimestamp(),
  };
  pushToFirestore('activity_logs', data, log.id);
};

export const getActivityLogs = (user_id, callback) =>
  fetchFromFirestore('activity_logs', user_id, callback);

export const addInsulinLog = (log) => {
  const data = {
    user_id: log.userId,
    carb_input: log.carb_input || 0.0,
    bolus: log.bolus || 0.0,
    calories: log.calories || 0.0,
    basal_rate: log.basal_rate || null,
    timestamp: log.timestamp || serverTimestamp(),
  };
  pushToFirestore('insulin_logs', data, log.id);
};

export const getInsulinLogs = (user_id, callback) =>
  fetchFromFirestore('insulin_logs', user_id, callback);

export const addVaultFile = (file) => {
  const data = {
    user_id: file.userId,
    file_name: file.name,
    file_url: file.url,
    uploaded_at: serverTimestamp(),
  };
  pushToFirestore('vault_files', data, file.id);
};

export const getVaultFiles = (user_id, callback) =>
  fetchFromFirestore('vault_files', user_id, callback);

export const addMenstruationLog = (log) => {
  const data = {
    user_id: log.userId,
    start_date: log.startDate,
    end_date: log.endDate,
    cycle_length: log.cycleLength,
    period_length: log.periodLength,
    symptoms: log.symptoms || null,
    mood_changes: log.moodChanges || null,
    flow_intensity: log.flowIntensity,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  };
  pushToFirestore('menstruation_logs', data, log.id);
};

export const getMenstruationLogs = (user_id, callback) =>
  fetchFromFirestore('menstruation_logs', user_id, callback);

// // firestoreHandlers.js (Firebase v8 compatible)
// import firebase from 'firebase';
// import { firebase as firebaseApp } from '../../firebase'; // Ensures initialization

// const db = firebase.firestore();
// const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp;

// // Add data to Firestore
// export const pushToFirestore = async (collectionName, dataMap) => {
//   try {
//     const payload = {
//       ...dataMap,
//       timestamp: serverTimestamp(),
//     };
//     const docRef = await db.collection(collectionName).add(payload);
//     console.log(`Document written to ${collectionName} with ID: `, docRef.id);
//   } catch (error) {
//     console.error(`Error adding document to ${collectionName}: `, error);
//   }
// };

// // Fetch data with listener
// export const fetchFromFirestore = (collectionName, user_id, callback) => {
//   return db
//     .collection(collectionName)
//     .where('user_id', '==', user_id)
//     .orderBy('timestamp', 'desc')
//     .onSnapshot((snapshot) => {
//       const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//       callback(docs);
//     });
// };

// // --- Data Management Functions ---

// export const addUser = (userObject) => {
//   const data = {
//     user_id: userObject.id,
//     name: userObject.name,
//     email: userObject.email,
//     phone: userObject.phone,
//     dob: userObject.dob,
//     gender: userObject.gender,
//     created_at: serverTimestamp(),
//     updated_at: serverTimestamp(),
//   };
//   pushToFirestore('users', data);
// };

// export const getUsers = (user_id, callback) =>
//   fetchFromFirestore('users', user_id, callback);

// export const addCGMLog = (log) => {
//   const data = {
//     user_id: log.userId,
//     glucose: log.glucoseValue,
//     timestamp: log.timestamp || serverTimestamp(),
//   };
//   pushToFirestore('cgm_logs', data);
// };

// export const getCGMLogs = (user_id, callback) =>
//   fetchFromFirestore('cgm_logs', user_id, callback);

// export const addActivityLog = (log) => {
//   const data = {
//     user_id: log.userId,
//     steps: log.steps || 0,
//     distance_km: log.distance_km || 0.0,
//     heart_rate: log.heart_rate || null,
//     timestamp: log.timestamp || serverTimestamp(),
//   };
//   pushToFirestore('activity_logs', data);
// };

// export const getActivityLogs = (user_id, callback) =>
//   fetchFromFirestore('activity_logs', user_id, callback);

// export const addInsulinLog = (log) => {
//   const data = {
//     user_id: log.userId,
//     carb_input: log.carb_input || 0.0,
//     bolus: log.bolus || 0.0,
//     calories: log.calories || 0.0,
//     basal_rate: log.basal_rate || null,
//     timestamp: log.timestamp || serverTimestamp(),
//   };
//   pushToFirestore('insulin_logs', data);
// };

// export const getInsulinLogs = (user_id, callback) =>
//   fetchFromFirestore('insulin_logs', user_id, callback);

// export const addVaultFile = (file) => {
//   const data = {
//     user_id: file.userId,
//     file_name: file.name,
//     file_url: file.url,
//     uploaded_at: serverTimestamp(),
//   };
//   pushToFirestore('vault_files', data);
// };

// export const getVaultFiles = (user_id, callback) =>
//   fetchFromFirestore('vault_files', user_id, callback);

// export const addMenstruationLog = (log) => {
//   const data = {
//     user_id: log.userId,
//     start_date: log.startDate,
//     end_date: log.endDate,
//     cycle_length: log.cycleLength,
//     period_length: log.periodLength,
//     symptoms: log.symptoms || null,
//     mood_changes: log.moodChanges || null,
//     flow_intensity: log.flowIntensity,
//     created_at: serverTimestamp(),
//     updated_at: serverTimestamp(),
//   };
//   pushToFirestore('menstruation_logs', data);
// };

// export const getMenstruationLogs = (user_id, callback) =>
//   fetchFromFirestore('menstruation_logs', user_id, callback);
