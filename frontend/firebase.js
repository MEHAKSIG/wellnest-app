//V-8.0.0
// // firebase.js
import firebase from 'firebase';        
import 'firebase/auth';
import 'firebase/firestore';
const firebaseConfig = {
  apiKey: "AIzaSyAZhla1bLkPTr11-LdYON21R5Jz_lipgBg",
  authDomain: "wellnest-ea82e.firebaseapp.com",
  projectId: "wellnest-ea82e",
  storageBucket: "wellnest-ea82e.firebasestorage.app",
  messagingSenderId: "984306463772",
  appId: "1:984306463772:web:eff2609527f428c1989bd9"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const firestore = firebase.firestore();

export { firebase, auth, firestore };