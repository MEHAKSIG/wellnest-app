import firebase from 'firebase';        
import 'firebase/auth';
import 'firebase/storage';
import { auth } from '../utilityV8/authHandler';

const firebaseConfig = {
  apiKey: "AIzaSyCmGjqxOKbyixjXUUTf2yMuNuwF94lwSfA",
  authDomain: "goviam.firebaseapp.com",
  databaseURL: "https://goviam-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "goviam",
  storageBucket: "goviam.appspot.com",
  messagingSenderId: "46888798223",
  appId: "1:46888798223:web:d16a396237b0f3b5debb7a"
};

// Initialize secondary app only if not already initialized
let secondaryApp;
if (!firebase.apps.find((app) => app.name === 'StorageApp')) {
  secondaryApp = firebase.initializeApp(firebaseConfig, 'StorageApp');
} else {
  secondaryApp = firebase.app('StorageApp');
}

const storage = secondaryApp.storage();

export const uploadToSecondaryStorage = async (file) => {
  try {
    const userId = auth.currentUser?.uid || 'guest_user';

    const response = await fetch(file.uri);
    const blob = await response.blob();

    const filenameOnCloud = `${Date.now()}_${file.name}`;
    const fileRef = storage.ref(`vault/${userId}/${filenameOnCloud}`);

    console.log('📤 Uploading to Firebase Storage...');
    await fileRef.put(blob);

    const fileUrl = await fileRef.getDownloadURL();
    console.log('✅ Uploaded to storage:', fileUrl);

    return fileUrl;
  } catch (error) {
    console.error('❌ uploadToSecondaryStorage error:', error);
    throw error;
  }
};

// export const uploadToSecondaryStorage = async (file, fileType = 'general') => {
//   try {
//     const userId = auth.currentUser?.uid || 'guest_user';

//     const response = await fetch(file.uri);
//     const blob = await response.blob();

//     const filenameOnCloud = `${Date.now()}_${file.name}`;
//     const fileRef = storage.ref(`vault/${userId}/${filenameOnCloud}`);

//     // Upload to Firebase Storage
//     await fileRef.put(blob);

//     // Get public URL
//     const fileUrl = await fileRef.getDownloadURL();

//     // Prepare metadata
//     const fileMeta = {
//       file_url: fileUrl,
//       file_name: file.name,
//       file_type: fileType,
//       uploaded_at: new Date().toISOString(),
//     };

//     // Save metadata in primary Firestore
//     await addVaultFile(userId, fileMeta);

//     console.log('✅ File uploaded and metadata saved:', fileUrl);
//   } catch (error) {
//     console.error('❌ uploadToSecondaryStorage error:', error);
//     throw error;
//   }
// };