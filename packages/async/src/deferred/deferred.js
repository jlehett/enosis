
/**
 * Deferred promise object based on the $q.Deferred implementation. Allows a
 * developer to resolve or reject the created promise from outside of the
 * promise's scope.
 * 
 * The deferred object's promise can be accessed through its `promise` property,
 * and the promise can be externally resolved or rejected via the `resolve` and
 * `reject` properties.
 * 
 * @property {Promise<*>} promise The internal promise of the Deferred instance
 * @property {function} resolve Function to resolve the internal promise of the
 * Deferred instance
 * @property {function} reject Function to reject the internal promise of the
 * Deferred instance
 * @property {boolean} settled Flag indicating whether the promise has settled
 * yet (resolved or rejected)
 */
class Deferred {
    constructor() {
        this.settled = false;
        this.promise = new Promise((resolve, reject) => {
            this.reject = (value) => {
                this.settled = true;
                reject(value);
            };
            this.resolve = (value) => {
                this.settled = true;
                resolve(value);
            };
        });
    }

    /**
     * The `Deferred` equivalent of `Promise.resolve()`. Creates a new `Deferred` instance and instantly
     * resovles it, then returns the created instance.
     * 
     * @param {*} value The value to return as the deferred resolution
     * @returns {Deferred} Returns the new resolved Deferred instance
     */
    static resolve(value) {
        const deferred = new Deferred();
        deferred.resolve(value);
        return deferred;
    }

    /**
     * The `Deferred` equivalent of `Promise.reject()`. Creates a new `Deferred` instance and instantly
     * rejects it, then returns the created instance.
     * 
     * @param {*} value The value to return as the deferred rejection
     * @returns {Deferred} Returns the new rejected Deferred instance
     */
    static reject(value) {
        const deferred = new Deferred();
        deferred.reject(value);
        return deferred;
    }
}

export default Deferred;