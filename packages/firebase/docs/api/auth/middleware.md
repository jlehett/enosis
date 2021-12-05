# Middleware

Middleware allows a developer to define additional functions that are run when the `onAuthStateChanged` event is fired. If a `key` is specified for the Middleware, the result of running that Middleware will be stored in the user context under that `key`.

## Middleware Example (Fetch Profile)

Let's say that whenever we detect a change to the auth state, we want to also fetch the new user's corresponding profile document from Firestore and store it in the user context under the `profile` key.

We could this like so:

```js
import {
    Middleware,
    UserContextProvider,
} from '@unifire-js/firebase/auth';

// Let's say we have a ProfileModel defined using
// `@unifire-js/firebase/firestore`'s `Model` solution

// Define the middleware to fetch the corresponding profile given
// the new user object
const fetchProfileMiddleware = new Middleware({
    key: 'profile',
    fn: async (user, updateState) => {
        if (user?.email) {
            const results = await ProfileModel.getByQuery([
                where('email', '==', user.email),
            ]);
            if (results.length > 0) {
                return results[0];
            }
        }
        return null;
    }
});

// Pass the middlware when using the Provider
<UserContextProvider middleware={[fetchProfileMiddleware]}>
    {children}
</UserContextProvider>
```

From there, the `profile` key will be populated with the `await`'d result of the defined middleware alongside the `user` and `initialLoadDone` properties in the return value of `useUserContext`:

```js
import { useUserContext } from '@unifire-js/firebase/auth';

// In a functional component...
const { user, initialLoadDone, profile } = useUserContext();
```

## Middleware Example (Keep Profile Updated with Listener)

Let's say we want to keep the user's associated profile updated all the time, listening for changes on the profile itself and updating the user context any time changes are detected on the profile as well. This can be done with `key`-less `Middleware` instances.

The following is an example `Middleware` definition to accomplish that goal using `@unifire-js/firebase/firestore`'s listener capabilities:

```js
import {
    Middleware,
    useUserContextProvider,
} from '@unifire-js/firebase/auth';

// Let's say we have a ProfileModel defined using `@unifire-js/firebase/firestore`'s `Model` solution

// Define some global storage for the previous listener name
const prevListenerName = null;

// Define the middleware to initialize listeners, as needed, when the auth user switches.
const initializeProfileListener = new Middleware({
    fn: (user, updateState) => {
        const listenerName = user ? `${user.uid}-profileListener` : null;
        // We only need to update / create a listener if the new name does not match the previous
        // listener name
        if (listenerName !== prevListenerName) {
            // If a previous listener name existed, we have to remove that listener from the ProfileModel first
            if (prevListenerName) {
                ProfileModel.removeListener(prevListenerName);
            }
            // If the new listener name is not null, we then want to create the new listener
            if (listenerName) {
                ProfileModel.addListenerByID(
                    listenerName,
                    user.uid,
                    (doc) => {
                        // This will update the user context to have a `profile` property that is always updated
                        // via the listener
                        updateState({ profile: doc });
                    }
                );
            }
            // We then want to set the previous listener name to the new listener name
            prevListenerName = newListenerName;
        }
    }
});

// Pass the middleware when using the Provider
<UserContextProvider middleware={[initializeProfileListener]}>
    {children}
</UserContextProvider>
```

From there, the `profile` key will be always be updated with the latest data for the user's associated profile via the listener, and can be accessed like so:

```js
import { useUserContext } from '@unifire-js/firebase/auth';

// In a functional component...
const { profile } = useUserContext();
```

## API

### Constructor Arguments

| Argument | Type | Description |
| --- | --- | --- |
| key | string | The key to store the results of this middleware function under in the user context. You should take care that this key is unique amongst all defined middleware in use, and it should *not* overwrite the `user` property unless you know what you are doing. |
| fn | function | The function to call to fetch the result that should be stored in the user context under the specified key. This function should take in the newly-updated `user` object as its only param. |