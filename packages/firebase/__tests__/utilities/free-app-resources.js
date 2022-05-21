import {
    deleteApp
} from 'firebase/app';
import { getUnifireFirebaseApp } from '../../lib/firebase-app/firebase-app';

export default function() {
    deleteApp(getUnifireFirebaseApp());
};