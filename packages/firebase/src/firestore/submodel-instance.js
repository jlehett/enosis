import {
    createCollectionRef
} from './utilities/referencing';
import ModelInstanceOperations from './utilities/model-instance-operations';

/**
 * Class which should ONLY be constructed via the Submodel's factory function.
 * Exposes `ModelInstanceOperations` functionality for a subcollection with
 * a specified parent document reference.
 * 
 * @param {SubmodelInstanceParams} params The parameters to use when creating
 * the submodel instance
 */
class SubmodelInstance extends ModelInstanceOperations {
    constructor(params) {
        super();
        this._validateConstructorParams(params);

        // Create class variables
        this.sanitizer = params.sanitizer;
        this.subcollections = params.subcollections;
        this.collectionRef = createCollectionRef(
            params.collectionName,
            params.parentDocRef
        );
    }

    /********************
     * PUBLIC FUNCTIONS *
     ********************/

    /*********************
     * PRIVATE FUNCTIONS *
     *********************/

    /**
     * Validates the SubmodelInstance constructor's params object.
     * @private
     * @function
     * 
     * @param {Object} params Argument given to the SubmodelInstance's
     * constructor
     */
    _validateConstructorParams(params) {
        if (!params.sanitizer) {
            throw new Error('`sanitizer` must be specified when constructing a submodel instance.');
        }
        if (!params.subcollections) {
            throw new Error('`subcollections` must be specified when constructing a submodel instance.');
        }
        if (!params.collectionName) {
            throw new Error('`collectionName` must be specified when constructing a submodel instance.');
        }
        if (!params.parentDocRef) {
            throw new Error('`parentDocRef` must be specified when constructing a submodel instance.');
        }
    }
}

export default SubmodelInstance;