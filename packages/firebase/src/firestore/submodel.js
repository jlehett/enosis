import {
    registerSubcollection,
} from './utilities/referencing';
import Sanitizer from './utilities/sanitization';
import SubmodelInstance from './submodel-instance';
import Model from './model';

/**
 * Class which provides a streamlined approach for creating Firestore
 * submodel objects with various simplified read and write operations.
 * 
 * Before submodels are constructed, the firebase app in use should be
 * tracked via the `setFirebaseApp` function from this package.
 * 
 * Submodels are unique in that each instance associates a particular
 * document as its parent. For this reason, the `Submodel` class is
 * intended as a way to interact with Firestore subcollections in very
 * general aspects.
 * 
 * Each Model (or SubmodelInstance) will contain references to its direct
 * SubmodelInstance children, which can be used for interacting with specific
 * instances of Firestore subcollections.
 * 
 * @example
 * // Given an existing "Profile" model for Firestore, create a new
 * // "Email" submodel for "Profile" model instances.
 * const ProfileEmailModel = new Submodel({
 *      collectionName: 'emails',
 *      collectionProps: [
 *          'address',
 *          'isValid',
 *      ],
 *      propDefaults: {
 *          address: 'john@gmail.com',
 *          isValid: true
 *      }
 * });
 * 
 * @param {SubmodelParams} params The parameters to use when creating the
 * submodel
 */
class Submodel {
    constructor(params) {
        this._validateConstructorParams(params);

        // Create class variables
        this.subcollections = {};

        // Store some info for the SubmodelInstance factory function
        this.collectionName = params.collectionName;
        this.sanitizer = new Sanitizer(
            params.collectionProps,
            params.propDefaults || {}
        );

        // Register the subcollection on the parent
        params.parent.registerSubcollection(this);

        // Add partials
        this.registerSubcollection = childModel => registerSubcollection(
            this.subcollections,
            childModel
        );
    }

    /********************
     * PUBLIC FUNCTIONS *
     ********************/

    /***********************
     * PROTECTED FUNCTIONS *
     ***********************/

    /**
     * Validates the Submodel constructor's params object.
     * @private
     * @function
     * 
     * @param {Object} params Argument given to the Submodel's constructor
     */
    _validateConstructorParams(params) {
        if (!params.collectionName) {
            throw new Error('`collectionName` must be specified when constructing a new submodel.');
        }
        if (!params.collectionProps) {
            throw new Error('`collectionProps` must be specified when constructing a new submodel.');
        }
        if (
            !params.parent ||
            (
                !params.parent instanceof Model &&
                !params.parent instanceof Submodel
            )
        ) {
            throw new Error('`parent` must be specified and be of type `Model` or `Submodel` when constructing a new submodel.');
        }
    }
    
    /**
     * Given the doc or doc reference to associate as the parent, create a
     * new submodel instance.
     * 
     * @param {Firestore.DocumentSnapshot | Firestore.DocumentReference} docOrDocRef
     * The doc or doc reference to set as the parent of the new submodel
     * instance
     * @returns {SubmodelInstance} The created submodel instance
     */
    _createSubmodelInstance(docOrDocRef) {
        let docRef = docOrDocRef._ref || docOrDocRef;
        return new SubmodelInstance({
            collectionName: this.collectionName,
            parentDocRef: docRef,
            sanitizer: this.sanitizer,
            subcollections: this.subcollections,
        });
    }
}

export default Submodel;