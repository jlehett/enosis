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