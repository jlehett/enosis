/**
 * Exposes an interface for declaring middleware to be used during auth
 * state changes.
 * 
 * @param {Object} config The configuration object for the Middleware
 * @property {string} [key] The key to save the results of running the
 * Middleware function under in the user context; if a key is not specified,
 * results will not be saved to the user context
 * @param {function} fn The function to run to retrieve the data to
 * store in user context; this function should accept 2 params -- the first is
 * the user currently stored in the user context, the second is a function that
 * takes an object containing the key-value pairs to update in the user context
 * state and then updates the state accordingly
 */
export default class Middleware {
    constructor(config) {
        this._validateConfigObject(config);

        this.key = config.key;
        this.fn = config.fn;
    }

    /******************
     * PUBLIC METHODS *
     ******************/

    /**
     * Run the Middleware's function to fetch the data to store in user
     * context.
     * 
     * @param {Object} user The current Firebase Auth user object in use
     * @returns {Promise<*> | *} The data to store in the user context under the
     * Middleware's key
     */
    run(user, setState) {
        return this.fn(
            user,
            (stateUpdates) => {
                setState((prevState) => ({
                    ...prevState,
                    middlewareResults: {
                        ...prevState.middlewareResults,
                        ...stateUpdates,
                    }
                }));
            }
        );
    }

    /*******************
     * PRIVATE METHODS *
     *******************/

    /**
     * Validate the config object passed to the constructor.
     * 
     * @param {Object} config The config object passed to the constructor
     */
    _validateConfigObject(config) {
        if (!this.fn) {
            throw new Error('An `fn` property must be specified when creating a new Middleware instance.');
        }
    }
}