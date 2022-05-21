import {
    connectFirestoreEmulator,
    getFirestore
} from 'firebase/firestore';
import {
    connectDatabaseEmulator,
    getDatabase
} from 'firebase/database';
import {
    connectFunctionsEmulator,
    getFunctions
} from 'firebase/functions';
import { initializeApp } from 'firebase/app';
import firebaseConfig from '../../firebase.config';
import { setUnifireFirebaseApp } from '../../lib';
import {
    clearFirestoreEmulatorData,
    clearRealtimeDatabaseEmulatorData
} from './clear-emulator-data';

/**
 * Create the Unifire Firebase app.
 */
export function setUpApp() {
    const app = initializeApp(firebaseConfig);
    setUnifireFirebaseApp(app);
}

/**
 * Set up the Firestore emulator for testing.
 */
export async function setUpFirestoreEmulator() {
    const db = getFirestore();
    connectFirestoreEmulator(db, 'localhost', 8080);
    await clearFirestoreEmulatorData();
}

/**
 * Set up the Realtime Database emulator for testing.
 */
export async function setUpRealtimeDatabaseEmulator() {
    const db = getDatabase();
    connectDatabaseEmulator(db, 'localhost', 9000);
    await clearRealtimeDatabaseEmulatorData();
}

/**
 * Set up the Firebase Functions emulator for testing.
 */
export async function setUpFunctionsEmulator() {
    const functions = getFunctions();
    connectFunctionsEmulator(functions, 'localhost', 5001);
}