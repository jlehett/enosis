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
}

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
}