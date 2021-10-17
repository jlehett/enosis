import {
    registerSubcollection,
} from './utilities/referencing';
import Sanitizer from './utilities/sanitization';
import SubmodelInstance from './submodel-instance';
import Model from './model';

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