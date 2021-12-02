/**
 * Exposes an interface for declaring middleware to be used during auth
 * state changes.
 * 
 * @param {string} key The key to save the results of running the
 * Middleware function under in the user context
 * @param {function} fn The function to run to retrieve the data to
 * store in user context
 */
export default class Middleware {
    constructor(key, fn) {
        this.key = key;
        this.fn = fn;
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
    fetch(user) {
        return this.fn(user);
    }

    /*******************
     * PRIVATE METHODS *
     *******************/
}