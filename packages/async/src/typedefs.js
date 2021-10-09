/**
 * Async function to run to acquire some data asynchronously; desired result
 * should be returned as a promise.
 * @callback acquireDataFn
 * 
 * @example
 * // Async function to acquire profile data from a database using an email
 * // previously fetched in the pipeline and stored in progressive storage
 * (progressiveStorage) => {
 *      return ProfileModel.getProfileByEmail(progressiveStorage.email);
 * }
 * 
 * @param {Object} progressiveStorage The progressive storage object from the
 * data loading pipeline
 * @returns {Promise<*>} Resolves with the desired async data to either save to
 * storage, or to pass to a post-processing function
 */

/**
 * Synchronous function to modify acquired data before it is saved to the
 * progressive storage object in a data loading pipeline.
 * @callback postProcessingFn
 * 
 * @example
 * // Post-processing function to only save the `displayName` property of a
 * // profile object fetched from the database asynchronously
 * (progressiveStorage, profile) => {
 *      return profile.displayName;
 * }
 * 
 * @param {Object} progressiveStorage The progressive storage object from the
 * data loading pipeline
 * @param {*} data The data acquired from the {@link acquireDataFn} function
 * @returns {*} The value to save to progressive storage
 */

/**
 * Synchronous function to populate non-async data to the progressive storage
 * object in a data loading pipeline.
 * @callback populateDataFn
 * 
 * @example
 * // Function to save a new value to progressive storage which is the result
 * // of appending "-New" to the existing `profileDisplayName` property value
 * // in progressive storage
 * (progressiveStorage) => {
 *      return progressiveStorage.profileDisplayName + '-New';
 * }
 * 
 * @param {Object} progressiveStorage The progressive storage object from the
 * data loading pipeline
 * @returns {*} The value to save to progressive storage
 */