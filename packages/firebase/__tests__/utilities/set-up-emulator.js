import {
    connectFirestoreEmulator,
    getFirestore
} from '@firebase/firestore';
import {
    connectDatabaseEmulator,
    getDatabase
} from '@firebase/database';
import firebaseConfig from '../../firebase.config';
import { createUnifireFirebaseApp } from '../../lib';
import {
    clearFirestoreEmulatorData,
    clearRealtimeDatabaseEmulatorData
} from './clear-emulator-data';

/**
 * Set up the Firestore emulator for testing.
 */
export function setUpFirestoreEmulator() {
    createUnifireFirebaseApp(firebaseConfig);
    const db = getFirestore();
    connectFirestoreEmulator(db, 'localhost', 8080);
    await clearFirestoreEmulatorData();
}

/**
 * Set up the Realtime Database emulator for testing.
 */
export function setUpRealtimeDatabaseEmulator() {
    createUnifireFirebaseApp(firebaseConfig);
    const db = getDatabase();
    connectDatabaseEmulator(db, 'localhost', 8080);
    await clearRealtimeDatabaseEmulatorData();
}