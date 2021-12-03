# useInterval(fn, config)

Hook which runs a specified function continuously in a set interval until the component is unmounted.

### Arguments

| Argument | Type | Description |
| --- | --- | --- |
| fn | function | The function to run in the interval. |
| config | Object | Configuration object for the hook. |
| config.period | number | The time in milliseconds between each run of the passed-in function. |
| config.runOnInitialization | boolean | *(opt.)* Flag indicating whether the function should be run when the interval is first initialized; otherwise, the first run of the function will occur after waiting for the defined period once. The default is false. |
| config.awaitFnBeforeContinuingInterval | boolean | *(opt.)* Flag indicating whether the function should complete (if it is async) before starting the next interval. The default is false. |

### Example

```js
import { useInterval } from '@unifire-js/hooks';

// In a functional component...

// Run the `pingGoogle` function every 5 seconds, starting after waiting the initial 5 seconds first.
useInterval(
    pingGoogle,
    { period: 5000 }
);

// Run the `refreshProfile` function every 5 seconds, starting as soon as the component mounts.
useInterval(
    refreshProfile,
    {
        period: 5000,
        runOnIntialization: true
    }
);

// Run the `refreshProfile` function every 5 seconds AFTER the previous `refreshProfile` function completed.
useInterval(
    refreshProfile,
    {
        period: 5000,
        awaitFnBeforeContinuingInterval: true
    }
);
```