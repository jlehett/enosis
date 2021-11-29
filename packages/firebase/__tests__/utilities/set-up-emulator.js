import {
    connectFirestoreEmulator,
    getFirestore
} from '@firebase/firestore';
import firebaseConfig from '../../firebase.config';
import { createUnifireFirebaseApp } from '../../lib';
import clearEmulatorData from './clear-emulator-data';

export default async function() {
    createUnifireFirebaseApp(firebaseConfig);
    const db = getFirestore();
    connectFirestoreEmulator(db, 'localhost', 8080);
    await clearEmulatorData();
};