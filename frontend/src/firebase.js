import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDEpL5k8r8s9yNkqLHewXEVrDuPC1HQ-ik",
  authDomain: "interview-prep-app-b077c.firebaseapp.com",
  projectId: "interview-prep-app-b077c",
  storageBucket: "interview-prep-app-b077c.firebasestorage.app",
  messagingSenderId: "459828482083",
  appId: "1:459828482083:web:a6b6d865625e042b272196"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export default app;
