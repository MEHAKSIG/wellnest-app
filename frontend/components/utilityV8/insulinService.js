import { firestore,firebase,auth } from '../../firebase';
import { generateDocId,convertToISTString,toUTC } from './utility';
import {updateLastPredictedBolus} from './userService'

const { Timestamp } = firebase.firestore;
const COLLECTION = 'Insulin_logs';
const userId = auth.currentUser?.uid||'2NgUdjPSfjVvBJnmEp3CkvoKkMo1';


// ✅ Add single insulin log
export const addInsulinLog = async (entry) => {
  const timestamp = entry.timestamp ? Timestamp.fromDate(new Date(entry.timestamp)) : Timestamp.now();
  const log_id = entry.log_id || generateDocId('insulin', entry.user_id, timestamp);

  const doc = {
    log_id,
    user_id: entry.user_id,
    timestamp,
    bolus: entry.bolus || 0,
    carb_input: entry.carb_input || 0,
    basal_rate: entry.basal_rate ?? null,
    calories: entry.calories || 0,
  };

  await firestore.collection(COLLECTION).doc(log_id).set(doc);
};

// ✅ Add multiple insulin logs (pre-processed)
export const addMultipleInsulinLogs = async (logs = []) => {
  const batch = firestore.batch();

  logs.forEach((entry) => {
    const ref = firestore.collection(COLLECTION).doc(entry.log_id);
    batch.set(ref, { ...entry });
  });

  await batch.commit();
};

export const updateaddNutrient = async (entry) => {
  const userId = entry.user_id;
  const timestamp = Timestamp.fromDate(new Date(entry.timestamp));

  try {
    // 🔍 Query for doc with the same timestamp (exact match) for the same user
    const snapshot = await firestore
      .collection(COLLECTION)
      .where('user_id', '==', userId)
      .where('timestamp', '==', timestamp)
      .limit(1)
      .get();

    if (!snapshot.empty) {
      // 🛠 Update existing doc
      const docId = snapshot.docs[0].id;
      await firestore.collection(COLLECTION).doc(docId).update({
        carb_input: entry.carb_input || 0,
        food_intake: entry.food_intake || 'No food recorded',
      });
      console.log('✅ Nutrient log updated');
    } else {
      // ➕ Add new doc
      const log_id = generateDocId('insulin', userId, timestamp);
      const doc = {
        log_id,
        user_id: userId,
        timestamp,
        carb_input: entry.carb_input || 0,
        food_intake: entry.food_intake || 'No food recorded',
      };
      await firestore.collection(COLLECTION).doc(log_id).set(doc);
      console.log('✅ Nutrient log added');
    }
  } catch (error) {
    console.error('❌ Error in updateaddNutrient:', error);
    throw error;
  }
};
// ✅ Read one doc
export const getInsulinLog = async (time) => {
  const userId = '2NgUdjPSfjVvBJnmEp3CkvoKkMo1';
  console.log("inside get Insulin log")
  const timestamp = time instanceof Date ? time : new Date(time);
  const logId = generateDocId('insulin', userId, timestamp); // Assuming your docId includes timestamp
  const doc = await firestore.collection(COLLECTION).doc(logId).get();
  
  const data= doc.exists ? { id: doc.id, ...doc.data() } : null;
  console.log("last insulin predicted doc",data,"generatedId",logId)
  return data;
  // const doc = await firestore.collection(COLLECTION).doc(logId).get();
  // return doc.exists ? { id: doc.id, ...doc.data() } : null;
};

// ✅ Get logs in a time range
export const getInsulinLogsBetween = async (start, end) => {
  const snapshot = await firestore
    .collection(COLLECTION)
    .where('timestamp', '>=', start)
    .where('timestamp', '<=', end)
    .orderBy('timestamp')
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const getBolusAndBasalSortedByTimeDesc = async (start, end) => {
  
  const startUTC = toUTC(new Date(start));
  const endUTC = toUTC(new Date(end));
  console.log(`fetching insulin log for ${startUTC} to ${endUTC}`);
  const snapshot = await firestore
    .collection(COLLECTION)
    .where('user_id', '==', userId)
    .where('timestamp', '>=', Timestamp.fromDate(new Date(startUTC)))
    .where('timestamp', '<=', Timestamp.fromDate(new Date(endUTC)))
    .orderBy('timestamp', 'desc')
    .get();

  return snapshot.docs
    .map((doc) => {
      const data = doc.data();
      return {
        timestamp: data.timestamp.toDate(),
        bolus: data.bolus || 0,
        basal_rate: data.basal_rate ?? null,
      };
    })
    .filter((entry) => entry.bolus !== 0); // ✅ Filter out bolus === 0
};

export const getCarbsAndFoodIntakeBetween = async (start, end) => {
  console.log("inside getCarbsAndFoodIntakeBetween")
  const startUTC = toUTC(new Date(start));
  const endUTC = toUTC(new Date(end));
  const snapshot = await firestore
    .collection(COLLECTION)
    .where('user_id', '==', userId)
    .where('timestamp', '>=', Timestamp.fromDate(new Date(startUTC)))
    .where('timestamp', '<=', Timestamp.fromDate(new Date(endUTC)))
    .orderBy('timestamp', 'desc') // 🔁 Latest first
    .get();

  return snapshot.docs
    .map((doc) => {
      const data = doc.data();
      return {
        timestamp: data.timestamp.toDate(),
        carb_input: data.carb_input || 0,
        food_intake: data.food_intake || "No food taken",
      };
    })
    .filter((entry) => entry.carb_input!==0); // ✅ Filter out placeholders
};


// ✅ Get latest log within ±15 mins from now
export const getLatestInsulinLogNearNow = async (maxPages = 100, pageSize = 10) => {
  const userId = '2NgUdjPSfjVvBJnmEp3CkvoKkMo1';
  let lastVisible = null;
  let page = 0;

  while (page < maxPages) {
    let query = firestore
      .collection(COLLECTION)
      .where('user_id', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(pageSize);

    if (lastVisible) {
      query = query.startAfter(lastVisible);
    }

    const snapshot = await query.get();
    if (snapshot.empty) break;

    const docs = snapshot.docs;
    lastVisible = docs[docs.length - 1];
    page++;

    const validDoc = docs.find(doc => {
      const d = doc.data();
      return d.bolus && d.bolus > 0;
    });

    if (validDoc) {
      const data = validDoc.data();
      //updateLastPredictedBolus(data.timestamp)
      console.log("✅ Found valid insulin log:", data);
      return data.bolus; // or return full data if needed
    }
  }

  console.warn("⚠️ No bolus > 0 insulin logs found in scanned pages.");
  return null;
};
// export const getLatestInsulinLogNearNow = async () => {
//   const userId = '2NgUdjPSfjVvBJnmEp3CkvoKkMo1';
//   console.log("📍 Inside getLatestInsulinLogNearNow");

//   try {
//     const snapshot = await firestore
//       .collection(COLLECTION)
//       .where('user_id', '==', userId)
//       .orderBy('timestamp', 'desc') // latest first
//       .limit(1) // only the most recent
//       .get();

//     if (snapshot.empty) {
//       console.warn("⚠️ No Insulin logs found for user:", userId);
//       return null;
//     }

//     const latestDoc = snapshot.docs[0].data();
//     console.log("✅ Fetched latest Insulin:", latestDoc?.bolus);

//     return latestDoc.bolus;
//   } catch (error) {
//     console.error("❌ Error in getLatestInsulinLogNearNow:", error);
//     return null;
//   }
// };