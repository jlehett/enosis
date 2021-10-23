import {
    addDoc,
    doc,
    getDoc,
    getDocs,
    setDoc,
    query,
    Firestore,
} from 'firebase/firestore';
import {
    concat,
    map
} from 'lodash';

/**
 * Class for all operations that can be performed on model "instances".
 * This includes all regular models, and any subcollection model instances
 * where the parent document reference is defined.
 */
class ModelInstanceOperations {

    /********************
     * PUBLIC FUNCTIONS *
     ********************/

    /**
     * Sanitizes the specified data and writes it to a new document in the
     * model's collection with an auto-assigned ID.
     * @public
     * @function
     * 
     * @example
     * // Write data to a new document
     * ProfileModel.writeToNewDoc({
     *      displayName: 'john',
     *      email: 'john@gmail.com',
     *      address: '111 Test Rd',
     *      phone: '555-555-5555',
     * });
     * 
     * @example
     * // Write data to a new document and specify that default values
     * // should be used for properties where no value was specified
     * ProfileModel.writeToNewDoc(
     *      {
     *          displayName: 'john',
     *      },
     *      { mergeWithDefaultValues: true }
     * );
     * 
     * @param {Object} data The data to sanitize and write to the new document
     * @param {WriteToNewDocParams} [params] Various settings for the operation
     * @returns {Promise<Object>} Resolves with the newly created document
     * reference, populated with additional subcollection info
     */
    async writeToNewDoc(data, params) {
        const sanitizedData = this.sanitizer.getSanitizedDataToSave(
            data,
            params?.mergeWithDefaultValues
        );
        const docRef = await addDoc(this.collectionRef, sanitizedData);
        this._attachSubmodelInstanceReferencesToDocRef(docRef);
        return docRef;
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
     * @example
     * // Write data to a specified document
     * ProfileModel.writeToID(
     *      'testProfile',
     *      {
     *          displayName: 'john',
     *          email: 'john@gmail.com',
     *          address: '111 Test Rd',
     *          phone: '555-555-5555'
     *      }
     * );
     * 
     * @example
     * // Write data to a specified document and specify that default values
     * // should be used for properties where no value was specified
     * ProfileModel.writeToID(
     *      'testProfile',
     *      {
     *          displayName: 'john'
     *      },
     *      { mergeWithDefaultValues: true }
     * );
     * 
     * @example
     * // Use a transaction for the write operation and specify that default
     * // values should be used for properties where no value was specified
     * runTransaction(db, (transaction) => {
     *      ProfileModel.writeToID(
     *          'testProfile',
     *          {
     *              displayName: 'john'
     *          },
     *          {
     *              transaction,
     *              mergeWithDefaultValues: true
     *          }
     *      );
     * });
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
        params?.transaction
            ? await params.transaction.set(
                docRef,
                sanitizedData,
                { merge: params?.mergeWithExistingValues }
            )
            : await setDoc(
                docRef,
                sanitizedData,
                { merge: params?.mergeWithExistingValues }
            );
        this._attachSubmodelInstanceReferencesToDocRef(docRef);
        return docRef;
    }

    /**
     * Retrieves the specified document's data from the database, if it exists.
     * @public
     * @function
     * 
     * @example
     * // Get a document given an ID
     * const doc = ProfileModel.getByID('testProfile');
     * 
     * @example
     * // Get a document given an ID using a transaction
     * runTransaction(db, (transaction) => {
     *      ProfileModel.getByID(
     *          'testProfile',
     *          { transaction }
     *      );
     * });
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
        // For each subcollection registered to the model instance, create
        // and attach submodel instances for reference
        this._attachSubmodelInstanceReferencesToFetchedData(sanitizedData);
        // Return the sanitized data
        return sanitizedData;
    }

    /**
     * Retrieves all documents from the database matching the specified query
     * parameters.
     * @public
     * @function
     * 
     * @example
     * // Get documents matching a simple query
     * import { where } from '@firebase/firestore';
     * 
     * const docsMatchingQuery = ProfileModel.getByQuery([
     *      where('displayName', '==', 'john')
     * ]);
     * 
     * @example
     * // Get documents matching a compound query
     * import { where } from '@firebase/firestore';
     * 
     * const docsMatchingQuery = await ProfileModel.getByQuery([
     *      where('displayName', '==', 'john'),
     *      where('email', '==', 'john@gmail.com'),
     * ]);
     * 
     * @example
     * // Get documents matching a compound query, but limit results to the
     * // first 4 matches
     * import { where, limit } from '@firebase/firestore';
     * 
     * const firstFourDocsMatchingQuery = await ProfileModel.getByQuery([
     *      where('displayName', '==', 'john'),
     *      where('email', '==', 'john@gmail.com'),
     *      limit(4)
     * ]);
     * 
     * @example
     * // Get documents matching a compound query, ordered first by 'displayName'
     * // in descending order, then ordered by 'email' in ascending order
     * import { orderBy, where } from '@firebase/firestore';
     * 
     * const orderedDocsMatchingQuery = await ProfileModel.getByQuery([
     *      where('displayName', '==', 'john'),
     *      where('email', '==', 'john@gmail.com'),
     *      orderBy('displayName', 'desc'),
     *      orderBy('email')
     * ]);
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
        map(sanitizedDocuments, doc => this._attachSubmodelInstanceReferencesToFetchedData(doc));
        // Return the final result
        return sanitizedDocuments;
    }

    /*********************
     * PRIVATE FUNCTIONS *
     *********************/

    /**
     * Attaches a new `subcollections` property to the specified data, which
     * contains references to submodel instances, mapped by the corresponding
     * subcollection names.
     * 
     * @param {Object} data The sanitized data to attach submodel instance
     * references to
     */
    _attachSubmodelInstanceReferencesToFetchedData(data) {
        data.subcollections = {};
        const subcollectionNames = Object.keys(this.subcollections);
        for (let subcollectionName of subcollectionNames) {
            const subcollection = this.subcollections[subcollectionName];
            const submodelInstance = subcollection._createSubmodelInstance(
                data._ref
            );
            data.subcollections[subcollectionName] = submodelInstance;
        }
    }

    /**
     * Attaches a new `subcollections` property to the specified doc ref,
     * which contains references to submodel instances, mapped by the
     * corresponding subcollection names.
     * 
     * @param {Firestore.DocumentReference} docRef The Firestore document
     * reference to attach subcollection info to
     */
    _attachSubmodelInstanceReferencesToDocRef(docRef) {
        docRef.subcollections = {};
        const subcollectionNames = Object.keys(this.subcollections);
        for (let subcollectionName of subcollectionNames) {
            const subcollection = this.subcollections[subcollectionName];
            const submodelInstance = subcollection._createSubmodelInstance(
                docRef
            );
            docRef.subcollections[subcollectionName] = submodelInstance;
        }
    }
}

export default ModelInstanceOperations;