import {
    doc,
    getDoc,
    getDocs,
    setDoc,
    query,
    deleteDoc,
    onSnapshot,
} from 'firebase/firestore';
import {
    map
} from 'lodash';
import { useEffect } from 'react';
import {
    attachSubmodelInstanceReferencesToDocRef,
    attachSubmodelInstanceReferencesToFetchedData,
} from './referencing';

/**
 * Class for all operations that can be performed on model "instances".
 * This includes all regular models, and any subcollection model instances
 * where the parent document reference is defined.
 */
class ModelInstanceOperations {
    constructor() {
        /**
         * Map of listener names to their unsubscribe functions.
         */
        this.listeners = {};
    }

    /********************
     * PUBLIC FUNCTIONS *
     ********************/

    /**
     * Sanitizes the specified data and writes it to a new document in the
     * model's collection with an auto-assigned ID.
     * @public
     * @function
     * 
     * @param {Object} data The data to sanitize and write to the new document
     * @param {WriteToNewDocParams} [params] Various settings for the operation
     * @returns {Promise<Object>} Resolves with the newly created document
     * reference, populated with additional subcollection info
     */
    async writeToNewDoc(data, params) {
        const docRef = doc(this.collectionRef);
        return this.writeToID(docRef.id, data, params);
    }

    /**
     * Sanitizes the specified data and writes it to a specified document in the
     * model's collection. A new document will be created if it doesn't already
     * exist.
     * 
     * By default, this will completely overwrite the existing document, if one
     * exists. Properties unspecified by the new data will be deleted from the
     * existing document.
     * 
     * In order to merge the existing data with the new data, the
     * `mergeWithExistingValues` property can be set to true in the `params`
     * object.
     * @public
     * @function
     * 
     * @param {string} id The ID of the document to write the sanitized data to
     * @param {Object} data The data to sanitize and write to the specified
     * document
     * @param {WriteToIDParams} [params] Various settings for the operation
     * @returns {Promise<Object>} Resolves with the newly created document
     * reference, populated with additional subcollection info
     */
    async writeToID(id, data, params) {
        const docRef = doc(this.collectionRef, id);
        const sanitizedData = this.sanitizer.getSanitizedDataToSave(
            data,
            params?.mergeWithDefaultValues
        );

        // Write to the database using either a transaction, autobatcher,
        // or with a vanilla write operation, as specified in params
        const writeArgs = [
            docRef,
            sanitizedData,
            { merge: params?.mergeWithExistingValues }
        ];
        if (params?.transaction) {
            await params.transaction.set(...writeArgs);
        } else if (params?.autobatcher) {
            params.autobatcher.set(...writeArgs);
        } else {
            await setDoc(...writeArgs);
        }

        attachSubmodelInstanceReferencesToDocRef(docRef, this.subcollections);
        return docRef;
    }

    /**
     * Retrieves the specified document's data from the database, if it exists.
     * @public
     * @function
     * 
     * @param {string} id The ID of the document to fetch from the database
     * @param {GetByIDParams} [params] Various settings for the operation
     * @returns {Promise<Object | null>} If the document exists, the promise
     * will resolve with the sanitized data for the document; otherwise, the
     * promise will resolve with `null`
     */
    async getByID(id, params) {
        // Get the document snapshot from Firestore
        const docRef = doc(this.collectionRef, id);
        const docSnap = params?.transaction
            ? await params.transaction.get(docRef)
            : await getDoc(docRef);
        // Sanitize the data
        let sanitizedData = this.sanitizer.sanitizeFromRead(docSnap);
        if (sanitizedData) {
            // For each subcollection registered to the model instance, create
            // and attach submodel instances for reference
            attachSubmodelInstanceReferencesToFetchedData(sanitizedData, this.subcollections);
        }
        // Return the sanitized data
        return sanitizedData;
    }

    /**
     * Retrieves all documents from the database matching the specified query
     * parameters.
     * @public
     * @function
     * 
     * @param {function[]} queryFns Array of Firestore query functions to
     * use in the query, e.g., `limit`, `orderBy`, and `where`
     * @returns {Promise<Object[]>} Resolves with an array of all documents in
     * the model's collection matching the specified query
     */
    async getByQuery(queryFns) {
        // Construct the query function
        const q = query(this.collectionRef, ...queryFns);
        // Make the query call
        const querySnapshot = await getDocs(q);
        // Sanitize the documents
        const sanitizedDocuments = this.sanitizer.sanitizeFromRead(querySnapshot);
        // For each document, and for each subcollection specified for the
        // model, create and attach submodel instances for reference
        map(
            sanitizedDocuments,
            doc => attachSubmodelInstanceReferencesToFetchedData(doc, this.subcollections)
        );
        // Return the final result
        return sanitizedDocuments;
    }

    /**
     * Deletes a document from the database, given its ID.
     * @public
     * @function
     * 
     * @param {string} id The ID of the document to delete from the database
     * @param {DeleteByIDParams} [params] Various settings for the operation
     * @returns {Promise<void>} Resolves once the document has been deleted
     * (if not using an autobatcher)
     */
    async deleteByID(id, params) {
        const docRef = doc(this.collectionRef, id);

        // Delete from the database using either a transaction, autobatcher,
        // or with a vanilla delete operation, as specified in params
        if (params?.transaction) {
            await params.transaction.delete(docRef);
        } else if (params?.autobatcher) {
            params.autobatcher.delete(docRef);
        } else {
            await deleteDoc(docRef);
        }
    }

    /**
     * Register a listener for a specific document. The listener is stored on the model or submodel
     * itself, and can be removed by calling either the `removeListener` or `removeAllListeners`
     * functions.
     * @public
     * @function
     * 
     * @param {string} nameOfListener The name to give to the listener during registration; used to
     * reference the listener when you need to delete it later
     * @param {string} id The ID of the document to register the listener for
     * @param {function} fn The callback function for the listener; should accept the sanitized
     * document (with `_ref` and `subcollections` attached to it) as its param
     */
    addListenerByID(nameOfListener, id, fn) {
        this._validateListenerNameNotTaken(nameOfListener);
        // Create the document reference
        const docRef = doc(this.collectionRef, id);
        // Register the listener
        this.listeners[nameOfListener] = onSnapshot(
            docRef,
            (docSnapshot) => {
                const sanitizedData = this.sanitizer.sanitizeFromRead(docSnapshot);
                if (sanitizedData) {
                    // For each subcollection registered to the model instance, create
                    // and attach submodel instances for reference
                    attachSubmodelInstanceReferencesToFetchedData(sanitizedData, this.subcollections);
                }
                fn(sanitizedData);
            }
        );
    }

    /**
     * React hook for adding a listener for a specific document, and the removing it once the component
     * unmounts.
     * @public
     * @function
     * 
     * @param {string} nameOfListener The name to give to the listener during registration; used to
     * reference the listener when you need to delete it later
     * @param {string} id The ID of the document to register the listener for
     * @param {function} fn The callback function for the listener; should accept the sanitized
     * document (with `_ref` and `subcollections` attached to it) as its param
     */
    useListenerByID(nameOfListener, id, fn) {
        useEffect(() => {
            // Create the listener
            this.addListenerByID(nameOfListener, id, fn);
            // In the useEffect cleanup, remove the listener
            return () => this.removeListener(nameOfListener);
        }, []);
    }

    /**
     * Register a listener for multiple documents in a collection or subcollection, given a query. The
     * listener is stored on the model or submodel itself, and can be removed by calling either the
     * `removeListener` or `removeAllListeners` functions.
     * @public
     * @function
     * 
     * @param {string} nameOfListener The name to give to the listener during registration; used to
     * reference the listener when you need to delete it later
     * @param {function[]} queryFns Array of Firestore query functions to use in the query, e.g.,
     * `limit`, `orderBy`, and `where`
     * @param {function} fn The callback function for the listener; should accept the sanitized document
     * array (with `_ref` and `subcollections` attached to each sanitized document in the array) as its
     * param
     */
    addListenerByQuery(nameOfListener, queryFns, fn) {
        this._validateListenerNameNotTaken(nameOfListener);
        // Construct the query function
        const q = query(this.collectionRef, ...queryFns);
        // Register the listener
        this.listeners[nameOfListener] = onSnapshot(
            q,
            (querySnapshot) => {
                const sanitizedDocuments = this.sanitizer.sanitizeFromRead(querySnapshot);
                // For each document, and for each subcollection specified for the model, create and
                // attach submodel instances for reference
                map(
                    sanitizedDocuments,
                    doc => attachSubmodelInstanceReferencesToFetchedData(doc, this.subcollections)
                );
                fn(sanitizedDocuments);
            }
        );
    }

    /**
     * React hook for adding a listener for multiple documents in a collection or subcollection, given a query,
     * and then removing it once the component unmounts.
     * @public
     * @function
     * 
     * @param {string} nameOfListener The name to give to the listener during registration; used to
     * reference the listener when you need to delete it later
     * @param {function[]} queryFns Array of Firestore query functions to use in the query, e.g.,
     * `limit`, `orderBy`, and `where`
     * @param {function} fn The callback function for the listener; should accept the sanitized document
     * array (with `_ref` and `subcollections` attached to each sanitized document in the array) as its
     * param
     */
    useListenerByQuery(nameOfListener, queryFns, fn) {
        useEffect(() => {
            // Create the listener
            this.addListenerByQuery(nameOfListener, queryFns, fn);
            // In the useEffect cleanup, remove the listener
            return () => this.removeListener(nameOfListener);
        }, []);
    }

    /**
     * Removes a specified listener from the model.
     * @public
     * @function
     * 
     * @param {string} nameOfListener The name of the listener to remove from the model
     * @throws {Error} Thrown if a non-existent listener is attempted to be removed
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

    /*********************
     * PRIVATE FUNCTIONS *
     *********************/

    /**
     * Validates that the listener name is not already taken by another active listener.
     * @private
     * @function
     * 
     * @param {string} nameOfListener The listener name to validate
     */
    _validateListenerNameNotTaken(nameOfListener) {
        if (this.listeners[nameOfListener]) {
            throw new Error(`Listener with name, ${nameOfListener}, already exists.`);
        }
    }
}

export default ModelInstanceOperations;