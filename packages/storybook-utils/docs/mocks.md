# Mocks

Storybook stories frequently mock callback functions in components for easier testing. These utility functions provide some mocked functions for common use-cases.

## Functions

### mockDelay(timeInMilliseconds)

Mock function to wait a certain amount of time before resolving.

#### Arguments

| Argument | Type | Description |
| --- | --- | --- |
| timeInMilliseconds | Number | The number of milliseconds to wait before resolving the promise that the mock function returns. |

#### Return Value

This function returns a promise that resolves after `timeInMilliseconds` has elapsed.

#### Example

```js
import { mockDelay } from '@unifire-js/storybook-utils';

// Waits for 1 second before continuing
await mockDelay(1000);
```