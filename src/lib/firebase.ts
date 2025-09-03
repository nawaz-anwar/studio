import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyBGS1KTAmrlpZxYpaEFR0igToGHIEC_6bQ",
    authDomain: "erp-testing-2e4d3.firebaseapp.com",
    projectId: "erp-testing-2e4d3",
    storageBucket: "erp-testing-2e4d3.appspot.com",
    messagingSenderId: "1022213351772",
    appId: "1:1022213351772:web:2bea46dabb3b735759f999",
    measurementId: "G-HWFDEHC0P2"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
