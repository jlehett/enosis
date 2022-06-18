# Context Levels

Context Levels are your primary interaction point with this package. They contain a `Provider`, which can be used to provide all of its context to any child components, as well as methods to interact with the various "Context Slices" it contains.

## Creating a Context Level

Creating a new context level is very simple. Let's say you want to track 3 variables (`profile`, `isAuthenticated`, and `favoriteIceCream`) in state for a particular route. You can do this like so:

```js
import { createContextLevel } from '@unifire-js/context';

export const SomeContextLevel = createContextLevel({
    profile: null,
    isAuthenticated: false,
    favoriteIceCream: 'Vanilla',
});
```

Here, we are defining all of the variables that we would like to track in state for this particular context level, as well as defining their initial values when this context level loads.

## Providing the Context Level

Once you have a context level created, you need to provide it at whatever part of your app you would like. All child components of this provider will be able to use the variables tracked inside of this context level's particular provider.

To note, if this provider is ever unmounted and remounted, it will be reset to its original values, as the React context API normally does. If you want to keep state around for the entire length of a session on your app, simply provide the desired context level(s) at the top level of your app.

You can provide a created context level like so:

```js
const SomeFunction = ({ children }) => {
    return (
        <SomeContextLevel.Provider>
            {children}
        </SomeContextLevel.Provider>
    )
}
```

where the `SomeContextLevel` is what was returned from the `createContextLevel` function.

At this point, any of the children of `SomeContextLevel.Provider` will be able to use the context being tracked and provided by that particular provider.

## Using Context Values

Any child of a context level provider can use that context level's values via the hooks provided by the create context level. These hooks are all found under the `use` property of the created context level from `createContextLevel`.

The `use` property on a created context level is simply an object that maps your variables' names to their corresponding value (`use.<property>.value`) and API (`use.<property>.api`) hooks.

You can use a particular property's value as you would a normal React context value, like so:

```js
const SomeChildComponent = () => {
    // Use the profile value from SomeContextLevel
    const profile = SomeContextLevel.use.profile.value();

    // Rendering...
};
```

From here, the `profile` value in `SomeChildComponent` is treated the same as how state or context is normally treated by React. If the value changes, either from the `SomeChildComponent` component, or from some other component using the same context level provider, it will trigger a re-render of `SomeChildComponent`, with the new value of `profile`.

## Using Context API

As mentioned above, the `use` property on a created context level also exposes the static API (`use.<property>.api`) hook for each variable in the context level.

This hook provides access to the `api` object which has `set` and `reset` functions to allow you to update the context variable's value.

The `set` function simply provides access to the internal `setState` function controlling the context variable. Thus, you can think of it as the equivalent of calling `setProfile` from the following `useState` hook:

```js
const [profile, setProfile] = useState();
```

This means you can also provide a callback to access the prev state value when calling `set`.

The `reset` function simply resets the particular context variable's value back to its initial value.

You can use the `api` object for a particular context variable in a context level like so:

```js
const SomeChildComponent = () => {
    // Use the profile API from SomeContextLevel
    const profileAPI = SomeContextLevel.use.profile.api();

    // Call the `set` function to update the value of `profile` in state
    profileAPI.set({ displayName: 'Test User' });
    
    // Call the `reset` function to reset the value of `profile` in state back to its initial value
    profileAPI.reset();

    // Rendering...
};
```

As mentioned in the overview documentation, by splitting up the API hook from the value hook, we can gain some performance increases. In this particular case, `SomeChildComponent` will not re-render if `profile` changes, even when `profileAPI.set` is called, because we are not using the context variable's `value` hook, which would be `const profile = SomeContextLevel.use.profile.value();`.
