# User Context

User context offers a solution for automatically tracking the current Firebase Auth user using React context hooks.

Additional middleware functions can also be specified to automatically fetch and store additional data in the user context whenever an auth state changed event gets fired.

## API

### UserContextProvider({ middleware, children })

The React UserContext Provider which will automatically update the user context whenever an `onAuthStateChanged` event is detected. Middleware can optionally be specified which will run and store values in user context whenever an `onAuthStateChanged` event occurs as well.

#### Props

| Property | Type | Description |
| --- | --- | --- |
| middleware | [Middleware](/packages/firebase/docs/api/auth/middleware.md)\[\] | *(opt.)* The array of middleware to apply and store the results of iin the user context. See [the documentation for the Middleware class](/packages/firebase/docs/api/auth/middleware.md) for more information. |
| children | React.Fragment | The children to render in the component. |

#### Example

```js
// Let's pretend we have some middleware definitions already in an
// array called `middleware`...

import { UserContextProvider } from '@unifire-js/firebase/auth';

const App = ({children}) => {
    return (
        <UserContextProvider middleware={middleware}>
            {children}
        </UserContextProvider>
    );
};
```

### useUserContext()

Hook to use the user context that has been created and is automatically being updated.

#### Return Value

This hook always returns an object. This object is guaranteed to have the following properties:

| Property | Type | Description |
| --- | --- | --- |
| user | Object \| *null* | The current user object from Firebase auth. If there is no user currently signed in, this value will be *null*. |
| initialLoadDone | boolean | Flag indicating whether the initial auth state loading has already been completed. Whenever the site is loaded for the first time or refreshed, there will always be a miniscule delay before the user state is updated with the current value. Until then, the value will be *null*, regardless if a user is about to be signed in or not. |

Depending on the [Middleware](/packages/firebase/docs/api/auth/middleware.md) definitions, additional properties may be populated on the object, according to the middleware keys that are provided. See [the middleware documentation](/packages/firebase/docs/api/auth/middleware.md) for more information.

#### Example

```js
// We can utilize the context (and trigger re-renders whenever it
// automatically updates) like so:

import { useUserContext } from '@unifire-js/firebase/auth';

// in a functional component...

// Let's say our middleware additionally fetched the corresponding
// profile document from Firestore...

const { user, profile } = useUserContext();

// Log the changes whenever they occur
console.log(user, profile);
```
