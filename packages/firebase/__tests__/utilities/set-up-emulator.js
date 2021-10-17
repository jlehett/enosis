import {
    connectFirestoreEmulator,
    getFirestore
} from '@firebase/firestore';
import { initializeApp } from 'firebase/app';
import firebaseConfig from '../../firebase.config';
import { setFirebaseApp } from '../../lib';
import clearEmulatorData from './clear-emulator-data';

export default async function() {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore();
    connectFirestoreEmulator(db, 'localhost', 8080);
    setFirebaseApp(app);
    await clearEmulatorData();
};