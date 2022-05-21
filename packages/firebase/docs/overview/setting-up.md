# Setting Up

Before we can begin to use the full extent of this package's API, we must first set the Firebase app for this package to use.

Typically, the Firebase app is initialized in its own file, which is imported very early in the app's codebase. We can add a few lines to create the Unifire Firebase app as well:

```js
import { initializeApp } from 'firebase/app';
import { setUnifireFirebaseApp } from '@unifire-js/firebase';

const firebaseApp = initializeApp(FIREBASE_CONFIG);
setUnifireFirebaseApp(firebaseApp);
```

We can now freely use the `@unifire-js/firebase` package throughout our app! It will automatically pull in the set Firebase app when it needs it.
