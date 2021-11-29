# Submodel

## Overview

Submodels represent any subcollections we may have in Firestore. Just like with regular collections, you will typically want to restrict the data that can be stored and read from subcollection to a list of defined "collection properties".

`@unifire-js/firebase/firestore` offers the `Submodel` class as the subcollection counterpart to the `Model` class. It is only intended to be used for subcollections, and as such, a parent `Model` or `Submodel` must be provided.

Examples of a `Submodel` instantiation are as follows:

```js
import { Model, Submodel } from '@unifire-js/firebase/firestore';

const ProfileModel = new Model({
    collectionName: 'profiles',
    collectionProps: [
        'displayName',
        'email',
    ]
});

const ProfileGroupsModel = new Submodel({
    collectionName: 'groups',
    parent: ProfileModel,
    collectionProps: [
        'name',
        'description',
    ]
});

const ProfileGroupCategoriesModel = new Submodel({
    collectionName: 'categories',
    parent: ProfileGroupsModel,
    collectionProps: [
        'name',
        'dateAdded',
    ]
});
```

### Default Property Values

Like `Model`s, you may want to specify default values that some of the collection props should take if nothing else is specified.

To do so, you can simply add a new property, `propDefaults`, to the object parameter passed to the `Submodel` constructor:

```js
import { Model, Submodel } from '@unifire-js/firebase/firestore';

const ProfileModel = new Model({
    collectionName: 'profiles',
    collectionProps: [
        'displayName',
        'email',
    ]
});

const ProfileGroupsModel = new Submodel({
    collectionName: 'groups',
    parent: ProfileModel,
    collectionProps: [
        'name',
        'description',
    ],
    propDefaults: {
        name: 'No Name',
    }
});
```

By default, these default prop values will <i>not</i> be merged into any sanitized data for write operations. It must be specifically set in the operation's params argument.

### Working with Submodels Directly

Since, unlike collections, subcollections can have many different instances, each with a different parent document, `Submodel` does not expose the [`ModelInstanceOperations`](/packages/firebase/docs/api/firestore/model-instance-operations.md) API that `Model` does.

To work with the `ModelInstanceOperations` API with subcollections, you would have to work with a [`SubmodelInstance`](/packages/firebase/docs/api/firestore/submodel-instance.md) object. These objects are attached automatically to any document references and sanitized document snapshots that are returned from the `ModelInstanceOperations` API methods or from the `Submodel` API methods as a `subcollections` property, which is a map of subcollection names to the corresponding `SubmodelInstance` object.

## API

### Constructor Arguments

| Argument | Type | Description |
| --- | --- | --- |
| params | Object | Parameters are specified as key-value pairs in an object for this constructor. |
| params.collectionName | string | The name of the collection in Firestore. |
| params.collectionProps | Array\<string\> | Array of names of all the properties the subcollection supports. |
| params.propDefaults | Object\<string, *\> | (opt.) Map of property names to their default values. |

### Properties

| Property | Type | Description |
| --- | --- | --- |
| subcollections | Object\<string, Submodel\> | Map of subcollection names to their corresponding `Submodel` object. |

### Methods

#### writeToNewDoc(path, data, params)

Sanitizes the specified data and writes it to a new document in the given subcollection instance, while giving the new document an auto-assigned ID.

If the `mergeWithDefaultValues` flag is not set, any default values specified by the submodel's `propDefaults` will <i>not</i> be merged in.

##### Arguments

| Argument | Type | Description |
| --- | --- | --- |
| path | string | The path to the subcollection instance in Firestore to write the new document to. |
| data | Object | The data to write to the new document. |
| params | Object | (opt.) Object specifying various settings for the operation. |
| params.mergeWithDefaultValues | boolean | (opt.) If set to true, any data that is missing from `data` will be set to use the corresponding collection property default value specified by the `propDefaults` property in the `Submodel` constructor. |
| params.transaction | [Firestore.Transaction](https://firebase.google.com/docs/reference/js/firestore_.transaction) | (opt.) A Firestore transaction for the operation to use. |
| params.autobatcher | [Autobatcher](/packages/firebase/docs/api/firestore/autobatcher.md) | (opt.) An autobatcher used to automatically batch Firestore write operations into set chunk sizes. |

##### Return Value

This function always returns a promise which resolves with the [`Firestore.DocumentReference`](https://firebase.google.com/docs/reference/js/firestore_.documentreference) for the created document, with an additional property attached:

| Property | Type | Description |
| --- | --- | --- |
| subcollections | Object\<string, SubmodelInstance\> | Map of names of subcollections that the document supports to their corresponding `SubmodelInstance` objects. |

Note that if an `autobatcher` is used, this document may not yet be created.

##### Example

```js
/**
 * Write to a new document with an auto-assigned ID in the `groups`
 * subcollection of a document with ID, `john`, in the `profiles`
 * root-level collection.
 * 
 * Also, merge in any default values specified by the ProfileGroupsModel
 * for properties whose value has not been specified in the `data` argument.
 */
const docRef = await ProfileGroupsModel.writeToNewDoc(
    'profiles/john/groups',
    {
        name: 'Welcome Group',
    },
    {
        mergeWithDefaultValues: true
    }
);

/**
 * Write to a new document with an auto-assigned ID to the `categories`
 * subcollection of a group in the `groups` subcollection with ID,
 * `12341234`, of a profile in the `profiles` subcollection with ID,
 * `john`.
 * 
 * Also, do NOT merge in any default values specified by the
 * ProfileGroupsCategoriesModel.
 */
const docRef = await ProfileGroupsCategoriesModel.writeToNewDoc(
    'profiles/john/groups/12341234',
    {
        name: 'Welcome',
    },
);
```

#### writeToPath(path, data, params)

Sanitizes the specified data and writes it to a specified document in a specified instance of the subcollection. A new document will be created if it doesn't already exist.

The difference between this and the `writeToNewDoc` method is that we are including a specified ID in the path instead of using an auto-assigned ID. This means this method can be used to either modify an existing document in the database, or create a new document with a specified ID.

If the `mergeWithExistingValues` flag is not set, this will completely overwrite the existing document, if one exists. Properties unspecified by the new data will be deleted from the existing document.

If the `mergeWithDefaultValues` flag is not set, any default values specified by the submodel's `propDefaults` will <i>not</i> be merged in.

##### Arguments

| Argument | Type | Description |
| --- | --- | --- |
| path | string | The path to the document in Firestore to write the data to. |
| data | Object | The data to write to the document. |
| params | Object | (opt.) Object specifying various settings for the operation. |
| params.mergeWithExistingValues | boolean | (opt.) If set to true, any data already found in the specified document will be merged with the new data. This applies after `mergeWithDefaultValues` does, if both are set. |
| params.mergeWithDefaultValues | boolean | (opt.) If set to true, any data that is missing from `data` will be set to use the corresponding collection property default value specified by the `propDefaults` property in the `Submodel` constructor. |
| params.transaction | [Firestore.Transaction](https://firebase.google.com/docs/reference/js/firestore_.transaction) | (opt.) A Firestore transaction for the operation to use. |
| params.autobatcher | [Autobatcher](/packages/firebase/docs/api/firestore/autobatcher.md) | (opt.) An autobatcher used to automatically batch Firestore write operations into set chunk sizes. |

##### Return Value

This function always returns a promise which resolves with the [`Firestore.DocumentReference`](https://firebase.google.com/docs/reference/js/firestore_.documentreference) for the specified document, with an additional property attached:

| Property | Type | Description |
| --- | --- | --- |
| subcollections | Object\<string, SubmodelInstance\> | Map of names of subcollections that the document supports to their corresponding `SubmodelInstance` objects. |

Note that if an `autobatcher` is used, this document may not yet be created.

##### Example

```js
/**
 * Write to a new document with ID, `welcome`, in the `groups` subcollection
 * of a document with ID, `john`, in the `profiles` root-level collection.
 * 
 * Also, merge in any default values for missing data in `data`, and then
 * merge in any existing data in the document (if it already exists).
 */
const docRef = await ProfileGroupsModel.writeToPath(
    'profiles/john/groups/welcome',
    {
        name: 'Welcome Group',
    },
    {
        mergeWithExistingValues: true,
        mergeWithDefaultValues: true,
    }
);

/**
 * Write to a new document with ID, `intro`, in the `categories`
 * subcollection of a document with ID, `welcome`, in the `groups`
 * subcollection of a document with ID, `john`, in the `profiles` root-level
 * collection.
 * 
 * Also, have this data completely overwrite the existing document (if it
 * already exists), and do NOT merge in any default values for missing data.
 */
const docRef = await ProfileGroupsCategoriesModel.writeToPath(
    'profiles/john/groups/welcome/categories/intro',
    {
        name: 'Intro Category',
    }
);
```

#### getByPath(path, params)

Retrieves the specified document's data from the database, if it exists.

##### Arguments

| Argument | Type | Description |
| --- | --- | --- |
| path | string | The path to the document in Firestore to retrieve the data for. |
| params | Object | (opt.) Object specifying various settings for the operation. |
| params.transaction | [Firestore.Transaction](https://firebase.google.com/docs/reference/js/firestore_.transaction) | (opt.) A Firestore transaction for the operation to use. |

##### Return Value

This function always returns a promise.

If no document was found at the specified path, the promise resolves with <i>`null`</i>.

Otherwise, the promise resolves with the sanitized data from the document, with a few other properties added:

| Property | Type | Description |
| --- | --- | --- |
| _ref | [Firestore.DocumentReference](https://firebase.google.com/docs/reference/js/firestore_.documentreference) | The document reference for the document at the specified path. |
| id | string | The ID of the document fetched. |
| subcollections | Object\<string, SubmodelInstance\> | Map of names of subcollections that the document supports to their corresponding `SubmodelInstance` objects. |

##### Example

```js
/**
 * Fetch the document with ID, `welcome`, from the `groups` subcollection
 * in a document with ID, `john`, from the `profiles` root-level
 * collection.
 */
const welcomeGroup = await ProfileGroupsModel.getByPath('profiles/john/groups/welcome');

/**
 * Fetch the document with ID, `intro`, from the `categories` subcollection
 * in a document with ID, `welcome`, from the `groups` subcollection in a
 * document with ID, `john`, from the `profiles` root-level collection.
 */
const introCategory = await ProfileGroupsCategoriesModel.getByPath('profiles/john/groups/welcome/categories/intro');
```

#### getByQueryInInstance(path, queryFns)

Retrieves all documents from the database matching the specified query parameters, in the given Firestore path.

##### Arguments

| Argument | Type | Description |
| --- | --- | --- |
| path | string | The path to the specific subcollection instance to run the query inside of. |
| queryFns | Array\<function\> | Array of Firestore query functions to use in the query, i.e., `limit`, `orderBy`, and `where`. Note that these functions **MUST** be exported from `@unifire-js/firebase/firestore` or you will get an error about mixing Firestore SDK references. |

##### Return Value

This function always returns a promise that resolves with an array of all sanitized documents matching the query in the subcollection instance (will be empty if none match), with each individual sanitized document containing some additional properties:

| Property | Type | Description |
| --- | --- | --- |
| _ref | [Firestore.DocumentReference](https://firebase.google.com/docs/reference/js/firestore_.documentreference) | The document reference for the document at the specified path. |
| id | string | The ID of the document fetched. |
| subcollections | Object\<string, SubmodelInstance\> | Map of names of subcollections that the document supports to their corresponding `SubmodelInstance` objects. |

##### Example

```js
import {
    limit,
    orderBy,
    where,
} from '@unifire-js/firebase/firestore';

/**
 * Find all groups that match the given query in the document with ID,
 * `john` in the `profiles` root-level collection.
 */
const matchingGroups = await ProfileGroupsModel.getByQueryInInstance(
    'profiles/john/groups',
    [
        where('name', '==', 'Welcome Group'),
        orderBy('description', 'desc'),
        limit(4),
    ]
);
```

#### getByQuery(queryFns)

Retrieves all documents from the database matching the specified query parameters, in the given subcollection group -- not tied to a specific subcollection instance.

##### Arguments

| Argument | Type | Description |
| --- | --- | --- |
| queryFns | Array\<function\> | Array of Firestore query functions to use in the query, i.e., `limit`, `orderBy`, and `where`. Note that these functions **MUST** be exported from `@unifire-js/firebase/firestore` or you will get an error about mixing Firestore SDK references. |

##### Return Value

This function always returns a promise that resolves with an array of all sanitized documents matching the query in the subcollection group (will be empty if none match), with each individual sanitized document containing some additional properties:

| Property | Type | Description |
| --- | --- | --- |
| _ref | [Firestore.DocumentReference](https://firebase.google.com/docs/reference/js/firestore_.documentreference) | The document reference for the document at the specified path. |
| id | string | The ID of the document fetched. |
| subcollections | Object\<string, SubmodelInstance\> | Map of names of subcollections that the document supports to their corresponding `SubmodelInstance` objects. |

##### Example

```js
import {
    limit,
    orderBy,
    where,
} from '@unifire-js/firebase/firestore';

/**
 * Find all groups that match the given query.
 */
const matchingGroups = await ProfileGroupsModel.getByQuery([
        where('name', '==', 'Welcome Group'),
        orderBy('description', 'desc'),
        limit(4),
]);
```

#### deleteByPath(path, params)

Deletes a document from the database, given the path to the document.

##### Arguments

| Argument | Type | Description |
| --- | --- | --- |
| path | string | The path to the document to delete. |
| params | Object | (opt.) Object specifying various settings for the operation. |
| params.transaction | [Firestore.Transaction](https://firebase.google.com/docs/reference/js/firestore_.transaction) | (opt.) A Firestore transaction for the operation to use. |
| params.autobatcher | [Autobatcher](/packages/firebase/docs/api/firestore/autobatcher.md) | (opt.) An autobatcher used to automatically batch Firestore write operations into set chunk sizes. |

##### Return Value

This function always returns a promise. That promise will either resolve once the document has been deleted if an `autobatcher` is not used, or it will resolve when the operation has been added to the batch if an `autobatcher` is used.

##### Example

```js
import {
    Autobatcher
} from '@unifire-js/firebase/firestore';

/**
 * Delete the specified document from the database.
 */
ProfileEmailsModel.deleteByPath('profiles/john/emails/gmail');

/**
 * Delete the specified document from the database using an autobatcher.
 */
const autobatcher = new Autobatcher();
ProfileEmailsModel.deleteByPath('profiles/john/emails/gmail', { autobatcher });
```

#### addListenerByPath(nameOfListener, path, fn)

Register a listener for a specific document. The listener is stored on the submodel itself, and can be removed by calling either the `removeListener` or `removeAllListeners` functions for this submodel class instance.

Throws an error if the name for the listener is already taken by another active listener on the submodel class instance.

##### Arguments

| Argument | Type | Description |
| --- | --- | --- |
| nameOfListener | string | The name to give to the listener during registration; used to reference the listener when you need to delete it later. |
| path | string | The path to the document to register the listener for. |
| fn | function | The callback function for the listener; should accept the sanitized document (with `_ref` and `subcollections` attached to it) as its param. |

##### Example

```js
/**
 * Registers a listener on the document at path, `profiles/john/messages/1`. The listener callback
 * specifies that we want to log the new `displayName` for the doc.
 */
MessagesModel.addListenerByPath(
    'TestListener',
    'profiles/john/messages/1',
    (doc) => {
        console.log(doc.content);
    }
);
```

#### addListenerByQueryInInstance(nameOfListener, path, queryFns, fn)

Register a listener for multiple documents in a specific subcollection instance, given a query. The listener is stored on the submodel itself, and can be removed by calling either the `removeListener` or `removeAllListeners` functions.

Throws an error if the name for the listener is already taken by another active listener on the submodel class instance.

##### Arguments

| Argument | Type | Description |
| --- | --- | --- |
| nameOfListener | string | The name to give to the listener during registration; used to reference the listener when you need to delete it later. |
| path | string | The path to the specific subcollection instance to register the listener for. |
| queryFns | function[] | Array of Firestore query functions to use in the query, e.g., `limit`, `orderBy`, and `where`. Note that these functions **MUST** be exported from `@unifire-js/firebase/firestore` or you will get an error about mixing Firestore SDK references. |
| fn | function | The callback function for the listener; should accept the sanitized document array (with `_ref` and `subcollections` attached to each sanitized document in the array) as its param. |

##### Example

```js
import {
    where,
    orderBy
} from '@unifire-js/firebase/firestore';

/**
 * Registers a query listener for the subcollection instance at path, `profiles/john/messages`. The
 * listener callback specifies that we want to log all docs matching the query whenever ANY doc matching
 * that query is added, removed, or changed.
 */
MessagesModel.addListenerByQueryInInstance(
    'TestListener',
    'profiles/john/messages',
    [
        where('posted', '==', true),
        where('content', '==', 'Hello World!'),
        orderBy('userPosted'),
    ],
    (docs) => {
        for (let doc of docs) {
            console.log(`${doc.id}`);
        }
    }
);
```

#### addListenerByQuery(nameOfListener, queryFns, fn)

Register a listener for multiple documents in a subcollection group, given a query. The listener is stored on the submodel itself, and can be removed by calling either the `removeListener` or `removeAllListeners` functions.

Throws an error if the name for the listener is already taken by another active listener on the submodel class instance.

##### Arguments

| Argument | Type | Description |
| --- | --- | --- |
| nameOfListener | string | The name to give to the listener during registration; used to reference the listener when you need to delete it later. |
| queryFns | function[] | Array of Firestore query functions to use in the query, e.g., `limit`, `orderBy`, and `where`. Note that these functions **MUST** be exported from `@unifire-js/firebase/firestore` or you will get an error about mixing Firestore SDK references. |
| fn | function | The callback function for the listener; should accept the sanitized document array (with `_ref` and `subcollections` attached to each sanitized document in the array) as its param. |

##### Example

```js
import {
    where,
    orderBy
} from '@unifire-js/firebase/firestore';

/**
 * Registers a query listener for the subcollection as a whole. The listener callback specifies that we
 * want to log all docs matching the query whenever ANY doc matching that query is added, removed, or
 * changed.
 */
MessagesModel.addListenerByQuery(
    'TestListener',
    [
        where('posted', '==', true),
        where('content', '==', 'Hello World!'),
        orderBy('userPosted'),
    ],
    (docs) => {
        for (let doc of docs) {
            console.log(`${doc.id}`);
        }
    }
);
```

#### removeListener(nameOfListener)

Removes a specified listener from the submodel. Throws an error if the listener does not exist.

##### Arguments

| Argument | Type | Description |
| --- | --- | --- |
| nameOfListener | string | The name of the listener to remove. |

##### Example

```js
/**
 * Removes the `TestListener` listener from the Messages submodel, if it exists.
 */
MessagesModel.removeListener('TestListener');
```

#### removeAllListeners()

Removes all listeners from the submodel.

##### Arguments

| Argument | Type | Description |
| --- | --- | --- |
| \- | \- | \- |

##### Example

```js
/**
 * Removes all listeners from the Messages model.
 */
MessagesModel.removeAllListeners();
```