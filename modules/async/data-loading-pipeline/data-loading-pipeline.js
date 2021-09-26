import DataPipelineStep from './data-loading-steps/data-pipeline-step.abstract';
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
 * pipeline steps" with single responsibilities. Data populated from previous
 * steps is still accessible via a "progressive storage" object that is passed
 * through each data pipeline step's `run` function. However, it becomes easier
 * to tell when a step relies on previously-acquired data by its usage of the
 * `progressiveStorage` object.
 * 
 * For example, if an AcquireDataStep's `acquireDataFn` uses
 * `progressiveStorage.profile`, a developer can easily ensure that the
 * appropriate data pipeline step that populates the `profile` key in progressive
 * storage is kept in the pipeline as a step that runs before the example
 * AcquireDataStep is run.
 * 
 * @example
 * @TODO Add example here
 */
class DataLoadingPipeline {

    /**
     * Constructs the data loading pipeline.
     * @constructor
     * 
     * @param {DataPipelineStep[]} dataPipelineSteps Array of data pipeline
     * steps; all values in the array should be instances of classes which
     * inherit from DataPipelineStep
     */
    constructor(dataPipelineSteps) {
        this._ensureAllStepsInArrayAreActuallySteps(dataPipelineSteps);
        this.dataPipelineSteps = dataPipelineSteps;

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

        // Iterate through all of the data pipeline steps and perform their
        // corresponding operations
        forEach(this.dataPipelineSteps, (dataPipelineStep) => {
            loopingPromise = loopingPromise
                .then(() => {
                    return dataPipelineStep.run(this.progressiveStorage);
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
     * `dataPipelineSteps` array are DataPipelineStep instances.
     * @private
     * @function
     * 
     * @param {*[]} dataPipelineSteps Array of values to ensure are instances of
     * DataPipelineStep
     */
    _ensureAllStepsInArrayAreActuallySteps(dataPipelineSteps) {
        for (let dataPipelineStep of dataPipelineSteps) {
            if (!dataPipelineStep instanceof DataPipelineStep) {
                throw new Error('Non-DataPipelineStep passed in `dataPipelineSteps` array.');
            }
        }
    }
}

export default DataLoadingPipeline;