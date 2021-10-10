# CategorizedErrorFactory

When defining errors for your code to potentially throw, a developer may opt to define the errors wherever they are needed. However, this can lead to difficulty in discerning all potential errors a codebase (or particular file) may throw without reading through every line of code, or `CTRL-F` searching for `new Error`.

A developer may also discover that some errors should be handled in the same way, like a "category" of errors.

The `CategorizedErrorFactory` is meant to be declared either near the top of the file in which it is used, or in a separate "error factory" file that contains all of the errors that your code base may throw. It also provides methods for defining errors as part of 0+ "categories", and exposing a method to quickly determine if a specified error is part of a category.

### Example Usage

```js
import { CategorizedErrorFactory } from '@unifire-js/categorized-errors';

var categorizedErrors = new CategorizedErrorFactory({
    NO_FILES_SELECTED: {
        message: 'No files selected!',
        categories: ['SAFE', 'HARMLESS'],
    },
    ONE_FILE_SELECTED: {
        messageTemplate: '<%= filename %> selected!',
        categories: ['SAFE'],
    },
    QUESTIONABLE_ERROR: {
        message: 'This is very useful, I promise!',
    },
});

// Generate the defined errors using the created factories
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
noFilesSelectedErr.id === categorizedErrors.ids.NO_FILES_SELECTED; // true
```

### Constructor Arguments

| Argument | Type | Description |
| --- | --- | --- |
| errorDefs | Object\<string, [ErrorDef](#ErrorDef)\> | Definitions of errors, mapped to by their IDs in an object. |

### Properties

| Property | Type | Description |
| --- | --- | --- |
| ids | Object\<string, string\> | Reference enum where the key equals the value, with each pair representing the ID of an error definition that was passed to the constructor. |
| factories | Object\<string, function\> | Object mapping an error's ID to the [factory function](#Factory\ Functions) that can be used to create instances of the specified categorized error. |
| categories | Object\<string, string\> | Reference enum where the key equals the value, with each pair representing one of all of the unique categories specified by any of the error definitions passed to the constructor. |

### Factory Functions

The factory functions stored in `CategorizedErrorFactory.factories` can be used to create instances of any of the categorized errors specified when the `CategorizedErrorFactory` was constructed.

The usage is as follows, assuming `categorizedErrors` is an instance of `CategorizedErrorFactory`:

```js
// Creating an instance of a categorized error that is using the `message`
// property, as opposed to the `messageTemplate` property
categorizedErrors.factories.SOME_SPECIFIED_ERROR_ID();

// Creating an instance of a categorized error that is using the
// `messageTemplate` property, as opposed to the `message` property
categorizedErrors.factories.ANOTHER_SPECIFIED_ERROR_ID({
    fileName: 'test.csv',
});
```

See the [`lodash` template string](https://lodash.com/docs/4.17.15#template) documentation to get a better understanding of how the `messageTemplate` property works.

In short, the object passed as an argument to the categorized error factory is the object that will be passed as a parameter to the function created by `_.template(messageTemplate)`.

The return of the factory functions stored in `CategorizedErrorFactory.factories` will be a [`CategorizedError`](#CategorizedError) instance.

#### CategorizedError

##### Properties

| Property | Type | Description |
| --- | --- | --- |
| id | string | The ID of the categorized error, matching the key that mapped to the related error definition when passed to the `CategorizedErrorFactory` constructor. |
| message | string | The message of the error -- either taken directly from the `message` property of the related error definition, or compiled from the `lodash` template string, given the object argument to the factory. |
| categories | Array\<string\> | Array of all of the categories the categorized error is associated with, taken from the related error definition. |

##### Methods

| Method | Return | Description |
| --- | --- | --- |
| inCategory(string) | boolean | Returns true if the error is associated with the given category; returns false, otherwise. |

### ErrorDef

An error definition is an object with properties that define key characteristics of the error. The `CategorizedErrorFactory` will use these error definitions to create and store the factory functions used to create instances of the categorized error, as well as storing references of each unique category that was defined in all of the error definitions passed to the `CategorizedErrorFactory`.

#### Properties

| Property | Type | Description |
| --- | --- | --- |
| message | string \| null | The message that will be attached to all created instances of the categorized error. Does not support variables. If this isn't specified, the `messageTemplate` property must be specified -- however, both cannot be specified at the same time. |
| messageTemplate | string \| null | A [`lodash` template string](https://lodash.com/docs/4.17.15#template) can be passed in order to defined an error message that can utilize variables in order to have slightly different messaging for each categorized error instance. |
| categories | Array\<string\> \| null | An array containing all of the categories the categorized error is a part of. |