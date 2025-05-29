import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { GoogleAuthProvider, getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || null,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Validate configuration
const validateConfig = () => {
    const requiredFields = [
        'apiKey',
        'authDomain',
        'projectId',
        'messagingSenderId',
        'appId'
    ];

    const missingFields = requiredFields.filter(field => !firebaseConfig[field]);
    
    if (missingFields.length > 0) {
        throw new Error(
            `Missing required Firebase configuration fields: ${missingFields.join(', ')}. ` +
            'Please check your .env file.'
        );
    }

    // Clean up config by removing null/undefined values
    Object.keys(firebaseConfig).forEach(key => {
        if (firebaseConfig[key] === null || firebaseConfig[key] === undefined) {
            delete firebaseConfig[key];
        }
    });

    // Log the project ID being used (helpful for debugging)
    console.log('Initializing Firebase with project ID:', firebaseConfig.projectId);
};

// Initialize Firebase instances
let auth;
let db;
let provider;

try {
    // Validate configuration before initializing
    validateConfig();

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);

    // Initialize Auth
    auth = getAuth(app);

    // Initialize Firestore
    db = getFirestore(app);

    // Enable offline persistence
    enableIndexedDbPersistence(db).catch((err) => {
        if (err.code === 'failed-precondition') {
            console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
        } else if (err.code === 'unimplemented') {
            console.warn('The current browser does not support persistence.');
        }
    });

    // Initialize Google Auth Provider
    provider = new GoogleAuthProvider();
    provider.setCustomParameters({
        prompt: 'select_account'
    });
} catch (error) {
    console.error('Error initializing Firebase:', error);
    throw error;
}

export { auth, provider, db };
