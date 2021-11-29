# Submodel Instance

## Overview

Submodel Instances represent specific instances of our subcollections in Firestore. For instance, let's say `groups` is a subcollection in our database, which is a subcollection of the `profiles` collection. Referencing the `groups` subcollection alone, would correspond to the `Submodel`. However, referencing a specific instance of the subcollection, such as a subcollection instance on a document with ID, `john`, in the `profiles` collection, would correspond to the `SubmodelInstance`.

When using `SubmodelInstance`s, we can use the [`ModelInstanceOperations`](/packages/firebase/docs/api/firestore/model-instance-operations.md) API that `Model` also inherits, which provides various methods for reading and writing data from documents within the subcollection instance.

### Creating a SubmodelInstance

`SubmodelInstance`s are not intended to be created directly by the developer. Instead, they are created and attached automatically to any document references or sanitized document snapshots that are returned from either the [`ModelInstanceOperations`](/packages/firebase/docs/api/firestore/model-instance-operations.md) API, or the [`Submodel`](/packages/firebase/docs/api/firestore/submodel.md) API, typically under an additional property, `subcollections`. Please see the corresponding API's for more information on the methods which return `SubmodelInstance`s.

The following is an example of a piece of code that provides us with a `SubmodelInstance`:

```js
import { Model, Submodel } from '@unifire-js/firebase/firestore';

const ProfileModel = new Model({
    collectionName: 'profiles',
    collectionProps: [ 'displayName' ]
});

const ProfileGroupsModel = new Submodel({
    collectionName: 'groups',
    collectionProps: [ 'name' ]
});

const johnProfile = Model.getByID('john');

// johnProfile.subcollections contains a map of the names of all
// subcollections it supports to their corresponding `SubmodelInstance`.
console.log(johnProfile.subcollections.groups);
```

### Model Instance Operations

SubmodelInstances inherit from the [`ModelInstanceOperations`](/packages/firebase/docs/api/firestore/model-instance-operations.md) class, which exposes an API for writing and reading data from the collection the model represents.

## API

### Properties

| Property | Type | Description |
| --- | --- | --- |
| subcollections | Object\<string, Submodel\> | Map of subcollection names to their corresponding `Submodel` object. |

### Methods

See the [`ModelInstanceOperations`](/packages/firebase/docs/api/firestore/model-instance-operations.md) API for additional methods that `Model` inherits.