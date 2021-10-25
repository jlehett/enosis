# Model

## Overview

Models represent our root-level collections in Firestore. Typically, when creating a production app, you will want to restrict the data that can be stored and read from collections to a list of defined "collection properties".

By default, Firestore does not "sanitize" our data in any way. So instead, you might try to create "model" classes for each of your collections, define the collection props inside of the class, and then write a sanitizer for the model that will sanitize any data read or written to the collection.

This results in a lot of boilerplate code. Instead, `@unifire-js/firebase/firestore` offers the `Model` class as a solution.

### Creating a Model

To create a `Model`, you only need to pass the `collectionName` and the list of supported `collectionProps` which the built-in sanitizer will use when reading and writing data to and from the collection.

An example of a `Model` instantiation is as follows:

```js
import { Model } from '@unifire-js/firebase/firestore';

const ProfileModel = new Model({
    collectionName: 'profiles',
    collectionProps: [
        'displayName',
        'email',
        'phone',
        'address'
    ]
});
```

This states that we'd like to support a root-level collection in Firestore called `profiles`, and that it should support the following properties:

* `displayName`
* `email`
* `phone`
* `address`

### Default Property Values

Sometimes, you may like to specify default values that some of the collection props should take if nothing else is specified.

To do so, you can simply add a new property, `propDefaults`, to the object parameter passed to the `Model` constructor:

```js
import { Model } from '@unifire-js/firebase/firestore';

const ProfileModel = new Model({
    collectionName: 'profiles',
    collectionProps: [
        'displayName',
        'email',
        'phone',
        'address',
    ],
    propDefaults: {
        displayName: 'No Name',
        email: 'No Email',
    }
});
```

By default, these default prop values will <i>not</i> be merged into any sanitized data for write operations. It must be specifically set in the operation's params argument.

### Model Instance Operations

Models inherit from the [`ModelInstanceOperations`](/packages/firebase/docs/api/model-instance-operations.md) class, which exposes an API for writing and reading data from the collection the model represents.

## API

### Constructor Arguments

| Argument | Type | Description |
| --- | --- | --- |
| params | Object | Parameters are specified as key-value pairs in an object for this constructor. |
| params.collectionName | string | The name of the collection in Firestore. |
| params.collectionProps | Array\<string\> | Array of names of all the properties the collection supports. |
| params.propDefaults | Object\<string, *\> | (opt.) Map of property names to their default values. |

### Properties

| Property | Type | Description |
| --- | --- | --- |
| subcollections | Object\<string, Submodel\> | Map of subcollection names to their corresponding `Submodel` object. |

### Methods

See the [`ModelInstanceOperations`](/packages/firebase/docs/api/model-instance-operations.md) API for additional methods that `Model` inherits.