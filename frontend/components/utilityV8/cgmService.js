import { firestore,firebase,auth } from '../../firebase';
import { getUserTracking, updateLastTrackedCGM } from './userService';
import { parseTimestamp, generateDocId, toUTC } from './utility'; 
//import { Alert } from 'react-native';
const { Timestamp } = firebase.firestore;
const userId = auth.currentUser?.uid||'2NgUdjPSfjVvBJnmEp3CkvoKkMo1';
const COLLECTION = 'CGM_logs';

export const uploadNewCgmLogs = async (data) => {
  const uid = auth.currentUser?.uid || '2NgUdjPSfjVvBJnmEp3CkvoKkMo1';
  console.log('👤 Using user ID:', uid);

  if (!Array.isArray(data) || !data.length) {
    console.log('⚠️ Empty Data: No CGM entries provided.');
    return;
  }

  try {
    console.log('📥 Fetching last_tracked_cgm...');
    const track = await getUserTracking();
    const last = track?.last_tracked_cgm?.toDate?.() || new Date(0);
    console.log('🕓 Last tracked CGM timestamp:', last.toISOString());

    const logs = data
      .map((d, i) => {
        try {
          const ts = parseTimestamp(d.date);
          if (!ts) {
            console.log(`⛔ Entry ${i} skipped: invalid timestamp →`, d.date);
            return null;
          }

          const dt = ts.toDate();
          if (dt <= last) {
            console.log(`⏩ Entry ${i} skipped (older):`, dt.toISOString());
            return null;
          }

          const doc = {
            log_id: generateDocId('cgm', uid, dt),
            user_id: uid,
            timestamp: ts,
            glucose: d.value,
          };
          console.log(`✅ Entry ${i} added:`, doc);
          return doc;
        } catch (entryErr) {
          console.error(`❌ Error parsing entry ${i}:`, entryErr);
          return null;
        }
      })
      .filter(Boolean);

    if (!logs.length) {
      console.log('✅ All CGM data is already uploaded. No new entries.');
      return;
    }

    console.log(`📤 Uploading ${logs.length} new CGM logs...`);
    await addMultipleCgmLogs(logs);

    const latest = logs.reduce((max, doc) =>
      doc.timestamp.toDate() > max ? doc.timestamp.toDate() : max, last
    );
    console.log('🕓 Updating last_tracked_cgm to:', latest.toISOString());

    await updateLastTrackedCGM(latest);

    console.log('✅ Upload complete:', `${logs.length} CGM logs successfully uploaded.`);
  } catch (err) {
    console.error('❌ CGM Upload Error:', err);
    console.log('❌ Upload Failed:', err.message || 'Unknown error');
  }
};

// ✅ Add single CGM log
export const addCgmLog = async (entry) => {
  const timestamp = entry.timestamp ? Timestamp.fromDate(new Date(entry.timestamp)) : Timestamp.now();
  const log_id = entry.log_id || generateDocId('cgm', entry.user_id, timestamp);

  const doc = {
    log_id,
    user_id: entry.user_id,
    timestamp,
    glucose: entry.glucose || 0,
  };

  await firestore.collection(COLLECTION).doc(log_id).set(doc);
};

// ✅ Add multiple CGM logs (pre-processed)
export const addMultipleCgmLogs = async (logs = []) => {
  const batch = firestore.batch();

  logs.forEach((entry) => {
    const ref = firestore.collection(COLLECTION).doc(entry.log_id);
    batch.set(ref, { ...entry });
  });

  await batch.commit();
};

// ✅ Read one
export const getCgmLog = async (logId) => {
  const doc = await firestore.collection(COLLECTION).doc(logId).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
};

// ✅ Range query
export const getCgmLogsByUserAndTime = async (start, end) => {
  try {
    // Resolve the user ID dynamically
    

    const startTimestamp = Timestamp.fromDate(new Date(toUTC(new Date(start))))
    const endTimestamp = Timestamp.fromDate(new Date(toUTC(new Date(end))))

    console.log('🕐 Querying CGM logs from:', startTimestamp.toDate(), 'to', endTimestamp.toDate());

    const snapshot = await firestore
      .collection(COLLECTION)
      .where('user_id', '==', userId)
      .where('timestamp', '>=', startTimestamp)
      .where('timestamp', '<=', endTimestamp)
      .orderBy('timestamp','desc') // required to filter timestamp
      .get();

    console.log(`✅ Fetched ${snapshot.docs.length} logs`);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error('❌ getCgmLogsByUserAndTime error:', err.message);
    throw err;
  }
};

// ✅ Delete one
export const deleteCgmLog = async (logId) => {
  await firestore.collection(COLLECTION).doc(logId).delete();
};

// ✅ Delete multiple
export const deleteMultipleCgmLogs = async (logIds = []) => {
  const batch = firestore.batch();
  logIds.forEach((id) => {
    const ref = firestore.collection(COLLECTION).doc(id);
    batch.delete(ref);
  });
  await batch.commit();
};

// ✅ Get latest near now (±15 min)
export const getLatestCgmLogNearNow = async () => {
  const userId = '2NgUdjPSfjVvBJnmEp3CkvoKkMo1';
  console.log("📍 Inside getLatestCgmLogNearNow");

  try {
    const snapshot = await firestore
      .collection(COLLECTION)
      .where('user_id', '==', userId)
      .orderBy('timestamp', 'desc') // latest first
      .limit(1) // only the most recent
      .get();

    if (snapshot.empty) {
      console.warn("⚠️ No CGM logs found for user:", userId);
      return null;
    }

    const latestDoc = snapshot.docs[0].data();
    console.log("✅ Fetched latest glucose:", latestDoc);

    return latestDoc.glucose;
  } catch (error) {
    console.error("❌ Error in getLatestCgmLogNearNow:", error);
    return null;
  }
};

// import firebase from 'firebase';

// const db = firebase.firestore();
// const COLLECTION = 'CGM_logs';
// const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp;

// // 🔧 Generate custom doc ID
// const generateDocId = (prefix) => {
//   const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
//   const rand = Math.floor(Math.random() * 1000000);
//   return `${prefix}_${dateStr}_${rand}`;
// };

// // 🔧 Add single doc with timestamps
// const setDocWithTimestamps = async (collection, docId, data) => {
//   await db.collection(collection).doc(docId).set({
//     ...data,
//     created_at: serverTimestamp(),
//     updated_at: serverTimestamp(),
//   });
// };

// // 🔧 Batch insert docs with timestamps
// const batchSetDocs = async (collection, dataArray) => {
//   const batch = db.batch();
//   dataArray.forEach(({ docId, data }) => {
//     const ref = db.collection(collection).doc(docId);
//     batch.set(ref, {
//       ...data,
//       created_at: serverTimestamp(),
//       updated_at: serverTimestamp(),
//     });
//   });
//   await batch.commit();
// };

// // 🔧 Get doc by ID
// const getDocById = async (collection, docId) => {
//   const doc = await db.collection(collection).doc(docId).get();
//   return doc.exists ? { id: doc.id, ...doc.data() } : null;
// };

// // 🔧 Delete doc by ID
// const deleteDocById = async (collection, docId) => {
//   await db.collection(collection).doc(docId).delete();
// };

// // 🔧 Delete multiple docs
// const deleteMultipleDocs = async (collection, docIds) => {
//   const batch = db.batch();
//   docIds.forEach((docId) => {
//     const ref = db.collection(collection).doc(docId);
//     batch.delete(ref);
//   });
//   await batch.commit();
// };

// // 🔧 Real-time fetch by user ID
// const fetchDocsByUserId = (collection, userId, callback) => {
//   return db
//     .collection(collection)
//     .where('user_id', '==', userId)
//     .orderBy('reading_time', 'desc')
//     .onSnapshot((snapshot) => {
//       const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//       callback(docs);
//     });
// };

// // 🔧 Fetch N oldest docs for deletion
// const fetchOldestDocsByUserId = async (collection, userId, count) => {
//   try {
//     const snapshot = await db
//       .collection(collection)
//       .where('user_id', '==', userId)
//       .orderBy('reading_time', 'asc')
//       .limit(count)
//       .get();
//     return snapshot.docs.map((doc) => ({ id: doc.id }));
//   } catch (error) {
//     console.error('Error fetching oldest documents:', error);
//     return [];
//   }
// };

// // ✅ Add one CGM record
// export const addCgmRecord = async (userId, reading) => {
//   const docId = generateDocId('cgm');
//   const data = {
//     user_id: userId,
//     glucose_value: reading.glucose_value || 0,
//     reading_time: reading.reading_time || new Date().toISOString(),
//     device: reading.device || 'unknown',
//   };
//   await setDocWithTimestamps(COLLECTION, docId, data);
// };

// // ✅ Add multiple CGM records
// export const addMultipleCgmRecords = async (userId, readingsArray) => {
//   console.log(`🟢 addMultipleCgmRecords called for user: ${userId}, count: ${readingsArray.length}`);

//   const dataArray = readingsArray.map((reading) => {
//     const docId = generateDocId('cgm');
//     const data = {
//       user_id: userId,
//       glucose_value: reading.glucose_value || 0,
//       reading_time: reading.reading_time || new Date().toISOString(),
//       device: reading.device || 'unknown',
//     };
//     return { docId, data };
//   });

//   await batchSetDocs(COLLECTION, dataArray);
// };

// // ✅ Get one CGM record
// export const getCgmRecord = async (docId) => {
//   return await getDocById(COLLECTION, docId);
// };

// // ✅ Real-time fetch of CGM records for a user
// export const getAllCgmRecordsForUser = (userId, callback) => {
//   return fetchDocsByUserId(COLLECTION, userId, callback);
// };

// // ✅ Delete one CGM record
// export const deleteCgmRecord = async (docId) => {
//   await deleteDocById(COLLECTION, docId);
// };

// // ✅ Delete oldest `n` CGM records
// export const deleteOldestCgmRecords = async (userId, count) => {
//   const oldestDocs = await fetchOldestDocsByUserId(COLLECTION, userId, count);
//   const docIds = oldestDocs.map((doc) => doc.id);

//   if (docIds.length > 0) {
//     await deleteMultipleDocs(COLLECTION, docIds);
//     console.log(`${docIds.length} oldest CGM records deleted.`);
//   } else {
//     console.log('No CGM records found to delete.');
//   }
// };

// // import {
// //   addDoc,
// //   getDoc,
// //   deleteDoc,
// //   addMultipleDocs,
// //   fetchDocsByUserId,
// //   generateDocId,
// //   fetchOldestDocsByUserId
// // } from './dbHandler';

// // const COLLECTION = 'CGM_logs';

// // export const addCgmRecord = async (userId, reading) => {
// //   const docId = generateDocId('cgm');
// //   const data = {
// //     user_id: userId,
// //     glucose_value: reading.glucose_value || 0,
// //     reading_time: reading.reading_time || new Date().toISOString(),
// //     device: reading.device || 'unknown',
// //   };
// //   await addDoc(COLLECTION, docId, data);
// // };

// // export const addMultipleCgmRecords = async (userId, readingsArray) => {
// //     console.log(`🟢 addMultipleCgmRecords called for user: ${userId}, count: ${readingsArray.length}`);

// //   const dataArray = readingsArray.map((reading) => {
// //     const docId = generateDocId('cgm');
// //     const data = {
// //       user_id: userId,
// //       glucose_value: reading.glucose_value || 0,
// //       reading_time: reading.reading_time || new Date().toISOString(),
// //       device: reading.device || 'unknown',
// //     };
// //     return { docId, data };
// //   });
// //   await addMultipleDocs(COLLECTION, dataArray);
// // };

// // export const getCgmRecord = async (docId) => {
// //   return await getDoc(COLLECTION, docId);
// // };

// // export const getAllCgmRecordsForUser = (userId, callback) => {
// //   return fetchDocsByUserId(COLLECTION, userId, callback);
// // };

// // export const deleteCgmRecord = async (docId) => {
// //   await deleteDoc(COLLECTION, docId);
// // };

// // import {  } from './dbHandler';

// // export const deleteOldestCgmRecords = async (userId, count) => {
// //   const oldestDocs = await fetchOldestDocsByUserId('cgm', userId, count);
// //   const docIds = oldestDocs.map((doc) => doc.id);

// //   if (docIds.length > 0) {
// //     await deleteMultipleDocs('cgm', docIds);
// //   } else {
// //     console.log('No records found to delete');
// //   }
// // };
