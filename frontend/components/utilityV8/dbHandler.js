
import firebase from 'firebase';

const db = firebase.firestore();
const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp;

// Generate custom doc ID like 'cgm_20250503_123456'
export const generateDocId = (prefix) => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(Math.random() * 1000000);
  return `${prefix}_${dateStr}_${rand}`;
};

// Add one document
export const addDoc = async (collection, docId, data) => {
  if (!collection || !docId || !data) {
    console.error('❌ Missing parameters in addDoc:', { collection, docId, data });
    throw new Error('Invalid arguments provided to addDoc');
  }

  console.log(`📄 Writing to Firestore → Collection: ${collection}, DocID: ${docId}`, data);

  try {
    await db.collection(collection).doc(docId).set({
      ...data,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });

    console.log('✅ Document written successfully.');
  } catch (error) {
    if (error.message.includes('Firestore backend')) {
      console.warn('⚠️ Firestore is in offline mode or unreachable. Data will sync when online.');
    }
    console.error('❌ Firestore write failed:', error.message);
    throw error;
  }
};

// Get one document by ID
export const getDoc = async (collection, docId) => {
  const doc = await db.collection(collection).doc(docId).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
};

// Delete one document by ID
export const deleteDoc = async (collection, docId) => {
  await db.collection(collection).doc(docId).delete();
};

// Add multiple documents in batch
export const addMultipleDocs = async (collection, dataArray) => {
  const batch = db.batch();
  dataArray.forEach(({ docId, data }) => {
    const ref = db.collection(collection).doc(docId);
    batch.set(ref, {
      ...data,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
  });
  await batch.commit();
};

// Get all documents for a user_id (realtime)
export const fetchDocsByUserId = (collection, userId, callback) => {
  return db
    .collection(collection)
    .where('user_id', '==', userId)
    .orderBy('reading_time', 'desc')
    .onSnapshot((snapshot) => {
      const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      callback(docs);
    });
};
// Fetch N oldest documents for a user (for deletion)
export const fetchOldestDocsByUserId = async (collection, userId, count) => {
  try {
    const snapshot = await firebase
      .firestore()
      .collection(collection)
      .where('user_id', '==', userId)
      .orderBy('reading_time', 'asc') // Oldest first
      .limit(count)
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id }));
  } catch (error) {
    console.error('Fetch oldest error:', error);
    return [];
  }
};
export const fetchDocsByUserIdAndField = async (collection, userId, field, value) => {
  try {
    const snapshot = await firebase
      .firestore()
      .collection(collection)
      .where('user_id', '==', userId)
      .where(field, '==', value)
      .orderBy('created_at', 'desc')
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Fetch by field error:', error);
    return [];
  }
};
// Query by any field
export const queryDocsByField = async (collection, field, value) => {
  try {
    const snapshot = await db
      .collection(collection)
      .where(field, '==', value)
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error querying ${collection} by ${field}:`, error);
    return [];
  }
};
