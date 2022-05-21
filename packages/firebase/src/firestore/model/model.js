import Sanitizer from '../utilities/sanitization';
import {
    registerSubcollection,
    createCollectionRef,
} from '../utilities/referencing';
import ModelInstanceOperations from '../utilities/model-instance-operations';

/**
 * Class which provides a streamlined approach for creating Firestore model
 * objects with various simplified read and write operations.
 * 
 * Before models are constructed, the Unifire Firebase app should be set via
 * the `setUnifireFirebaseApp` function from this package.
 * 
 * @param {ModelParams} params The parameters to use when creating the model
 */
class Model extends ModelInstanceOperations {
    constructor(params) {
        super();
        this._validateConstructorParams(params);

        // Create class variables
        this.sanitizer = new Sanitizer(
            params.collectionProps,
            params.propDefaults || {}
        );
        this.subcollections = {};
        this.collectionRef = createCollectionRef(params.collectionName);

        // Add partials
        this.registerSubcollection = childModel => registerSubcollection(
            this.subcollections,
            childModel
        );
    }

    /********************
     * PUBLIC FUNCTIONS *
     ********************/

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

export default Model;