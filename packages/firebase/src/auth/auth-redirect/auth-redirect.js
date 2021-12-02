import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '..';

/**
 * Redirects the user to the specified route if a condition function
 * returns true given every update to the auth user context.
 * 
 * The condition function should take in the whole user context as its
 * only param.
 * 
 * As a note, the check will be skipped, and will never redirect until
 * the auth user context has been fully loaded (should be very quick).
 * 
 * Once at least one check with the condition has been run after the
 * user context has been loaded, the boolean flag returned from the
 * hook will be updated to the value, `true`.
 * 
 * @param {string} redirectTo The route to redirect the user to if the
 * condition function returns true
 * @param {function} condition Checking function which will cause the
 * user to be redirected if it returns true; does nothing if it returns
 * false
 * @returns {boolean} Flag stating whether a check has been done at
 * least one time AFTER the user context has been loaded
 */
export default function(redirectTo, condition) {
    // Track whether an initial check has been done or not
    const [initialCheckDone, setInitialCheckDone] = useState(false);

    // Use the user context
    const userContext = useUserContext();

    // Use react-router-dom to provide a navigation
    const navigate = useNavigate();

    // Whenever the user context updates, re-run the condition
    // function and trigger the redirect if it returns true
    useEffect(async () => {
        if (userContext.initialLoadDone) {
            const conditionResult = await condition(userContext);
            if (conditionResult) {
                navigate(redirectTo);
            }
            setInitialCheckDone(true);
        }
    }, [userContext]);

    // Return the flag stating whether an initial check has been done
    return initialCheckDone;
}