import { useEffect } from 'react';

/**
 * Configuration object for the useInterval hook.
 * @typedef {Object} UseIntervalConfig
 * @property {number} period The time in milliseconds between each run of the passed-in function
 * @property {boolean} [runOnInitialization=false] Flag indicating whether the function should be run when the interval
 * is first initialized; otherwise, the first run of the function will occur after waiting for the defined period once
 * @property {boolean} [awaitFnBeforeContinuingInterval=false] Flag indicating whether the function should be `await`'d
 * before continuing with the interval 
 */

/**
 * React hook to continuously run a specified function in some interval, and is cleaned up automatically when the
 * component unmounts.
 * 
 * @param {function} fn The function to run in the interval
 * @param {UseIntervalConfig} config Configuration object for the hook
 */
export default function(fn, config) {
    validateConfig(config);

    useEffect(() => {
        // Track the setTimeout for clearing the active one later
        let activeSetTimeout;

        // Define the interval function
        let intervalFn;
        intervalFn = async () => {
            // Run the function
            if (config.awaitFnBeforeContinuingInterval) {
                await fn();
            } else {
                fn();
            }
            // Set the timeout for the next run
            activeSetTimeout = setTimeout(intervalFn, config.period);
        };

        // Either run the function immediately or after an initial timeout, depending on config
        if (config.runOnInitialization) {
            intervalFn();
        } else {
            activeSetTimeout = setTimeout(intervalFn, config.period);
        }

        // Return the cleanup for the interval (if an active timeout was present)
        return () => {
            if (activeSetTimeout) {
                clearTimeout(activeSetTimeout);
            }
        };
    }, []);
}

/********************
 * HELPER FUNCTIONS *
 ********************/

/**
 * Validate the required `config` object values for the `useInterval` hook.
 * 
 * @param {*} config 
 */
function validateConfig(config) {
    if (!config) {
        throw new Error('A `config` object must be passed to the `useInterval` hook.');
    }
    if (!config.period || typeof config.period !== 'number' || config.period <= 0) {
        throw new Error('The `config` object must contain a `period` property with a positive number as the value in the `useInterval` hook.');
    }
}