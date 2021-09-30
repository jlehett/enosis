# Enosis

Enosis is a library aiming to provide consistent, easy-to-read interfaces of solutions for a wide variety of web development problems.

Why Enosis? I'm not sure yet. Name pending.

## API Docs

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

#### Table of Contents

*   [Async](#async)
    *   [Deferred](#deferred)
        *   [Properties](#properties)
        *   [Examples](#examples)
    *   [DataLoadingPipeline](#dataloadingpipeline)
        *   [Parameters](#parameters)
        *   [Examples](#examples-1)
        *   [run](#run)
    *   [DataPipelineStep](#datapipelinestep)
        *   [run](#run-1)
    *   [AcquireDataStep](#acquiredatastep)
        *   [Parameters](#parameters-1)
        *   [Examples](#examples-2)
        *   [run](#run-2)
            *   [Parameters](#parameters-2)
    *   [PopulateDataStep](#populatedatastep)
        *   [Parameters](#parameters-3)
        *   [Examples](#examples-3)
        *   [run](#run-3)
            *   [Parameters](#parameters-4)
    *   [ClearDataStep](#cleardatastep)
        *   [Parameters](#parameters-5)
        *   [Examples](#examples-4)
        *   [run](#run-4)
            *   [Parameters](#parameters-6)
    *   [Type Defs](#type-defs)
        *   [acquireDataFn](#acquiredatafn)
            *   [Parameters](#parameters-7)
            *   [Examples](#examples-5)
        *   [postProcessingFn](#postprocessingfn)
            *   [Parameters](#parameters-8)
            *   [Examples](#examples-6)
        *   [populateDataFn](#populatedatafn)
            *   [Parameters](#parameters-9)
            *   [Examples](#examples-7)
*   [Categorized Error](#categorized-error)
    *   [CategorizedErrorFactory](#categorizederrorfactory)
        *   [Parameters](#parameters-10)
        *   [Examples](#examples-8)
    *   [Type Defs](#type-defs-1)
        *   [CategorizedError](#categorizederror)
            *   [Properties](#properties-1)
        *   [InCategoryFn](#incategoryfn)
            *   [Parameters](#parameters-11)
        *   [CategorizedErrorReferenceEnums](#categorizederrorreferenceenums)
            *   [Properties](#properties-2)
        *   [ErrorDef](#errordef)
            *   [Properties](#properties-3)
        *   [ID_ReferenceEnum](#id_referenceenum)
        *   [Factory_ReferenceEnum](#factory_referenceenum)
        *   [Category_ReferenceEnum](#category_referenceenum)
        *   [ErrorFactory](#errorfactory)
            *   [Parameters](#parameters-12)

### Async



#### Deferred

[modules/async/deferred.js:29-36](https://github.com/jlehett/enosis/blob/5dee376d36b0821f5df00e4af9fb1bbb6291ab29/modules/async/deferred.js#L29-L36 "Source code on GitHub")

Deferred promise object based on the $q.Deferred implementation. Allows a
developer to resolve or reject the created promise from outside of the
promise's scope.

The deferred object's promise can be accessed through its `promise` property,
and the promise can be externally resolved or rejected via the `resolve` and
`reject` properties.

##### Properties

*   `promise` **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<any>** The internal promise of the Deferred instance
*   `resolve` **[function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)** Function to resolve the internal promise of the
    Deferred instance
*   `reject` **[function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)** Function to reject the internal promise of the
    Deferred instance

##### Examples

```javascript
// Create a deferred promise
const deferred = new Deferred();

// After 3 seconds, resolve the deferred promise with the value, "Test"
setTimeout(() => {
     deferred.resolve('Test');
}, 3000);

// Obtain the result of deferred once it has resolved
const deferredResult = await deferred.promise; // deferredResult now has the value "Test"
```

#### DataLoadingPipeline

[modules/async/data-loading-pipeline/data-loading-pipeline.js:74-137](https://github.com/jlehett/enosis/blob/5dee376d36b0821f5df00e4af9fb1bbb6291ab29/modules/async/data-loading-pipeline/data-loading-pipeline.js#L74-L137 "Source code on GitHub")

Class which provides a readable and maintainable system for constructing
async data loading pipelines that require intermediate data to be saved
between steps.

Typical data loading pipelines tend to be hard to refactor, as it is
difficult to parse what data from previous steps may be required in future
steps. This means re-ordering, removing, or adding any data loading steps can
introduce many unintended issues.

This data pipeline class is intended to chunk individual steps into "data
pipeline steps" with single responsibilities. Data populated from previous
steps is still accessible via a "progressive storage" object that is passed
through each data pipeline step's `run` function. However, it becomes easier
to tell when a step relies on previously-acquired data by its usage of the
`progressiveStorage` object.

For example, if an AcquireDataStep's `acquireDataFn` uses
`progressiveStorage.profile`, a developer can easily ensure that the
appropriate data pipeline step that populates the `profile` key in progressive
storage is kept in the pipeline as a step that runs before the example
AcquireDataStep is run.

##### Parameters

*   `dataPipelineSteps` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)<[DataPipelineStep](#datapipelinestep)>** Array of data pipeline
    steps; all values in the array should be instances of classes which
    inherit from DataPipelineStep

##### Examples

```javascript
// Create an acquire data step to fetch a profile from a database and store
// its `displayName` property for a future step in the pipeline
const acquireProfileStep = new AcquireDataStep(
     // Result will be stored under `profileDisplayName`
     'profileDisplayName',
     // Function defining how to get the profile data asynchronously
     (progressiveStorage) => {
         return Profile.fetchProfileByEmailAddress('test@gmail.com');
     },
     // Post-processing step to only save the `displayName` property to
     // progressive storage
     (progressiveStorage, profile) => {
         return profile.displayName;
     }
);

// Create a populate data step to store the profile name + a suffix of '-test'
// in a new slot of progressive storage
const populateDisplayNameWithSuffixStep = new PopulateDataStep(
     // Result will be stored under `displayNameWithSuffix`
     'displayNameWithSuffix',
     // Function defining what should be populated in storage
     (progressiveStorage) => {
         return progressiveStorage.profileDisplayName + '-test';
     }
);

// Create a clear data step to clear the `profileDisplayName` data from
// progressive storage since it is no longer needed
const clearDisplayNameStep = new ClearDataStep(['profileDisplayName']);

// Create the data loading pipeline with the given steps
const dataLoadingPipeline = new DataLoadingPipeline([
     acquireProfileStep,
     populateDisplayNameWithSuffixStep,
     clearDisplayNameStep,
]);

// Run the pipeline and obtain the results that were stored in progressive
// storage by the end of the pipeline
const results = await dataLoadingPipeline.run();
```

##### run

[modules/async/data-loading-pipeline/data-loading-pipeline.js:95-115](https://github.com/jlehett/enosis/blob/5dee376d36b0821f5df00e4af9fb1bbb6291ab29/modules/async/data-loading-pipeline/data-loading-pipeline.js#L95-L115 "Source code on GitHub")

Runs the data loading pipeline and returns a promise which resolves with
the final `progressiveStorage` that is constructed.

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)>** Promise which resolves with the progressive
storage object that is constructed by the end of the pipeline

#### DataPipelineStep

[modules/async/data-loading-pipeline/data-loading-steps/data-pipeline-step.abstract.js:6-21](https://github.com/jlehett/enosis/blob/5dee376d36b0821f5df00e4af9fb1bbb6291ab29/modules/async/data-loading-pipeline/data-loading-steps/data-pipeline-step.abstract.js#L6-L21 "Source code on GitHub")

Abstract class that any data pipeline step classes should inherit from.

##### run

[modules/async/data-loading-pipeline/data-loading-steps/data-pipeline-step.abstract.js:18-20](https://github.com/jlehett/enosis/blob/5dee376d36b0821f5df00e4af9fb1bbb6291ab29/modules/async/data-loading-pipeline/data-loading-steps/data-pipeline-step.abstract.js#L18-L20 "Source code on GitHub")

Run the data spec.

#### AcquireDataStep

[modules/async/data-loading-pipeline/data-loading-steps/acquire-data-step.js:57-86](https://github.com/jlehett/enosis/blob/5dee376d36b0821f5df00e4af9fb1bbb6291ab29/modules/async/data-loading-pipeline/data-loading-steps/acquire-data-step.js#L57-L86 "Source code on GitHub")

**Extends DataPipelineStep**

Defines a step where data is asynchronously acquired and stored in
progressive storage.

This data pipeline step will run the `acquireDataFn` and obtain the results
from the promise. It will then store those results in the data loading
pipeline's "progressive storage" object under the `dataStorageKey` to be used
in future data loading steps.

If the raw data from the `acquireDataFn` function should be modified before
being stored in "progressive storage", an optional `postProcessingFn`
parameter can be passed to the `AcquireDataStep` constructor. If a
`postProcessingFn` function is passed, the raw results from `acquireDataFn`
will be passed through the `postProcessingFn`, and the result of
`postProcessingFn` will be stored in "progressive storage" under the `dataStorageKey`.

This data pipeline step should only be used for loading async data, as a
promise is expected to be returned from the `acquireDataFn` function.
Any post-processing that needs to be done in the `postProcessingFn` should
only be synchronous.

##### Parameters

*   `dataStorageKey` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The key to store the results of this data
    pipeline step under
*   `acquireDataFn` **[acquireDataFn](#acquiredatafn)** The async function to run to acquire the data
    asynchronously; should return the desired result as a promise (or the
    function itself should be async and return the desired result)
*   `postProcessingFn` **[postProcessingFn](#postprocessingfn)?** If the raw value from the async
    fetching function should be modified in a synchronous manner before being
    stored in the pipeline, an optional post-processing function will be run

##### Examples

```javascript
// Create an AcquireDataStep that loads a profile from a database, and stores the
// profile in the data pipeline's "progressive storage" under the key "profile"
let acquireDisplayNameStep = new AcquireDataStep(
     'profile',
     (progressiveStorage) => {
         return ProfileModel.getProfileByEmail('test@gmail.com'); // <= Returns a promise
     }
);
```

```javascript
// Create an AcquireDataStep that loads a profile from a database, and only stores
// the profile's `displayName` property in the data pipeline's "progressive storage"
// under the key "profileDisplayName"
let acquireDisplayNameStep = new AcquireDataStep(
     'profileDisplayName',
     (progressiveStorage) => {
         return ProfileModel.getProfileByEmail('test@gmail.com'); // <= Returns a promise
     },
     (progressiveStorage, profile) => {
         return profile.displayName;
     }
);
```

##### run

[modules/async/data-loading-pipeline/data-loading-steps/acquire-data-step.js:79-85](https://github.com/jlehett/enosis/blob/5dee376d36b0821f5df00e4af9fb1bbb6291ab29/modules/async/data-loading-pipeline/data-loading-steps/acquire-data-step.js#L79-L85 "Source code on GitHub")

Run the data pipeline step and save the results.

###### Parameters

*   `progressiveStorage` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** The progressive storage object from
    the data pipeline that is running this data pipeline step

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<any>** Returns a promise that resolves once the data has
been stored in progressive storage

#### PopulateDataStep

[modules/async/data-loading-pipeline/data-loading-steps/populate-data-step.js:41-65](https://github.com/jlehett/enosis/blob/5dee376d36b0821f5df00e4af9fb1bbb6291ab29/modules/async/data-loading-pipeline/data-loading-steps/populate-data-step.js#L41-L65 "Source code on GitHub")

**Extends DataPipelineStep**

Data spec defining a step where data is synchronously populated into the
progressive storage.

This data loading spec will run the `populateDataFn` to obtain the result
that should be stored in progressive storage under the `dataStorageKey` to be
used in future data loading specs.

The `populateDataFn` should ONLY be async or return a promise IF a promise
itself is intended to be stored in progressive storage.

##### Parameters

*   `dataStorageKey` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The key to store the results of this data
    loading spec under
*   `populateDataFn` **[populateDataFn](#populatedatafn)** The synchronous function to run to
    populate the data synchronously; should NOT return a promise unless
    storing a promise itself in the progressive storage is desired

##### Examples

```javascript
// Create a PopulateDataSpec that populates a constant name to the progressive
// storage under the "constantName" key
let populateNameStep = new PopulateDataStep(
     'constantName',
     (progressiveStorage) => {
         return 'Turing';
     }
);
```

```javascript
// Create a PopulateDataSpec that populates the progressive storage with a
// string that combines something already stored in progressive storage with
// a suffix of "-New"
let populateSuffixedString = new PopulateDataStep(
     'suffixedString',
     (progressiveStorage) => {
         return progressiveStorage.someOtherString + '-New';
     }
);
```

##### run

[modules/async/data-loading-pipeline/data-loading-steps/populate-data-step.js:62-64](https://github.com/jlehett/enosis/blob/5dee376d36b0821f5df00e4af9fb1bbb6291ab29/modules/async/data-loading-pipeline/data-loading-steps/populate-data-step.js#L62-L64 "Source code on GitHub")

Run the data loading spec and save the results.

###### Parameters

*   `progressiveStorage` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** The progressive storage object from
    the data pipeline that is running this data loading spec

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<any>** Returns a promise that resolves once the data has
been stored in progressive storage

#### ClearDataStep

[modules/async/data-loading-pipeline/data-loading-steps/clear-data-step.js:23-49](https://github.com/jlehett/enosis/blob/5dee376d36b0821f5df00e4af9fb1bbb6291ab29/modules/async/data-loading-pipeline/data-loading-steps/clear-data-step.js#L23-L49 "Source code on GitHub")

**Extends DataPipelineStep**

Defines a step where data is cleared from the progressive storage in the
data pipeline.

This data pipeline step will clear the data in progressive storage that
exists under any of the keys in `dataStorageKeys`.

This is useful if, for example, you need data from step 1 to exist only long
enough for it to be used by step 3. At that point, you no longer need the
results of step 1 in memory, and so you can clear memory with this step.

##### Parameters

*   `dataStorageKeys` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)<[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>** The keys to clear the data from in
    progressive storage

##### Examples

```javascript
// Create a clear data step to clear the `profileDisplayName` data from
// progressive storage
const clearDisplayNameStep = new ClearDataStep(['profileDisplayName']);
```

##### run

[modules/async/data-loading-pipeline/data-loading-steps/clear-data-step.js:44-48](https://github.com/jlehett/enosis/blob/5dee376d36b0821f5df00e4af9fb1bbb6291ab29/modules/async/data-loading-pipeline/data-loading-steps/clear-data-step.js#L44-L48 "Source code on GitHub")

Run the data pipeline step and clear the data from the appropriate keys
in progressive storage.

###### Parameters

*   `progressiveStorage` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** The progressive storage object from
    the data pipeline that is running this data pipeline step

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<any>** Returns a promise that resolves once the data has
been cleared from progressive storage

#### Type Defs



##### acquireDataFn

[modules/async/typedefs.js:1-53](https://github.com/jlehett/enosis/blob/5dee376d36b0821f5df00e4af9fb1bbb6291ab29/modules/async/typedefs.js#L1-L17 "Source code on GitHub")

Async function to run to acquire some data asynchronously; desired result
should be returned as a promise.

Type: [Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)

###### Parameters

*   `progressiveStorage` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** The progressive storage object from the
    data loading pipeline

###### Examples

```javascript
// Async function to acquire profile data from a database using an email
// previously fetched in the pipeline and stored in progressive storage
(progressiveStorage) => {
     return ProfileModel.getProfileByEmail(progressiveStorage.email);
}
```

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<any>** Resolves with the desired async data to either save to
storage, or to pass to a post-processing function

##### postProcessingFn

[modules/async/typedefs.js:1-53](https://github.com/jlehett/enosis/blob/5dee376d36b0821f5df00e4af9fb1bbb6291ab29/modules/async/typedefs.js#L19-L35 "Source code on GitHub")

Synchronous function to modify acquired data before it is saved to the
progressive storage object in a data loading pipeline.

Type: [Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)

###### Parameters

*   `progressiveStorage` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** The progressive storage object from the
    data loading pipeline
*   `data` **any** The data acquired from the [acquireDataFn](#acquiredatafn) function

###### Examples

```javascript
// Post-processing function to only save the `displayName` property of a
// profile object fetched from the database asynchronously
(progressiveStorage, profile) => {
     return profile.displayName;
}
```

Returns **any** The value to save to progressive storage

##### populateDataFn

[modules/async/typedefs.js:1-53](https://github.com/jlehett/enosis/blob/5dee376d36b0821f5df00e4af9fb1bbb6291ab29/modules/async/typedefs.js#L37-L53 "Source code on GitHub")

Synchronous function to populate non-async data to the progressive storage
object in a data loading pipeline.

Type: [Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)

###### Parameters

*   `progressiveStorage` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** The progressive storage object from the
    data loading pipeline

###### Examples

```javascript
// Function to save a new value to progressive storage which is the result
// of appending "-New" to the existing `profileDisplayName` property value
// in progressive storage
(progressiveStorage) => {
     return progressiveStorage.profileDisplayName + '-New';
}
```

Returns **any** The value to save to progressive storage

### Categorized Error



#### CategorizedErrorFactory

[modules/categorized-errors/categorized-error-factory.js:58-140](https://github.com/jlehett/enosis/blob/5dee376d36b0821f5df00e4af9fb1bbb6291ab29/modules/categorized-errors/categorized-error-factory.js#L58-L140 "Source code on GitHub")

Factory for generating categorized errors given their definitions.

This class is intended to generate reference enums for "Categorized" errors,
which are errors that may be associated with 0+ user-defined categories.

By grouping all error definitions in a single location in a file, it becomes
easier to see what errors may be thrown from functions within the file. It
also becomes easier to reference those errors via the reference enums instead
of using arbitrary strings.

Lodash template strings can also be used in the error factories that are
generated if the error definition uses a `messageTemplate` property as
opposed to a plaintext `message` property.

##### Parameters

*   `errorDefs` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)<[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String), [ErrorDef](#errordef)>** Map of IDs to their error
    definitions

##### Examples

```javascript
// Create the reference enums for some error definitions
var categorizedErrors = new CategorizedErrorFactory({
     NO_FILES_SELECTED: {
         message: 'No files selected!',
         categories: ['SAFE', 'HARMLESS'],
     },
     ONE_FILE_SELECTED: {
         messageTemplate: '<%= filename %> selected!',
         categories: ['SAFE']
     },
     QUESTIONABLE_ERROR: {
         message: 'This is very useful, I promise!'
     }
});

// Generate some errors
var noFilesSelectedErr = categorizedErrors.factories.NO_FILES_SELECTED();

var oneFileSelectedErr = categorizedErrors.factories.ONE_FILE_SELECTED({
     filename: 'Test File.csv'
});

var questionableErr = categorizedErrors.factories.QUESTIONABLE_ERROR();

// Test to see if the errors are part of a category
noFilesSelectedErr.inCategory(categorizedErrors.categories.HARMLESS); // true

oneFileSelectedErr.inCategory(categorizedErrors.categories.HARMLESS); // false

questionableErr.inCategory(categorizedErrors.categories.SAFE); // false

// Test to see if an error is a specific Categorized Error
var errorMatches = noFilesSelectedErr.id === categorizedErrors.ids.NO_FILES_SELECTED; // true
```

#### Type Defs



##### CategorizedError

[modules/categorized-errors/typedefs.js:1-68](https://github.com/jlehett/enosis/blob/5dee376d36b0821f5df00e4af9fb1bbb6291ab29/modules/categorized-errors/typedefs.js#L48-L58 "Source code on GitHub")

A categorized error object that can be thrown.

Type: [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

###### Properties

*   `id` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The ID of the error
*   `message` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The message of the error after being compiled
    with template variables inserted
*   `categories` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)<[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>** All of the categories to which the error belongs
*   `inCategory` **[InCategoryFn](#incategoryfn)** Function to see if the error is
    associated with the provided category

##### InCategoryFn

[modules/categorized-errors/typedefs.js:1-68](https://github.com/jlehett/enosis/blob/5dee376d36b0821f5df00e4af9fb1bbb6291ab29/modules/categorized-errors/typedefs.js#L60-L68 "Source code on GitHub")

Function to see if a categorized error is associated with a specific category.

Type: [Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)

###### Parameters

*   `category` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The category to test to see if the categorized
    error is associated with

Returns **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** Returns true if the categorized error is associated
with the specified category

##### CategorizedErrorReferenceEnums

[modules/categorized-errors/typedefs.js:1-68](https://github.com/jlehett/enosis/blob/5dee376d36b0821f5df00e4af9fb1bbb6291ab29/modules/categorized-errors/typedefs.js#L14-L21 "Source code on GitHub")

Object containing all of the created reference enums.

Type: [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

###### Properties

*   `ids` **[ID_ReferenceEnum](#id_referenceenum)** ID reference enum
*   `factories` **[Factory_ReferenceEnum](#factory_referenceenum)** Factory reference enum
*   `categories` **[Category_ReferenceEnum](#category_referenceenum)** Category reference enum

##### ErrorDef

[modules/categorized-errors/typedefs.js:1-68](https://github.com/jlehett/enosis/blob/5dee376d36b0821f5df00e4af9fb1bbb6291ab29/modules/categorized-errors/typedefs.js#L1-L12 "Source code on GitHub")

Object defining an error.

Type: [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

###### Properties

*   `messageTemplate` **\_.template?** Message template created with
    lodash's `template` function; must be specified if a regular `message` is
    not specified
*   `message` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** Plain string message; must be specified if a
    `messageTemplate` is not specified
*   `categories` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)<[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>?** Specifies the categories the error is
    associated with

##### ID_ReferenceEnum

[modules/categorized-errors/typedefs.js:1-68](https://github.com/jlehett/enosis/blob/5dee376d36b0821f5df00e4af9fb1bbb6291ab29/modules/categorized-errors/typedefs.js#L23-L26 "Source code on GitHub")

Reference enum of IDs.

Type: [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)<[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String), [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>

##### Factory_ReferenceEnum

[modules/categorized-errors/typedefs.js:1-68](https://github.com/jlehett/enosis/blob/5dee376d36b0821f5df00e4af9fb1bbb6291ab29/modules/categorized-errors/typedefs.js#L28-L31 "Source code on GitHub")

Reference enum of error factories.

Type: [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)<[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String), [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>

##### Category_ReferenceEnum

[modules/categorized-errors/typedefs.js:1-68](https://github.com/jlehett/enosis/blob/5dee376d36b0821f5df00e4af9fb1bbb6291ab29/modules/categorized-errors/typedefs.js#L33-L36 "Source code on GitHub")

Reference enum of all categories used in the error defs.

Type: [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)<[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String), [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>

##### ErrorFactory

[modules/categorized-errors/typedefs.js:1-68](https://github.com/jlehett/enosis/blob/5dee376d36b0821f5df00e4af9fb1bbb6291ab29/modules/categorized-errors/typedefs.js#L38-L46 "Source code on GitHub")

Factory for a specified error.

Type: [Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)

###### Parameters

*   `templateVars` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** Any variables that should be passed to the
    error message template; See lodash's documentation on `_.template` for
    more information

Returns **[CategorizedError](#categorizederror)** The categorized error generated from the factory
