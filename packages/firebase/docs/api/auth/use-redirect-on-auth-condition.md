# useRedirectOnAuthCondition(redirectTo, condition)

Sometimes, you want to redirect a user from a page depending on whether that user is signed in, has a certain permission, or something else related to authorization.

This React hook allows you to specify a condition function which takes in the whole auth user context from as its only argument, and, if it returns (or resolves with) true, will automatically redirect the user to a specified route.

The condition function will be re-run each time the user context changes.

## Arguments

| Argument | Type | Description |
| --- | --- | --- |
| redirectTo | string | The route to redirect the ser to if the condition function returns true. |
| condition | function | The function to run anytime auth user context changes. If this function returns true, it will automatically redirect the user to the route specified by `redirectTo`. This function should take in the whole user context object as its only argument. |

## Example

```js
import { useRedirectOnAuthCondition } from '@unifire-js/firebase/auth';

const ExampleComponent = () => {
    // Redirect to the /unauthorized-access route whenever the user is
    // not signed in. We also want to make sure an initial loading is
    // done if a user is not found, since that could be a false
    // negative.
    useRedirectOnAuthCondition(
        '/unauthorized-access',
        (userContext) => {
            // Return true if the user context has finished an initial 
            // loading and the user is not signed in; this will trigger
            // a redirect to the /unauthorized-access route
            return userContext.initialLoadDone && !userContext.user;
        }
    );

    return (
        <div>
            Example content.
        </div>
    );
};
```