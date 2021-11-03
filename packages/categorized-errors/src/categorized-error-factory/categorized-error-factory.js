import template from 'lodash/template';
import includes from 'lodash/includes';

/**
 * Factory for generating categorized errors given their definitions.
 * 
 * This class is intended to generate reference enums for "Categorized" errors,
 * which are errors that may be associated with 0+ user-defined categories.
 * 
 * By grouping all error definitions in a single location in a file, it becomes
 * easier to see what errors may be thrown from functions within the file. It
 * also becomes easier to reference those errors via the reference enums instead
 * of using arbitrary strings.
 * 
 * Lodash template strings can also be used in the error factories that are
 * generated if the error definition uses a `messageTemplate` property as
 * opposed to a plaintext `message` property.
 * 
 * @param {Object<string, ErrorDef>} errorDefs Map of IDs to their error
 * definitions
 */
class CategorizedErrorFactory {
    constructor(errorDefs) {
        const referenceEnums = this._createReferenceEnums(errorDefs);
        this.ids = referenceEnums.ids;
        this.factories = referenceEnums.factories;
        this.categories = referenceEnums.categories;
    }

    /********************
     * PUBLIC FUNCTIONS *
     ********************/

    /*********************
     * PRIVATE FUNCTIONS *
     *********************/

    /**
     * Creates the reference enums for error IDs, factories, and error
     * categories.
     * @private
     * @function
     * 
     * @param {Object<string, ErrorDef>} errorDefs Map of IDs to their error
     * definitions
     * @returns {CategorizedErrorReferenceEnums} All of the generated reference
     * as a single object
     */
    _createReferenceEnums(errorDefs) {
        const referenceEnums = {
            ids: {},
            factories: {},
            categories: {},
        };

        for (var id in errorDefs) {
            // Add the ID to the ID reference enum
            referenceEnums.ids[id] = id;
            // Get the error def from the object
            const errorDef = errorDefs[id];
            // Add all of the categories in the error def to the categories
            // reference enum
            if (errorDef.categories) {
                for (const category of errorDef.categories) {
                    referenceEnums.categories[category] = category;
                }
            }
            // Create the factory for the error def, and add it to the factories
            // reference enum
            referenceEnums.factories[id] = this._createErrorFactory(errorDef, id);
        }

        return referenceEnums;
    }

    /**
     * Creates and returns an error factory for the specified error def.
     * @private
     * @function
     * 
     * @param {ErrorDef} errorDef Object defining the error for which to create
     * a factory
     * @param {string} id ID of the error
     * @returns {ErrorFactory} The factory function for the specified error
     */
    _createErrorFactory(errorDef, id) {
        return function (templateVars) {
            return {
                id: id,
                message: errorDef.message || template(errorDef.messageTemplate)(templateVars),
                categories: errorDef.categories || [],
                inCategory: function (category) {
                    return includes(errorDef.categories, category);
                },
            };
        };
    }
}

export default CategorizedErrorFactory;