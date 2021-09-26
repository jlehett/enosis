import DataPipelineStep from './data-pipeline-step.abstract';

/**
 * Defines a step where data is cleared from the progressive storage in the
 * data pipeline.
 * @class
 * 
 * @description
 * This data pipeline step will clear the data in progressive storage that
 * exists under any of the keys in `dataStorageKeys`.
 * 
 * This is useful if, for example, you need data from step 1 to exist only long
 * enough for it to be used by step 3. At that point, you no longer need the
 * results of step 1 in memory, and so you can clear memory with this step.
 */
class ClearDataStep extends DataPipelineStep {

    /**
     * A data pipeline step for clearing data from progressive storage.
     * @constructor
     * 
     * @param {string[]} dataStorageKeys The keys to clear the data from in
     * progressive storage
     */
    constructor(dataStorageKeys) {
        super();
        this.dataStorageKeys = dataStorageKeys;
    }

    /********************
     * PUBLIC FUNCTIONS *
     ********************/

    /**
     * Run the data pipeline step and clear the data from the appropriate keys
     * in progressive storage.
     * @public
     * @function
     * 
     * @param {Object} progressiveStorage The progressive storage object from
     * the data pipeline that is running this data pipeline step
     * @returns {Promise<*>} Returns a promise that resolves once the data has
     * been cleared from progressive storage
     */
    async run(progressiveStorage) {
        for (let dataStorageKey of this.dataStorageKeys) {
            delete progressiveStorage[dataStorageKey];
        }
    }
}

export default ClearDataStep;