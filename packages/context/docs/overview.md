# Overview

The React Context API provides an easy-to-use API for interacting with state that can be tracked at any level (not just at a global level, as Redux does). However, there are some performance considerations that need to be made when using React Context.

## Considerations

### Performance Concerns

The issue with the React Context API is that, as of React v17, any changes to a Provider will trigger re-renders of all of its consumers, regardless of what parts of that Provider the consumer may be using.

For instance, let's say you have some state object representing a `profile` in context:

```js
<ProfileContext.Provider
    value={{
        displayName: null,
        email: null,
    }}
>
    {children}
</ProfileContext.Provider>
```

And let's say you have some consumer component that only cares about the `displayName` from the `profile` object in context:

```js
const { displayName } = useContext(ProfileContext);
```

The unfortunate news is that even an update that only impacts the `email` property in that particular context will still trigger a re-render of the consumer that is requesting only the `displayName`.

Likewise, if you are using the `useState` hook to provide both the `state` and the `setState` function in a Provider, and a consumer only needs the `setState` function, that consumer will still be re-rendered on every update to `state`.

So, the best solution is to keep context small, and separate the `state` Provider from the `setState` Provider.

## `@unifire-js/context` Selling Point

The `@unifire-js/context` package aims to provide a simple, quick-to-implement, performant, and ergonomic solution for state management as a replacement for Redux and other global state management libraries, using just the React context API.

An added benefit of using the React context API is that this concept can be applied to route-specific state management very easily, as opposed to the more global-oriented state management libraries such as Redux.

At a base level, this is done by automatically splitting each variable tracked in context into its own context "slice", which is further split into a "value slice" and a static "API slice", to address the performance concerns outlined above.

With this package, setting up and using route-specific state management is as easy as:

Declaring a context level:

```js
import { createContextLevel } from '@unifire-js/context';

export const AppContextLevel = createContextLevel({
    profile: null,
    isAuthenticated: false,
    favoriteIceCream: 'Vanilla',
});
```

Adding the created Provider to the appropriate level of your app:

```js
const App = ({ children }) => {
    return (
        <AppContextLevel.Provider>
            {children}
        </AppContextLevel.Provider>
    );
}
```

Using any values or APIs from the created context level:

```js
const SomeChildComponent = () => {
    // Use the profile value from the AppContextLevel
    const profile = AppContextLevel.use.profile.value();

    // Use the API of the `favoriteIceCream` context slice to update its value in state
    const favoriteIceCreamAPI = AppContextLevel.use.favoriteIceCream.api();

    favoriteIceCreamAPI.set('Chocolate');

    // Rendering...
}
```
