import {
    runTransaction as _runTransaction,
} from 'firebase/firestore';
import { getDB } from './referencing';

/**
 * This file is intended to export functions that really just map 1:1 to an existing Firestore function, with some
 * parameters pre-filled in.
 */

/**
 * Creates a transaction to run for Firestore. Pre-fills the database info so that the user only needs to provide the
 * transaction function to run.
 * 
 * @param {function} updateFn The transaction function to run; should accept `transaction` as its only parameter
 * @returns {Promise<*>} Resolves once the transaction has completed successfully 
 */
export function runTransaction(updateFn) {
    return _runTransaction(getDB(), updateFn);
}