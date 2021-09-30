
/**
 * Deferred promise object based on the $q.Deferred implementation. Allows a
 * developer to resolve or reject the created promise from outside of the
 * promise's scope.
 * 
 * The deferred object's promise can be accessed through its `promise` property,
 * and the promise can be externally resolved or rejected via the `resolve` and
 * `reject` properties.
 * 
 * @example
 * // Create a deferred promise
 * const deferred = new Deferred();
 * 
 * // After 3 seconds, resolve the deferred promise with the value, "Test"
 * setTimeout(() => {
 *      deferred.resolve('Test');
 * }, 3000);
 * 
 * // Obtain the result of deferred once it has resolved
 * const deferredResult = await deferred.promise; // deferredResult now has the value "Test"
 * 
 * @property {Promise<*>} promise The internal promise of the Deferred instance
 * @property {function} resolve Function to resolve the internal promise of the
 * Deferred instance
 * @property {function} reject Function to reject the internal promise of the
 * Deferred instance
 */
class Deferred {
    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }
};

export default Deferred;