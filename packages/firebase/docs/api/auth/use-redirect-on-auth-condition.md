# useRedirectOnAuthCondition(redirectTo, condition)

Sometimes, you want to redirect a user from a page depending on whether that user is signed in, has a certain permission, or something else related to authorization.

This React hook allows you to specify a condition function which takes in the whole auth user context from as its only argument, and, if it returns (or resolves with) true, will automatically redirect the user to a specified route.

The condition function will be re-run each time the user context changes.

The condition function will not be run until the user context is fully-loaded however. This is to prevent the condition from incorrectly assuming that a user is not present before the user context has registered whether a user is truly there or not.

## Arguments

| Argument | Type | Description |
| --- | --- | --- |
| redirectTo | string | The route to redirect the ser to if the condition function returns true. |
| condition | function | The function to run anytime auth user context changes. If this function returns true, it will automatically redirect the user to the route specified by `redirectTo`. This function should take in the whole user context object as its only argument. |

## Return Value

This hook always returns a boolean flag stating whether at least one check has been run AFTER the auth user context has been fully loaded. This can be used to display a loading state on the page until the check has been run successfully at least once.

## Example

```js
import { useRedirectOnAuthCondition } from '@unifire-js/firebase/auth';

const ExampleComponent = () => {
    // Redirect to the /unauthorized-access route whenever the user is
    // not signed in. This check will only be run once the user context
    // is fully loaded to prevent inaccurate results.
    useRedirectOnAuthCondition(
        '/unauthorized-access',
        (userContext) => {
            // Return true if the user is not signed in; this will 
            // trigger a redirect to the /unauthorized-access route
            return !userContext.user;
        }
    );

    return (
        <div>
            Example content.
        </div>
    );
};
```