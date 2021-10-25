let _this;

/**
 * Stores the Firebase App reference to use throughout the @unifire-js/firebase
 * package.
 */
class FirebaseAppUnifireConfig {
    constructor() {
        this.firebaseApp = null;
        _this = this;
    }

    /**
     * Set the firebase app reference to use in all of the utility functions
     * provided by this package.
     * @public
     * @function
     * 
     * @param {FirebaseApp} firebaseApp The firebase reference to use in all of the
     * utility functions provided by this package
     */
    setFirebaseApp(firebaseApp) {
        _this.firebaseApp = firebaseApp;
    }

    /**
     * Get the firebase app reference to use in all of the utility functions
     * provided by this package.
     * @public
     * @function
     * 
     * @returns {FirebaseApp} The firebase reference to use in all of the utility
     * functions provided by this package
     * @throws {Error} Throws error if `firebaseApp` has not been set via
     * `setFirebaseApp` yet
     */
    getFirebaseApp() {
        if (_this.firebaseApp) {
            return _this.firebaseApp;
        } else {
            throw new Error('`firebaseApp` needs to be set via `setFirebaseApp` before any utilities can be used from @unifire/firebase');
        }
    }
}

const firebaseAppUnifireConfig = new FirebaseAppUnifireConfig();
const setFirebaseApp = firebaseAppUnifireConfig.setFirebaseApp;
const getFirebaseApp = firebaseAppUnifireConfig.getFirebaseApp;

export { setFirebaseApp };
export { getFirebaseApp };