# Why a second app?

The Firebase SDK, as of version 9.x, still relies on side-effect imports. The `getFirestore` function, for example, automatically registers the Firestore app when it is created, making it impossible to pass the reference to this external package.

While I would love to eventually find a solution where a single standard Firebase app reference can be passed and utilized freely by this external package, I have not found a way to do so yet.

A side-effect of this current limitation is that you can *not* mix many of the functions exported from the standard `firebase` package with this package. For example, if you were to do the following:

```js
import { where } from 'firebase/firestore';
import { Model } from '@unifire-js/firebase/firestore';

// Model definition...
profileModel.getByQuery([
    where('email', '==', 'john@gmail.com')
]);
```

You will receive an error about mixing Firestore SDK references. The current workaround is that any necessary functions are being exported from `@unifire-js/firebase`, as well. So the functionality above could be written as:

```js
import { Model, where } from 'firebase/firestore';

// Model definition...
profileModel.getByQuery([
    where('email', '==', 'john@gmail.com')
]);
```

We are currently re-exporting Firebase functions on a per-case basis. It is possible that the function you need is not being re-exported by this package. Until we either find a more automated workaround for this problem, or until we add that to our list of re-exported Firebase functions, you will have to utilize a secondary standard Firebase app reference you create in your own project, and avoid using `@unifire-js/firebase` for that particular functionality.