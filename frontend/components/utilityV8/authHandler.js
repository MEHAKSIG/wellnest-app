 import { auth } from '../../firebase'; 
// import {firebase} from '../../firebase.js';

// const auth = firebase.auth();
// 🛠️ Common wrapper for handling auth operations with try/catch
const handleAuthOperation = async (operationFn) => {
  try {
    const result = await operationFn();
    return { success: true, ...result };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ✅ Register new user
export const registerUser = async (email, password) => {
  return handleAuthOperation(async () => {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    return {
      user: userCredential.user,
      firebase_uid: userCredential.user.uid,
    };
  });
};

// ✅ Login existing user
export const loginUser = async (email, password) => {
  return handleAuthOperation(async () => {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    return { user: userCredential.user };
  });
};

// ✅ Logout
export const logoutUser = async () => {
  return handleAuthOperation(() => auth.signOut());
};

// ✅ Send password reset email
export const sendResetLink = async (email) => {
  return handleAuthOperation(() => auth.sendPasswordResetEmail(email));
};

// ✅ Send passwordless login link
export const sendEmailLink = async (email) => {
  const actionCodeSettings = {
    url: 'https://wellnest-ea82e.web.app/completeSignIn.html',
    handleCodeInApp: true,
  };

  return handleAuthOperation(() =>
    auth.sendSignInLinkToEmail(email, actionCodeSettings)
  );
};

// ✅ Complete passwordless login
export const completeEmailLinkSignIn = async (email, url) => {
  if (!auth.isSignInWithEmailLink(url)) {
    return { success: false, error: 'Invalid or missing sign-in link.' };
  }

  return handleAuthOperation(async () => {
    const result = await auth.signInWithEmailLink(email, url);
    return { user: result.user };
  });
};

export { auth };

// // authHandler.js (Firebase v8 syntax)
// import firebase from 'firebase';
// const auth = firebase.auth();

// // Register new user

// export const registerUser = async (email, password) => {
//   try {
//     const userCredential = await auth.createUserWithEmailAndPassword(email, password);
//     const firebaseUid = userCredential.user.uid;

//     return {
//       success: true,
//       user: userCredential.user,
//       firebase_uid: firebaseUid, // return UID
//     };
//   } catch (error) {
//     return { success: false, error: error.message };
//   }
// };

// // Login existing user
// export const loginUser = async (email, password) => {
//   try {
//     const userCredential = await auth.signInWithEmailAndPassword(email, password);
//     return { success: true, user: userCredential.user };
//   } catch (error) {
//     console.log(error.message);
//     return { success: false, error: error.message };
//   }
// };

// // Logout
// export const logoutUser = async () => {
//   try {
//     await auth.signOut();
//     return { success: true };
//   } catch (error) {
//     return { success: false, error: error.message };
//   }
// };

// // Send password reset email
// export const sendResetLink = async (email) => {
//   try {
//     await auth.sendPasswordResetEmail(email);
//     return { success: true };
//   } catch (error) {
//     return { success: false, error: error.message };
//   }
// };

// // Send email link for passwordless login
// export const sendEmailLink = async (email) => {
//   const actionCodeSettings = {
//     url: 'https://wellnest-ea82e.web.app/completeSignIn.html',
//     handleCodeInApp: true,
//   };

//   try {
//     await auth.sendSignInLinkToEmail(email, actionCodeSettings);
//     return { success: true };
//   } catch (error) {
//     return { success: false, error: error.message };
//   }
// };

// // Complete email link sign-in
// export const completeEmailLinkSignIn = async (email, url) => {
//   if (auth.isSignInWithEmailLink(url)) {
//     try {
//       const result = await auth.signInWithEmailLink(email, url);
//       return { success: true, user: result.user };
//     } catch (error) {
//       return { success: false, error: error.message };
//     }
//   } else {
//     return { success: false, error: 'Invalid or missing sign-in link.' };
//   }
// };

// export { auth };
