import { useEffect } from 'react';

/**
 * React hook for creating a listener, and removing the listener when the component unmounts.
 * 
 * @param {Model | Submodel | SubmodelInstance} model The Model, Submodel, or SubmodelInstance to create the listener for
 * @param {function} addListenerFn The Model, Submodel, or SubmodelInstance's function to call to add a listener; this
 * may be `addListenerByQuery`, `addListenerByQueryInInstance`, `addListenerByPath`, or `addListenerByID`
 * @param {string} listenerName The name to give to the listener
 * @param  {...any} remainingAddListenerFnParams The remaining params that need to be passed to the chosen "add listener"
 * function, other than `listenerName`
 */
export default function(model, addListenerFn, listenerName, ...remainingAddListenerFnParams) {
    useEffect(() => {
        // Create the listener
        addListenerFn(listenerName, ...remainingAddListenerFnParams);
        // In the useEffect cleanup, remove the listener
        return () => model.removeListener(listenerName);
    }, []);
}