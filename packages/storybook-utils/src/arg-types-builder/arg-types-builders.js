
/********************
 * PUBLIC FUNCTIONS *
 ********************/

/**
 * Set a specified set of args as "disabled", such that they will not be shown in the Storybook
 * documentation nor in the controls.
 * @public
 *
 * @param {Object} argTypes The argTypes object to modify with the info
 * @param {string[]} argsToDisable List of args to disable
 */
export function setAsDisabled(argTypes, argsToDisable) {
    for (let arg of argsToDisable) {
        createArgTableIfNotPresent(argTypes, arg);
        argTypes[arg].table.disable = true;
    }
}

/**
 * Set a specified set of args to be of a particular category for grouping in documentation and
 * in the controls for Storybook.
 * @public
 *
 * @param {Object} argTypes The argTypes object to modify with the info
 * @param {string} category The category to add the specified args to
 * @param {string[]} argsToCategorize List of args to categorize
 */
export function setAsCategory(argTypes, category, argsToCategorize) {
    for (let arg of argsToCategorize) {
        createArgTableIfNotPresent(argTypes, arg);
        argTypes[arg].table.category = category;
    }
}

/**
 * Set a specified arg to use a radio select to choose from a set of specified options in the controls for Storybook.
 * @public
 *
 * @param {Object} argTypes The argTypes object to modify with the info
 * @param {string} arg The arg to create the entry for
 * @param {*[]} options Array of options to select from with the radio select
 */
export function setControlToRadioSelect(argTypes, arg, options) {
    createArgIfNotPresent(argTypes, arg);
    argTypes[arg].options = options;
    argTypes[arg].control = { type: 'radio' };
}

/********************
 * HELPER FUNCTIONS *
 ********************/

/**
 * In the argTypes object, create the arg if it doesn't exist already.
 * @private
 *
 * @param {Object} argTypes The arg types object to add data to
 * @param {string} arg The arg to create the entry for
 */
function createArgIfNotPresent(argTypes, arg) {
    if (!argTypes[arg]) {
        argTypes[arg] = {};
    }
}

/**
 * In the argTypes object, create both the arg and its table, if they don't exist already.
 * @private
 *
 * @param {Object} argTypes The arg types object to add data to
 * @param {string} arg The arg to create the entry and its table param for
 */
function createArgTableIfNotPresent(argTypes, arg) {
    createArgIfNotPresent(argTypes, arg);
    if (!argTypes[arg].table) {
        argTypes[arg].table = {};
    }
}