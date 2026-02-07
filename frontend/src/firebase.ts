import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCh2tbbd8NI3nUp77f5p4sdHypoH3MJhb4",
    authDomain: "soundscope-1a221.firebaseapp.com",
    projectId: "soundscope-1a221",
    storageBucket: "soundscope-1a221.firebasestorage.app",
    messagingSenderId: "152206110152",
    appId: "1:152206110152:web:8de92232aca076b6c9e4fd",
    measurementId: "G-66983B5MJR"
  };

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
