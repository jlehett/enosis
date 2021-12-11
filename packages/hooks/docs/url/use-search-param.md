# useSearchParam(key)

Provides the user with the value of the specified search param from the current URL using `react-router-dom`.

## Arguments

| Argument | Type | Description |
| --- | --- | --- |
| key | string | The key of the search param to get the value of from the current URL. |

## Return Value

This hook returns the value of the search param for the current URL. If the search param does not exist in the current URL, this hook returns `null`.

## Examples

```js
import { useSearchParam } from '@unifire-js/hooks';

// In a functional React component...

/**
 * Get the value of the `postID` search param in the current URL. For example,
 * in the URL: "www.example.com/testing?postID=test", the hook would return the
 * value, "test".
 */
const postID = useSearchParam('postID');
```