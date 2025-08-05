// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAkL3X5Nmodxfh8I2PryurRPrDgg9Rf8Yc",
  authDomain: "ai-bot-dbb51.firebaseapp.com",
  projectId: "ai-bot-dbb51",
  storageBucket: "ai-bot-dbb51.firebasestorage.app",
  messagingSenderId: "794478918124",
  appId: "1:794478918124:web:5e546c125dae80d0d868c9",
  measurementId: "G-PPQL2REB8W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup };