import {
    set,
    get,
} from 'firebase/database';
import Sanitizer from '../utilities/sanitization';
import {
    createCollectionRefString,
    createRefFromRefString,
} from '../utilities/referencing';

class RealtimeModel {
    constructor(params) {
        this._validateConstructorParams(params);

        // Create class variables
        this.sanitizer = new Sanitizer(
            params.collectionProps,
            params.propDefaults || {}
        );
        this.refString = createCollectionRefString(
            params.collectionName,
            params.parentDoc?.refString,
        );
    }

    /********************
     * PUBLIC FUNCTIONS *
     ********************/

    /**
     * Sanitizes the specified data and writes it to a specified document in the collection.
     * 
     * @param {*} id 
     * @param {*} data 
     */
    writeToID(id, data) {
        const ref = createRefFromRefString(
            createDocRefString(this.refString, id)
        );
        const sanitizedData = this.sanitizer.getSanitizedDataToSave(
            data,
            params?.mergeWithDefaultValues
        );
        set(ref, sanitizedData);
    }

    /*********************
     * PRIVATE FUNCTIONS *
     *********************/

    /**
     * Validates the Model constructor's params object.
     * @private
     * @function
     * 
     * @param {Object} params Argument given to the Model's constructor
     */
    _validateConstructorParams(params) {
        if (!params.collectionName) {
            throw new Error('`collectionName` must be specified when constructing a new model.');
        }
        if (!params.collectionProps) {
            throw new Error('`collectionProps` must be specified when constructing a new model.');
        }
    }
}