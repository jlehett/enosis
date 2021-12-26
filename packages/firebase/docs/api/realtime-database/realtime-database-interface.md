# Realtime Database Interface

## Overview

The Realtime Database Interface is meant to provide a more streamlined approach to interacting with Firebase's Realtime Database.

For the purposes of this package's abstractions over Firestore and the Firebase Realtime Database, you will likely want to use Firestore by default.

However, if you need to be able to create listeners for when the user disconnects from the database (by closing their tab, turning off their computer, etc.) to perform simple writes in those instances (for example, if you need a user "presence" system), you will want to use the Firebase Realtime Database.

The Realtime Database will also likely provide better and more stable read / write speeds and consts for data that is updated very frequently at the cost of less powerful queries and less structured data.

To note, queries based on anything other than paths in the Realtime Database are currently not supported in `@unifire-js/firebase`. If you need to use powerful queries, consider utilizing the Firestore abstractions in this package instead.

## API

### writeToPath(path, data, params)

Writes the specified data to a specified path in the Realtime Database.

This function will overwrite any existing data at that path in the database, by default. If you'd like to merge in the new data with any existing data, you will need to specify `mergeWithExistingData` in the `params` object.

#### Arguments

| Argument | Type | Description |
| --- | --- | --- |
| path | string | The path in the Firebase Realtime Database to write the data to. |
| data | Object | The data to write to the path. |
| params | Object | (opt.) Object specifying various settings for the operation. |
| params.mergeWithExistingData | boolean | (opt.) If set to true, any existing data will be merged with the new data when writing to the database. |

#### Return Value

This function returns a promise that resolves when the data has been written to the database.

#### Example

```js
/**
 * Write data to the `rooms/1` path, and merge in any existing data at that
 * path.
 */
await RealtimeDatabaseInterface.writeToPath(
    'rooms/1',
    {
        active: true,
        users: {
            john: {
                vote: 1,
            }
        }
    },
    { mergeWithExistingData: true }
);

/**
 * Write data to the `rooms/1` path, and do NOT merge in any existing data
 * at that path.
 */
await RealtimeDatabaseInterface.writeToPath(
    'rooms/1',
    {
        active: true,
        users: {
            john: {
                vote: 1,
            }
        }
    }
);
```

### deleteAtPath(path)

Deletes the data (and any child data in the JSON tree) at the specified path.

#### Arguments

| Argument | Type | Description |
| --- | --- | --- |
| path | string | The path to delete the data from. |

#### Return Value

This function returns a promise that resolves when the data at the specified path has been deleted from the Realtime Database.

#### Example

```js
/**
 * Delete all data starting at the path `rooms/1` in the realtime database.
 */
await RealtimeDatabaseInterface.deleteAtPath('rooms/1');
```

### getByPath(path)

Reads data from the given path in the Firebase Realtime Database. This will return that data and any children of that path in the Realtime Database JSON tree.

#### Arguments

| Argument | Type | Description |
| --- | --- | --- |
| path | string | The path to read data from in the Realtime Database. |

#### Return Value

This function returns a promise that resolves with the data read from the specified path in the Realtime Database.

#### Example

```js
/**
 * Get the sanitized data at the path `rooms/1` in the Realtime Database.
 */
const roomData = await RealtimeDatabaseInterface.getByPath('rooms/1');
```

#### addListenerByPath(nameOfListener, path, fn)

Registers a listener for a specific path in the Realtime Database. The listener is stored on the Realtime Database Interface instance itself, and can be removed by calling either the `removeListener` or `removeAllListeners` functions.

The listener will be registered for the given path in the Firebase Realtime Database and any children of that path in the Realtime Database JSON tree.

The callback function passed as an argument should take in the data at the given path as its only argument.

This function will throw an error if a listener with the name specified by `nameOfListener` already exists.

##### Arguments

| Argument | Type | Description |
| --- | --- | --- |
| nameOfListener | string | The name to give to the listener during registration. It is used to reference the listener when you need to delete it later. |
| path | string | The path in the Realtime Database to register the listener for. |
| fn | function | The callback function for the listener; should accept the data from the specified path as its only argument. |

##### Example

```js
/**
 * Create a listener by the name, `RoomListener`, that will listen for
 * changes in the Realtime Database JSON tree at the path, `rooms/1`.
 */
RealtimeDatabaseInterface.addListenerByPath(
    'RoomListener',
    'rooms/1',
    (data) => {
        console.log('Data at path:', data);
    }
);
```

#### useListenerByPath(nameOfListener, path, fn)

React hook for adding a listener for a specific path in the Realtime Database JSON tree, and then removing it once the component unmounts.

The callback function passed as an argument should take in the data at the given path as its only argument.

This function will throw an error if a listener with the name specified by `nameOfListener` already exists.

##### Arguments

| Argument | Type | Description |
| --- | --- | --- |
| nameOfListener | string | The name to give to the listener during registration. It is used to reference the listener when you need to delete it later. |
| path | string | The path in the Realtime Database to register the listener for. |
| fn | function | The callback function for the listener; should accept the data at the given path as its only argument. |

##### Example

```js
// In a functional component...

/**
 * Registers a listener on the path, `rooms/1`, in the Realtime Database.
 * This listener will automatically be cleaned up when the React component
 * unmounts.
 */
RealtimeDatabaseInterface.useListenerByPath(
    'TestListener',
    'rooms/1',
    (data) => {
        console.log('Data at path:', data);
    }
);
```

#### removeListener(nameOfListener)

Removes a specified listener from the realtime database interface. Throws an error if the listener does not exist.

To remove the special `onDisconnect` listeners, you must use the `removeOnDisconnectListener` or `removeAllOnDisconnectListeners` instead.

##### Arguments

| Argument | Type | Description |
| --- | --- | --- |
| nameOfListener | string | The name of the listener to remove. |

##### Example

```js
/**
 * Removes the `TestListener` listener from the realtime database interface,
 * if it exists.
 */
RealtimeDatabaseInterface.removeListener('TestListener');
```

#### removeAllListeners()

Removes all listeners from the realtime database interface. This does *not* include the special `onDisconnect` listeners. To remove those listeners, you must use the `removeOnDisconnectListener` or `removeAllOnDisconnectListeners` instead.

##### Arguments

| Argument | Type | Description |
| --- | --- | --- |
| \- | \- | \- |

##### Example

```js
/**
 * Removes all listeners from the realtime database interface.
 */
RealtimeDatabaseInterface.removeAllListeners();
```

#### addOnDisconnectListenerByPath(nameOfListener, path, onDisconnectFn, args=[])

Adds an `onDisconnect` listener to the realtime database interface, which will trigger a certain realtime database operation whenever the user disconnects from the database for any reason (e.g., closing the tab, turning off their computer, etc.).

`onDisconnect` listeners are stored separately from regular listeners. Therefore, if you would like to delete an `onDisconnect` listener, you must use either the `removeOnDisconnectListener` or `removeAllOnDisconnectListeners` functions. The usual `removeListener` and `removeAllListeners` functions will not affect any `onDisconnect` listeners, and name collisions between `onDisconnect` listeners and regular listeners will not affect anything.

##### Arguments

| Argument | Type | Description |
| --- | --- | --- |
| nameOfListener | string | The name to give to the disconnect listener during registration; used to reference the listener when you need to delete it later. |
| path | string | The path to create an `onDisconnect` listener for. |
| onDisconnectFn | string | The name of one of the functions exposed by the [`OnDisconnect`](https://firebase.google.com/docs/reference/js/database.ondisconnect) class instance that should be used by the `onDisconnect` listener. |
| args | Array | (opt.) List of args to pass to the `onDisconnectFn`. |

##### Example

An example of using the `set` `onDisconnectFn`:

```js
/**
 * Add an `onDisconnect` listener that sets the profile's
 * `active` status to `false` when the user disconnects.
 */
RealtimeDatabaseInterface.addOnDisconnectListenerByPath(
    'User Presence Listener',
    'profiles/john/active',
    'set',
    ['false']
);
```

An example of using the `remove` `onDisconnectFn`:

```js
/**
 * Add an `onDisconnect` listener that removes the user from
 * a room in the database when the user disconnects.
 */
RealtimeDatabaseInterface.addOnDisconnectListenerByPath(
    'User Presence Listener',
    'rooms/1/users/john',
    'remove'
);
```

#### useOnDisconnectListenerByPath(nameOfListener, path, onDisconectFn, args=[])

React hook for adding an `onDisconnect` listener for a specific path, and then removing it once the component unmounts.

The documentation from `addOnDisconnectListenerByPath` also applies to this function.

##### Arguments

| Argument | Type | Description |
| --- | --- | --- |
| nameOfListener | string | The name to give to the disconnect listener during registration; used to reference the listener when you need to delete it later. |
| path | string | The path to create an `onDisconnect` listener for. |
| onDisconnectFn | string | The name of one of the functions exposed by the [`OnDisconnect`](https://firebase.google.com/docs/reference/js/database.ondisconnect) class instance that should be used by the `onDisconnect` listener. |
| args | Array | (opt.) List of args to pass to the `onDisconnectFn`. |

##### Example

```js
// In a functional component...

/**
 * Add an `onDisconnect` listener when the component mounts that
 * sets the profile's `active` status to `false` when the user
 * disconnects.
 */
RealtimeDatabaseInterface.useOnDisconnectListenerByPath(
    'User Presence Listener',
    'profiles/john/active',
    'set',
    ['false']
);
```

#### removeOnDisconnectListener(nameOfListener)

Removes a specified `onDisconnect` listener from the realtime database interface. Note that this function will only remove `onDisconnect` listeners. Regular listeners that are referenced will *not* be removed by this function.

Throws an error if the `onDisconnect` listener does not exist.

##### Arguments

| Argument | Type | Description |
| --- | --- | --- |
| nameOfListener | string | The name of the `onDisconnect` listener to remove. |

##### Example

```js
/**
 * Remove the "User Presence Listener" `onDisconnect` listener
 * from the realtime database interface.
 */
RealtimeDatabaseInterface.removeOnDisconnectListener('User Presence Listener');
```

#### removeAllOnDisconnectListener()

Removes all `onDisconnect` listeners from the realtime database interface. Note that this function only affects `onDisconnect` listeners. Any regular listeners that exist will remain untouched by this function.

##### Arguments

| Argument | Type | Description |
| --- | --- | --- |
| \- | \- | \- |

##### Example

```js
/**
 * Remove all `onDisconnect` listeners from the realtime database interface.
 */
RealtimeDatabaseInterface.removeAllOnDisconnectListeners();
```
