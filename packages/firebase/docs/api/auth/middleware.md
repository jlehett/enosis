# Middleware

Middleware allows a developer to define additional properties that should be automatically updated in the user context whenever an auth state changed event gets fired, in addition to the `user` property that is updated by default.

## Middleware Example

Let's say that whenever we detect a change to the auth state, we want to also fetch the new user's corresponding profile document from Firestore and store it in the user context under the `profile` key.

We could this like so:

```js
import {
    Middleware,
    useUserContextProvider,
} from '@unifire-js/firebase/auth';

// Let's say we have a ProfileModel defined using
// `@unifire-js/firebase/firestore`'s `Model` solution

// Define the middleware to fetch the corresponding profile given
// the new user object
const fetchProfileMiddleware = new Middleware(
    'profile',
    async (user) => {
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
);

// Pass the middlware when declaring the provider hook
const UserContextProvider = useUserContextProvider([
    fetchProfileMiddleware
]);

// Make sure to use the provider as demonstrated in the User Context
// documentation!
```

From there, the `profile` key will be populated with the `await`'d result of the defined middleware alongside the `user` and `initialLoadDone` properties in the return value of `useUserContext`:

```js
import { useUserContext } from '@unifire-js/firebase/auth';

// In a functional component...
const { user, initialLoadDone, profile } = useUserContext();
```

## API

### Constructor Arguments

| Argument | Type | Description |
| --- | --- | --- |
| key | string | The key to store the results of this middleware function under in the user context. You should take care that this key is unique amongst all defined middleware in use, and it should *not* overwrite the `user` property unless you know what you are doing. |
| fn | function | The function to call to fetch the result that should be stored in the user context under the specified key. This function should take in the newly-updated `user` object as its only param. |