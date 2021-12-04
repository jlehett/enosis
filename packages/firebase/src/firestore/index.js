import 'core-js/stable';
import 'regenerator-runtime';

export { default as Model } from './model/model';
export { default as Submodel } from './submodel/submodel';
export { default as Autobatcher } from './utilities/autobatcher';
export {
    runTransaction
} from './utilities/firestore-adapters';
export { default as useListener } from './hooks/use-listener';

/**
 * We must re-export the query functions from the internal firebase
 * app, since Firestore does a funky thing related to registering the
 * Firestore component. If you try to use a query function from outside
 * this package, Firestore will complain that you passed a reference
 * of a different Firestore SDK.
 */
export {
    where,
    orderBy,
    limit
} from 'firebase/firestore';