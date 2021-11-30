import { initializeApp } from 'firebase/app';

/**
 * Storage of the Unifire Firebase app.
 * @type {Firebase.App | null}
 */
let unifireFirebaseApp = null;

/**
 * Function to create the Unifire Firebase App for use throughout the package.
 * 
 * @param {Object} FIREBASE_CONFIG Object defining the necessary keys for the Firebase App to be created
 */
export function createUnifireFirebaseApp(FIREBASE_CONFIG) {
    unifireFirebaseApp = initializeApp(FIREBASE_CONFIG);
}

/**
 * Returns the current Unifire Firebase app, if one has been created. Otherwise, throws an error.
 * 
 * @returns {Firebase.App} Returns the current Unifire Firebase app
 * @throws {Error} Thrown if a Unifire Firebase App has not been created yet
 */
export function getUnifireFirebaseApp() {
    if (unifireFirebaseApp) {
        return unifireFirebaseApp;
    } else {
        throw new Error('The Unifire Firebase App needs to be created via `createUnifireFirebaseApp` before any utilities can be used from @unifire/firebase');
    }
}