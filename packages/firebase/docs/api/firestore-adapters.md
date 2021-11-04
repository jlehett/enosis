# Firestore Adapters

Many of the Firestore functions require passing the database reference as an argument. Since we are storing that globally to use throughout the package, there is no sense in requiring this database reference to be fetched by a developer and passed.

The following methods are 1:1 copies of the existing Firestore API, while allowing you to skip passing the database reference as an argument.

## Methods

### runTransaction(updateFn)

Copy of [`runTransaction` from Firestore](https://firebase.google.com/docs/reference/js/firestore_.md#runtransaction), without needing to pass the `firestore` argument.