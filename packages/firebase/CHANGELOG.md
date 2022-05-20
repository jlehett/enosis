# @unifire-js/firebase

## 3.1.3

<i>May 20, 2022</i>

* 🛠️ Make `firebase` a peer dependency.

## 3.1.2

<i>May 15, 2022</i>

* 🛠️ Add peer dependency support for React v18.x

## 3.1.1

<i>May 15, 2022</i>

### `unifire-js/firebase/auth`

* 🛠️ Fix issue with async `useEffect` hook usage.

## 3.1.0

<i>May 7, 2022</i>

### `unifire-js/firebase/firestore`

* 🔧 Add `startAt`, `startAfter`, `endAt`, and `endBefore` exports to the Unifire-JS Firestore package to use in query pagination.

## 3.0.3

<i>Dec 29, 2021</i>

### `@unifire-js/firebase/firestore`

* ⚠️ [!POTENTIALLY BREAKING CHANGE!] Attempting to remove listeners that don't exist will no longer throw an error and will instead be silently handled to minimize the use of `try...catch` blocks.

### `@unifire-js/firebase/realtime-database`

* ⚠️ [!POTENTIALLY BREAKING CHANGE!] Attempting to remove regular listeners or `onDisconnect` listeners that don't exist will no longer throw an error and will instead be silently handled to minimize the use of `try...catch` blocks.

## 3.0.2

<i>Dec 26, 2021</i>

### `@unifire-js/firebase/firestore`

* 👂 Add `useLiveDataBy...` functions as simplifications of the existing `useListenerBy...` functions.

### `@unifire-js/firebase/realtime-database`

* 👂 Add `useLiveDataByPath` function as a simplification of the `useListenerByPath` function.

## 3.0.1

<i>Dec 26, 2021</i>

### `@unifire-js/firebase/realtime-database`

* 🗑 Add `deleteAtPath` function to the `RealtimeDatabaseInterface` API!

## 3.0.0

<i>Dec 25, 2021</i>

### `@unifire-js/firebase/realtime-database`

* 🛠️ Major refactor replacing the `RealtimeModel` concept with a singleton `RealtimeDatabaseInterface` concept.

## 2.3.8

<i>Dec 22, 2021</i>

### `@unifire-js/firebase/realtime-database`

* 🚀 Add realtime-database submodule with utilities for realtime models that emulate Firestore models!
>>>>>>> 4e04f1ed4368282f06ab8edba89338f3c9e5c4dc

## 2.3.7

<i>Dec 12, 2021</i>

### `@unifire-js/firebase/auth`

* 🛠️ Fix issue with key-less middleware being overwritten during auth state changes.

## 2.3.6

<i>Dec 5, 2021</i>

### `@unifire-js/firebase/auth`

* 🛠️ Fix validation code in the `Middleware` class.

## 2.3.5

<i>Dec 5, 2021</i>

### `@unifire-js/firebase/auth`

* 🛠️ Rework the `Middleware` class to support `key`-less instances which can be used to set up listeners that are initialized as part of the middleware.
* 🛠️ Remove unused code from the `user-context` file.

## 2.3.4

<i>Dec 4, 2021</i>

### `@unifire-js/firebase/auth`

* 🛠️ Fix export.

## 2.3.3

<i>Dec 4, 2021</i>

### `@unifire-js/firebase/auth`

* 🛠️ Replace the `useUserContextProvider` function with a simpler `UserContextProvider` React functional component.

## 2.3.2

<i>Dec 4, 2021</i>

### `@unifire-js/firebase/auth`

* 🛠️ Modify the `useUserContextProvider` function to provide a different API to fix issues with constructing the Provider in a callback.

## 2.3.1

<i>Dec 4, 2021</i>

### `@unifire-js/firebase/auth`

* 🛠️ Wrap the `useUserContextProvider` provider function in a `useCallback` to stop unnecessary remounts.

## 2.3.0

<i>Dec 4, 2021</i>

### `@unifire-js/firebase/firestore`

* 🛠️ Rethink the `useListener`-type hooks. They are now defined individually for each type of `addListener...` function within the `Submodel` and `ModelInstanceOperations` classes.

## 2.2.1

<i>Dec 3, 2021</i>

* 📃 Update documentation!

## 2.2.0

<i>Dec 3, 2021</i>

### `@unifire-js/firebase/firestore`

* 👂 Add the `useListener` React hook!

## 2.1.0

<i>Dec 1, 2021</i>

### `@unifire-js/firebase/auth`

* 🚂 Added the `useRedirectOnAuthCondition` React hook for automatic redirects based on auth user context changes.

## 2.0.0

<i>Nov 29, 2021</i>

**🎉 @unifire-js/firebase v2.0.0 released! 🎉**

* **\[!BREAKING CHANGES!\]** 🔧 Developer now create a separate "Unifire" Firebase app reference as opposed to passing an already-created reference to the package.
    * This fixed issues caused by `firebase/firestore` registration logic.

### `@unifire-js/firebase/auth`

* 🚀 `auth` submodule released!
* 🧍 React hooks for creating and using an automatically updating auth user context added!
* 📦 Support for defining middleware to keep other values in the auth user context updated automatically on auth changes added!

### `@unifire-js/firebase/firestore`

* **\[!BREAKING CHANGES!\]** 🔧 Updated the `firestore` submodule to utilize the new separate "Unifire Firebase app" reference concept.

## 1.0.2

<i>Nov 24, 2021</i>

* 🛠️ REALLY fixed the package exports!

## 1.0.1

<i>Nov 24, 2021</i>

* 🛠️ Fixed package exports to properly export the `@unifire-js/firebase/firestore` route!

## 1.0.0

<i>Nov 21, 2021</i>

**🎉 @unifire-js/firebase v1.0.0 released! 🎉**

### `@unifire-js/firebase/firestore`

* 👂 Added support for defining realtime listeners for models, submodels, and submodel instances!

## 1.0.0-alpha.1

<i>Nov 20, 2021</i>

### `@unifire-js/firebase/firestore`

* 🔧 Updated npm keywords and home page.

## 1.0.0-alpha.0

<i>Nov 14, 2021</i>

### `@unifire-js/firebase/firestore`

* 🤝 Add the Firestore `transaction` adapter!
* ❓ Add the `getByQuery` method to the `Submodel` class!

## 0.0.9

<i>Nov 3, 2021</i>

### `@unifire-js/firebase/firestore`

* 🤖 🎁 Add [`Autobatch`](/packages/firebase/docs/api/firestore/autobatcher.md) support!
* 🗑 Add document deletion methods to the [`ModelInstanceOperations` API](/packages/firebase/docs/api/firestore/model-instance-operations.md) and to [`Submodel`](/packages/firebase/docs/api/firestore/submodel.md).
* 🤝 Modify the `writeToNewDoc` methods for both the [`ModelInstanceOperations` API](/packages/firebase/docs/api/firestore/model-instance-operations.md) and [`Submodel`](/packages/firebase/docs/api/firestore/submodel.md) to support Firestore transactions.

## 0.0.8

<i>Oct 25, 2021</i>

* 🚀 Release the `firebase` package!

### `@unifire-js/firebase/firestore`

* \[Model\] Added `Model` class.
* \[Submodel\] Added `Submodel` class.