import { createContext, useState, useContext } from 'react';

/**
 * Object representing a React Context "Slice".
 * @typedef {Object} ContextSlice
 * @property {React.FunctionalComponent} Provider The combined state and API provider that can
 * be added at the desired level within the codebase
 * @property {React.Hook} useContext Hook for telling a component to consume the value from the
 * closest parent Provider
 * @property {React.Hook} useContextAPI Hook for returning the {@link ContextAPI} to be used within
 * a component
 */

/**
 * Object containing various functions that can be called to update the corresponding state context.
 * @typedef {Object} ContextAPI
 * @property {function} setState Works like a normal `setState` function from the `useState` hook
 * @property {function} resetState Resets the associated state context back to the defined initial state
 */

/**
 * Context "slice" constructor, split into 2 contexts -- one for the state itself and one for
 * the static API to update the context, in order to minimize potential performance issues.
 * 
 * Returns an API for working with these React Context "slices".
 * 
 * @example
 * // Create the context "slice"
 * SignedInContext = createContextSlice({
 *      signedIn: false,
 *      user: null,
 * });
 * 
 * // Add the Provider to your code whenever it makes sense
 * <SignedInContext.Provider>
 *      {children}
 * </SignedInContext.Provider>
 * 
 * // Use the context values in a consumer component
 * const signedInInfo = SignedInContext.useContext();
 * 
 * // Use the context's API to update state, as desired
 * const signedInInfoAPI = SignedInContext.useContextAPI();
 * 
 * // `setState` function that acts like a normal `setState` function from the `useState` hook
 * signedInInfoAPI.setState({
 *      signedIn: true,
 *      user: { displayName: 'Test User' },
 * });
 * 
 * // `resetState` function that resets the context state back to the defined initial state
 * signedInInfoAPI.resetState();
 * 
 * @param {*} initialState The initial state value that is passed to the internal `useState` hook
 * @returns {ContextSlice} A React Context "Slice" object
 */
export function createContextSlice(initialState) {
    // Create the 2 contexts -- one for the state itself and one for the static API
    const stateContext = createContext();
    const apiContext = createContext();

    // Create the combined Provider comsponent
    const Provider = ({ children }) => {
        // Context is tracked via React state hooks
        const [state, setState] = useState(initialState);

        // Create the static API for controlling the context
        const api = {
            /**
             * Regular set state hook function.
             */
            set,
            /**
             * Reset function to set state back to the defined initial state.
             */
            reset: () => setState(initialState),
        };

        // Returns the children, wrapped in 2 React context Providers.
        return (
            <stateContext.Provider value={state}>
                <apiContext.Provider value={api}>
                    {children}
                </apiContext.Provider>
            </stateContext.Provider>
        );
    };

    // Return the necessary hooks API for the React context slice
    return {
        Provider,
        useContext: () => useContext(stateContext),
        useContextAPI: () => useContext(apiContext),
    };
}

/**
 * Combines a set of Context Providers into a single Provider.
 * 
 * @param  {ContextSlice.Provider[]} contextProviders Array of context providers to combine into a
 * single provider
 * @returns {React.FunctionalComponent} Returns a single Provider component that combines all of the
 * given context slice providers
 */
export function combineContextProviders(contextProviders) {
    return contextProviders.reduce(
        (AccumulatedContextProviders, CurrentContextProvider) => {
            return ({ children }) => {
                return (
                    <AccumulatedContextProviders>
                        <CurrentContextProvider>
                            {children}
                        </CurrentContextProvider>
                    </AccumulatedContextProviders>
                );
            };
        },
        ({ children }) => <>{children}</>,
    );
}
