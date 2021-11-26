# useTrackFunction(fn)

Hook which returns an API for running functions and tracking whether they are currently running.

### Arguments

| Argument | Type | Description |
| --- | --- | --- |
| fn | function | The function to track in state. |

### Return Value

This function returns an array that looks like:

`[ fnRunning, runFn ]`

Where `fnRunning` is a boolean tracking whether the function is actively running, and `runFn` is the function to call to run the function while tracking it in state.

### Example

```js
import { useTrackFunction } from '@unifire-js/hooks';

// Define a function that we would like to track
const quickResolve = () => {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, 2000);
    });
};

// Define the hook to track the function
const [quickResolveRunning, runQuickResolve] = useTrackFunction(quickResolve);

// Can grab whether the function is actively running with the first arg
// from the array
console.log(quickResolveRunning);

// Can run the function and track it in state with the second arg from
// the array
runQuickResolve();
```