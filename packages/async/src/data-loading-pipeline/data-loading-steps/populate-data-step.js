import DataPipelineStep from './data-pipeline-step.abstract';

/**
 * Data spec defining a step where data is synchronously populated into the
 * progressive storage.
 * 
 * This data loading spec will run the `populateDataFn` to obtain the result
 * that should be stored in progressive storage under the `dataStorageKey` to be
 * used in future data loading specs.
 * 
 * The `populateDataFn` should ONLY be async or return a promise IF a promise
 * itself is intended to be stored in progressive storage.
 * 
 * @example
 * // Create a PopulateDataSpec that populates a constant name to the progressive
 * // storage under the "constantName" key
 * let populateNameStep = new PopulateDataStep(
 *      'constantName',
 *      (progressiveStorage) => {
 *          return 'Turing';
 *      }
 * );
 * 
 * @example
 * // Create a PopulateDataSpec that populates the progressive storage with a
 * // string that combines something already stored in progressive storage with
 * // a suffix of "-New"
 * let populateSuffixedString = new PopulateDataStep(
 *      'suffixedString',
 *      (progressiveStorage) => {
 *          return progressiveStorage.someOtherString + '-New';
 *      }
 * );
 * 
 * @param {string} dataStorageKey The key to store the results of this data
 * loading spec under
 * @param {populateDataFn} populateDataFn The synchronous function to run to
 * populate the data synchronously; should NOT return a promise unless
 * storing a promise itself in the progressive storage is desired
 */
class PopulateDataStep extends DataPipelineStep {
    constructor(dataStorageKey, populateDataFn) {
        super();
        this.dataStorageKey = dataStorageKey;
        this.populateDataFn = populateDataFn;
    }

    /********************
     * PUBLIC FUNCTIONS *
     ********************/

    /**
     * Run the data loading spec and save the results.
     * @public
     * @function
     * 
     * @param {Object} progressiveStorage The progressive storage object from
     * the data pipeline that is running this data loading spec
     * @returns {Promise<*>} Returns a promise that resolves once the data has
     * been stored in progressive storage
     */
    async run(progressiveStorage) {
        progressiveStorage[this.dataStorageKey] = this.populateDataFn(progressiveStorage);
    }
}

export default PopulateDataStep;