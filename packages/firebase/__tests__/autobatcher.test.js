import { expect } from 'chai';
import {
    Model,
    Submodel,
    Autobatcher,
} from '../lib/firestore';
import freeAppResources from './utilities/free-app-resources';
import clearEmulatorData from './utilities/clear-emulator-data';
import setUpEmulator from './utilities/set-up-emulator';
import {
    where,
} from 'firebase/firestore';

describe('Autobatcher', () => {

    before(async () => {
        await setUpEmulator();
    });

    beforeEach(async () => {
        await clearEmulatorData();
    });

    after(() => {
        freeAppResources();
    });

    it('can commit a batch manually before its capacity is reached', async () => {
        const profileModel = new Model({
            collectionName: 'profiles',
            collectionProps: [
                'displayName',
                'email',
            ]
        });
        const autobatcher = new Autobatcher();
        profileModel.writeToID(
            'testing',
            {
                displayName: 'Hello',
                invalidProp: 'Not Valid',
            },
            { autobatcher }
        );
        const firstReading = await profileModel.getByID('testing');
        await autobatcher.commit();
        const secondReading = await profileModel.getByID('testing');
        const results = {
            firstReading,
            secondReadingDisplayName: secondReading.displayName
        };
        expect(results).to.deep.equal({
            firstReading: null,
            secondReadingDisplayName: 'Hello',
        });
    });

    it('can commit multiple batches automatically', async () => {
        const results = {};
        const ProfileModel = new Model({
            collectionName: 'profiles',
            collectionProps: [ 'displayName' ]
        });
        const autobatcher = new Autobatcher(2);

        for (let i = 0; i < 8; i++) {
            ProfileModel.writeToNewDoc(
                { displayName: 'Hello' },
                { autobatcher }
            );
        }
        results.numBatches = autobatcher.batchPromises.length;
        await autobatcher.allBatchesFinalized();
        const reading = await ProfileModel.getByQuery([
            where('displayName', '==', 'Hello')
        ]);
        results.numMatches = reading.length;
        expect(results).to.deep.equal({
            numBatches: 4,
            numMatches: 8,
        });
    });

    it('won\'t automatically commit an incomplete batch', async () => {
        const ProfileModel = new Model({
            collectionName: 'profiles',
            collectionProps: [ 'displayName' ]
        });
        const autobatcher = new Autobatcher(3);

        for (let i = 0; i < 2; i++) {
            ProfileModel.writeToNewDoc(
                { displayName: 'Hello' },
                { autobatcher }
            );
        }

        const reading = await ProfileModel.getByQuery([
            where('displayName', '==', 'Hello')
        ]);
        expect(reading.length).to.equal(0);
    });

});