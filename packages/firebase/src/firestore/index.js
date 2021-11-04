import 'core-js/stable';
import 'regenerator-runtime';

export { default as Model } from './model';
export { default as Submodel } from './submodel';
export { default as Autobatcher } from './utilities/autobatcher';
export {
    runTransaction
} from './utilities/firestore-adapters';