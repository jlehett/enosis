import {
    collection,
    getFirestore
} from 'firebase/firestore';
import { getFirebaseApp } from '../../firebase-app/firebase-app';

/**
 * Registers the given child as a subcollection.
 * 
 * @param {Object<string, Submodel} subcollections Map of subcollection names
 * to their corresponding Submodel
 * @param {Submodel} childModel The Submodel to register as a subcollection
 */
export function registerSubcollection(subcollections, childModel) {
    subcollections[childModel.collectionName] = childModel;
};

/**
 * Creates and returns the collection ref for a Model or SubmodelInstance.
 * 
 * @param {string} collectionName The name of the collection to create the
 * ref for
 * @param {Firestore.DocumentReference} [parentDocRef] The parent document
 * reference, if one exists
 * @returns {Firestore.CollectionReference} The collection reference to use
 * in the Model or SubmodelInstance
 */
export function createCollectionRef(collectionName, parentDocRef) {
    const db = getFirestore(getFirebaseApp());
    if (!parentDocRef) {
        return collection(db, collectionName);
    } else {
        const fullPath = [parentDocRef.path, collectionName].join('/');
        return collection(db, fullPath);
    }
};

/**
 * Creates and returns the collection ref given a Firestore path.
 * 
 * @param {string} path The Firestore path to create the collection ref for
 * @returns {Firestore.CollectionReference} The collection reference to use
 */
export function createCollectionRefWithPath(path) {
    const db = getFirestore(getFirebaseApp());
    return collection(db, path);
}

/**
 * Attaches a new `subcollections` property to the specified data, which
 * contains references to submodel instances, mapped by the corresponding
 * subcollection names.
 * 
 * @param {Object} data The sanitized data to attach submodel instance
 * references to
 * @param {Object<string, Object>} subcollections The map of subcollection names
 * to the corresponding Submodel
 */
export function attachSubmodelInstanceReferencesToFetchedData(data, subcollections) {
    data.subcollections = {};
    const subcollectionNames = Object.keys(subcollections);
    for (let subcollectionName of subcollectionNames) {
        const subcollection = subcollections[subcollectionName];
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
 * @param {Object<string, Object>} subcollections The map of subcollection names
 * to the corresponding Submodel
 */
export function attachSubmodelInstanceReferencesToDocRef(docRef, subcollections) {
    docRef.subcollections = {};
    const subcollectionNames = Object.keys(subcollections);
    for (let subcollectionName of subcollectionNames) {
        const subcollection = subcollections[subcollectionName];
        const submodelInstance = subcollection._createSubmodelInstance(
            docRef
        );
        docRef.subcollections[subcollectionName] = submodelInstance;
    }
}