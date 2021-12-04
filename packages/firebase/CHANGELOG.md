# @unifire-js/firebase

## 2.2.0

<i>Dec 3, 2021</i>

### `unifire-js/firebase/firestore`

* 👂 Add the `useListener` React hook!

## 2.1.0

<i>Dec 1, 2021</i>

### `unifire-js/firebase/auth`

* 🚂 Added the `useRedirectOnAuthCondition` React hook for automatic redirects based on auth user context changes.

## 2.0.0

<i>Nov 29, 2021</i>

**🎉 @unifire-js/firebase v2.0.0 released! 🎉**

* **\[!BREAKING CHANGES!\]** 🔧 Developer now create a separate "Unifire" Firebase app reference as opposed to passing an already-created reference to the package.
    * This fixed issues caused by `firebase/firestore` registration logic.

### `unifire-js/firebase/auth`

* 🚀 `auth` submodule released!
* 🧍 React hooks for creating and using an automatically updating auth user context added!
* 📦 Support for defining middleware to keep other values in the auth user context updated automatically on auth changes added!

### `unifire-js/firebase/firestore`

* **\[!BREAKING CHANGES!\]** 🔧 Updated the `firestore` submodule to utilize the new separate "Unifire Firebase app" reference concept.

## 1.0.2

<i>Nov 24, 2021</i>

* 🛠️ REALLY fixed the package exports!

## 1.0.1

<i>Nov 24, 2021</i>

* 🛠️ Fixed package exports to properly export the `@unifire-js/firebase/firestore` route!

## 1.0.0

<i>Nov 21, 2021</i>

**🎉 @unifire-js/firebase v1.0.0 released! 🎉**

### `@unifire-js/firebase/firestore`

* 👂 Added support for defining realtime listeners for models, submodels, and submodel instances!

## 1.0.0-alpha.1

<i>Nov 20, 2021</i>

### `@unifire-js/firebase/firestore`

* 🔧 Updated npm keywords and home page.

## 1.0.0-alpha.0

<i>Nov 14, 2021</i>

### `@unifire-js/firebase/firestore`

* 🤝 Add the Firestore `transaction` adapter!
* ❓ Add the `getByQuery` method to the `Submodel` class!

## 0.0.9

<i>Nov 3, 2021</i>

### `@unifire-js/firebase/firestore`

* 🤖 🎁 Add [`Autobatch`](/packages/firebase/docs/api/firestore/autobatcher.md) support!
* 🗑 Add document deletion methods to the [`ModelInstanceOperations` API](/packages/firebase/docs/api/firestore/model-instance-operations.md) and to [`Submodel`](/packages/firebase/docs/api/firestore/submodel.md).
* 🤝 Modify the `writeToNewDoc` methods for both the [`ModelInstanceOperations` API](/packages/firebase/docs/api/firestore/model-instance-operations.md) and [`Submodel`](/packages/firebase/docs/api/firestore/submodel.md) to support Firestore transactions.

## 0.0.8

<i>Oct 25, 2021</i>

* 🚀 Release the `firebase` package!

### `@unifire-js/firebase/firestore`

* \[Model\] Added `Model` class.
* \[Submodel\] Added `Submodel` class.