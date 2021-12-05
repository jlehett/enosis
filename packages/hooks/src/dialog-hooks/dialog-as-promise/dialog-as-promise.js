import { useState } from 'react';
import { Deferred } from '@unifire-js/async';

/**
 * The deferred promise tracking whether the dialog is open or not
 * @typedef {Deferred<*>} OpenPromise
 */

/**
 * Function to call to open the dialog.
 * @typedef {function} OpenFn
 */

/**
 * Function to call to close the dialog and resolve the dialog promise.
 * @typedef {function} CloseWithResolveFn
 */

/**
 * Function to call to close the dialog and reject the dialog promise.
 * @typedef {function} CloseWithRejectFn
 */

/**
 * Hook which returns a generalized imperative API for controlling a dialog as a promise.
 *
 * @returns {[ OpenPromise, OpenFn, CloseWithResolveFn, CloseWithRejectFn ]} The imperative API exposed by the hook
 * to control a general dialog as a promise.
 */
export default function() {
    // Track the open deferred promise in state
    const [openPromise, setOpenPromise] = useState(Deferred.resolve());
    // We need to track something else in state that updates on every close / open so that React
    // triggers an update appropriately
    const [update, setUpdate] = useState(false);

    /**
     * Callback function to open the dialog.
     * @type {OpenFn}
     */
    const open = async () => {
        if (!openPromise.settled) {
            return openPromise.promise;
        }
        const newOpenPromise = new Deferred();
        setOpenPromise(newOpenPromise);
        setUpdate(false);
        return newOpenPromise.promise;
    };

    /**
     * Callback function to close the dialog and resolve the dialog promise.
     * @type {CloseWithResolveFn}
     */
    const closeWithResolve = async (value) => {
        if (openPromise.settled) {
            return openPromise.promise;
        }
        openPromise.resolve(value);
        setUpdate(true);
        return openPromise.promise;
    };

    /**
     * Callback function to close the dialog and reject the dialog promise.
     * @type {CloseWithRejectFn}
     */
    const closeWithReject = async (value) => {
        if (openPromise.settled) {
            return openPromise.promise;
        }
        openPromise.reject(value);
        setUpdate(true);
        return openPromise.promise;
    };

    // Return the imperative API to control a general dialog as a promise
    return [
        openPromise,
        open,
        closeWithResolve,
        closeWithReject,
    ];
};