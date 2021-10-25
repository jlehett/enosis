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

Since, unlike collections, subcollections can have many different instances, each with a different parent document, `Submodel` does not expose the [`ModelInstanceOperations`](/packages/firebase/docs/api/model-instance-operations.md) API that `Model` does.

To work with the `ModelInstanceOperations` API with subcollections, you would have to work with a [`SubmodelInstance`](/packages/firebase/docs/api/submodel-instance.md) object. These objects are attached automatically to any document references and sanitized document snapshots that are returned from the `ModelInstanceOperations` API methods or from the `Submodel` API methods as a `subcollections` property, which is a map of subcollection names to the corresponding `SubmodelInstance` object.

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

##### Return Value

This function always returns a promise which resolves with the [`Firestore.DocumentReference`](https://firebase.google.com/docs/reference/js/firestore_.documentreference) for the created document, with an additional property attached:

| Property | Type | Description |
| --- | --- | --- |
| subcollections | Object\<string, SubmodelInstance\> | Map of names of subcollections that the document supports to their corresponding `SubmodelInstance` objects. |

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
| params.mergeWithExistingValues | boolean | (opt.) If set to true, any data already found in the specified document will be merged with the new data. |
| params.mergeWithDefaultValues | boolean | (opt.) If set to true, any data that is missing from either `data`, or the existing data if `mergeWithExistingValues` is set to true, will be set to use the corresponding collection property default value specified by the `propDefaults` property in the `Submodel` constructor. |
| params.transaction | [Firestore.Transaction](https://firebase.google.com/docs/reference/js/firestore_.transaction) | (opt.) A Firestore transaction for the operation to use. |

##### Return Value

This function always returns a promise which resolves with the [`Firestore.DocumentReference`](https://firebase.google.com/docs/reference/js/firestore_.documentreference) for the specified document, with an additional property attached:

| Property | Type | Description |
| --- | --- | --- |
| subcollections | Object\<string, SubmodelInstance\> | Map of names of subcollections that the document supports to their corresponding `SubmodelInstance` objects. |

##### Example

```js
/**
 * Write to a new document with ID, `welcome`, in the `groups` subcollection
 * of a document with ID, `john`, in the `profiles` root-level collection.
 * 
 * Also, merge in any existing values found in the document (if it already
 * exists), and then merge the default values for missing data.
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
| queryFns | Array\<function\> | Array of Firestore query functions to use in the query, i.e., `limit`, `orderBy`, and `where`. |

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
} from 'firebase/firestore';

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