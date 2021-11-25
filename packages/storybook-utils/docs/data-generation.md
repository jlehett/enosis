# Data Generation

In some Storybook stories, you may need to have some randomized data in a component to give it a realistic look. These utility functions provide ways to generate randomized realistic data.

## Functions

### generateRandomName()

Generates a random name (first and last) for testing.

### Return Value

This function returns a string composed of a first and last name.

### Example

```js
import { generateRandomName } from '@unifire-js/storybook-utils';

// Generates a new randomized first and last name
const newName = generateRandomName();
```