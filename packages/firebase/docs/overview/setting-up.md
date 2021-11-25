# Setting Up

Before we can begin to use the full extent of this package's API, we must declare the Firebase app we are using.

Typically, the Firebase app is initialized in it's own file, which is imported very early in the app's codebase. We can add a few lines to set the `@unifire-js/firebase` package to use the initialized app:

```js
import { initializeApp } from 'firebase/app';
import { setFirebaseApp } from '@unifire-js/firebase';

const firebaseApp = initializeApp(FIREBASE_CONFIG);
setFirebaseApp(firebaseApp);
```

We can now freely use the `@unifire-js/firebase` package throughout our app! It will automatically pull in the set Firebase app when it needs it.

**Note**: It is very important that the version of the Firebase SDK used in your project, and this package, are the same. Make sure to verify this during installation and setup!
