import { useImperativeHandle } from 'react';
import { useDialogAsPromise } from '../dialog-as-promise/dialog-as-promise';

/**
 * React hook that allows a developer to use a dialog as though it were a promise in an imperative manner. This hook
 * should be used when constructing the reusable dialog itself.
 *
 * If applied to a forwardRef'd component, this hook will create an imperative handle for the component's ref with
 * the following functions:
 *
 * - {function} open Function to call to open the dialog and start the dialog promise
 * - {function} closeWithResolve Function to call to close the dialog and resolve its promise
 * - {function} closeWithReject Function to call to close the dialog and reject its promise
 *
 * This hook then returns an array with the following values (in order):
 *
 * - {boolean} isOpen Flag indicating whether the dialog should be currently open
 * - {function} actionFactory Apply to any callback functions to create an action that will
 *   automatically close the dialog with either a resolution or rejection, when it completes
 *
 * @param {React.ref} ref The functional component's forwarded ref to create the imperative handle for
 * @returns {[boolean, function]} An array stating whether the dialog is currently open, and an action
 * factory for augmenting actions which automatically close the dialog when they are complete
 */
export default function(ref) {
    /**
     * React hook to use the dialog like a promise.
     */
    const [openPromise, open, closeWithResolve, closeWithReject] = useDialogAsPromise();

    /**
     * React hook to create the imperative handle for the dialog.
     */
    useImperativeHandle(ref, () => ({
        /**
         * Open the dialog.
         * @function
         */
        open,
        /**
         * Close the dialog and resolve its promise.
         * @function
         */
        closeWithResolve,
        /**
         * Close the dialog and reject its promise.
         * @function
         */
        closeWithReject,
    }));

    /**
     * A factory for creating action functions that close the dialog when they complete.
     * @function
     *
     * @param {function} actionFn The action function to augment with dialog closing capabilities
     * @param {boolean} [resolveOnSuccess=true] If true, this action will resolve the dialog promise
     * when the action succeeds; if false, it will reject the dialog promise when the action succeeds
     * @param {boolean} [rejectOnFailure=true] If true, this action will reject the dialog promise
     * when the action fails; if false, it will resolve the dialog promise when the action fails
     * @returns {function} Returns the augmented action function that can be called from the dialog
     * which will handle automatically closing the dialog when the action promise has settled
     */
    const actionFactory = (actionFn, resolveOnSuccess=true, rejectOnFailure=true) => (
        () => (
            actionFn()
                .then(() => {
                    if (resolveOnSuccess) {
                        closeWithResolve();
                    } else {
                        closeWithReject();
                    }
                })
                .catch(() => {
                    if (rejectOnFailure) {
                        closeWithReject();
                    } else {
                        closeWithResolve();
                    }
                })
        )
    );

    /**
     * Return the Hook API.
     * @type {[boolean, function]} An array stating whether the dialog is currently open, and an action
     * factory for augmenting actions which automatically close the dialog when they are complete
     */
    return [
        !openPromise.settled,
        actionFactory,
    ];
}