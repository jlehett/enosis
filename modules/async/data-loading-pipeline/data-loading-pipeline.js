import DataLoadingSpec from './data-loading-specs/data-loading-spec.abstract';
import forEach from 'lodash/forEach';

/**
 * Class which provides a readable and maintainable system for constructing
 * async data loading pipelines that require intermediate data to be saved
 * between steps.
 * @class
 *
 * @description
 * Typical data loading pipelines tend to be hard to refactor, as it is
 * difficult to parse what data from previous steps may be required in future
 * steps. This means re-ordering, removing, or adding any data loading steps can
 * introduce many unintended issues.
 * 
 * This data pipeline class is intended to chunk individual steps into "data
 * loading specs" with single responsibilities. Data populated from previous
 * steps is still accessible via a "progressive storage" object that is passed
 * through each data loading spec's `run` function. However, it becomes easier
 * to tell when a step relies on previously-acquired data by its usage of the
 * `progressiveStorage` object.
 * 
 * For example, if an AcquireDataSpec's `acquireDataFn` uses
 * `progressiveStorage.profile`, a developer can easily ensure that the
 * appropriate data loading spec that populates the `profile` key in progressive
 * storage is kept in the pipeline as a spec that runs before the example
 * AcquireDataSpec is run.
 * 
 * @example
 * @TODO Add example here
 */
class DataLoadingPipeline {

    /**
     * Constructs the data loading pipeline.
     * @constructor
     * 
     * @param {DataLoadingSpec[]} dataLoadingSpecs Array of data loading specs;
     * all values in the array should be instances of classes which inherit from
     * DataLoadingSpec
     */
    constructor(dataLoadingSpecs) {
        this._ensureAllSpecsInArrayAreActuallySpecs(dataLoadingSpecs);
        this.dataLoadingSpecs = dataLoadingSpecs;

        this.progressiveStorage = {};
    }

    /********************
     * PUBLIC FUNCTIONS *
     ********************/

    /**
     * Runs the data loading pipeline and returns a promise which resolves with
     * the final `progressiveStorage` that is constructed.
     * @public
     * @function
     * 
     * @returns {Promise<Object>} Promise which resolves with the progressive
     * storage object that is constructed by the end of the pipeline
     */
    run() {
        // Create a starting point to begin a promise loop
        let loopingPromise = new Promise((resolve, reject) => {
            resolve();
        });

        // Iterate through all of the data loading specs and perform their
        // corresponding operations
        forEach(this.dataLoadingSpecs, (dataLoadingSpec) => {
            loopingPromise = loopingPromise
                .then(() => {
                    return dataLoadingSpec.run(this.progressiveStorage);
                });
        });

        // Once the looping promise has completed, return the progressive
        // storage that has been constructed
        return loopingPromise.then(() => {
            return this.progressiveStorage;
        });
    }

    /*********************
     * PRIVATE FUNCTIONS *
     *********************/

    /**
     * Perform error checking to ensure all values being passed in the
     * `dataLoadingSpecs` array are DataLoadingSpec instances.
     * @private
     * @function
     * 
     * @param {*[]} dataLoadingSpecs Array of values to ensure are instances of
     * DataLoadingSpec
     */
    _ensureAllSpecsInArrayAreActuallySpecs(dataLoadingSpecs) {
        for (let dataLoadingSpec of dataLoadingSpecs) {
            if (!dataLoadingSpec instanceof DataLoadingSpec) {
                throw new Error('Non-DataLoadingSpec passed in `dataLoadingSpecs` array.');
            }
        }
    }
}

export default DataLoadingPipeline;