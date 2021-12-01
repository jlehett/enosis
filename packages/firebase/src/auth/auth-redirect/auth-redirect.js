import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '..';

/**
 * Redirects the user to the specified route if a condition function
 * returns true given every update to the auth user context.
 * 
 * The condition function should take in the whole user context as its
 * only param.
 * 
 * @param {string} redirectTo The route to redirect the user to if the
 * condition function returns true
 * @param {function} condition Checking function which will cause the
 * user to be redirected if it returns true; does nothing if it returns
 * false
 */
export default function(redirectTo, condition) {
    // Use the user context
    const userContext = useUserContext();

    // Use react-router-dom to provide a navigation
    const navigate = useNavigate();

    // Whenever the user context updates, re-run the condition
    // function and trigger the redirect if it returns true
    useEffect(async () => {
        const conditionResult = await condition(userContext);
        if (conditionResult) {
            navigate(redirectTo);
        }
    }, [userContext]);
}