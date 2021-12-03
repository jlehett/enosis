import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Redirects the user to the specified route if a condition function returns true given every update to the specified
 * array of dependencies.
 * 
 * The condition function should not take in any params itself.
 * 
 * Once at least one check with the condition has been run, the boolean flag returned from the hook will be updated
 * to the value, `true`.
 * 
 * An optional `skipCheckIfCondition` function can be passed. If this function returns or resolves with false,
 * the redirect condition check will be skipped for that cycle, and the `initialCheckDone` flag will remain unchanged.
 * 
 * @param {string} redirectTo The route to redirect the user to if the condition function returns true
 * @param {function} redirectCondition Checking function which will cause the user to be redirected if it returns
 * true; does nothing if it returns false
 * @param {*[]} dependencies Array of dependencies to pass to the `useEffect` call
 * @param {function} [skipCheckIfCondition] Function which will cause the `redirectCondition` to be skipped if it
 * returns true
 * @returns {boolean} Flag stating whether the redirect condition check has been done at least one time
 */
export default function(redirectTo, redirectCondition, dependencies, skipCheckIfCondition) {
    // Track whether an initial check has been done or not
    const [ initialCheckDone, setInitialCheckDone] = useState(false);

    // Use react-router-dom to provide a navigation
    const navigate = useNavigate();

    // Create the redirect side effect
    useEffect(async () => {
        // Skip the check if the skipCheckIfCondition result is true
        const skipCheck = skipCheckIfCondition ? await skipCheckIfCondition() : false;
        if (!skipCheck) {
            const redirect = await redirectCondition();
            if (redirect) {
                navigate(redirectTo);
            }
            setInitialCheckDone(true);
        }
    }, dependencies);

    // Return the flag stating whether an initial check has been done
    return initialCheckDone;
}