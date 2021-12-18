import { useEffect } from 'react';
import {
    set,
    get,
    onValue,
    onDisconnect,
} from 'firebase/database';
import Sanitizer from '../utilities/sanitization';
import { getRefFromPath } from '../utilities/referencing';

/**
 * Class which provides a streamlined approach for creating Firebase realtime
 * database model objects with various simplified read and write operations.
 * 
 * Before models are constructed, the Unifire Firebase app should be created via
 * the `createUnifireFirebaseApp` function from this package.
 * 
 * @param {RealtimeModelParams} param The parameters to use when creating the
 * model
 */
class RealtimeModel {
    constructor(params) {
        this._validateConstructorParams(params);

        // Create class variables
        this.sanitizer = new Sanitizer(
            params.collectionProps,
            params.propDefaults || {}
        );

        /**
         * Map of listener names to their unsubscribe function.
         */
        this.listeners = {};

        /**
         * Map of disconnect listener names to their unsubscribe function.
         */
        this.disconnectListeners = {};
    }

    /********************
     * PUBLIC FUNCTIONS *
     ********************/

    /**
     * Sanitizes the specified data and writes it to a specified path.
     * @public
     * @function
     * 
     * @param {string} path The path to write sanitized data to
     * @param {Object} data The unsanitized data to first sanitize, and then
     * write to the specified "document" in the realtime database
     * @param {WriteToPathParams} [params] Various settings for the operation
     * @returns {Promise<void>} Resolves when the data has been written to the
     * realtime database
     */
    async writeToPath(path, data, params) {
        const ref = getRefFromPath(path);
        let dataToWrite = this.sanitizer.getSanitizedDataToSave(
            data,
            params?.mergeWithDefaultValues
        );
        await set(ref, dataToWrite);
    }

    /**
     * Reads the data from the given path in Firebase realtime database.
     * @public
     * @function
     * 
     * @param {string} path The path to read data from
     * @returns {Promise<Object>} Resolves with the sanitized data from the
     * specified path in the realtime database
     */
    async getByPath(path) {
        const ref = getRefFromPath(path);
        const dataSnapshot = await get(ref);
        return this.sanitizer.sanitizeFromRead(dataSnapshot);
    }

    /**
     * Register a listener for a specific path. The listener is stored on the
     * model itself, and can be removed by calling either the `removeListener`
     * or `removeAllListeners` functions.
     * @public
     * @function
     * 
     * @param {string} nameOfListener The name to give to the listener during
     * registration; used to reference the listener when you need to delete it
     * later
     * @param {string} path The path to register the listener for
     * @param {function} fn The callback function for the listener; should
     * accept the sanitized data snapshot
     */
    addListenerByPath(nameOfListener, path, fn) {
        const ref = getRefFromPath(path);
        this.listeners[nameOfListener] = onValue(
            ref,
            (docSnapshot) => {
                const sanitizedData = this.sanitizer.sanitizeFromRead(docSnapshot);
                fn(sanitizedData);
            }
        );
    }

    /**
     * React hook for adding a listener for a specific document, and then
     * removing it once the component unmounts.
     * @public
     * @function
     * 
     * @param {string} nameOfListener The name to give to the listener during
     * registration; used to reference the listener when you need to delete
     * it later
     * @param {string} path The path to register the listener for
     * @param {function} fn The callback function for the listener; should accept
     * the sanitized data snapshot
     */
    useListenerByPath(nameOfListener, path, fn) {
        useEffect(() => {
            // Create the listener
            this.addListenerByPath(nameOfListener, path, fn);
            // In the useEffect cleanup, remove the listener
            return () => this.removeListener(nameOfListener);
        }, []);
    }

    /**
     * Removes a specified listener from the model.
     * @public
     * @function
     * 
     * @param {string} nameOfListener The name of the listener to remove from
     * the model
     * @throws {Error} Thrown if a non-existent listener is attempted to be
     * removed
     */
    removeListener(nameOfListener) {
        if (this.listeners[nameOfListener]) {
            this.listeners[nameOfListener]();
            delete this.listeners[nameOfListener];
        } else {
            throw new Error(`Attempted to remove non-existent listener, ${nameOfListener}.`);
        }
    }

    /**
     * Removes all listeners from the model.
     * @public
     * @function
     */
    removeAllListeners() {
        for (let nameOfListener of Object.keys(this.listeners)) {
            this.removeListener(nameOfListener);
        }
    }

    /**
     * Add an onDisconnect listener to the model. Due to the nature of how
     * `onDisconnect` functions work, sanitization will not be applied to
     * any data passed to the onDisconnectFn.
     * 
     * @param {string} nameOfListener The name to give to the disconnect
     * listener during registration; used to reference the listener when you
     * need to delete it later
     * @param {string} path The path to create an onDisconnect listener for
     * @param {function} onDisconnectFn One of the functions exposed by the
     * `OnDisconnect` class instance; see Firebase Realtime Database docs for
     * a list of available function
     * @param {Array | Object} args List of args to pass to the onDisconnectFn
     */
    addOnDisconnectListenerByPath(nameOfListener, path, onDisconnectFn, args) {
        const ref = getRefFromPath(path);
        const onDisconnectObj = onDisconnect(ref)[onDisconnectFn](...args);
        this.disconnectListeners[nameOfListener] = onDisconnectObj.cancel;
    }

    /**
     * React hook for adding an onDisconnect listener for a specific path, and
     * then removing it once the component unmounts.
     * @public
     * @function
     * 
     * @param {string} nameOfListener The name to give to the disconnect
     * listener during registration; used to reference the listener when you
     * need to delete it later
     * @param {string} path The path to create an onDisconnect listener for
     * @param {function} onDisconnectFn One of the functions exposed by the
     * `OnDisconnect` class instance; see Firebase Realtime Database docs for
     * a list of available function
     * @param {Array | Object} args List of args to pass to the onDisconnectFn
     */
    useOnDisconnectListenerByPath(nameOfListener, path, onDisconnectFn, args) {
        useEffect(() => {
            // Create the listener
            const ref = this.addOnDisconnectListenerByPath(nameOfListener, path, onDisconnectFn, args);
            // In the useEffect cleanup, remove the listener
            return () => this.removeListener(nameOfListener);
        }, []);
    }

    /**
     * Removes a specified disconnect listener from the model.
     * @public
     * @function
     * 
     * @param {string} nameOfListener The name of the disconnect listener to
     * remove from the model
     * @throws {Error} Thrown if a non-existent disconnect listener is attempted
     * to be removed
     */
    removeOnDisconnectListener(nameOfListener) {
        if (this.disconnectListeners[nameOfListener]) {
            this.disconnectListeners[nameOfListener]();
            delete this.disconnectListeners(nameOfListener);
        } else {
            throw new Error(`Attempted to remove non-existent disconnect listener, ${nameOfListener}.`);
        }
    }

    /**
     * Removes all disconnect listeners from the model.
     * @public
     * @function
     */
    removeAllOnDisconnectListeners() {
        for (let nameOfListener of Object.keys(this.disconnectListeners)) {
            this.removeOnDisconnectListener(nameOfListener);
        }
    }

    /*********************
     * PRIVATE FUNCTIONS *
     *********************/

    /**
     * Validates the Model constructor's params object.
     * @private
     * @function
     * 
     * @param {Object} params Argument given to the Model's constructor
     */
    _validateConstructorParams(params) {
        if (!params.collectionName) {
            throw new Error('`collectionName` must be specified when constructing a new model.');
        }
        if (!params.collectionProps) {
            throw new Error('`collectionProps` must be specified when constructing a new model.');
        }
    }
}

export default RealtimeModel;