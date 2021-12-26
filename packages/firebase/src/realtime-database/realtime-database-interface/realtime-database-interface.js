import {
    set,
    get,
    remove,
    onValue,
    onDisconnect,
} from 'firebase/database';
import { useEffect, useState } from 'react';
import { getRefFromPath } from '../utilities/referencing';

/**
 * Class which provides a streamlined approach for interacting with Firebase's
 * Realtime Database.
 * 
 * Before the RealtimeInterface can be utilized, the Unifire Firebase app
 * should be created via the `createUnifireFirebaseApp` function from this
 * package.
 */
class RealtimeDatabaseInterface {
    constructor() {
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
     * Writes the specified data to a specified path.
     * @public
     * @function
     * 
     * @param {string} path The path to write the data to
     * @param {Object} data The data to write to the specified path in the
     * realtime database
     * @param {WriteToPathParams} [params] Various settings for the operation
     * @returns {Promise<void>} Resolves when the data has been written to the
     * realtime database
     */
    async writeToPath(path, data, params) {
        const ref = getRefFromPath(path);
        let dataToWrite = data;
        if (params?.mergeWithExistingData) {
            const existingData = await this.getByPath(path);
            dataToWrite = {
                ...existingData,
                ...dataToWrite
            };
        }
        await set(ref, dataToWrite);
    }

    /**
     * Deletes the data (and any child data in the JSON tree) at the specified
     * path.
     * @public
     * @function
     * 
     * @param {string} path The path to delete the data from
     * @returns {Promise<void>} Resolves when the data at the specified path
     * has been deleted
     */
    async deleteAtPath(path) {
        const ref = getRefFromPath(path);
        await remove(ref);
    }

    /**
     * Reads the data from the given path in Firebase realtime database.
     * @public
     * @function
     * 
     * @param {string} path The path to read data from
     * @returns {Promise<Object>} Resolves with the data from the specified
     * path in the realtime database
     */
    async getByPath(path) {
        const ref = getRefFromPath(path);
        const dataSnapshot = await get(ref);
        return this._sanitizeFromRead(dataSnapshot);
    }

    /**
     * Registers a listener for a specific path. The listener is stored on the
     * realtime interface instance itself, and can be removed by calling either
     * the `removeListener` or `removeAllListeners` functions.
     * @public
     * @function
     * 
     * @param {string} nameOfListener The name to give to the listener during
     * registration; used to reference the lsitener when you need to delete it
     * later
     * @param {string} path The path to register the listener for
     * @param {function} fn The callback function for the listener; should accept
     * the data from the snapshot
     */
    addListenerByPath(nameOfListener, path, fn) {
        const ref = getRefFromPath(path);
        this.listeners[nameOfListener] = onValue(
            ref,
            (dataSnapshot) => {
                const data = this._sanitizeFromRead(dataSnapshot);
                fn(data);
            }
        );
    }

    /**
     * React hook for adding a listener for a specific path, and then removing
     * it once the component unmounts.
     * @public
     * @function
     * 
     * @param {string} nameOfListener The name to give to the listener during
     * registration; used to reference the listener when you need to delete it
     * later
     * @param {string} path The path to register the listener for
     * @param {function} fn The callback function for the listener; should accept
     * the data from the snapshot
     */
    useListenerByPath(nameOfListener, path, fn) {
        useEffect(() => {
            // Create the listener
            this.addListenerByPath(nameOfListener, path, fn);
            // In the userEffect cleanup, remove the listener
            return () => this.removeListener(nameOfListener);
        }, []);
    }

    /**
     * React hook for adding a listener for a specific path, tracking the
     * live data in state, and then removing the listener once the component
     * unmounts.
     * @public
     * @function
     * 
     * @param {string} nameOfListener The name to give to the listener during
     * registration; used to reference the listener when you need to delete it
     * later
     * @param {string} path The path to register the listener for
     * @returns {[*, boolean]} First index is the live data; second index is a flag indicating whether the
     * data's initial fetch has been performed or not
     */
    useLiveDataByPath(nameOfListener, path) {
        /**
         * Track live data info in state.
         */
        const [liveDataInfo, setLiveDataInfo] = useState({
            data: null,
            initialFetchDone: false,
        });

        /**
         * When the component mounts, create the listener.
         */
        useEffect(() => {
            // Create the lsitener
            this.addListenerByPath(nameOfListener, path, (data) => {
                setLiveDataInfo({
                    data,
                    initialFetchDone: true,
                });
            });
            // In the useEffect cleanup, remove the listener
            return () => this.removeListener(nameOfListener);
        }, []);

        // Return the hook API
        return [liveDataInfo.data, liveDataInfo.initialFetchDone];
    }

    /**
     * Removes a specified listener.
     * @public
     * @function
     * 
     * @param {string} nameOfListener The name of the listener to remove
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
     * Removes all listeners.
     * @public
     * @function
     */
    removeAllListeners() {
        for (let nameOfListener of Object.keys(this.listeners)) {
            this.removeListener(nameOfListener);
        }
    }

    /**
     * Add an onDisconnect listener.
     * 
     * @param {string} nameOfListener The name to give to the disconnect
     * listener during registration; used to reference the listener when you
     * need to delete it later
     * @param {string} path The path to create an onDisconnect listener for
     * @param {string} onDisconnectFn One of the functions exposed by the
     * `OnDisconnect` class instance; see Firebase Realtime Database docs for
     * a list of available function
     * @param {Array} [args=[]] List of args to pass to the onDisconnectFn
     */
    addOnDisconnectListenerByPath(nameOfListener, path, onDisconnectFn, args=[]) {
        const ref = getRefFromPath(path);
        const onDisconnectObj = onDisconnect(ref);
        onDisconnectObj[onDisconnectFn](...args);
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
     * @param {Array} [args=[]] List of args to pass to the onDisconnectFn
     */
    useOnDisconnectListenerByPath(nameOfListener, path, onDisconnectFn, args=[]) {
        useEffect(() => {
            // Create the listener
            this.addOnDisconnectListenerByPath(nameOfListener, path, onDisconnectFn, args);
            // In the useEffect cleanup, remove the listener
            return () => this.removeListener(nameOfListener);
        }, []);
    }

    /**
     * Removes a specified disconnect listener.
     * @public
     * @function
     * 
     * @param {string} nameOfListener The name of the disconnect listener to
     * remove
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
     * Removes all disconnect listeners.
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
     * Sanitize the return value of read operations from the database down
     * to just the desired data.
     * @private
     * @function
     * 
     * @param {FirebaseError.DataSnapshot} dataSnapshot The data snapshot
     * to sanitize
     * @returns {Object | null} The data from the data snapshot, if it existed;
     * otherwise, null
     */
    _sanitizeFromRead(dataSnapshot) {
        const value = dataSnapshot.val();
        if (!value) {
            return null;
        }
        // Return the data
        return value;
    }
}

export default new RealtimeDatabaseInterface();