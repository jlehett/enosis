# Setting Up

Before we can begin to use the full extent of this package's API, we must first create a new Firebase app for this package to use. This avoids any peer dependency headaches caused by the way Firebase register Firestore components.

Typically, the Firebase app is initialized in its own file, which is imported very early in the app's codebase. We can add a few lines to create the Unifire Firebase app as well:

```js
import { initializeApp } from 'firebase/app';
import { createUnifireFirebaseApp } from '@unifire-js/firebase';

const firebaseApp = initializeApp(FIREBASE_CONFIG);
createUnifireFirebaseApp(FIREBASE_CONFIG);
```

We can now freely use the `@unifire-js/firebase` package throughout our app! It will automatically pull in the set Firebase app when it needs it.

As a note, if you find that you do not need any functionality from the base `firebase` package, you can skip the initialization of the local reference and just create the Unifire Firebase app reference!s