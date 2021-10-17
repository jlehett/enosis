import { expect } from 'chai';
import { setFirebaseApp } from '../lib';
import { getFirebaseApp } from '../lib/firebase-app/firebase-app';

describe('Firebase App', () => {

    before(() => {
        setFirebaseApp(null);
    });
    
    it('throws an error if Firebase app is not set when it is fetched', () => {
        let correctErrorThrown = false;
        try {
            firebaseApp = getFirebaseApp();
        } catch (err) {
            if (err.message === '`firebaseApp` needs to be set via `setFirebaseApp` before any utilities can be used from @unifire/firebase') {
                correctErrorThrown = true;
            }
        }
        expect(correctErrorThrown).to.equal(true);
    });

    it('sets Firebase app correctly', () => {
        setFirebaseApp('test');
        const firebaseApp = getFirebaseApp();
        expect(firebaseApp).to.equal('test');
    });

});