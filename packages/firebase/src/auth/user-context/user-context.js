import React, {
    createContext,
    useState,
    useContext,
    useEffect,
} from 'react';
import map from 'lodash/map';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getUnifireFirebaseApp } from '../../firebase-app/firebase-app';
import Middleware from '../middleware/middleware';

/**
 * The user context.
 * @type {React.Context}
 */
const UserContext = createContext({
    state: {
        user: null,
        middlewareResults: {},
        initialLoadDone: false,
    },
    setState: (state) => {},
});

/**
 * The Firebase Auth object.
 * @type {Firebase.Auth}
 */
const auth = getAuth(getUnifireFirebaseApp());

/********************
 * PUBLIC FUNCTIONS *
 ********************/

/**
 * The UserContextProvider which will automatically update the user context whenever an
 * `onAuthStateChanged` event is detected. Middleware can optionally be specified that will
 * run and store values in user context whenever an `onAuthStateChanged` event occurs
 * as well.
 * 
 * @param {Middleware[]} [middleware] Array of Middleware to use in the user context
 * @param {React.Fragment} children The children to render under the provider
 * @returns {React.Context.Provider} The Provider element for user context
 */
export const UserContextProvider = ({middleware, children}) => {
    // Create the state for the user context
    const [state, setState] = useState({
        user: null,
        middlewareResults: {},
        initialLoadDone: false,
    });

    // Attach an observer to update the user context whenever an auth event occurs
    useEffect(() => {
        onAuthStateChanged(auth, async (user) => {
            const middlewareResults = await applyMiddleware(
                middleware,
                user,
                setState
            );
            setState((prevState) => ({
                ...prevState,
                user,
                middlewareResults: {
                    ...prevState.middlewareResults,
                    ...middlewareResults,
                },
                initialLoadDone: true
            }));
        });
    }, []);

    // Main render
    return (
        <UserContext.Provider
            value={{
                state,
                setState
            }}
        >
            {children}
        </UserContext.Provider>
    );
}

/**
 * Function to use the user context that has been created in a React
 * functional component.
 * 
 * @returns {Object} Returns the auth user context
 */
export function useUserContext() {
    // Return a simplified and destructured version of the user context,
    // with only the necessary data
    const { state } = useContext(UserContext);

    return {
        user: state.user,
        initialLoadDone: state.initialLoadDone,
        ...state.middlewareResults,
    };
}

/*********************
 * PRIVATE FUNCTIONS *
 *********************/

/**
 * Fetch the data for all the defined middleware, and return a promise
 * that resolves with an object containing the data indexed by each
 * middleware key.
 * 
 * @param {Middleware[]} middleware All of the middleware to apply
 * @param {Firebase.Auth.User} user The Firebase Auth user currently
 * active
 * @param {function} setState The function to call to set the user context state
 * @returns {Promise<Object>} Resolves with an object containing data
 * indexed by each middleware key
 */
async function applyMiddleware(middleware, user, setState) {
    const middlewareResults = {};
    await Promise.all(
        map(
            middleware,
            async (singularMiddleware) => {
                const result = await singularMiddleware.run(user, setState);
                // If a key was specified for the middleware, store the results
                // in the middlewareResults array to add to user context
                if (singularMiddleware.key) {
                    middlewareResults[singularMiddleware.key] = result;
                }
            }
        )
    );
    return middlewareResults;
}