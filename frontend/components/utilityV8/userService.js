// 📂 userService.js
import { firebase, firestore as db } from '../../firebase';
import { auth } from '../utilityV8/authHandler';
import * as AuthSession from 'expo-auth-session';

const COLLECTION = 'Users';
const TRACKING_COLLECTION = 'User_Tracking';
const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp;

const ALLOWED_USER_FIELDS = [
  'email', 'name', 'phone', 'dob', 'gender', 'cgm_device_id',
  'therapy_type', 'fitbit_permission', 'fitbit_access_token',
  'fitbit_user_id', 'fitbit_scopes', 'fitbit_expires_at',
  'fitbit_refresh_token', 'profile_image_url'
];

export const getActiveUserId = () => {
  const uid = auth.currentUser?.uid || '2NgUdjPSfjVvBJnmEp3CkvoKkMo1';
  if (!uid) throw new Error('No active user');
  return uid;
};

const getNoonTimestamp = () => new Date(new Date().setHours(12, 0, 0, 0));

const updateDocWithTimestamp = async (collection, docId, updates) => {
  try {
    await db.collection(collection).doc(docId).update({
      ...updates,
      updated_at: serverTimestamp(),
    });
  } catch (error) {
    console.error(`❌ Failed to update ${collection}/${docId}:`, error);
    throw error;
  }
};

const setDocWithTimestamps = async (collection, docId, data) => {
  try {
    await db.collection(collection).doc(docId).set({
      ...data,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
  } catch (error) {
    console.error(`❌ Failed to set ${collection}/${docId}:`, error);
    throw error;
  }
};

const getDocById = async (collection, docId) => {
  try {
    const doc = await db.collection(collection).doc(docId).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  } catch (error) {
    console.error(`❌ Failed to get ${collection}/${docId}:`, error);
    return null;
  }
};

const deleteDocById = async (collection, docId) => {
  try {
    await db.collection(collection).doc(docId).delete();
  } catch (error) {
    console.error(`❌ Failed to delete ${collection}/${docId}:`, error);
    throw error;
  }
};

const queryDocsByField = async (collection, field, value) => {
  try {
    const snapshot = await db.collection(collection).where(field, '==', value).get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`❌ Error querying ${collection} by ${field}:`, error);
    return [];
  }
};

export const addUser = async (userObject, userId = getActiveUserId()) => {
  try {
    const existing = await queryDocsByField(COLLECTION, 'email', userObject.email);
    if (existing.length > 0) throw new Error('A user with this email already exists.');

    const userData = {
      user_id: userId,
      name: userObject.name,
      email: userObject.email,
      phone: userObject.phone || '',
      dob: userObject.dob || '',
      gender: userObject.gender || '',
      cgm_device_id: userObject.cgm_device_id || '',
      therapy_type: userObject.therapy_type || '',
      fitbit_permission: userObject.fitbit_permission || false,
      fitbit_access_token: userObject.fitbit_access_token || '',
      fitbit_refresh_token: userObject.fitbit_refresh_token || '',
      fitbit_user_id: userObject.fitbit_user_id || '',
      fitbit_scopes: userObject.fitbit_scopes || [],
      fitbit_expires_at: userObject.fitbit_expires_at || null,
      profile_image_url: userObject.profile_image_url || '',
    };

    const trackingData = {
      last_tracked_fitbit: getNoonTimestamp(),
      last_tracked_cgm: getNoonTimestamp(),
      last_trained: getNoonTimestamp(),
      last_predicted_bolus: getNoonTimestamp(),
    };

    await setDocWithTimestamps(COLLECTION, userId, userData);
    await setDocWithTimestamps(TRACKING_COLLECTION, userId, trackingData);
    console.log('✅ User and tracking data added.');
  } catch (error) {
    console.error('❌ addUser failed:', error);
    throw error;
  }
};

export const getUser = async (userId = getActiveUserId()) => {
  return await getDocById(COLLECTION, userId);
};

export const deleteUser = async (userId = getActiveUserId()) => {
  await deleteDocById(COLLECTION, userId);
  await deleteDocById(TRACKING_COLLECTION, userId);
};

export const updateUser = async (userId = getActiveUserId(), userObject) => {
  try {
    const updates = {};

    for (const field of ALLOWED_USER_FIELDS) {
      if (userObject[field] !== undefined) {
        updates[field] = userObject[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      throw new Error('No valid fields to update.');
    }

    if (updates.email !== undefined) {
      const existing = await queryDocsByField(COLLECTION, 'email', updates.email);
      const conflict = existing.find((doc) => doc.user_id !== userId);
      if (conflict) throw new Error('Another user already uses this email.');

      const currentUser = auth.currentUser;
      if (currentUser && currentUser.uid === userId && currentUser.email !== updates.email) {
        try {
          await currentUser.updateEmail(updates.email);
        } catch (error) {
          console.error('❌ Firebase Auth email update failed:', error);
          throw new Error('Failed to update Auth email. Please reauthenticate.');
        }
      }
    }

    console.log('🔄 Updating user with:', updates);
    await updateDocWithTimestamp(COLLECTION, userId, updates);
    console.log('✅ updateUser successful');
  } catch (error) {
    console.error('❌ updateUser error:', error);
    throw error;
  }
};

const validTrackingFields = [
  'last_tracked_fitbit', 'last_tracked_cgm', 'last_trained', 'last_predicted_bolus',
];

export const getUserTracking = async () => {
  try {
    const userId = getActiveUserId();
    const doc = await getDocById(TRACKING_COLLECTION, userId);
    console.log('For userId:', userId, 'doc:', doc);
    return doc;
  } catch (error) {
    console.error('❌ getUserTracking error:', error);
    return null;
  }
};

export const updateUserTracking = async (userId = getActiveUserId(), updates) => {
  try {
    const validUpdates = Object.keys(updates)
      .filter((key) => validTrackingFields.includes(key))
      .reduce((obj, key) => ({ ...obj, [key]: updates[key] }), {});

    if (Object.keys(validUpdates).length === 0) {
      throw new Error('No valid tracking fields provided for update');
    }

    await updateDocWithTimestamp(TRACKING_COLLECTION, userId, validUpdates);
    console.log('✅ updateUserTracking successful');
  } catch (error) {
    console.error('❌ updateUserTracking failed:', error);
    throw error;
  }
};

const updateUserTrackingField = async (fieldName, value) => {
  try {
    if (!validTrackingFields.includes(fieldName)) {
      throw new Error(`Invalid tracking field: ${fieldName}`);
    }
    const userId = getActiveUserId();
    await updateUserTracking(userId, { [fieldName]: value });
  } catch (error) {
    console.error(`❌ updateUserTrackingField (${fieldName}) failed:`, error);
    throw error;
  }
};

export const updateLastTrackedFitbit = async (date = new Date()) =>
  updateUserTrackingField('last_tracked_fitbit', date);

export const updateLastTrackedCGM = async (date = new Date()) =>
  updateUserTrackingField('last_tracked_cgm', date);

export const updateLastTrained = async (date = new Date()) =>
  updateUserTrackingField('last_trained', date);

export const updateLastPredictedBolus = async (date = new Date()) =>
  updateUserTrackingField('last_predicted_bolus', date);

// ─── Fitbit Token Refresh ─────────────────────
export const refreshFitbitToken = async (refreshToken, clientId, clientSecret) => {
  try {
    const creds = btoa(`${clientId}:${clientSecret}`);
    const res = await fetch('https://api.fitbit.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${creds}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `grant_type=refresh_token&refresh_token=${refreshToken}`
    });
    const result = await res.json();
    if (!result.access_token || !result.refresh_token) throw new Error('Token refresh failed');
    return result;
  } catch (error) {
    console.error('❌ Fitbit token refresh error:', error);
    throw error;
  }
};

// import { firebase, firestore as db } from '../../firebase';
// import { auth } from '../utilityV8/authHandler';
// import * as AuthSession from 'expo-auth-session';

// // ─── Constants ─────────────────────────────
// const COLLECTION = 'Users';
// const TRACKING_COLLECTION = 'User_Tracking';
// const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp;


// const ALLOWED_USER_FIELDS = [
//   'email', 'name', 'phone', 'dob', 'gender', 'cgm_device_id',
//   'therapy_type', 'fitbit_permission', 'fitbit_access_token',
//   'fitbit_user_id', 'fitbit_scopes', 'fitbit_expires_at',
//   'fitbit_refresh_token', 'profile_image_url' // ✅ added
// ];

// // ─── Helpers ───────────────────────────────
// export const getActiveUserId = () => {
//   const uid = auth.currentUser?.uid || '2NgUdjPSfjVvBJnmEp3CkvoKkMo1';
//   if (!uid) throw new Error('No active user');
//   return uid;
// };

// const getNoonTimestamp = () => new Date(new Date().setHours(12, 0, 0, 0));

// const updateDocWithTimestamp = async (collection, docId, updates) => {
//   try {
//     await db.collection(collection).doc(docId).update({
//       ...updates,
//       updated_at: serverTimestamp(),
//     });
//   } catch (error) {
//     console.error(`❌ Failed to update ${collection}/${docId}:`, error);
//     throw error;
//   }
// };

// const setDocWithTimestamps = async (collection, docId, data) => {
//   try {
//     await db.collection(collection).doc(docId).set({
//       ...data,
//       created_at: serverTimestamp(),
//       updated_at: serverTimestamp(),
//     });
//   } catch (error) {
//     console.error(`❌ Failed to set ${collection}/${docId}:`, error);
//     throw error;
//   }
// };

// const getDocById = async (collection, docId) => {
//   try {
//     const doc = await db.collection(collection).doc(docId).get();
//     return doc.exists ? { id: doc.id, ...doc.data() } : null;
//   } catch (error) {
//     console.error(`❌ Failed to get ${collection}/${docId}:`, error);
//     return null;
//   }
// };

// const deleteDocById = async (collection, docId) => {
//   try {
//     await db.collection(collection).doc(docId).delete();
//   } catch (error) {
//     console.error(`❌ Failed to delete ${collection}/${docId}:`, error);
//     throw error;
//   }
// };

// const queryDocsByField = async (collection, field, value) => {
//   try {
//     const snapshot = await db.collection(collection).where(field, '==', value).get();
//     return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//   } catch (error) {
//     console.error(`❌ Error querying ${collection} by ${field}:`, error);
//     return [];
//   }
// };

// // ─── User Management ───────────────────────
// export const addUser = async (userObject, userId = getActiveUserId()) => {
//   try {
//     const existing = await queryDocsByField(COLLECTION, 'email', userObject.email);
//     if (existing.length > 0) throw new Error('A user with this email already exists.');

//     const userData = {
//       user_id: userId,
//       name: userObject.name,
//       email: userObject.email,
//       phone: userObject.phone || '',
//       dob: userObject.dob || '',
//       gender: userObject.gender || '',
//       cgm_device_id: userObject.cgm_device_id || '',
//       therapy_type: userObject.therapy_type || '',
//       fitbit_permission: userObject.fitbit_permission || false,
//     };

//     const trackingData = {
//       last_tracked_fitbit: getNoonTimestamp(),
//       last_tracked_cgm: getNoonTimestamp(),
//       last_trained: getNoonTimestamp(),
//       last_predicted_bolus: getNoonTimestamp(),
//     };

//     await setDocWithTimestamps(COLLECTION, userId, userData);
//     await setDocWithTimestamps(TRACKING_COLLECTION, userId, trackingData);
//     console.log('✅ User and tracking data added.');
//   } catch (error) {
//     console.error('❌ addUser failed:', error);
//     throw error;
//   }
// };

// export const getUser = async (userId = getActiveUserId()) => {
//   return await getDocById(COLLECTION, userId);
// };

// export const deleteUser = async (userId = getActiveUserId()) => {
//   await deleteDocById(COLLECTION, userId);
//   await deleteDocById(TRACKING_COLLECTION, userId);
// };

// // ─── User Update ───────────────────────────
// export const updateUser = async (userId = getActiveUserId(), userObject) => {
//   try {
//     const updates = {};

//     // Step 1: Collect valid fields without updating yet
//     for (const field of ALLOWED_USER_FIELDS) {
//       if (userObject[field] !== undefined) {
//         updates[field] = userObject[field];
//       }
//     }

//     if (Object.keys(updates).length === 0) {
//       throw new Error('No valid fields to update.');
//     }

//     // Step 2: Handle email separately before touching Firestore
//     if (updates.email !== undefined) {
//       const existing = await queryDocsByField(COLLECTION, 'email', updates.email);
//       const conflict = existing.find((doc) => doc.user_id !== userId);
//       if (conflict) throw new Error('Another user already uses this email.');

//       const currentUser = auth.currentUser;
//       if (currentUser && currentUser.uid === userId && currentUser.email !== updates.email) {
//         try {
//           await currentUser.updateEmail(updates.email);
//         } catch (error) {
//           console.error('❌ Firebase Auth email update failed:', error);
//           throw new Error('Failed to update Auth email. Please reauthenticate.');
//         }
//       }
//     }

//     // Step 3: All validations passed → now update Firestore
//     console.log('🔄 Updating user with:', updates);
//     await updateDocWithTimestamp(COLLECTION, userId, updates);
//     console.log('✅ updateUser successful');
//   } catch (error) {
//     console.error('❌ updateUser error:', error);
//     throw error; // ensure parent component knows it failed
//   }
// };

// // ─── User Tracking ─────────────────────────
// const validTrackingFields = [
//   'last_tracked_fitbit', 'last_tracked_cgm', 'last_trained', 'last_predicted_bolus',
// ];

// export const getUserTracking = async () => {
//   try {
//     const userId = getActiveUserId();
//     const doc= await getDocById(TRACKING_COLLECTION, userId);
//     console.log("For userId: ",userId," doc: ",doc)
//     return doc;
//   } catch (error) {
//     console.error('❌ getUserTracking error:', error);
//     return null;
//   }
// };

// export const updateUserTracking = async (userId = getActiveUserId(), updates) => {
//   try {
//     const validUpdates = Object.keys(updates)
//       .filter((key) => validTrackingFields.includes(key))
//       .reduce((obj, key) => ({ ...obj, [key]: updates[key] }), {});

//     if (Object.keys(validUpdates).length === 0) {
//       throw new Error('No valid tracking fields provided for update');
//     }

//     await updateDocWithTimestamp(TRACKING_COLLECTION, userId, validUpdates);
//     console.log('✅ updateUserTracking successful');
//   } catch (error) {
//     console.error('❌ updateUserTracking failed:', error);
//     throw error;
//   }
// };

// const updateUserTrackingField = async (fieldName, value) => {
//   try {
//     if (!validTrackingFields.includes(fieldName)) {
//       throw new Error(`Invalid tracking field: ${fieldName}`);
//     }
//     const userId = getActiveUserId();
//     await updateUserTracking(userId, { [fieldName]: value });
//   } catch (error) {
//     console.error(`❌ updateUserTrackingField (${fieldName}) failed:`, error);
//     throw error;
//   }
// };

// export const updateLastTrackedFitbit = async (date = new Date()) =>
//   updateUserTrackingField('last_tracked_fitbit', date);

// export const updateLastTrackedCGM = async (date = new Date()) =>
//   updateUserTrackingField('last_tracked_cgm', date);

// export const updateLastTrained = async (date = new Date()) =>
//   updateUserTrackingField('last_trained', date);

// export const updateLastPredictedBolus = async (date = new Date()) =>
//   updateUserTrackingField('last_predicted_bolus', date);

// // ─── Fitbit Auth Integration ─────────────────────────────────────────────


// // import {firebase ,firestore as db}from '../../firebase';
// // import { auth } from '../utilityV8/authHandler';

// // //const db = firebase.firestore();
// // const COLLECTION = 'Users';
// // const TRACKING_COLLECTION = 'User_Tracking';
// // const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp;
// // const userId = '2NgUdjPSfjVvBJnmEp3CkvoKkMo1';

// // import * as AuthSession from 'expo-auth-session';

// // const CLIENT_ID = 'YOUR_CLIENT_ID';
// // const REDIRECT_URI = AuthSession.makeRedirectUri(); // ✅ for Expo
// // const SCOPES = ['activity', 'heartrate', 'sleep', 'profile'];

// // export const handleFitbitAuthAndSave = async () => {
// //   const user = auth.currentUser;
// //   if (!user) throw new Error('User not authenticated');

// //   const userId = user.uid;

// //   const authUrl = `https://www.fitbit.com/oauth2/authorize?response_type=token&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${SCOPES.join('%20')}`;

// //   const result = await AuthSession.startAsync({ authUrl });

// //   if (result.type === 'success' && result.params.access_token) {
// //     const accessToken = result.params.access_token;

// //     // Optional: get Fitbit userId using profile API
// //     const profile = await fetch('https://api.fitbit.com/1/user/-/profile.json', {
// //       headers: {
// //         Authorization: `Bearer ${accessToken}`,
// //       },
// //     }).then((res) => res.json());

// //     const fitbitUserId = profile?.user?.encodedId || '';

// //     // Update Users collection
// //     await updateUser(userId, {
// //       fitbit_permission: true,
// //       fitbit_access_token: accessToken,
// //       fitbit_user_id: fitbitUserId,
// //       fitbit_scopes: SCOPES,
// //     });

// //     return { success: true, message: 'Fitbit linked and user updated.' };
// //   } else {
// //     return { success: false, message: 'Fitbit permission denied or cancelled.' };
// //   }
// // };


// // const setDocWithTimestamps = async (collection, docId, data) => {
// //   if (!collection || !docId || !data) throw new Error('Invalid args to setDocWithTimestamps');
// //   await db.collection(collection).doc(docId).set({
// //     ...data,
// //     created_at: serverTimestamp(),
// //     updated_at: serverTimestamp(),
// //   });
// // };

// // const updateDocWithTimestamp = async (collection, docId, updates) => {
// //   await db.collection(collection).doc(docId).update({
// //     ...updates,
// //     updated_at: serverTimestamp(),
// //   });
// // };

// // const getDocById = async (collection, docId) => {
// //   const doc = await db.collection(collection).doc(docId).get();
// //   return doc.exists ? { id: doc.id, ...doc.data() } : null;
// // };

// // const deleteDocById = async (collection, docId) => {
// //   await db.collection(collection).doc(docId).delete();
// // };

// // const queryDocsByField = async (collection, field, value) => {
// //   try {
// //     const snapshot = await db.collection(collection).where(field, '==', value).get();
// //     return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
// //   } catch (error) {
// //     console.error(`Error querying ${collection} by ${field}:`, error);
// //     return [];
// //   }
// // };

// // const getNoonTimestamp = () => {
// //   const now = new Date();
// //   return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
// // };

// // // ✅ Add User + Tracking
// // export const addUser = async (userObject, userId) => {
// //   console.log('🟢 addUser called with:', userObject);

// //   const existing = await queryDocsByField(COLLECTION, 'email', userObject.email);
// //   if (existing.length > 0) throw new Error('A user with this email already exists.');

// //   const userData = {
// //     user_id: userId,
// //     name: userObject.name,
// //     email: userObject.email,
// //     phone: userObject.phone || '',
// //     dob: userObject.dob || '',
// //     gender: userObject.gender || '',
// //     cgm_device_id: userObject.cgm_device_id || '',
// //     therapy_type: userObject.therapy_type || '', // 💉 New field
// //     fitbit_permission: userObject.fitbit_permission || false,
// //   };

// //   const noon = getNoonTimestamp();

// //   const trackingData = {
// //     last_tracked_fitbit: noon,
// //     last_tracked_cgm: noon,
// //     last_trained: noon,
// //     last_predicted_bolus:noon
// //   };

// //   await setDocWithTimestamps(COLLECTION, userId, userData);
// //   await setDocWithTimestamps(TRACKING_COLLECTION, userId, trackingData);

// //   console.log('✅ User and tracking profile created successfully.');
// // };

// // // ✅ Get User
// // export const getUser = async (userId) => {
// //   return await getDocById(COLLECTION, userId);
// // };

// // export const getUserTracking = async () => {
// //   //const userId = auth.currentUser?.uid||'2NgUdjPSfjVvBJnmEp3CkvoKkMo1';
  
// //   console.log("inside get User Tracking")
// //   try{
// //     const doc= await getDocById(TRACKING_COLLECTION, userId);
// //     console.log("usertracking ",doc);
// //     return doc;
// //     }
// //     catch(error){
// //       consol.log("error",error)
// //     }
  
// //   return null;
// // };

// // // Fields that can be updated in Firestore
// // const ALLOWED_USER_FIELDS = [
// //   'email',
// //   'name',
// //   'phone',
// //   'dob',
// //   'gender',
// //   'cgm_device_id',
// //   'therapy_type',
// //   'fitbit_permission',
// //   'fitbit_access_token',
// //   'fitbit_user_id',
// //   'fitbit_scopes',
// //   'fitbit_expires_at',       // ✅ Add if you store expiry
// //   'fitbit_refresh_token',    // ✅ Add if you use code flow
// // ];

// // export const updateUser = async (userId, userObject) => {
// //   const updates = {};

// //   for (const field of ALLOWED_USER_FIELDS) {
// //     if (userObject[field] !== undefined) {
// //       updates[field] = userObject[field];
// //     }
// //   }

// //   // Special case: handle Auth email update
// //   if (userObject.email !== undefined) {
// //     const existing = await queryDocsByField(COLLECTION, 'email', userObject.email);
// //     const conflict = existing.find((doc) => doc.user_id !== userId);
// //     if (conflict) throw new Error('Another user already uses this email.');

// //     const currentUser = auth.currentUser;
// //     if (currentUser && currentUser.uid === userId && currentUser.email !== userObject.email) {
// //       try {
// //         await currentUser.updateEmail(userObject.email);
// //       } catch (error) {
// //         console.error('❌ Firebase Auth email update failed:', error);
// //         throw new Error('Failed to update Auth email. Please reauthenticate.');
// //       }
// //     }
// //   }

// //   if (Object.keys(updates).length === 0) {
// //     throw new Error('No valid fields to update.');
// //   }

// //   await updateDocWithTimestamp(COLLECTION, userId, updates);
// // };

// // // // ✅ Update User
// // // export const updateUser = async (userId, userObject) => {
// // //   const updates = {};

// // //   if (userObject.email !== undefined) {
// // //     const existing = await queryDocsByField(COLLECTION, 'email', userObject.email);
// // //     const conflict = existing.find((doc) => doc.user_id !== userId);
// // //     if (conflict) throw new Error('Another user already uses this email.');

// // //     const currentUser = auth.currentUser;
// // //     if (currentUser && currentUser.uid === userId) {
// // //       try {
// // //         await currentUser.updateEmail(userObject.email);
// // //       } catch (error) {
// // //         console.error('❌ Firebase Auth email update failed:', error);
// // //         throw new Error('Failed to update Auth email. Please reauthenticate.');
// // //       }
// // //     }

// // //     updates.email = userObject.email;
// // //   }

// // //   if (userObject.name !== undefined) updates.name = userObject.name;
// // //   if (userObject.phone !== undefined) updates.phone = userObject.phone;
// // //   if (userObject.dob !== undefined) updates.dob = userObject.dob;
// // //   if (userObject.gender !== undefined) updates.gender = userObject.gender;
// // //   if (userObject.cgm_device_id !== undefined) updates.cgm_device_id = userObject.cgm_device_id;
// // //   if (userObject.therapy_type !== undefined) updates.therapy_type = userObject.therapy_type; // ✅ Add this line
// // //   if (userObject.fitbit_permission !== undefined) updates.fitbit_permission = userObject.fitbit_permission;

// // //   await updateDocWithTimestamp(COLLECTION, userId, updates);
// // // };

// // // ✅ Update multiple tracking fields
// // export const updateUserTracking = async (userId, trackingUpdates) => {
// //   if (!trackingUpdates || Object.keys(trackingUpdates).length === 0) {
// //     throw new Error('No updates provided for user tracking');
// //   }

// //   const validFields = [
// //     'last_tracked_fitbit',
// //     'last_tracked_cgm',
// //     'last_trained',
// //     'last_predicted_bolus',
// //   ];

// //   const updates = {};
// //   for (const key of validFields) {
// //     if (trackingUpdates[key] !== undefined) {
// //       updates[key] = trackingUpdates[key];
// //     }
// //   }

// //   if (Object.keys(updates).length === 0) {
// //     throw new Error('No valid tracking fields provided for update');
// //   }

// //   await updateDocWithTimestamp('User_Tracking', userId, updates);
// // };

// // // ✅ Generic single field updater
// // export const updateUserTrackingField = async (fieldName, value) => {
// //   const validFields = [
// //     'last_tracked_fitbit',
// //     'last_tracked_cgm',
// //     'last_trained',
// //     'last_predicted_bolus',
// //   ];

// //   if (!validFields.includes(fieldName)) {
// //     throw new Error(`Invalid tracking field: ${fieldName}`);
// //   }

// //   await updateUserTracking(userId, { [fieldName]: value });
// // };

// // // ✅ Individual wrapper functions
// // export const updateLastTrackedFitbit = async (dateValue = new Date()) => {
// //   await updateUserTrackingField('last_tracked_fitbit', dateValue);
// // };

// // export const updateLastTrackedCGM = async (dateValue = new Date()) => {
// //   await updateUserTrackingField('last_tracked_cgm', dateValue);
// // };

// // export const updateLastTrained = async (dateValue = new Date()) => {
// //   await updateUserTrackingField('last_trained', dateValue);
// // };

// // export const updateLastPredictedBolus = async (dateValue ) => {
// //   await updateUserTrackingField('last_predicted_bolus', dateValue);
// // };


// // // ✅ Delete User
// // export const deleteUser = async (userId) => {
// //   await deleteDocById(COLLECTION, userId);
// //   await deleteDocById(TRACKING_COLLECTION, userId);
// // };

