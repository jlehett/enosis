import { expect } from 'chai';
import {
    Model,
    Submodel
} from '../lib';
import {
    omit
} from 'lodash';
import clearEmulatorData from './utilities/clear-emulator-data';
import setUpEmulator from './utilities/set-up-emulator';

describe('Submodel', () => {

    before(async () => {
        await setUpEmulator();
    });

    beforeEach(async () => {
        await clearEmulatorData();
    });

    it('can write a document to a submodel instance with proper sanitization, and then fetch the written doc', async () => {
        const ProfileModel = new Model({
            collectionName: 'profiles',
            collectionProps: [
                'displayName',
                'agreedToTerms',
            ]
        });

        const ProfileEmailsModel = new Submodel({
            collectionName: 'emails',
            parent: ProfileModel,
            collectionProps: [
                'address',
                'domain',
            ]
        });

        await ProfileModel.writeToID(
            'john',
            {
                displayName: 'John',
                agreedToTerms: true
            }
        );

        const johnProfile = await ProfileModel.getByID('john');

        await johnProfile.subcollections.emails.writeToID(
            'gmail',
            {
                address: 'john',
                domain: 'gmail.com',
            }
        );

        let johnGmailDoc = await johnProfile.subcollections.emails.getByID('gmail');
        johnGmailDoc = omit(johnGmailDoc, ['_ref']);

        expect(johnGmailDoc).to.deep.equal({
            id: 'gmail',
            address: 'john',
            domain: 'gmail.com',
            subcollections: {},
        });
    });

});