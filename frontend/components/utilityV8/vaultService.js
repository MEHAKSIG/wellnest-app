// utilityV8/vaultService.js
import { firestore as db, firebase } from '../../firebase'; // ✅ assumes you're exporting both

const COLLECTION = 'Vault_files';
const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp;

// 🛠️ Generate a unique document ID
const generateDocId = (prefix) => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(Math.random() * 1000000);
  return `${prefix}_${dateStr}_${rand}`;
};

// 🛠️ Add a document with timestamps
const setDocWithTimestamps = async (collection, docId, data) => {
  await db.collection(collection).doc(docId).set({
    ...data,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
  console.log(`📝 Document ${docId} added to ${collection}`);
};

// ✅ Add a single vault file entry
export const addVaultFile = async (userId, file) => {
  const docId = generateDocId('files');
  const data = {
    user_id: userId,
    file_url: file.file_url || '',
    file_name: file.file_name || '',
    file_type: file.file_type || 'general',
    uploaded_at: file.uploaded_at || new Date().toISOString(),
  };

  console.log('📥 addVaultFile - Saving metadata:', data);
  await setDocWithTimestamps(COLLECTION, docId, data);
};

// ✅ Get vault files by type (e.g., 'prescription', 'report')
export const getVaultFilesByType = async (userId, fileType) => {
  try {
    const snapshot = await db
      .collection(COLLECTION)
      .where('user_id', '==', userId)
      .where('file_type', '==', fileType)
      .orderBy('uploaded_at', 'desc')
      .get();

    const results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    console.log(`📄 Fetched ${results.length} documents of type '${fileType}' for user ${userId}`);
    return results;
  } catch (error) {
    console.error(`❌ Error fetching vault files:`, error);
    return [];
  }
};
export const deleteVaultFile = async (fileId) => {
  try {
    await db.collection('Vault_files').doc(fileId).delete();
    console.log(`🗑️ Deleted file ${fileId}`);
  } catch (error) {
    console.error('❌ Failed to delete file:', error);
  }
};
// import firebase from 'firebase';

// const db = firebase.firestore();
// const COLLECTION = 'Vault_files';
// const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp;

// // 🛠️ Utility: Generate unique doc ID
// const generateDocId = (prefix) => {
//   const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
//   const rand = Math.floor(Math.random() * 1000000);
//   return `${prefix}_${dateStr}_${rand}`;
// };

// // 🛠️ Utility: Add single doc with timestamps
// const setDocWithTimestamps = async (collection, docId, data) => {
//   await db.collection(collection).doc(docId).set({
//     ...data,
//     created_at: serverTimestamp(),
//     updated_at: serverTimestamp(),
//   });
// };

// // 🛠️ Utility: Add multiple docs in batch
// const batchSetDocs = async (collection, items) => {
//   const batch = db.batch();
//   items.forEach(({ docId, data }) => {
//     const ref = db.collection(collection).doc(docId);
//     batch.set(ref, {
//       ...data,
//       created_at: serverTimestamp(),
//       updated_at: serverTimestamp(),
//     });
//   });
//   await batch.commit();
// };

// // 🛠️ Utility: Get doc
// const getDocById = async (collection, docId) => {
//   const doc = await db.collection(collection).doc(docId).get();
//   return doc.exists ? { id: doc.id, ...doc.data() } : null;
// };

// // 🛠️ Utility: Delete doc
// const deleteDocById = async (collection, docId) => {
//   await db.collection(collection).doc(docId).delete();
// };

// // 🛠️ Utility: Query by user + field
// const fetchDocsByUserIdAndField = async (collection, userId, field, value) => {
//   try {
//     const snapshot = await db
//       .collection(collection)
//       .where('user_id', '==', userId)
//       .where(field, '==', value)
//       .orderBy('uploaded_at', 'desc')
//       .get();
//     return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//   } catch (error) {
//     console.error(`Error fetching docs by ${field}:`, error);
//     return [];
//   }
// };

// // ✅ Add single vault file
// export const addVaultFile = async (userId, file) => {
//   const docId = generateDocId('files');
//   const data = {
//     user_id: userId,
//     file_url: file.file_url || '',
//     file_name: file.file_name || '',
//     file_type: file.file_type || 'general',
//     uploaded_at: file.uploaded_at || new Date().toISOString(),
//   };
//   await setDocWithTimestamps(COLLECTION, docId, data);
// };

// // ✅ Get single vault file
// export const getVaultFile = async (docId) => {
//   return await getDocById(COLLECTION, docId);
// };

// // ✅ Delete single vault file
// export const deleteVaultFile = async (docId) => {
//   await deleteDocById(COLLECTION, docId);
// };

// // ✅ Add multiple vault files
// export const addMultipleVaultFiles = async (userId, files) => {
//   const payload = files.map((file) => {
//     const docId = generateDocId('vault');
//     const data = {
//       user_id: userId,
//       file_url: file.file_url || '',
//       file_name: file.file_name || '',
//       file_type: file.file_type || 'general',
//       uploaded_at: file.uploaded_at || new Date().toISOString(),
//     };
//     return { docId, data };
//   });

//   await batchSetDocs(COLLECTION, payload);
// };

// // ✅ Delete multiple selected vault files
// export const deleteSelectedVaultFiles = async (docIds) => {
//   if (!docIds || docIds.length === 0) {
//     console.log('No document IDs provided for deletion.');
//     return;
//   }

//   try {
//     await Promise.all(docIds.map((docId) => deleteDocById(COLLECTION, docId)));
//     console.log(`${docIds.length} vault files deleted successfully.`);
//   } catch (error) {
//     console.error('Error deleting vault files:', error);
//   }
// };

// // ✅ Get vault files by file type
// export const getVaultFilesByType = async (userId, fileType) => {
//   return await fetchDocsByUserIdAndField(COLLECTION, userId, 'file_type', fileType);
// };

// // import {
// //   addDoc,
// //   getDoc,
// //   deleteDoc,
// //   addMultipleDocs,
// //   fetchDocsByUserIdAndField,
// //   generateDocId,
// // } from './dbHandler';

// // const COLLECTION = 'Vault_files';

// // // Add a single vault entry
// // export const addVaultFile = async (userId, file) => {
// //   const docId = generateDocId('files');
// //   const data = {
// //     user_id: userId,
// //     file_url: file.file_url || '',
// //     file_name: file.file_name || '',
// //     file_type: file.file_type || 'general', // 'prescription' or 'report'
// //     uploaded_at: file.uploaded_at || new Date().toISOString(),
// //   };
// //   await addDoc(COLLECTION, docId, data);
// // };

// // // Get a single vault entry
// // export const getVaultFile = async (docId) => {
// //   return await getDoc(COLLECTION, docId);
// // };

// // // Delete a single vault entry
// // export const deleteVaultFile = async (docId) => {
// //   await deleteDoc(COLLECTION, docId);
// // };

// // // Add multiple vault files
// // export const addMultipleVaultFiles = async (userId, files) => {
// //   const payload = files.map((file) => {
// //     const docId = generateDocId('vault');
// //     const data = {
// //       user_id: userId,
// //       file_url: file.file_url || '',
// //       file_name: file.file_name || '',
// //       file_type: file.file_type || 'general',
// //       uploaded_at: file.uploaded_at || new Date().toISOString(),
// //     };
// //     return { docId, data };
// //   });

// //   await addMultipleDocs(COLLECTION, payload);
// // };
// // //delete multiple files of id
// // export const deleteSelectedVaultFiles = async (docIds) => {
// //   if (!docIds || docIds.length === 0) {
// //     console.log('No document IDs provided for deletion.');
// //     return;
// //   }

// //   try {
// //     await Promise.all(
// //       docIds.map((docId) => deleteDoc('vault', docId))
// //     );
// //     console.log(`${docIds.length} vault files deleted successfully.`);
// //   } catch (error) {
// //     console.error('Error deleting vault files:', error);
// //   }
// // };
// // // Get all vault files by type (e.g., prescriptions, reports)
// // export const getVaultFilesByType = async (userId, fileType) => {
// //   return await fetchDocsByUserIdAndField(COLLECTION, userId, 'file_type', fileType);
// // };
