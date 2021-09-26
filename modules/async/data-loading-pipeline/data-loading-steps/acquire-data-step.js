import DataPipelineStep from './data-pipeline-step.abstract';

/**
 * Defines a step where data is asynchronously acquired and stored in
 * progressive storage.
 * @class
 * 
 * @description
 * This data pipeline step will run the `acquireDataFn` and obtain the results
 * from the promise. It will then store those results in the data loading
 * pipeline's "progressive storage" object under the `dataStorageKey` to be used
 * in future data loading steps.
 * 
 * If the raw data from the `acquireDataFn` function should be modified before
 * being stored in "progressive storage", an optional `postProcessingFn`
 * parameter can be passed to the `AcquireDataStep` constructor. If a
 * `postProcessingFn` function is passed, the raw results from `acquireDataFn`
 * will be passed through the `postProcessingFn`, and the result of
 * `postProcessingFn` will be stored in "progressive storage" under the `dataStorageKey`.
 * 
 * This data pipeline step should only be used for loading async data, as a
 * promise is expected to be returned from the `acquireDataFn` function.
 * Any post-processing that needs to be done in the `postProcessingFn` should
 * only be synchronous.
 * 
 * @example
 * // Create an AcquireDataStep that loads a profile from a database, and stores the
 * // profile in the data pipeline's "progressive storage" under the key "profile"
 * let acquireDisplayNameStep = new AcquireDataStep(
 *      'profile',
 *      (progressiveStorage) => {
 *          return ProfileModel.getProfileByEmail('test@gmail.com'); // <= Returns a promise
 *      }
 * );
 * 
 * // Create an AcquireDataStep that loads a profile from a database, and only stores
 * // the profile's `displayName` property in the data pipeline's "progressive storage"
 * // under the key "profileDisplayName"
 * let acquireDisplayNameStep = new AcquireDataStep(
 *      'profileDisplayName',
 *      (progressiveStorage) => {
 *          return ProfileModel.getProfileByEmail('test@gmail.com'); // <= Returns a promise
 *      },
 *      (progressiveStorage, profile) => {
 *          return profile.displayName;
 *      }
 * );
 */
class AcquireDataStep extends DataPipelineStep {

    /**
     * A data pipeline step for acquiring data asynchronously, then storing it
     * in the progressive storage of the pipeline for later use.
     * @constructor
     * 
     * @param {string} dataStorageKey The key to store the results of this data
     * pipeline step under
     * @param {function} acquireDataFn The async function to run to acquire the data
     * asynchronously; should return the desired result as a promise (or the
     * function itself should be async and return the desired result)
     * @param {function} [postProcessingFn] If the raw value from the async
     * fetching function should be modified in a synchronous manner before being
     * stored in the pipeline, an optional post-processing function will be run
     */
    constructor(dataStorageKey, acquireDataFn, postProcessingFn) {
        super();
        this.acquireDataFn = acquireDataFn;
        this.dataStorageKey = dataStorageKey;
        this.postProcessingFn = postProcessingFn;
    }

    /********************
     * PUBLIC FUNCTIONS *
     ********************/

    /**
     * Run the data pipeline step and save the results.
     * @public
     * @function
     * 
     * @param {Object} progressiveStorage The progressive storage object from
     * the data pipeline that is running this data pipeline step
     * @returns {Promise<*>} Returns a promise that resolves once the data has
     * been stored in progressive storage
     */
    async run(progressiveStorage) {
        let data = await this.acquireDataFn(progressiveStorage);
        if (this.postProcessingFn) {
            data = this.postProcessingFn(progressiveStorage, data);
        }
        progressiveStorage[this.dataStorageKey] = data;
    }
}

export default AcquireDataStep;