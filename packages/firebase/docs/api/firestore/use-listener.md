# useListener(model, addListenerFn, listenerName, remainingAddListenerFnParams)

React hook for creating a listener, and removing the listener when the component unmounts.

## Arguments

| Argument | Type | Description |
| --- | --- | --- |
| model | Model \| Submodel \| SubmodelInstance | The `Model`, `Submodel`, or `SubmodelInstance` to create the listener for. |
| listenerName | string | The name to give to the listener. |
| addListenerFn | function | The function to call to create the listener. Should use one of the `addListener...` functions from the `Model`, `Submodel`, or `SubmodelInstance` classes. |

## Examples

Example of creating a listener for a Model:

```js
import { Model, where } from '@unifire-js/firebase/firestore';
import { useListener } from '@unifire-js/firebase/firestore';

const ProfileModel = new Model({
    collectionName: 'profiles',
    collectionProps: [
        'email',
        'displayName',
    ]
});

// In a functional component...

// Create a listener for any documents in the profiles collection matching the email, 'john@gmail.com',
useListener(
    ProfileModel,
    'addListenerByQuery',
    'johnProfileListener',
    [ where('email', '==', 'john@gmail.com') ],
    (docs) => {
        console.log(docs);
    }
);
```

Example of creating a listener for a Submodel:

```js
import { Submodel } from '@unifire-js/firebase/firestore';
import { useListener } from '@unifire-js/firebase/firestore';

const GroupModel = new Submodel({
    collectionName: 'groups',
    parent: ProfileModel,
    collectionProps: [
        'name',
        'dateCreated',
        'category',
    ]
});

// In a functional component...

// Create a listener for any documents at /profiles/john/groups/groupToListenTo
useListener(
    GroupModel,
    'addListenerByPath',
    'johnGroupListener',
    'profiles/john/groups/groupToListenTo',
    (doc) => {
        console.log(doc);
    }
);
```