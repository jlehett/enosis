import {
    getDatabase,
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
 * Returns a string for a particular collection's reference path.
 * 
 * @param {string} collectionName The name of the collection to create a reference for, e.g., `profiles`
 * @param {string} [parentDocRefString] The parent document's reference string 
 * @returns {string} String representing a particular collection's reference path in the database
 */
export function createCollectionRefString(collectionName, parentDocRefString) {
    return `${parentDocRefString ? `${parentDocRefString}/` : null}${collectionName}`;
}

/**
 * Returns a string for a particular document's reference path.
 * 
 * @param {string} collectionRefString The reference string for the collection the document is part of
 * @param {string} id The ID of the document
 * @returns {string} String representing a particular document's reference path in the database
 */
export function creatDocRefString(collectionRefString, id) {
    return `${collectionRefString}/${id}`;
}

/**
 * Create the Firebase Realtime database reference given a ref string.
 * 
 * @param {string} refString The ref string to convert to a complete reference 
 * @returns {Firebase.DatabaseReference} The reference to a specific location in your realtime database
 */
export function createRefFromRefString(refString) {
    const db = getRealtimeDB();
    return ref(db, refString);
}