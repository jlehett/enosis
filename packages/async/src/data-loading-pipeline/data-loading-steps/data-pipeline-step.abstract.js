
/**
 * Abstract class that any data pipeline step classes should inherit from.
 * @abstract
 */
 class DataPipelineStep {

    /**********************
     * ABSTRACT FUNCTIONS *
     **********************/

    /**
     * Run the data spec.
     * @abstract
     * @public
     * @function
     */
    run() {
        throw new Error('Run function not specified for data pipeline step class.');
    }
}

export default DataPipelineStep;