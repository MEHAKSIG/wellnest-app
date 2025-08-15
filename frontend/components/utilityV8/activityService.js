// 📦 Firebase Activity Log Service (with step_difference)
import { firestore, firebase, auth } from '../../firebase';
import { generateDocId } from './utility';

const { Timestamp } = firebase.firestore;
const COLLECTION = 'Activity_logs';
const userId = auth.currentUser?.uid || '2NgUdjPSfjVvBJnmEp3CkvoKkMo1';

const restingRates = [68, 72, 75, 78, 80, 82, 85, 88];
const elevatedRates = [90, 91, 93, 95, 96, 97, 99, 100];
const db = firestore;
const getRandomFromRange = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const updateActivityLogsWithHeartRate = async () => {
  try {
    const snapshot = await db
      .collection(COLLECTION)
      .where('user_id', '==', userId)
      .get();

    if (snapshot.empty) {
      console.log('✅ No activity logs found.');
      return;
    }

    const batch = db.batch();
    let updateCount = 0;

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const currentRate = data.heart_rate;

      if (currentRate === null || currentRate === 0) {
        const stepDiff = data.step_difference || 0;
        let chosenRate = 70;

        if (stepDiff >= 30) {
          chosenRate = getRandomFromRange(90, 100);
        } else if (stepDiff >= 10) {
          chosenRate = getRandomFromRange(85, 95);
        } else {
          chosenRate = getRandomFromRange(68, 88);
        }

        batch.update(doc.ref, { heart_rate: chosenRate });
        console.log(`📍 Updating ${doc.id}: step_diff=${stepDiff} → HR=${chosenRate}`);
        updateCount++;
      }
    });

    if (updateCount === 0) {
      console.log('✅ All activity logs already have valid heart rates.');
      return;
    }

    await batch.commit();
    console.log(`✅ Successfully updated ${updateCount} activity log(s) with heart rate.`);
  } catch (err) {
    console.error('❌ Failed to update activity logs:', err);
  }
};
// ✅ Add a single activity log (computing step_difference)
export const addActivityLog = async (entry) => {
  const timestamp = entry.timestamp ? Timestamp.fromDate(new Date(entry.timestamp)) : Timestamp.now();
  const log_id = entry.log_id || generateDocId('activity', entry.user_id, timestamp);
  const currentSteps = entry.steps || 0;

  // Get last step count
  const latestLog = await getLatestActivityLog();
  const lastSteps = latestLog?.steps || 0;
  const step_difference = currentSteps - lastSteps;

  // Assign heart rate intelligently if not provided or 0
  let heart_rate = entry.heart_rate;
  if (!heart_rate || heart_rate === 0) {
    if (step_difference >= 30) {
      heart_rate = getRandomFromRange(90, 100);
    } else if (step_difference >= 10) {
      heart_rate = getRandomFromRange(85, 95);
    } else {
      heart_rate = getRandomFromRange(68, 88);
    }
  }

  const doc = {
    log_id,
    user_id: entry.user_id,
    timestamp,
    steps: currentSteps,
    distance_km: entry.distance_km || 0,
    heart_rate,
    step_difference,
  };

  await firestore.collection(COLLECTION).doc(log_id).set(doc);
};

export const addMultipleActivityLogs = async (logs = []) => {
  const batch = firestore.batch();
  let lastSteps = 0;

  logs.forEach((entry) => {
    const timestamp = entry.timestamp ? Timestamp.fromDate(new Date(entry.timestamp)) : Timestamp.now();
    const log_id = entry.log_id || generateDocId('activity', entry.user_id, timestamp);
    const steps = entry.steps || 0;
    const step_difference = steps - lastSteps;
    lastSteps = steps;

    // Assign heart rate intelligently
    let heart_rate = entry.heart_rate;
    if (!heart_rate || heart_rate === 0) {
      if (step_difference >= 30) {
        heart_rate = getRandomFromRange(90, 100);
      } else if (step_difference >= 10) {
        heart_rate = getRandomFromRange(85, 95);
      } else {
        heart_rate = getRandomFromRange(68, 88);
      }
    }

    const ref = firestore.collection(COLLECTION).doc(log_id);
    batch.set(ref, {
      log_id,
      user_id: entry.user_id,
      timestamp,
      steps,
      distance_km: entry.distance_km || 0,
      heart_rate,
      step_difference,
    });
  });

  await batch.commit();
};


// ✅ Get a single activity log by timestamp
export const getActivityLog = async (time) => {
  const timestamp = time instanceof Date ? time : new Date(time);
  const logId = generateDocId('activity', userId, timestamp);
  const doc = await firestore.collection(COLLECTION).doc(logId).get();

  return doc.exists ? { id: doc.id, ...doc.data() } : null;
};

// ✅ Get activity logs within a time range
export const getActivityLogsBetween = async (start, end) => {
  const snapshot = await firestore
    .collection(COLLECTION)
    .where('user_id', '==', userId)
    .where('timestamp', '>=', Timestamp.fromDate(new Date(start)))
    .where('timestamp', '<=', Timestamp.fromDate(new Date(end)))
    .orderBy('timestamp','desc')
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// ✅ Get latest activity log
export const getLatestActivityLog = async () => {
  const snapshot = await firestore
    .collection(COLLECTION)
    .where('user_id', '==', userId)
    .orderBy('timestamp', 'desc')
    .limit(1)
    .get();

  return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
};

export const getLatestNonZeroHeartRateToday = async () => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const snapshot = await firestore
      .collection(COLLECTION)
      .where('user_id', '==', userId)
      .where('timestamp', '>=', Timestamp.fromDate(startOfDay))
      .where('timestamp', '<=', Timestamp.fromDate(endOfDay))
      .orderBy('timestamp', 'desc')
      .get();

    const validLog = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .find(log => log.heart_rate && log.heart_rate > 0);

    if (validLog) {
      return validLog;
    } else {
      console.log("⚠️ No non-zero heart rate found for today.");
      return null;
    }

  } catch (err) {
    console.error("❌ Error fetching latest non-zero heart rate for today:", err);
    return null;
  }
};


// ✅ Delete a single activity log by timestamp
export const deleteActivityLog = async (timestamp) => {
  const logId = generateDocId('activity', userId, new Date(timestamp));
  await firestore.collection(COLLECTION).doc(logId).delete();
};

// ✅ Delete activity logs within a time range
export const deleteActivityLogsBetween = async (start, end) => {
  const snapshot = await firestore
    .collection(COLLECTION)
    .where('user_id', '==', userId)
    .where('timestamp', '>=', Timestamp.fromDate(new Date(start)))
    .where('timestamp', '<=', Timestamp.fromDate(new Date(end)))
    .get();

  const batch = firestore.batch();
  snapshot.forEach((doc) => batch.delete(doc.ref));

  await batch.commit();
};
export const getActivityLogsForDate = async (dateStr) => {
  console.log("inside getActivityLogsForDate")
  try {
    const startOfDay = new Date(`${dateStr}T00:00:00`);
    const endOfDay = new Date(`${dateStr}T23:59:59`);

    const snapshot = await firestore
      .collection(COLLECTION)
      .where('user_id', '==', userId)
      .where('timestamp', '>=', Timestamp.fromDate(startOfDay))
      .where('timestamp', '<=', Timestamp.fromDate(endOfDay))
      .orderBy('timestamp','desc')
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error(`❌ Error fetching activity logs for ${dateStr}:`, err);
    return [];
  }
};
