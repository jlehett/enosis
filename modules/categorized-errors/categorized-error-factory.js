import _ from 'lodash';
import template from 'lodash/template';
import includes from 'lodash/includes';

/**
 * Factory for generating categorized errors given their definitions.
 * @class
 * 
 * @definition
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
 * @example
 * // Create the reference enums for some error definitions
 * var categorizedErrors = new CategorizedErrorFactory({
 *      NO_FILES_SELECTED: {
 *          message: 'No files selected!',
 *          categories: ['SAFE', 'HARMLESS'],
 *      },
 *      ONE_FILE_SELECTED: {
 *          messageTemplate: '<%= filename %> selected!',
 *          categories: ['SAFE']
 *      },
 *      QUESTIONABLE_ERROR: {
 *          message: 'This is very useful, I promise!'
 *      }
 * });
 * 
 * // Generate some errors
 * var noFilesSelectedErr = categorizedErrors.factories.NO_FILES_SELECTED();
 * 
 * var oneFileSelectedErr = categorizedErrors.factories.ONE_FILE_SELECTED({
 *      filename: 'Test File.csv'
 * });
 * 
 * var questionableErr = categorizedErrors.factories.QUESTIONABLE_ERROR();
 * 
 * // Test to see if the errors are part of a category
 * noFilesSelectedErr.inCategory(categorizedErrors.categories.HARMLESS); // true
 * 
 * oneFileSelectedErr.inCategory(categorizedErrors.categories.HARMLESS); // false
 * 
 * questionableErr.inCategory(categorizedErrors.categories.SAFE); // false
 * 
 * // Test to see if an error is a specific Categorized Error
 * var errorMatches = noFilesSelectedErr.id === categorizedErrors.ids.NO_FILES_SELECTED; // true
 */
class CategorizedErrorFactory {

    /***********************
     * STANDALONE TYPEDEFS *
     ***********************/

    /**
     * Object defining an error.
     * @typedef {Object} ErrorDef
     * 
     * @property {_.template} [messageTemplate] Message template created with
     * lodash's `template` function; must be specified if a regular `message` is
     * not specified
     * @property {string} [message] Plain string message; must be specified if a
     * `messageTemplate` is not specified
     * @property {string[]} [categories] Specifies the categories the error is
     * associated with
     */

    /**
     * Object containing all of the created reference enums.
     * @typedef {Object} CategorizedErrorReferenceEnums
     * 
     * @property {ID_ReferenceEnum} ids ID reference enum
     * @property {Factory_ReferenceEnum} factories Factory reference enum
     * @property {Category_ReferenceEnum} categories Category reference enum
     */

    /**
     * Reference enum of IDs.
     * @typedef {Object<string, string>} ID_ReferenceEnum
     */

    /**
     * Reference enum of error factories.
     * @typedef {Object<string, string>} Factory_ReferenceEnum
     */

    /**
     * Reference enum of all categories used in the error defs.
     * @typedef {Object<string, string>} Category_ReferenceEnum
     */

    /**
     * Factory for a specified error.
     * @callback ErrorFactory
     * 
     * @param {Object} templateVars Any variables that should be passed to the
     * error message template; See lodash's documentation on `_.template` for
     * more information
     * @returns {CategorizedError} The categorized error generated from the factory
     */

    /**
     * A categorized error object that can be thrown.
     * @typedef {Object} CategorizedError
     * 
     * @property {string} id The ID of the error
     * @property {string} message The message of the error after being compiled
     * with template variables inserted
     * @property {string[]} categories All of the categories to which the error belongs
     * @property {InCategoryFn} inCategory Function to see if the error is
     * associated with the provided category
     */

    /**
     * Function to see if a categorized error is associated with a specific category.
     * @callback InCategoryFn
     * 
     * @param {string} category The category to test to see if the categorized
     * error is associated with
     * @returns {boolean} Returns true if the categorized error is associated
     * with the specified category
     */

    /***************
     * CONSTRUCTOR *
     ***************/

    /**
     * Constructs the categorized error factory object and populates the
     * following reference enums: `ids`, `factories`, and `categories`
     * @constructor
     * 
     * @param {Object<string, ErrorDef>} errorDefs Map of IDs to their error
     * definitions
     */
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