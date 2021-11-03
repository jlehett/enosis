# Autobatcher

An `Autobatcher` is an automated solution for chunking operations into chunks of a specified maximum size, committing chunks when they are maxed-out, and creating promises that resolve once all created chunks have resolved.

## API

### Constructor Arguments

| Argument | Type | Default Value | Description |
| --- | --- | --- |
| maxPerBatch | Number | `500` | Defines the maximum size of each batch of operations. The maximum batch size set by Firebase is `500`, thus the default value for `maxPerBatch` is set to `500`. |

#### commit()

Commits the current batch, if the current batch exists. Otherwise, does nothing. This will be called automatically when `allBatchesFinalized` is called to prevent indefinite asynchronous `await`s.

##### Example

```js
/**
 * Commit the current batch.
 */
autobatch.commit();
```

#### allBatchesFinalized()

Returns a promise that resolves once all batch promises that have been constructed thus far have resolved.

If the current batch has not yet been committed, automatically commits it before creating the promise so that an indefinite async `await` is not created.

##### Example

```js
/**
 * Create a promise that resolves once all batches have been written to the
 * database.
 */
autobatcher.allBatchesFinalized()
    .then(() => {
        console.log('All batches have been written to the database!');
    });
```