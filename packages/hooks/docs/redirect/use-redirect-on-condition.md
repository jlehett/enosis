# useRedirectOnCondition(redirectTo, redirectConditon, dependencies, skipCheckIfCondition)

Redirects the user to the specified route if a condition function returns true given every update to the specified array of dependencies.

The condition function should not take in any params itself.

Once at least one check with the condition has been run, the boolean flag returned from the hook will be updated to the value, `true`.

An optional `skipCheckIfCondition` function can be passed. If this function returns or resolves with `false`, the redirect condition check will be skipped for that cycle, and the `initialCheckDone` flag will remain unchanged.

## Arguments

| Argument | Type | Description |
| --- | --- | --- |
| redirectTo | string | The route to redirect the user to if the condition function returns true. |
| redirectCondition | function | Checking function which will cause the user to be redirected if it returns `true`; does nothing if it returns `false`. |
| dependencies | *\[\] | Array of dependencies to pass to the `useEffect` call. |
| skipCheckIfCondition | function | (opt.) Function which will cause the `redirectCondition` to be skipped if it returns true. |

## Return Value

This hook always returns a boolean flag stating whether at least one redirect condition check has been run. This can be used to display a loading state on the page until the check has been run successfully at least once.

## Examples

```js
import { useRedirectOnCondition } from '@unifire-js/hooks';

const ExampleComponent = () => {
    // Pretend we have some variables in state, `user` and `profile`...

    // Redirect to the /unauthorized-access route whenever the user is not signed in or if their profile has no name.
    const authorizationChecked = useRedirectOnCondition(
        '/unauthorized-access',
        () => {
            return !user || !profile.displayName;
        },
        [user]
    );j

    // We want to display a loading state until the user's access has been authenticated
    if (!authorizationChecked) {
        return <div>Verifying...</div>;
    } else {
        return <div>Example content since you are verified!</div>;
    }
}
```

```js
import { useRedirectOnCondition } from '@unifire-js/hooks';

const ExampleComponent = () => {
    // Pretend we have some variables in state, `user`, `userLoaded`, `profile`, and `profileLoaded`...

    // Redirect to the /unauthorized-access route whenever the user is not signed in or if their profile has no name,
    // but only run the check after the user and profile have been loaded.
    const authorizationChecked = useRedirectOnCondition(
        '/unauthorized-access',
        () => {
            return !user || !profile.displayName;
        },
        [user],
        () => {
            return !userLoaded || !profileLoaded;
        }
    );

    // We want to display a loading state until the user's access has been authenticated
    if (!authorizationChecked) {
        return <div>Verifying...</div>;
    } else {
        return <div>Example content since you are verified!</div>;
    }
}
```