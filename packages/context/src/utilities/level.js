import {
    createContextSlice,
    combineContextProviders,
} from './core';

/**
 * Object representing a React Context "Level".
 * @typedef {Object} ContextLevel
 * @property {React.FunctionalComponent} Provider The unified provider of all of the
 * context slices that were created for this context level
 * @property {Object<string, FunctionalContextSlice>} use Object mapping strings to a particular
 * functional context slice 
 */

/**
 * Object representing a functional React Context "Slice".
 * @typedef {Object} FunctionalContextSlice
 * @property {React.Hook} value The hook to call to use this particular slice's value as context
 * @property {React.Hook} api The hook to call to use this particular slice's {@link ContextAPI}
 */

/**
 * Creates a "context level", given its initial state. The proper context "slices" will be
 * instantiated.
 * 
 * The unified provider of all of the context "slices", and the individual `use...` hooks will
 * be available from the output of this function.
 * 
 * @param {Object} initialState Object mapping out the initial state of the context level; all
 * of the keys will represent individual context "slices" that will be created, and their values
 * will represent each of their individual initial states
 * @returns {ContextLevel} The context level object to use
 */
export function createContextLevel(initialState) {
    // Track all of the created context slice providers in an array to combine later
    const providers = [];
    // Create an empty `use` object to be populated
    const use = {};

    // Populate the `use` object with all of the individual slices and their functions
    for (const [key, value] of Object.entries(initialState)) {
        // Create the context slice for the entry
        const keyContext = createContextSlice(value);
        // Add the context's hooks to the `use` object
        use[key] = {
            value: keyContext.useContext,
            api: keyContext.useContextAPI,
        };
        // Add the context's provider to the providers array
        providers.push(keyContext.Provider);
    }

    // Combine all of the providers into a single provider
    const unifiedProvider = combineContextProviders(providers);

    // Return the final "context level"
    return {
        Provider: unifiedProvider,
        use,
    };
}
