import {
    registerSubcollection,
    createCollectionRefWithPath,
    attachSubmodelInstanceReferencesToDocRef,
    attachSubmodelInstanceReferencesToFetchedData,
    getDB,
} from './utilities/referencing';
import Sanitizer from './utilities/sanitization';
import SubmodelInstance from './submodel-instance';
import Model from './model';
import {
    getDoc,
    setDoc,
    doc,
    getDocs,
    query,
    deleteDoc,
    collectionGroup,
    onSnapshot,
} from 'firebase/firestore';
import { map } from 'lodash';

/**
 * Class which provides a streamlined approach for creating Firestore
 * submodel objects with various simplified read and write operations.
 * 
 * Before submodels are constructed, the firebase app in use should be
 * tracked via the `setFirebaseApp` function from this package.
 * 
 * Submodels are unique in that each instance associates a particular
 * document as its parent. For this reason, the `Submodel` class is
 * intended as a way to interact with Firestore subcollections in very
 * general aspects.
 * 
 * Each Model (or SubmodelInstance) will contain references to its direct
 * SubmodelInstance children, which can be used for interacting with specific
 * instances of Firestore subcollections.
 * 
 * @param {SubmodelParams} params The parameters to use when creating the
 * submodel
 */
class Submodel {
    constructor(params) {
        this._validateConstructorParams(params);

        // Create class variables
        this.subcollections = {};
        this.listeners = {};

        // Store some info for the SubmodelInstance factory function
        this.collectionName = params.collectionName;
        this.sanitizer = new Sanitizer(
            params.collectionProps,
            params.propDefaults || {}
        );

        // Register the subcollection on the parent
        params.parent.registerSubcollection(this);

        // Add partials
        this.registerSubcollection = childModel => registerSubcollection(
            this.subcollections,
            childModel
        );
    }

    /********************
     * PUBLIC FUNCTIONS *
     ********************/

    /**
     * Sanitizes the specified data and writes it to a new document in the
     * given collection reference path with an auto-assigned ID.
     * @public
     * @function
     * 
     * @param {string} path The path to the subcollection to write the new
     * document to
     * @param {Object} data The data to sanitize and write to the new document
     * @param {WriteToNewDocParams} [params] Various settings for the operation
     * @returns {Promise<Object>} Resolves with the newly created document
     * reference, populated with additional subcollection info
     */
    async writeToNewDoc(path, data, params) {
        this._verifyPathIncludesSubmodelCollectionName(path);

        const collectionRef = createCollectionRefWithPath(path);
        const docRef = doc(collectionRef);
        const pathWithID = `${path}/${docRef.id}`;
        
        return this.writeToPath(pathWithID, data, params);
    }

    /**
     * Sanitizes the specified data and writes it to a specified document
     * in a specified instance of the subcollection. A new document will
     * be created if it doesn't already exist.
     * 
     * By default, this will completely overwrite the existing document, if
     * one exists. Properties unspecified by the new data will be deleted
     * from the existing document.
     * 
     * In order to merge the existing data with the new data, the
     * `mergeWithExistingValues` property can be set to true in the `params`
     * object.
     * @public
     * @function
     * 
     * @param {string} path The path to the document to write to
     * @param {Object} data The data to sanitize and write to the new document
     * @param {WriteToIDParams} [params] Various settings for the operation
     * @returns {Promise<Object>} Resolves with the newly created document
     * reference, populated with additional subcollection info
     */
    async writeToPath(path, data, params) {
        this._verifyPathIncludesSubmodelCollectionName(path);

        // Sanitize the data
        const sanitizedData = this.sanitizer.getSanitizedDataToSave(
            data,
            params?.mergeWithDefaultValues
        );

        // Retrieve the doc ref
        const { id, collectionPath } = this._getCollectionPathAndIDFromPath(path);
        const collectionRef = createCollectionRefWithPath(collectionPath);
        const docRef = doc(collectionRef, id);

        // Write to the database using either a transaction, autobatcher, or
        // with a vanilla write operation, as specified in params
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
        
        // Attach additional info to doc ref and return
        attachSubmodelInstanceReferencesToDocRef(docRef, this.subcollections);
        return docRef;
    }

    /**
     * Retrieves the specified document's data from the database, if it exists.
     * @public
     * @function
     * 
     * @param {string} path Path specifying both the collection path and the
     * ID of the document to retrieve
     * @param {GetByPathParams} [params] Various settings for the operation
     * @returns {Promise<Object | null} If the document exists, the promise
     * will resolve with the sanitized data for the document; otherwise, the
     * promise will resolve with `null`
     */
    async getByPath(path, params) {
        this._verifyPathIncludesSubmodelCollectionName(path);

        // Retrieve the doc ref
        const { id, collectionPath } = this._getCollectionPathAndIDFromPath(path);
        const collectionRef = createCollectionRefWithPath(collectionPath);
        const docRef = doc(collectionRef, id);

        // Retrieve the data
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
     * parameters, in the given Firestore path.
     * @public
     * @function
     * 
     * @param {string} path Path specifying the specific subcollection instance
     * path
     * @param {function[]} queryFns Array of Firestore query functions to use
     * in the query, e.g., `limit`, `orderBy`, and `where`
     * @returns {Promise<Object[]>} Resolves with an array of all documents in
     * the specific subcollection matching the specified query
     */
    async getByQueryInInstance(path, queryFns) {
        this._verifyPathIncludesSubmodelCollectionName(path);

        // Retrieve the collection ref
        const collectionRef = createCollectionRefWithPath(path);

        // Construct the query function
        const q = query(collectionRef, ...queryFns);

        // Make the query call
        const querySnapshot = await getDocs(q);
        
        // Sanitize the documents
        const sanitizedDocuments = this.sanitizer.sanitizeFromRead(querySnapshot);

        // For each document, and for each subcolleciton specified for the model,
        // create and attach submodel instances for reference
        map(
            sanitizedDocuments,
            doc => attachSubmodelInstanceReferencesToFetchedData(doc, this.subcollections)
        );

        // Return the final results
        return sanitizedDocuments;
    }

    /**
     * Retrieves all documents from the database matching the specified query
     * parameters, in the given subcollection group.
     * @public
     * @function
     * 
     * @param {function[]} queryFns Array of Firestore query functions to use
     * in the query, e.g., 'limi', 'orderBy', and 'where'
     * @returns {Promise<Object[]>} Resolves with an array of all documents in
     * the subcollection group matching the specified query
     */
    async getByQuery(queryFns) {
        // Get the collection group reference
        const collectionGroupRef = collectionGroup(getDB(), this.collectionName);

        // Construct the query  function
        const q = query(collectionGroupRef, ...queryFns);

        // Make the query call
        const querySnapshot = await getDocs(q);

        // Sanitize the documents
        const sanitizedDocuments = this.sanitizer.sanitizeFromRead(querySnapshot);

        // For each document, and for each subcollection specified for the model,
        // create and attach submodel instances for reference
        map(
            sanitizedDocuments,
            doc => attachSubmodelInstanceReferencesToFetchedData(doc, this.subcollections)
        );

        // Return the final results
        return sanitizedDocuments;
    }

    /**
     * Deletes a document from the database, given the path to the document.
     * @public
     * @function
     * 
     * @param {string} path The path to the document to delete
     * @returns {Promise<void>} Resolves once the document has been deleted
     * (if not using an autobatcher)
     */
    async deleteByPath(path, params) {
        this._verifyPathIncludesSubmodelCollectionName(path);

        // Retrieve the doc ref
        const { id, collectionPath } = this._getCollectionPathAndIDFromPath(path);
        const collectionRef = createCollectionRefWithPath(collectionPath);
        const docRef = doc(collectionRef, id);

        // Delete from the database using either a transaction, autobatcher, or
        // with a vanilla delete operation, as specified in params
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
     * @param {string} path The path to the document to register the listener for
     * @param {function} fn The callback function for the listener; should accept the sanitized
     * document (with `_ref` and `subcollections` attached to it) as its param
     */
    addListenerByPath(nameOfListener, path, fn) {
        this._validateListenerNameNotTaken(nameOfListener);
        this._verifyPathIncludesSubmodelCollectionName(path);
        // Create the document reference
        const { id, collectionPath } = this._getCollectionPathAndIDFromPath(path);
        const collectionRef = createCollectionRefWithPath(collectionPath);
        const docRef = doc(collectionRef, id);
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
     * Register a listener for multiple documents in a specific subcollection instance, given a query.
     * The listener is stored on the model or submodel itself, and can be removed by calling either the
     * `removeListener` or `removeAllListeners` functions.
     * @public
     * @function
     * 
     * @param {string} nameOfListener The name to give to the listener during registration; used to
     * reference the listener when you need to delete it later
     * @param {string} path The path to the specific subcollection instance to register the listener for
     * @param {function[]} queryFns Array of Firestore query functions to use in the query, e.g., `limit`,
     * `orderBy`, and `where`
     * @param {function} fn The callback function for the listener; should accept the sanitized document
     * array (with `_ref` and `subcollections` attached to each sanitized document in the array) as its
     * param
     */
    addListenerByQueryInInstance(nameOfListener, path, queryFns, fn) {
        this._validateListenerNameNotTaken(nameOfListener);
        this._verifyPathIncludesSubmodelCollectionName(path);
        // Create the query function
        const collectionRef = createCollectionRefWithPath(path);
        const q = query(collectionRef, ...queryFns);
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
     * Register a listener for multiple documents in a subcollection group, given a query. The listener
     * is stored on the model or submodel itself, and can be removed by calling either the
     * `removeListener` or `removeAllListeners` functions.
     * @public
     * @function
     * 
     * @param {string} nameOfListener The name to give to the listener during registration; used to
     * reference the listener when you need to delete it later
     * @param {function[]} queryFns Array of Firestore query functions to use in the query, e.g., `limit`,
     * `orderBy`, and `where`
     * @param {function} fn The callback function for the listener; should accept the sanitized document
     * array (with `_ref` and `subcollections` attached to each sanitized document in the array) as its
     * param
     */
    addListenerByQuery(nameOfListener, queryFns, fn) {
        this._validateListenerNameNotTaken(nameOfListener);
        // Create the query function
        const collectionGroupRef = collectionGroup(getDB(), this.collectionName);
        const q = query(collectionGroupRef, ...queryFns);
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
     * Removes a specified listener from the submodel.
     * @public
     * @function
     * 
     * @param {string} nameOfListener The name of the listener to remove from the submodel
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
     * Removes all listeners from the submodel.
     * @public
     * @function
     */
    removeAllListeners() {
        for (let nameOfListener of Object.keys(this.listeners)) {
            this.removeListener(nameOfListener);
        }
    }

    /***********************
     * PROTECTED FUNCTIONS *
     ***********************/

    /**
     * Validates the Submodel constructor's params object.
     * @private
     * @function
     * 
     * @param {Object} params Argument given to the Submodel's constructor
     */
    _validateConstructorParams(params) {
        if (!params.collectionName) {
            throw new Error('`collectionName` must be specified when constructing a new submodel.');
        }
        if (!params.collectionProps) {
            throw new Error('`collectionProps` must be specified when constructing a new submodel.');
        }
        if (
            !params.parent ||
            (
                !params.parent instanceof Model &&
                !params.parent instanceof Submodel
            )
        ) {
            throw new Error('`parent` must be specified and be of type `Model` or `Submodel` when constructing a new submodel.');
        }
    }
    
    /**
     * Given the doc or doc reference to associate as the parent, create a
     * new submodel instance.
     * @private
     * @function
     * 
     * @param {Firestore.DocumentSnapshot | Firestore.DocumentReference} docOrDocRef
     * The doc or doc reference to set as the parent of the new submodel
     * instance
     * @returns {SubmodelInstance} The created submodel instance
     */
    _createSubmodelInstance(docOrDocRef) {
        let docRef = docOrDocRef._ref || docOrDocRef;
        return new SubmodelInstance({
            collectionName: this.collectionName,
            parentDocRef: docRef,
            sanitizer: this.sanitizer,
            subcollections: this.subcollections,
        });
    }

    /**
     * Verify that the path given includes this submodel's collection name
     * to attempt to ensure developers pass the correct absolute Firestore
     * path.
     * @private
     * @function
     * 
     * @param {string} path The path to verify
     */
    _verifyPathIncludesSubmodelCollectionName(path) {
        if (
            !path ||
            !path.includes ||
            !path.includes(this.collectionName)
        ) {
            throw new Error(
                `The path given must include the submodel's collection name.\n` +
                `Path given: ${path}\n` +
                `Subcollection name is: ${this.collectionName}`
            );
        }
    }

    /**
     * Given a path containing both the collection path and an ID, return
     * an object with the collection path split from the ID.
     * @private
     * @function
     * 
     * @param {string} path The path including both the collection path and
     * the ID
     * @returns {Object} Returns an object with `id` and `collectionPath`
     * properties 
     */
    _getCollectionPathAndIDFromPath(path) {
        const pathSegments = path.split('/');
        const id = pathSegments.pop();
        const collectionPath = pathSegments.join('/');
        return {
            id,
            collectionPath
        };
    }

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

export default Submodel;