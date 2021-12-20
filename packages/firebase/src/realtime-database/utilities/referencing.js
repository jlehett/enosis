import {
    getDatabase, ref,
} from 'firebase/database';
import { getUnifireFirebaseApp } from '../../firebase-app/firebase-app';

/**
 * Returns the Firebase Realtime database reference.
 * 
 * @returns {Firebase.Database} The Firebase realtime database instance reference
 */
export function getRealtimeDB() {
    return getDatabase(getUnifireFirebaseApp());
}

/**
 * Returns the Firebase realtime database reference for a given path.
 * 
 * @param {string} path The path to create the reference for
 * @returns {Firebase.DatabaseReference} The reference to a specific location
 * in your realtime database
 */
export function getRefFromPath(path) {
    const db = getRealtimeDB();
    return ref(db, path);
}
