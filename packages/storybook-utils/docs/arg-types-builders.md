# Arg Types Builders

Storybook uses an object called `argTypes` to define various characteristics of each argument for components, such as whether to display them in the control panel, and how to group them into different categories.

These utilities help simplify the process of creating the `argTypes` object.

## Functions

### setAsDisabled(argTypes, argsToDisable)

Sets a specified set of args as "disabled", such that they will not be shown in Storybook documentation nor in the controls.

#### Properties

| Property | Type | Description |
| --- | --- | --- |
| argTypes | Object | The arg types object to modify with the new info. |
| argsToDisabled | string[] | List of args to disable. |

#### Example

```js
import { setAsDisabled } from '@unifire-js/storybook-utils';

// Create the arg types object to use
const argTypes = {};

// Set two arguments, `argToDisable1` and `argToDisable2`, as disabled
setAsDisabled(argTypes, [ 'argToDisable1', 'argToDisable2' ]);
```

### setAsCategory(argTypes, category, argsToCategorize)

Sets a specified set of args to be of a particular category for grouping in documentation and in the controls for Storybook.

#### Properties

| Property | Type | Description |
| --- | --- | --- |
| argTypes | Object | The arg types object to modify with the new info. |
| category | string | The category to add the specified args to. |
| argsToCategorize | string[] | List of args to categorize. |

#### Example

```js
import { setAsCategory } from '@unifire-js/storybook-utils';

// Create the arg types object to use
const argTypes = {};

// Set two arguments, `arg1` and `arg2`, to be part of a category,
// "Test Args"
setAsCategory(argTypes, 'Test Args', [ 'arg1', 'arg2' ]);
```

### setControlToRadioSelect(argTypes, arg, options)

Set a specified arg to use a radio select to choose from a set of specified options in the controls for Storybook.

#### Properties

| Property | Type | Description |
| --- | --- | --- |
| argTypes | Object | The arg types object to modify with the new info. |
| arg | string | The specified arg that should use the radio select control. |
| options | *[] | Array of options to select from with the radio select for the specified arg. |

#### Example

```js
import { setControlToRadioSelect } from '@unifire-js/storybook-utils';

// Create the arg types object to use
const argTypes = {};

// Set an arg, `arg1`, to use a radio select control with three
// options, `opt1`, `opt2`, and `opt3`.
setControlToRadioSelect(argTypes, 'arg1', [ 'opt1', 'opt2', 'opt3' ]);
```