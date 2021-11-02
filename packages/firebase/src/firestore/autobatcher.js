import isInteger from 'lodash/isInteger';
import map from 'lodash/map';
import { getDB } from './utilities/referencing';
import {
    writeBatch
} from 'firebase/firestore';
import { Deferred } from '@unifire-js/async';

/**
 * Class to automatically create batches of a specified max size, commit them when
 * their capacity is maxed-out, and create new batches when they are needed.
 * 
 * @param {Number} [maxPerBatch=500] Defines the maximum capacity of each batch; the
 * maximum batch size supported by Firestore as of 10/31/21 is 500 writes, thus that
 * value is selected as the default
 */
class Autobatcher {
    constructor(maxPerBatch=500) {
        this._validateConstructorParams(maxPerBatch);

        this.maxPerBatch = maxPerBatch;
        this.numWritesInCurrentBatch = 0;

        // Set up storage to track all of the batch commit promises
        this.batchPromises = [];
    }

    /********************
     * PUBLIC FUNCTIONS *
     ********************/

    /**
     * Add a set operation to the current batch. If the batch is maxed out in
     * capacity, commit the batch.
     * @public
     * @function
     * 
     * @param {Firestore.DocumentReference} docRef The reference to the document
     * to call the set operation on
     * @param {Object} data The data to use in the set operation
     * @param {SetParams} [params] Various settings for the operation
     */
    set(docRef, data, params) {
        if (!this.currentBatch) {
            this._createNewBatch();
        }
        this.currentBatch.set(docRef, data, params);
        this._commitBatchIfNeeded();
    }

    /**
     * Add a delete operation to the current batch. If the batch is maxed out
     * in capacity, commit the branch.
     * @public
     * @function
     * 
     * @param {Firestore.DocumentReference} docRef The reference to the document
     * to delete
     */
    delete(docRef) {
        if (!this.currentBatch) {
            this._createNewBatch();
        }
        this.currentBatch.delete(docRef);
        this._commitBatchIfNeeded();
    }

    /**
     * Commit the current batch, and update its promise.
     * @public
     * @function
     */
    commit() {
        const numPromises = this.batchPromises.length;
        this.currentBatch.commit()
            .then(() => {
                this.batchPromises[numPromises-1].resolve();
            })
            .catch((err) => {
                this.batchPromises[numPromises-1].reject(err);
            });

        this.currentBatch = null;
        this.numWritesInCurrentBatch = 0;
    }

    /**
     * Return a promise that resolves once all current batch promises have
     * resolved.
     * @public
     * @function
     * 
     * @returns {Promise<void>} Resolves once all current batch promises have
     * resolved
     */
    allBatchesFinalized() {
        const promisesFromDeferred = map(this.batchPromises, (batchPromise) => {
            return batchPromise.promise;
        });
        return Promise.all(promisesFromDeferred);
    }

    /*********************
     * PRIVATE FUNCTIONS *
     *********************/

    /**
     * Validates the Autobatcher constructor's params object.
     * @private
     * @function
     * 
     * @param {*} maxPerBatch The `maxPerBatch` param given to the constructor
     */
    _validateConstructorParams(maxPerBatch) {
        if (maxPerBatch <= 0 && !isInteger(maxPerBatch)) {
            throw new Error(
                `maxPerBatch must be a positive integer; given value was ${maxPerBatch}`
            );
        }
    }

    /**
     * If the batch is maxed-out, commit it, then create a new batch.
     * @private
     * @function
     */
    _commitBatchIfNeeded() {
        if (++this.numWritesInCurrentBatch >= this.maxPerBatch) {
            this.commit();
        }
    }

    /**
     * Create a new batch, and track the new batch promise in storage.
     * @private
     * @function
     */
    _createNewBatch() {
        this.currentBatch = writeBatch(getDB());
        const newBatchPromise = new Deferred();
        this.batchPromises.push(newBatchPromise);
    }
}

export default Autobatcher;