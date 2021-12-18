import {
    assign,
    omitBy,
    pick,
    isUndefined,
} from 'lodash';

/**
 * Class which provides utility functions for sanitizing data from Firebase
 * realtime database read operations, and for sanitizing data to write to
 * the Firebase realtime database.
 * 
 * @param {string[]} collectionProps The list of properties the collection
 * supportws
 * @param {Object<string, *>} propDefaults Map of property keys to their default
 * values
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
     * Sanitizes the data from a data snapshot to be returned back.
     * @public
     * @function
     * 
     * @param {Firebase.DataSnapshot} dataSnapshot The data snapshot to sanitize
     * @returns {Object | null} The sanitized data from the data snapshot, if it existed; otherwise, null
     */
    sanitizeFromRead(dataSnapshot) {
        const value = dataSnapshot.val();
        if (!value) {
            return null;
        }
        // Grab only the data specified by collection props
        const data = omitBy(
            picker(value, this.collectionProps),
            isUndefined
        );

        // Return the sanitized data
        return data;
    }

    /**
     * Sanitizes the data to save to a document, while merging in default property values if the
     * `mergeWithDefaultValues` flag is set to true.
     * @public
     * @function
     * 
     * @param {Object} data The data to sanitize
     * @param {boolean} [mergeWithDefaultValues] If set to true, the default property values will
     * be merged in with the specified data before sanitization
     * @returns {Object} The sanitized data, with default values merged in if the `mergedWithDefaultValues`
     * flag was set to true
     */
    getSanitizedDataToSave(data, mergeWithDefaultValues) {
        let dataToSanitize = data;
        if (mergeWithDefaultValues) {
            dataToSanitize = assign({}, this.propDefaults, dataToSanitize);
        }
        return omitBy(pick(dataToSanitize, this.collectionProps), isUndefined);
    }

    /*********************
     * PRIVATE FUNCTIONS *
     *********************/
}

export default Sanitizer;