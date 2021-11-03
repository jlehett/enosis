# Model Instance Operations

`ModelInstanceOperations` is inherited by both `Model` and `SubmodelInstance` objects, and exposes an API for reading and writing data from documents in a collection or subcollection instance.

## Methods

### writeToNewDoc(data, params)

Sanitizes the specified data and writes it to a new document in the given collection or subcollection instance, while giving the new document an auto-assigned ID.

If the `mergeWithDefaultValues` flag is not set, any default values specified by the submodel's `propDefaults` will <i>not</i> be merged in.

#### Arguments

| Argument | Type | Description |
| --- | --- | --- |
| data | Object | The data to write to the new document. |
| params | Object | (opt.) Object specifying various settings for the operation. |
| params.mergeWithDefaultValues | boolean | (opt.) If set to true, any data that is missing from `data` will be set to use the corresponding collection property default value specified by the `propDefaults` property in the corresponding `Model` or `Submodel` constructor. |
| params.transaction | [Firestore.Transaction](https://firebase.google.com/docs/reference/js/firestore_.transaction) | (opt.) A Firestore transaction for the operation to use. |
| params.autobatcher | [Autobatcher](/packages/firebase/docs/api/autobatcher.md) | (opt.) An autobatcher used to automatically batch Firestore write operations into set chunk sizes. |


#### Return Value

This function always returns a promise which resolves with the [`Firestore.DocumentReference`](https://firebase.google.com/docs/reference/js/firestore_.documentreference) for the created document, with an additional property attached:

| Property | Type | Description |
| --- | --- | --- |
| subcollections | Object\<string, SubmodelInstance\> | Map of names of subcollections that the document supports to their corresponding `SubmodelInstance` objects. |

Note that if an `autobatcher` is used, this document may not yet be created.

#### Example

```js
/**
 * Write to a new document with an auto-assigned ID in the `profiles`
 * root-level collection.
 * 
 * Also, merge in any default values specified by the ProfileModel for
 * properties whose value has not been specified in the `data` argument.
 */
const johnDocRef = await ProfileModel.writeToNewDoc(
    {
        displayName: 'john',
    },
    {
        mergeWithDefaultValues: true
    }
);

const welcomeDocRef = await johnDocRef.subcollections.groups.writeToNewDoc({
    name: 'Welcome Group'
});
```

### writeToID(id, data, params)

Sanitizes the specified data and writes it to a specified document in the `Model` or `Submodel`'s (sub)collection. A new document will be created if it doesn't already exist.

The difference between this and the `writeToNewDoc` method is that we are including a specified ID to write to instead of using an auto-assigned ID. This means this method can be used to either modify an existing document in the database, or create a new document with a specified ID.

If the `mergeWithExistingValues` flag is not set, this will completely overwrite the existing document, if one exists. Properties unspecified by the new data will be deleted from the existing document.

If the `mergeWithDefaultValues` flag is not set, any default values specified by the `Model` or `Submodel`'s `propDefaults` will <i>not</i> be merged in.

#### Arguments

| Argument | Type | Description |
| --- | --- | --- |
| id | string | The ID of the document to write the sanitized data to. |
| data | Object | The data to sanitize and write to the specified document. |
| params | Object | (opt.) Object specifying various settings for the operation. |
| params.mergeWithExistingValues | boolean | (opt.) If set to true, any data already found in the specified document will be merged with the new data. This applies after `mergeWithDefaultValues` does, if both are set. |
| params.mergeWithDefaultValues | boolean | (opt.) If set to true, any data that is missing from `data` will be set to use the corresponding collection property default value specified by the `propDefaults` property in the `Model` or `Submodel` constructor. |
| params.transaction | [Firestore.Transaction](https://firebase.google.com/docs/reference/js/firestore_.transaction) | (opt.) A Firestore transaction for the operation to use. |
| params.autobatcher | [Autobatcher](/packages/firebase/docs/api/autobatcher.md) | (opt.) An autobatcher used to automatically batch Firestore write operations into set chunk sizes. |

#### Return Value

This function always returns a promise which resolves with the [`Firestore.DocumentReference`](https://firebase.google.com/docs/reference/js/firestore_.documentreference) for the specified document, with an additional property attached:

| Property | Type | Description |
| --- | --- | --- |
| subcollections | Object\<string, SubmodelInstance\> | Map of names of subcollections that the document supports to their corresponding `SubmodelInstance` objects. |

Note that if an `autobatcher` is used, this document may not yet be created or updated.

#### Example

```js
/**
 * Write data to a specified document, overwriting the existing document, if
 * one exists, and NOT using any default prop values for missing data.
 */
const johnDocRef = await ProfileModel.writeToID(
    'john',
    { displayName: 'John' }
);

/**
 * Write to a new document with ID, `welcome`, in the `groups` subcollection
 * of a document with ID, `john`, in the `profiles` root-level collection.
 * 
 * Also, merge in any default values for missing data in `data`, and then
 * merge in any existing data in the document (if it already exists).
 */
const welcomeDocRef = await johnDocRef.subcollections.groups.writeToID(
    'welcome',
    { name: 'Welcome Group' },
    {
        mergeWithExistingValues: true,
        mergeWithDefaultValues: true,
    }
);
```

### getByID(id, params)

Retrieves the specified document's data from the database, if it exists.

#### Arguments

| Argument | Type | Description |
| --- | --- | --- |
| id | string | The ID of the document to fetch from the database. |
| params | Object | (opt.) Object specifying various settings for the operation. |
| params.transaction | [Firestore.Transaction](https://firebase.google.com/docs/reference/js/firestore_.transaction) | (opt.) A Firestore transaction for the operation to use. |

#### Return Value

This function always returns a promise.

If no document was found at the specified path, the promise resolves with <i>`null`</i>

Otherwise, the promise resolves with the sanitized data from the document, with a few other properties added:

| Property | Type | Description |
| --- | --- | --- |
| _ref | [Firestore.DocumentReference](https://firebase.google.com/docs/reference/js/firestore_.documentreference) | The document reference for the document at the specified path. |
| id | string | The ID of the document fetched. |
| subcollections | Object\<string, SubmodelInstance\> | Map of names of subcollections that the document supports to their corresponding `SubmodelInstance` objects. |

#### Example

```js
/**
 * Fetch the document with ID, `john`, from the root-level `profiles`
 * collection.
 */
const johnProfile = await ProfileModel.getByID('john');

/**
 * Fetch the document with ID, `welcome`, from the `groups` subcollection
 * in a document with ID, `john`, from the root-level `profiles` collection.
 */
const welcomeGroup = await johnProfile.subcollections.groups.getByID('welcome');
```

### getByQuery(queryFns)

Retrieves all documents from the database matching the specified query parameters in the collection or subcollection instance.

#### Arguments

| Argument | Type | Description |
| --- | --- | --- |
| queryFns | Array\<function\> | Array of Firestore query functions to use in the query, i.e., `limit`, `orderBy`, and `where`. |

#### Return Value

This function always returns a promise that resolves with an array of all sanitized documents matching the query in the collection or subcollection instance (will be empty if none match), with each individual sanitized document containing some additional properties:

| Property | Type | Description |
| --- | --- | --- |
| _ref | [Firestore.DocumentReference](https://firebase.google.com/docs/reference/js/firestore_.documentreference) | The document reference for the document at the specified path. |
| id | string | The ID of the document fetched. |
| subcollections | Object\<string, SubmodelInstance\> | Map of names of subcollections that the document supports to their corresponding `SubmodelInstance` objects. |

#### Example

```js
import {
    limit,
    orderBy,
    where,
} from 'firebase/firestore';

/**
 * Find the first 4 profiles, ordered by their `email` properties, in the 
 * `profiles` root-level collection, whose `displayName` is `John`, and whose
 * `agreedToTerms` property is set to `true`.
 */
const matchingProfiles = await ProfileModel.getByQuery([
    where('displayName', '==', 'John'),
    where('agreedToTerms', '==', true),
    orderBy('email', 'desc'),
    limit(4),
]);

/**
 * Find all groups in `groups` subcollection in the document with ID, `john`,
 * in the `profiles` root-level collection, whose `name` is `Welcome Group`.
 */
const matchingGroups = await johnProfile.subcollections.groups.getByQuery([
    where('name', '==', 'Welcome Group')
]);
```

### deleteByID(id, params)

#### Arguments

| Argument | Type | Description |
| --- | --- | --- |
| id | string | The ID of the document to delete from the database. |
| params | Object | (opt.) Object specifying various settings for the operation. |
| params.transaction | [Firestore.Transaction](https://firebase.google.com/docs/reference/js/firestore_.transaction) | (opt.) A Firestore transaction for the operation to use. |
| params.autobatcher | [Autobatcher](/packages/firebase/docs/api/autobatcher.md) | (opt.) An autobatcher used to automatically batch Firestore write operations into set chunk sizes. |

#### Return Value

This function always returns a promise. That promise will either resolve once the document has been deleted if an `autobatcher` is not used, or it will resolve when the operation has been added to the batch if an `autobatcher` is used.

#### Example

```js
import {
    Autobatcher
} from '@unifire-js/firebase/firestore';

/**
 * Delete the specified document from the database.
 */
ProfileModel.deleteByID('john');

/**
 * Delete the specified document from the database using an autobatcher.
 */
const autobatcher = new Autobatcher();
ProfileModel.deleteByID('john', { autobatcher });
```