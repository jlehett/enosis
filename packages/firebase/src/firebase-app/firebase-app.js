/**
 * Storage of the Unifire Firebase app.
 * @type {Firebase.App | null}
 */
let unifireFirebaseApp = null;

/**
 * Function to set the Unifire Firebase App for use throughout the package.
 * 
 * @param {Object} FIREBASE_CONFIG Object defining the necessary keys for the Firebase App to be created
 */
export function setUnifireFirebaseApp(app) {
    unifireFirebaseApp = app;
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
        throw new Error('The Unifire Firebase App needs to be set via `setUnifireFirebaseApp` before any utilities can be used from @unifire/firebase');
    }
}