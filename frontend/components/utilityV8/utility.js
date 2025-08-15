import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import * as XLSX from 'xlsx';
import { Alert, Platform } from 'react-native';
import { firebase } from '../../firebase';
import { auth } from './authHandler';
import { uploadToSecondaryStorage } from './firebaseStroage';
import { addVaultFile } from './vaultService';
import { addMultipleCgmLogs } from './cgmService';
import { addMultipleInsulinLogs } from './insulinService';
import { addMultipleActivityLogs } from './activityService';
import {
  updateLastTrackedFitbit,
  getUser,
  getUserTracking,
  getActiveUserId,
  refreshFitbitToken
} from './userService';
const { Timestamp } = firebase.firestore;

// ───── Utilities ──────────────────────────────────────────────────────────

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

export const toUTC = (date) => new Date(date.getTime() - IST_OFFSET_MS);

const isValidDate = (date) =>
  date instanceof Date && !isNaN(date.getTime()) && date.getFullYear() >= 2000;

const alertWithMessage = (title, message) => Alert.alert(title, message);

// ───── Date / Time Handling ───────────────────────────────────────────────

export const parseTimestamp = (raw) => {
  if (!raw) return null;

  try {
    let jsDate = null;

    if (typeof raw === 'number' && raw >= 10000) {
      // Excel float timestamp
      const base = new Date(Date.UTC(1899, 11, 30));
      jsDate = new Date(base.getTime() + raw * 86400 * 1000 - IST_OFFSET_MS);
    } else if (raw instanceof Date) {
      jsDate = new Date(raw.getTime() - IST_OFFSET_MS);
    } else if (typeof raw === 'string') {
      // Accept ISO, remove dots only if not ISO
      const cleaned = raw.includes('T')
        ? raw.trim()
        : raw.trim().replace(/\./g, ':');
      const parsed = new Date(cleaned);
      if (!isNaN(parsed.getTime())) {
        jsDate = new Date(parsed.getTime() - IST_OFFSET_MS);
      }
    }

    return jsDate && !isNaN(jsDate.getTime()) && jsDate.getFullYear() >= 2000
      ? Timestamp.fromDate(jsDate)
      : null;
  } catch (err) {
    console.error('❌ Failed to parse timestamp:', raw, err);
    return null;
  }
};

export const convertToISTString = (firebaseTimestamp) => {
  if (!firebaseTimestamp) return 'N/A';
  const utc =
    firebaseTimestamp instanceof Date
      ? firebaseTimestamp
      : firebaseTimestamp.toDate();
  const ist = new Date(utc.getTime() + IST_OFFSET_MS);
  return ist.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
};

// ───── ID Generator ───────────────────────────────────────────────────────

export const generateDocId = (prefix, userId, timestamp) => {
  const date = new Date(timestamp);
  const pad = (n) => String(n).padStart(2, '0');
  return `${prefix}_${userId}_${date.getFullYear()}${pad(
    date.getMonth() + 1
  )}${pad(date.getDate())}_${pad(date.getHours())}${pad(
    date.getMinutes()
  )}${pad(date.getSeconds())}`;
};

// ───── Data Upload (Excel → Firestore) ─────────────────────────────────────

export const uploadPumpData = async (arrayBuffer) => {
  const userId = '2NgUdjPSfjVvBJnmEp3CkvoKkMo1';

  try {
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const rows = XLSX.utils.sheet_to_json(
      workbook.Sheets[workbook.SheetNames[0]],
      { raw: false }
    );

    if (!rows.length)
      return alertWithMessage(
        '⚠️ Empty sheet',
        'The selected file has no data.'
      );

    const cgmDocs = [];
    const insulinDocs = [];

    rows.forEach((row) => {
      const timestamp = parseTimestamp(row.timestamp);
      if (!timestamp) return;

      const date = timestamp.toDate();
      const glucose = parseFloat(row['glucose_mg/dL']);
      const bolus = parseFloat(row['bolus_insulin_U'] || 0);
      const basal = parseFloat(row['basal_insulin_U'] || 0);
      const carbs = parseFloat(row['carb_input_g'] || 0);
      const food = String(row['food_intake'] || 'No food taken');

      if (!isNaN(glucose)) {
        cgmDocs.push({
          log_id: generateDocId('cgm', userId, date),
          user_id: userId,
          timestamp,
          glucose,
        });
      }

      if (bolus || basal || carbs || food) {
        insulinDocs.push({
          log_id: generateDocId('insulin', userId, date),
          user_id: userId,
          timestamp,
          bolus,
          basal_rate: basal,
          carb_input: carbs,
          food_intake: food,
          calories: 0,
        });
      }
    });

    const uploadPromises = [
      cgmDocs.length && addMultipleCgmLogs(cgmDocs),
      insulinDocs.length && addMultipleInsulinLogs(insulinDocs),
    ].filter(Boolean);

    if (uploadPromises.length) {
      await Promise.all(uploadPromises);
      alertWithMessage(
        '✅ Upload Success',
        `${cgmDocs.length} CGM and ${insulinDocs.length} insulin entries uploaded.`
      );
    } else {
      alertWithMessage(
        '⚠️ No valid entries found',
        'Please check your file content.'
      );
    }

    alertWithMessage(
      '✅ Preview Complete',
      `${cgmDocs.length} CGM and ${insulinDocs.length} insulin entries parsed (not uploaded).`
    );
  } catch (err) {
    console.error('❌ uploadPumpData error:', err);
    alertWithMessage(
      '❌ Upload Failed',
      err.message || 'Error reading Excel file.'
    );
  }
};

// ───── PDF Document Upload ────────────────────────────────────────────────

export const pickDocument = async (
  userId,
  docType,
  setReports,
  setProgressMessage
) => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
      multiple: true,
    });

    if (result.canceled || !result.assets?.length) return;

    const assets = [...result.assets];
    const reports = [];
    let completed = 0;
    const total = assets.length;
    const MAX_CONCURRENT = 3;

    const runNextUpload = async () => {
      if (!assets.length) return;
      const { name, uri } = assets.shift();
      const copiedUri = FileSystem.documentDirectory + name;

      await FileSystem.copyAsync({ from: uri, to: copiedUri });

      const fileUrl = await uploadToSecondaryStorage({ name, uri: copiedUri });

      if (userId && fileUrl) {
        const meta = {
          file_name: name,
          file_url: fileUrl,
          file_type: docType.toLowerCase(),
          uploaded_at: new Date().toISOString(),
        };

        await addVaultFile(userId, meta);
        reports.push({
          id: Date.now() + Math.random(),
          name,
          uri: fileUrl,
          time: new Date().toISOString(), // ✅ Fixes invalid date
        });
      }

      completed++;
      setProgressMessage?.(`Uploading ${completed} of ${total}...`);
      return runNextUpload();
    };

    await Promise.all(
      Array.from(
        { length: Math.min(MAX_CONCURRENT, assets.length) },
        runNextUpload
      )
    );
    setReports((prev) => [...reports, ...prev]);
    setProgressMessage?.('✅ All files uploaded!');
  } catch (err) {
    console.error('❌ Error uploading:', err);
    alertWithMessage('Upload failed', 'Something went wrong.');
    setProgressMessage?.('');
  }
};

// ───── File Open Handler ──────────────────────────────────────────────────

export const openReport = async (uri) => {
  try {
    if (Platform.OS === 'android') {
      const contentUri = await FileSystem.getContentUriAsync(uri);
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: contentUri,
        type: 'application/pdf',
        flags: 1,
      });
    } else {
      alertWithMessage('Notice', 'Only Android supported right now in Expo Go');
    }
  } catch (err) {
    console.error('Error opening PDF:', err);
    alertWithMessage('Could not open PDF', 'Try again.');
  }
};
export const checkAndSyncFitbit = async () => {
  console.log("inside checkAndSyncFitbit")
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const user = await getUser(userId);
    if (user?.fitbit_permission) {
      console.log('✅ Fitbit permission enabled. Syncing activity...');
      await syncFitbitActivity(); // call your sync function
    } else {
      console.log('🚫 Fitbit permission not granted.');
    }
  } catch (error) {
    console.error('❌ Error while checking Fitbit permission:', error);
  }
};

export const syncFitbitActivity = async () => {
  console.log("inside syncFitbitActivity");

  const attemptSync = async (user, accessToken) => {
    const userId = user.user_id;
    const tracking = await getUserTracking(userId);
    if (!tracking) {
      console.error('❌ Tracking data not found');
      return;
    }

    const startTime = tracking.last_tracked_fitbit?.toDate?.() || new Date(Date.now() - 24 * 60 * 60 * 1000);
    const endTime = new Date();

    console.log('🔁 Syncing Fitbit data from', startTime, 'to', endTime);

    const activityLogs = [];
    let current = new Date(startTime);

    while (current <= endTime) {
      const dateStr = current.toISOString().split('T')[0];

      const stepsUrl = `https://api.fitbit.com/1/user/-/activities/steps/date/${dateStr}/1d/15min.json`;
      const hrUrl = `https://api.fitbit.com/1/user/-/activities/heart/date/${dateStr}/1d/15min.json`;

      console.log('📡 Fetching:', stepsUrl);

      const [stepsRes, hrRes] = await Promise.all([
        fetch(stepsUrl, { headers: { Authorization: `Bearer ${accessToken}` } }),
        fetch(hrUrl, { headers: { Authorization: `Bearer ${accessToken}` } }),
      ]);

      const stepsText = await stepsRes.text();
      const hrText = await hrRes.text();

      if (!stepsRes.ok || !hrRes.ok) {
        if (stepsText.includes('expired_token') || hrText.includes('expired_token')) {
          throw new Error('expired_token');
        } else {
          console.error('❌ Fitbit API error:', stepsText, hrText);
          return;
        }
      }

      const stepsData = JSON.parse(stepsText);
      const hrData = JSON.parse(hrText);

      const stepsArray = stepsData['activities-steps-intraday']?.dataset || [];
      const hrArray = hrData['activities-heart-intraday']?.dataset || [];

      const lastTracked = new Date(startTime);

      stepsArray.forEach((stepEntry) => {
        const entryTime = new Date(`${dateStr}T${stepEntry.time}`);
        if (entryTime <= lastTracked) return;

        const hrEntry = hrArray.find((h) => h.time === stepEntry.time);

        activityLogs.push({
          user_id: userId,
          timestamp: entryTime,
          steps: stepEntry.value,
          heart_rate: hrEntry?.value || null,
          distance_km: 0,
        });
      });

      current.setDate(current.getDate() + 1);
    }

    if (activityLogs.length === 0) {
      console.warn('⚠️ No new activity logs to save.');
    } else {
      let previousSteps = null;
      const filteredLogs = activityLogs
        .sort((a, b) => a.timestamp - b.timestamp)
        .map((log) => {
          const step_difference =
            previousSteps !== null ? log.steps - previousSteps : 0;
          previousSteps = log.steps;
          return {
            ...log,
            step_difference,
            log_id: generateDocId('log', log.user_id, log.timestamp),
          };
        });

      console.log(`📝 Adding ${filteredLogs.length} logs with IDs.`);
      await addMultipleActivityLogs(filteredLogs);
      console.log('✅ Logs added to Firestore');
    }

    await updateLastTrackedFitbit(endTime);
    console.log('📌 Updated last_tracked_fitbit to', endTime);
  };

  try {
    const userId = auth.currentUser?.uid;
    const user = await getUser(userId);

    if (!user || !user.fitbit_permission) {
      console.log('🚫 Fitbit permission not granted.');
      return;
    }

    try {
      await attemptSync(user, user.fitbit_access_token);
    } catch (error) {
      if (error.message === 'expired_token') {
        console.warn('🔁 Token expired. Attempting refresh...');
        const refreshed = await refreshFitbitToken(
          user.fitbit_refresh_token,
          '23QCBZ',
          '42bec6569e773ad9b0c1c163d5764a25'
        );
        const updated = {
          fitbit_access_token: refreshed.access_token,
          fitbit_refresh_token: refreshed.refresh_token,
          fitbit_expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
        };
        await updateUser(userId, updated);
        console.log('✅ Token refreshed. Retrying sync...');
        await attemptSync({ ...user, ...updated }, refreshed.access_token);
      } else {
        console.error('❌ Unexpected error during sync:', error);
      }
    }
  } catch (error) {
    console.error('❌ syncFitbitActivity failed:', error);
  }
};
// export const syncFitbitActivity = async () => {
//   console.log("inside syncFitbitActivity")
//   try {
//     const userId = getActiveUserId();
//     const user = await getUser(userId);
//     const tracking = await getUserTracking(userId);

//     if (!user || !tracking) {
//       console.error('❌ User or tracking data not found');
//       return;
//     }

//     const accessToken = user.fitbit_access_token;
//     const startTime =
//       tracking.last_tracked_fitbit?.toDate?.() ||
//       new Date(Date.now() - 24 * 60 * 60 * 1000);
//     const endTime = new Date();

//     console.log('🔁 Syncing Fitbit data from', startTime, 'to', endTime);

//     const activityLogs = [];
//     let current = new Date(startTime);

//     while (current <= endTime) {
//       const dateStr = current.toISOString().split('T')[0];

//       const stepsUrl = `https://api.fitbit.com/1/user/-/activities/steps/date/${dateStr}/1d/15min.json`;
//       const hrUrl = `https://api.fitbit.com/1/user/-/activities/heart/date/${dateStr}/1d/15min.json`;

//       console.log('📡 Fetching:', stepsUrl);

//       const [stepsRes, hrRes] = await Promise.all([
//         fetch(stepsUrl, {
//           headers: { Authorization: `Bearer ${accessToken}` },
//         }),
//         fetch(hrUrl, { headers: { Authorization: `Bearer ${accessToken}` } }),
//       ]);

//       if (!stepsRes.ok || !hrRes.ok) {
//         console.error(
//           '❌ Fitbit API error:',
//           await stepsRes.text(),
//           await hrRes.text()
//         );
//         break;
//       }

//       const stepsData = await stepsRes.json();
//       const hrData = await hrRes.json();

//       const stepsArray = stepsData['activities-steps-intraday']?.dataset || [];
//       const hrArray = hrData['activities-heart-intraday']?.dataset || [];

//       const lastTracked = new Date(startTime);

//       stepsArray.forEach((stepEntry) => {
//         const entryTime = new Date(`${dateStr}T${stepEntry.time}`);
//         if (entryTime <= lastTracked) return; // Skip old

//         const hrEntry = hrArray.find((h) => h.time === stepEntry.time);

//         activityLogs.push({
//           user_id: userId,
//           timestamp: entryTime,
//           steps: stepEntry.value,
//           heart_rate: hrEntry?.value || null,
//           distance_km: 0, // Optional: calculate from steps if desired
//         });
//       });

//       current.setDate(current.getDate() + 1);
//     }

//     if (activityLogs.length === 0) {
//       console.warn('⚠️ No new activity logs to save.');
//     } else {
//       // Sort and compute step difference
//       let previousSteps = null;
//       const filteredLogs = activityLogs
//         .sort((a, b) => a.timestamp - b.timestamp)
//         .map((log) => {
//           const step_difference =
//             previousSteps !== null ? log.steps - previousSteps : 0;
//           previousSteps = log.steps;
//           return {
//             ...log,
//             step_difference,
//             log_id: generateDocId('log', log.user_id, log.timestamp),
//           };
//         });

//       console.log(`📝 Adding ${filteredLogs.length} logs with IDs.`);
//       await addMultipleActivityLogs(filteredLogs);
//       console.log('✅ Logs added to Firestore');
//     }

//     await updateLastTrackedFitbit(endTime);
//     console.log('📌 Updated last_tracked_fitbit to', endTime);
//   } catch (error) {
//     console.error('❌ syncFitbitActivity failed:', error);
//   }
// };

// import * as DocumentPicker from 'expo-document-picker';
// import * as FileSystem from 'expo-file-system';
// import * as IntentLauncher from 'expo-intent-launcher';
// import {uploadToSecondaryStorage} from './firebaseStroage';
// import { Alert } from 'react-native';
// import {addVaultFile} from './vaultService';
// import { auth } from './authHandler';
// import * as XLSX from 'xlsx';
// import { addMultipleCgmLogs } from './cgmService';
// import { addMultipleInsulinLogs } from './insulinService';
// import { firebase } from '../../firebase'; // or correct relative path
// const { Timestamp } = firebase.firestore;

// export const parseTimestamp = (raw) => {
//   if (!raw) return null;

//   let jsDate = null;

//   // ✅ Handle Excel serial number (numeric)
//   if (typeof raw === 'number') {
//     if (raw < 10000) return null; // Ignore invalid values

//     const excelEpoch = new Date(Date.UTC(1899, 11, 30));
//     const localDate = new Date(excelEpoch.getTime() + raw * 86400 * 1000);

//     console.log("📥 Raw Excel value:", raw);
//     console.log("📆 Local (Excel) Date:", localDate.toString());

//     // 🔁 Convert IST → UTC
//     jsDate = new Date(localDate.getTime() - (5.5 * 60 * 60 * 1000));

//     console.log("🕓 Final UTC Date (saved to Firestore):", jsDate.toISOString());
//   }

//   // ✅ Handle JS Date object
//   else if (raw instanceof Date) {
//     jsDate = new Date(raw.getTime() - (5.5 * 60 * 60 * 1000));
//   }

//   // ✅ Handle displayed strings (formatted by Excel or user)
//   else if (typeof raw === 'string') {
//     const cleaned = raw.trim().replace(/\./g, ':'); // Convert 23.45.00 to 23:45:00
//     const parsed = new Date(cleaned);

//     if (!isNaN(parsed.getTime())) {
//       jsDate = new Date(parsed.getTime() - (5.5 * 60 * 60 * 1000));
//     } else {
//       console.warn("❌ Invalid string date:", raw);
//     }
//   }

//   // ✅ Final sanity check
//   if (!(jsDate instanceof Date) || isNaN(jsDate.getTime()) || jsDate.getFullYear() < 2000) {
//     console.warn("❌ Invalid parsed date:", jsDate);
//     return null;
//   }

//   return Timestamp.fromDate(jsDate); // ✅ Firestore-compatible
// };

// // 🔧 Generate log ID like: cgm_user_20240504_111258
// export const generateDocId = (prefix, userId, timestamp) => {
//   const date = new Date(timestamp);
//   // date.toDate();
//   const pad = (n) => String(n).padStart(2, '0');
//   return `${prefix}_${userId}_${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}_${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
// };

// // ✅ Upload Pump Data from Excel
// export const uploadPumpData = async (arrayBuffer) => {
//   console.log("📥 Inside uploadPumpData");
//   const userId = '2NgUdjPSfjVvBJnmEp3CkvoKkMo1';

//   try {
//     const workbook = XLSX.read(arrayBuffer, { type: 'array' });
//     const sheet = workbook.Sheets[workbook.SheetNames[0]];

//     // ✅ Use raw: false to get displayed values from Excel
//     const rows = XLSX.utils.sheet_to_json(sheet, { raw: false });

//     if (!rows.length) {
//       Alert.alert('⚠️ Empty sheet', 'The selected file has no data.');
//       return;
//     }

//     const cgmDocs = [];
//     const insulinDocs = [];

//     rows.forEach((row, index) => {
//       //console.log("timestamp ",row.timestamp)
//       const parsedTimestamp = parseTimestamp(row.timestamp);

//       if (!(parsedTimestamp instanceof Timestamp)) {
//         console.warn(`⚠️ Skipping row ${index + 1}: Invalid timestamp`, row.timestamp);
//         return;
//       }

//       const jsDate = parsedTimestamp.toDate();
//       const logIdCgm = generateDocId('cgm', userId, jsDate);
//       const logIdInsulin = generateDocId('insulin', userId, jsDate);
//       //console.log("parsed timestamp ",parsedTimestamp," logIDInsulin ",logIdInsulin)
//       // ✅ CGM log
//       const glucoseValue = parseFloat(row['glucose_mg/dL']);
//       if (!isNaN(glucoseValue)) {
//         cgmDocs.push({
//           log_id: logIdCgm,
//           user_id: userId,
//           timestamp: parsedTimestamp,
//           glucose: glucoseValue,
//         });
//       }

//       // ✅ Insulin log
//       const bolus = parseFloat(row['bolus_insulin_U'] || 0);
//       const basal = parseFloat(row['basal_insulin_U'] || 0);
//       const carbs = parseFloat(row['carb_input_g'] || 0);
//       const food = String(row['food_intake'] || 'No food taken');

//       if (bolus || basal || carbs || food) {
//         insulinDocs.push({
//           log_id: logIdInsulin,
//           user_id: userId,
//           timestamp: parsedTimestamp,
//           bolus,
//           basal_rate: basal,
//           carb_input: carbs,
//           food_intake: food,
//           calories: 0,
//         });
//       }
//     });

//     console.log("✅ Parsed", cgmDocs.length, "CGM logs and", insulinDocs.length, "insulin logs");

//     // 🔒 Commented out for now — Firestore upload

//     if (cgmDocs.length || insulinDocs.length) {
//       await Promise.all([
//         cgmDocs.length ? addMultipleCgmLogs(cgmDocs) : Promise.resolve(),
//         insulinDocs.length ? addMultipleInsulinLogs(insulinDocs) : Promise.resolve(),
//       ]);

//       Alert.alert(
//         '✅ Upload Success',
//         `${cgmDocs.length} CGM and ${insulinDocs.length} insulin entries uploaded.`
//       );
//     } else {
//       Alert.alert('⚠️ No valid entries found', 'Please check your file content.');
//     }

//     // ✅ Just notify how many were parsed
//     Alert.alert(
//       '✅ Preview Complete',
//       `${cgmDocs.length} CGM and ${insulinDocs.length} insulin entries parsed (not uploaded).`
//     );

//   } catch (err) {
//     console.error('❌ uploadPumpData error:', err);
//     Alert.alert('❌ Upload Failed', err.message || 'Error reading Excel file.');
//   }
// };

// export const convertToISTString = (firebaseTimestamp) => {
//   if (!firebaseTimestamp) return 'N/A';

//   const utcDate = firebaseTimestamp instanceof Date
//     ? firebaseTimestamp
//     : firebaseTimestamp.toDate();

//   const istOffsetMs = 5.5 * 60 * 60 * 1000;
//   const istDate = new Date(utcDate.getTime() + istOffsetMs);

//   return istDate.toLocaleString('en-IN', {
//     timeZone: 'Asia/Kolkata',
//     year: 'numeric',
//     month: 'short',
//     day: 'numeric',
//     hour: '2-digit',
//     minute: '2-digit',
//     second: '2-digit',
//     hour12: true, // change to false for 24-hour format
//   });
// };

// export const pickDocument = async (docType, setReports, setProgressMessage) => {
//   console.log("inside pick document")
//   const MAX_CONCURRENT = 3;

//   try {
//     const result = await DocumentPicker.getDocumentAsync({
//       type: 'application/pdf',
//       copyToCacheDirectory: true,
//       multiple: true,
//     });

//     if (!result.canceled && result.assets?.length > 0) {
//       const assets = [...result.assets];
//       const total = assets.length;
//       let completed = 0;
//       const reports = [];

//       const runNextUpload = async () => {
//         if (assets.length === 0) return;

//         const asset = assets.shift();
//         const { name, uri } = asset;
//         const copiedUri = FileSystem.documentDirectory + name;

//         await FileSystem.copyAsync({ from: uri, to: copiedUri });

//         console.log(`📦 Uploading ${name}...`);
//         const fileUrl = await uploadToSecondaryStorage({ name, uri: copiedUri });
//         console.log()
//         const userId = auth.currentUser?.uid;
//         console.log("userId ",userId)
//         if (userId && fileUrl) {
//           const fileMeta = {
//             file_name: name,
//             file_url: fileUrl,
//             file_type: docType.toLowerCase(),
//             uploaded_at: new Date().toISOString(),
//           };

//           await addVaultFile(userId, fileMeta);
//           console.log('🗃️ File meta saved:', fileMeta);

//           reports.push({ id: Date.now() + Math.random(), name, uri: fileUrl });
//         }

//         completed++;
//         setProgressMessage?.(`Uploading ${completed} of ${total}...`);
//         return runNextUpload();
//       };

//       const pool = [];
//       for (let i = 0; i < Math.min(MAX_CONCURRENT, assets.length); i++) {
//         pool.push(runNextUpload());
//       }

//       await Promise.all(pool);

//       setReports((prev) => [...reports, ...prev]);
//       setProgressMessage?.('✅ All files uploaded!');
//     }
//   } catch (err) {
//     console.error('❌ Error uploading:', err);
//     Alert.alert('Upload failed', 'Something went wrong.');
//     setProgressMessage?.('');
//   }
// };

//  export const openReport = async (uri) => {
//   try {
//     if (Platform.OS === 'android') {
//       const contentUri = await FileSystem.getContentUriAsync(uri);
//       await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
//         data: contentUri,
//         type: 'application/pdf',
//         flags: 1,
//       });
//     } else {
//       Alert.alert('Only Android supported right now in Expo Go');
//     }
//   } catch (err) {
//     Alert.alert('Could not open PDF');
//     console.error('Error opening PDF:', err);
//   }
// };
