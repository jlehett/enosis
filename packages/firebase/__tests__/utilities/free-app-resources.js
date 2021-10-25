import {
    deleteApp
} from '@firebase/app';
import { getFirebaseApp } from '../../lib/firebase-app/firebase-app';

export default function() {
    deleteApp(getFirebaseApp());
};