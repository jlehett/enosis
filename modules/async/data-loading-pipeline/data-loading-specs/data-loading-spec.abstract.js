
/**
 * Abstract class that any data spec classes should inherit from.
 */
class DataLoadingSpec {

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
        throw new Error('Run function not specified for data spec class.');
    }
}

export default DataLoadingSpec;