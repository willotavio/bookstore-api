import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD2steZqjgeBFEYuCdFR4NwRGBVXggDHqI",
  authDomain: "bookstore-api-b889d.firebaseapp.com",
  projectId: "bookstore-api-b889d",
  storageBucket: "bookstore-api-b889d.appspot.com",
  messagingSenderId: "348088718344",
  appId: "1:348088718344:web:3a7c889acd794026d96dbd"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
export { storage }