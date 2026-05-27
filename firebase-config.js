// config/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// TODO: Remplacez cet objet par la configuration de votre projet Firebase
// Vous trouverez cette configuration dans les paramètres de votre projet Firebase
export const firebaseConfig = {
  apiKey: "AIzaSyCULrLBsrlQ2a4QFEKj5SDChMsVXQomUvA",
  authDomain: "les-epices-alize.firebaseapp.com",
  projectId: "les-epices-alize",
  storageBucket: "les-epices-alize.firebasestorage.app",
  messagingSenderId: "717638844612",
  appId: "1:717638844612:web:c35a0712adf28ac3c08991",
  measurementId: "G-0Y9RX4QCLK"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);

// Exportation des services pour les utiliser dans d'autres fichiers
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
