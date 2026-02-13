import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getPerformance } from "firebase/performance";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyClycqIT5RKmls8CenPisb2sXeTU0gcKrE",
  authDomain: "novawallet-63345.firebaseapp.com",
  databaseURL: "https://novawallet-63345-default-rtdb.firebaseio.com/",
  projectId: "novawallet-63345",
  storageBucket: "novawallet-63345.firebasestorage.app",
  messagingSenderId: "834623434978",
  appId: "1:834623434978:web:7fe166ce6d3229f4b22ebb",
  measurementId: "G-FH566S2VP4"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const perf = getPerformance(app);
export const analytics = getAnalytics(app);
