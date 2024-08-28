// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA8_55Kpi20SGKmh6qlZnB_lksrixbTC-8",
  authDomain: "flashcards-44fe4.firebaseapp.com",
  projectId: "flashcards-44fe4",
  storageBucket: "flashcards-44fe4.appspot.com",
  messagingSenderId: "115021622254",
  appId: "1:115021622254:web:46d8a5a0b75db9740bbcff",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
