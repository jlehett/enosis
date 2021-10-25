import Sanitizer from './utilities/sanitization';
import {
    registerSubcollection,
    createCollectionRef,
} from './utilities/referencing';
import ModelInstanceOperations from './utilities/model-instance-operations';

/**
 * Class which provides a streamlined approach for creating Firestore model
 * objects with various simplified read and write operations.
 * 
 * Before models are constructed, the firebase app in use should be tracked via
 * the `setFirebaseApp` function from this package.
 * 
 * @example
 * // Create a "Profile" model for Firestore
 * const ProfileModel = new Model({
 *      collectionName: 'profiles',
 *      collectionProps: [
 *          'displayName',
 *          'email',
 *          'phone',
 *          'address'
 *      ],
 *      propDefaults: {
 *          displayName: 'No Name',
 *          email: 'No Email'
 *      },
 * });
 * 
 * // Create reusable functions for common operations and attach them to the
 * // created profile model object
 * ProfileModel.getProfilesByEmailAndPhone = (email, phone) => (
 *      ProfileModel.getByQuery([
 *          where('email', '==', email),
 *          where('phone', '==', phone),
 *      ]);
 * );
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