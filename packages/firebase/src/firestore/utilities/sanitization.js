import {
    assign,
    omitBy,
    pick,
    isUndefined,
} from 'lodash';

/**
 * Class which provides utility functions for sanitizing data from Firestore
 * read operations, and for sanitizing data to write to Firestore.
 * 
 * @param {string[]} collectionProps The list of properties the collection
 * supports
 * @param {Object<string, *>} propDefaults Map of property keys to their
 * default values
 */
class Sanitizer {
    constructor(collectionProps, propDefaults) {
        this.collectionProps = collectionProps;
        this.propDefaults = propDefaults;
    }

    /********************
     * PUBLIC FUNCTIONS *
     ********************/

    /**
     * Sanitizes the data from either a doc snapshot or a query snapshot, as
     * appropriate. Automatically determines if the passed-in data is a doc
     * snapshot or a query snapshot.
     * @public
     * @function
     * 
     * @param {Firestore.DocumentSnapshot | Firestore.QuerySnapshot} docOrQuerySnapshot
     * Either a document or query snapshot to sanitize the data from
     * @returns {Object | Object[]} If the passed-in snapshot was a document
     * snapshot, an object with the sanitized data will be returned; if the
     * passed-in snapshot was a query snapshot, an array of objects with the
     * sanitized data will be returned
     */
    sanitizeFromRead(docOrQuerySnapshot) {
        const isQuerySnapshot = docOrQuerySnapshot.size !== undefined;
        if (isQuerySnapshot) {
            return this._sanitizeQuerySnapshotFromRead(docOrQuerySnapshot);
        } else {
            return this._sanitizeDocSnapshotFromRead(docOrQuerySnapshot);
        }
    }

    /**
     * Sanitizes the data to save to a document, while merging in default
     * property values, if the `mergeWithDefaultValues` flag is set to true.
     * @public
     * @function
     * 
     * @param {Object} data The data to sanitize
     * @param {boolean} [mergeWithDefaultValues] If set to true, the default
     * property values will be merged in with the specified data before
     * sanitization
     * @returns {Object} The sanitized data, with default values merged in if
     * the `mergeWithDefaultValues` flag was set to true
     */
    getSanitizedDataToSave(data, mergeWithDefaultValues) {
        let dataToSanitize = data;
        if (mergeWithDefaultValues) {
            dataToSanitize = assign({}, this.propDefaults, dataToSanitize);
        }
        return this._sanitizeForWrite(dataToSanitize);
    }

    /*********************
     * PRIVATE FUNCTIONS *
     *********************/

    /**
     * Sanitizes the data from a document snapshot to be returned back.
     * @private
     * @function
     * 
     * @param {Firestore.DocumentSnapshot} docSnapshot A Firestore document
     * snapshot to sanitize the data from
     * @returns {Object | null} The sanitized data from the document snapshot;
     * if no data existed, `null` will be returned
     */
    _sanitizeDocSnapshotFromRead(docSnapshot) {
        if (!docSnapshot.exists()) {
            return null;
        } else {
            // Grab only the data specified by collection props
            const data = omitBy(
                pick(docSnapshot.data(), this.collectionProps),
                isUndefined
            );

            // General Firestore data massaging operations
            const convertedData = {};
            Object.entries(data).forEach(([key, value]) => {
                if (value) {
                    // Convert Firestore timestamp objects into JS Date objects
                    if (typeof value === 'object' && typeof value.toDate === 'function') {
                        convertedData[key] = value.toDate();
                    }
                }
            });

            // Attach id and _ref fields, and return the sanitized doc data
            return {
                ...data,
                ...convertedData,
                id: docSnapshot.id,
                _ref: docSnapshot.ref
            };
        }
    }
    
    /**
     * Sanitize the data from a query snapshot to be returned back.
     * @private
     * @function
     * 
     * @param {Firestore.QuerySnapshot} querySnapshot A Firestore query snapshot
     * to sanitize the data from
     * @returns {Object[]} The sanitized data from the query snapshot
     */
    _sanitizeQuerySnapshotFromRead(querySnapshot) {
        return querySnapshot.docs.map((doc) => {
            return this._sanitizeDocSnapshotFromRead(doc);
        });
    }

    /**
     * Sanitizes the passed-in data to be written to a document.
     * @private
     * @function
     * 
     * @param {Object} data The data to sanitize for the purposs of saving to
     * a document
     * @returns {Object} The sanitized data 
     */
    _sanitizeForWrite(data) {
        return omitBy(pick(data, this.collectionProps), isUndefined);
    }
}

export default Sanitizer;