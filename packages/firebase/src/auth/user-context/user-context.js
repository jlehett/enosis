import {
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
 * Function to perform the setup necessary to construct a UserContext provider, which automatically
 * updates the user context whenever auth state changes.
 * 
 * @returns {[UserContext, userContextState, userContextSetState]} The variables necessary for
 * constructing the UserContext Provider
 */
export function useUserContextProvider(middleware) {
    // Create the state for the user context
    const [state, setState] = useState({
        user: null,
        middlewareResults: {},
        initialLoadDone: false,
    });

    // Attach an observer to update the user context whenever an auth
    // event occurs
    useEffect(() => {
        onAuthStateChanged(auth, async (user) => {
            const middlewareResults = await applyMiddleware(
                middleware,
                user
            );
            setState({
                user,
                middlewareResults,
                initialLoadDone: true,
            });
        })
    }, []);

    // Return the variables necessary to construct the provider
    return [
        UserContext,
        state,
        setState,
    ];
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
 * @returns {Promise<Object>} Resolves with an object containing data
 * indexed by each middleware key
 */
async function applyMiddleware(middleware, user) {
    const middlewareResults = {};
    await Promise.all(
        map(
            middleware,
            async (singularMiddleware) => {
                const result = await singularMiddleware.fetch(user);
                middlewareResults[singularMiddleware.key] = result;
            }
        )
    );
    return middlewareResults;
}