import { useState } from 'react';

/**
 * Flag specifying whether the function is currently running or not.
 * @typedef {boolean} FnRunning
 */

/**
 * Runs the function passed to the hook initializer, while tracking
 * itself in state.
 * @param {function} AugmentedRunFn 
 */

/**
 * Hook which returns an API for running functions and tracking whether
 * they are currently running.
 * 
 * @param {fn} fn The function to track in state
 * @returns {[ FnRunning, AugmentedRunFn ]} The API exposed by the hook
 */
export default function(fn) {
    /**
     * State to track whether the function is running.
     */
    const [fnRunning, setFnRunning] = useState(false);

    /**
     * Define a new `runFn` function that tracks itself with state.
     */
    const runFn = async (...args) => {
        setFnRunning(true);
        try {
            if (fn) {
                await fn(...args);
            }
        } catch (err) {
            // We do not need to do anything here -- error handling
            // should be done in the passed `fn`
        } finally {
            setFnRunning(false);
        }
    };

    // Return the track function API
    return [
        fnRunning,
        runFn,
    ];
}
