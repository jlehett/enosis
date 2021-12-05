# useImperativeDialog(ref)

React hook that allows a developer to use a dialog as though it were a promise in an imperative manner. This hook should be used when constructing the reusable dialog itself.

## Imperative Handle

If applied to a `forwardRef`'d component, this hook will create an imperative handle for the component's ref with the following:

| Property | Type | Description |
| --- | --- | --- |
| open | function | Function to call to open the dialog and start the dialog promise. |
| closeWithResolve | function | Function to call to close the dialog and resolve its promise. |
| closeWithReject | function | Function to call to close the dialog and reject its promise. |

## Arguments

| Argument | Type | Description |
| --- | --- | --- |
| ref | React.Ref | The dialog's `ref`, obtained by forwarding a ref to the dialog. The imperative handle will be attached to this ref. |

## Return Value

This hook returns an array with the following values (in order):

| Array Index | Type | Description |
| --- | --- | --- |
| 0 | boolean | Flag indicating whether the dialog should be currently open. |
| 1 | function | Apply to any callback functions to create an action that will automatically close the dialog with either a resolution or rejection, when it completes. |

### Action Factory

The `Action Factory` is the function returned by the hook at array index `1`. It essentially wraps an action function with the necessary calls to either `resolve` or `reject` the dialog's promise.

#### Action Factory Arguments

| Argument | Type | Default Value | Description |
| --- | --- | --- |
| actionFn | function | - | The action function to augment with dialog closing capabilities. |
| resolveOnSuccess | boolean | `true` | (opt.) If true, this action will resolve the dialog promise when the action succeeds; if false, it will reject the dialog promise when the action succeeds. |
| rejectOnFailure | boolean | `true` | (opt.) If true, this action will reject the dialog promise when the action fails; if false, it will resolve the dialog promise when the action fails. |

#### Action Factory Return Value

The Action Factory will return the augmented action function that can be called within the dialog to perform the action, and deal with the dialog promise based on the results of the action.

#### Action Factory Example

```js
import { useImperativeDialog } from '@unifire-js/hooks';

// Example function that would be passed to the dialog
function confirm() {
    console.log('The user has confirmed their choice!');
}

// Using the imperative dialog hook
const [isOpen, actionFactory] = useImperativeDialog(ref);

// Getting the augmented confirm function that should be called when the "confirm" button
// is clicked in the dialog
const augmentedConfirm = actionFactory(confirm);
```

## Example

The following is an example of a confirm dialog built using the `useImperativeDialog` hook:

```js
/**
 * A confirmation dialog that extends an imperative handler that allows the dialog to be controlled
 * like a promise.
 */
const ConfirmDialog = forward(({
    cancelText,
    confirmText,
    dialogText,
    dialogTitle,
    onCancel, onConfirm,
}, ref) => {
    /**
     * Hooks
     */

    // Use the `useImperativeDialog` hook
    const [isOpen, actionFactory] = useImperativeDialog(ref);

    // Construct the augmented actions that will automatically update the dialog promise
    const augmentedOnConfirm = actionFactory(onConfirm, true, true);
    const augmentedOnCancel = actionFactory(onCancel, false, true);

    /**
     * Rendering
     */

    return (
        <Dialog
            open={isOpen}
            fullWidth
        >
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {dialogText}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button
                    variant='text'
                    onClick={augmentedOnCancel}
                >
                    {cancelText}
                </Button>
                <Button
                    variant='contained'
                    onClick={augmentedOnConfirm}
                >
                    {confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
});
```

You would be able to use this dialog imperatively as a promise like so:

```js
import { useRef } from 'react';

// At the top of the functional component that is the parent of the dialog...

const confirmDialogRef = useRef(null);

// In JSX...

<ConfirmDialog
    ref={confirmDialogRef}
    onCancel={() => {/** Cancellation logic */}}
    onConfirm={() => {/** Confirmation logic */}}
/>

/**
 * Once the ref has been created, we can bgin using the dialog like a promise. This promise
 * will resolve if the dialog is "confirmed" successfully, and will reject if either the dialog
 * is unsuccessfully "confirmed" or if the dialog is "canceled".
 */
function askForUserConfirmationThenProceed() {
    confirmDialogRef.current.open()
        .then(proceedWithLogic)
        .catch(handleUserCancellation);
}
```