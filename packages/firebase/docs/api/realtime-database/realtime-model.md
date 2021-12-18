# Realtime Model

## Overview

Realtime Models represent an abstraction over the generic JSON tree structure of Firebase's Realtime Database, and is meant to closely emulate how `@unifire-js/firebase/firestore`'s models work.

In comparison to the `@unifire-js/firebase/firestore` models, Realtime Models perform sanitization on only the first level of data in a tree, and focus more on full reference paths to the data as opposed to using collections and document IDs.

For the purposes of this package's abstractions over Firestore and the Firebase Realtime Database, you will likely want to use Firestore by default.

However, if you need to be able to create listeners for when the user disconnects from the database (by closing their tab, turning off their computer, etc.) to perform simple writes in those instances (for example, if you need a user "presence" system), you will want to use the Firebase Realtime Database.

The Realtime Database will also likely provide better and more stable read / write speeds and costs for data that is updated very frequently at the cost of less powerful queries and less structured data.

To note, queries based on anything other than paths in the Realtime Database are currently not supported in `@unifire-js/firebase`. If you need to use powerful queries, consider utilizing the Firestore abstractions in this package instead.

### Creating a RealtimeModel

To create a `RealtimeModel`, you only need to pass the `collectionName` and the list of supported `collectionProps` which the built-in sanitizer will use when reading and writing data to and from the collection.

An example of a `RealtimeModel` instantiation is as follows:

```js
import { RealtimeModel } from '@unifire-js/firebase/realtime-database';

const RoomModel = new RealtimeModel = new RealtimeModel({
    collectionName: 'rooms',
    collectionProps: [
        'publicInfo',
        'privateInfo',
    ]
});
```

Note that `collectionName` currently just serves as a unique identifier and does not have an effect on the underlying logic for the `RealtimeModel`.

Also note that the built-in sanitizer will only sanitize the first level of data specified in `collectionProps`. For example, if `publicInfo` and `privateInfo` are objects, there will be no sanitization of the data within those objects by default.

### Default Property Values

Sometimes, you may like to specify default values that some of the collection props should take if nothing else is specified.

To do so, you can simply add a new property, `propDefaults`, to the object parameter passed to the `RealtimeModel` constructor:

```js
import { RealtimeModel } from '@unifire-js/firebase/realtime-database';

const RoomModel = new RealtimeModel({
    collectionName: 'rooms',
    collectionProps: [
        'roomName',
        'active',
        'publicInfo',
        'privateInfo',
    ],
    propDefaults: {
        roomName: 'No Name',
        active: false,
    }
});
```

By default, these default prop values will *not* be merged into any sanitized data for write operations. This feature must be specifically set in the operation's params argument.

## API

### Constructor Arguments

| Argument | Type | Description |
| --- | --- | --- |
| params | Object | Parameters are specified as key-value pairs in an object for this constructor. |
| params.collectionName | string | The name of the "collection" in Firebase Realtime Database. Used purely as a unique identifier for the Realtime Model, and does not affect the underlying logic for the Realtime Model. |
| params.collectionProps | Array\<string\> | Array of names of all the properties the "collection" supports. Only has an effect on the first level of properties for the "collection", so data within objects will not be sanitized by default. |
| params.propDefaults | Object\<string, *\> | (opt.) Map of property names to their default values. |

### Methods

#### writeToPath(path, data, params)

Sanitizes the specified data and writes it to a specified path in the Realtime Database.

This function will *always* overwrite any existing data at that path in the database. If you'd like to merge in the new data with any existing data, you will have to perform a fetch operation first and manually specify how you'd like to merge any found data with the new data.

If the `mergeWithDefaultValues` flag is not set, any default values specified by the model's `propDefaults` will *not* be merged in.

##### Arguments

| Argument | Type | Description |
| --- | --- | --- |
| path | string | The path in the Firebase Realtime Database to write the sanitized data to. |
| data | Object | The unsanitized data to write to the path. |
| params | Object | (opt.) Object specifying various settings for the operation. |
| params.mergeWithDefaultValues | boolean | (opt.) If set to true, any data that is missing from the first level of `data` will be set to use the corresponding collection property default value specified by the `propDefaults` property in the `RealtimeModel` constructor. |

##### Return Value

This function returns a promise that resolves when the data has been written to the database.

##### Example

```js
/**
 * Write data to the `rooms/1` path, and merge in any default values
 * specified by the RoomModel for properties whose value has not been
 * specified in the `data` argument.
 */
await RoomModel.writeToPath(
    'rooms/1',
    {
        active: true,
        users: {
            john: {
                vote: 1,
            }
        }
    },
    { mergeWithDefaultValues: true }
);

/**
 * Write data to the `rooms/1` path, and do NOT merge in any default values
 * specified by the RoomModel for properties whose value has not been
 * specified in the `data` argument.
 */
await RoomModel.writeToPath(
    'rooms/1',
    {
        active: true,
        users: {
            john: {
                vote: 1,
            }
        },
    }
);
```

#### getByPath(path)

Reads data from the given path in Firebase Realtime Database. This will return that data and any children of that path in the Realtime Database JSON tree.

##### Arguments

| Argument | Type | Description |
| --- | --- | --- |
| path | string | The path to read data from in the Realtime Database. |

##### Return Value

This function returns a promise that resolves with the sanitized data read from the specified path in the Realtime Database.

##### Example

```js
/**
 * Get the sanitized data at the path `rooms/1` in the Realtime Database.
 */
const roomData = await RoomModel.getByPath('rooms/1');
```

#### addListenerByPath(nameOfListener, path, fn)

Registers a listener for a specific path in the Realtime Database. The listener is stored on the Realtime Model itself, and can be removed by calling either the `removeListener` or `removeAllListeners` functions.

The listener will be registered for the given path in the Firebase Realtime Database and any children of that path in the Realtime Database JSON tree.

The callback function passed as an argument should take in the sanitized data at the given path as its only argument.

This function will throw an error if a listener with the name specified by `nameOfListener` already exists.

##### Arguments

| Argument | Type | Description |
| --- | --- | --- |
| nameOfListener | string | The name to give to the listener during registration. It is used to reference the listener when you need to delete it later. |
| path | string | The path in the Realtime Database to register the listener for. |
| fn | function | The callback function for the listener; should accept the sanitized data snapshot as its only argument. |

##### Example

```js
/**
 * Create a listener by the name, `RoomListener`, that will listen for
 * changes in the Realtime Database JSON tree at the path, `rooms/1`.
 */
RoomModel.addListenerByPath(
    'RoomListener',
    'rooms/1',
    (sanitizedData) => {
        console.log('Sanitized data at path:', sanitizedData);
    }
);
```

#### useListenerByPath(nameOfListener, path, fn)

React hook for adding a listener for a specific path in the Realtime Database JSON tree, and then removing it once the component unmounts.

The callback function passed as an argument should take in the sanitized data at the given path as its only argument.

This function will throw an error if a listener with the name specified by `nameOfListener` already exists.

##### Arguments

| Argument | Type | Description |
| --- | --- | --- |
| nameOfListener | string | The name to give to the listener during registration. It is used to reference the listener when you need to delete it later. |
| path | string | The path in the Realtime Database to register the listener for. |
| fn | function | The callback function for the listener; should accept the sanitized data snapshot as its only argument. |

##### Example

```js
// In a functional component...

/**
 * Registers a listener on the path, `rooms/1`, in the Realtime Database.
 * This listener will automatically be cleaned up when the React component
 * unmounts.
 */
RoomModel.useListenerByPath(
    'TestListener',
    'rooms/1',
    (sanitizedData) => {
        console.log('Sanitized data at path:', sanitizedData);
    }
);
```

#### removeListener(nameOfListener)

Removes a specified listener from the realtime model. Throws an error if the listener does not exist.

To remove the special `onDisconnect` listeners, you must use the `removeOnDisconnectListener` or `removeAllOnDisconnectListeners` instead.

##### Arguments

| Argument | Type | Description |
| --- | --- | --- |
| nameOfListener | string | The name of the listener to remove. |

##### Example

```js
/**
 * Removes the `TestListener` listener from the Room realtime model, if it
 * exists.
 */
RoomModel.removeListener('TestListener');
```

#### removeAllListeners()

Removes all listeners from the realtime model. This does *not* include the special `onDisconnect` listeners. To remove those listeners, you must use the `removeOnDisconnectListener` or `removeAllOnDisconnectListeners` instead.

##### Arguments

| Argument | Type | Description |
| --- | --- | --- |
| \- | \- | \- |

##### Example

```js
/**
 * Removes all listeners from the Room model.
 */
RoomModel.removeAllListeners();
```