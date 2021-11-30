import { expect } from 'chai';
import {
    Model,
    Submodel,
    runTransaction,
} from '../lib/firestore';
import {
    where,
    orderBy,
} from 'firebase/firestore';
import {
    omit,
    map,
    assign
} from 'lodash';
import clearEmulatorData from './utilities/clear-emulator-data';
import setUpEmulator from './utilities/set-up-emulator';
import freeAppResources from './utilities/free-app-resources';
import { Deferred } from '@unifire-js/async';

describe('Submodel Instance', () => {

    before(async () => {
        await setUpEmulator();
    });

    beforeEach(async () => {
        await clearEmulatorData();
    });

    after(() => {
        freeAppResources();
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

        const johnProfile = await ProfileModel.writeToID(
            'john',
            {
                displayName: 'John',
                agreedToTerms: true
            }
        );

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

    it('can write a document to a submodel instance with default values merged in', async () => {
        const ProfileModel = new Model({
            collectionName: 'profiles',
            collectionProps: [
                'displayName',
                'agreedToTerms',
            ],
        });

        const ProfileEmailsModel = new Submodel({
            collectionName: 'emails',
            parent: ProfileModel,
            collectionProps: [
                'address',
                'isValid',
            ],
            propDefaults: {
                isValid: true
            }
        });

        const johnProfile = await ProfileModel.writeToID(
            'testing',
            {
                displayName: 'john',
                agreedToTerms: true
            }
        );

        await johnProfile.subcollections.emails.writeToID(
            'gmail',
            {
                address: 'john@gmail.com'
            },
            { mergeWithDefaultValues: true },
        );

        let johnGmailDoc = await johnProfile.subcollections.emails.getByID('gmail');
        johnGmailDoc = omit(johnGmailDoc, ['_ref']);

        expect(johnGmailDoc).to.deep.equal({
            id: 'gmail',
            address: 'john@gmail.com',
            isValid: true,
            subcollections: {},
        });
    });

    it('can query for data with compound queries', async () => {
        const ProfileModel = new Model({
            collectionName: 'profiles',
            collectionProps: [
                'displayName',
            ]
        });

        const ProfileEmailModel = new Submodel({
            collectionName: 'emails',
            parent: ProfileModel,
            collectionProps: [
                'address',
                'domain',
                'isValid',
            ]
        });

        const johnProfile = await ProfileModel.writeToID(
            'john',
            {
                displayName: 'john'
            }
        );

        await Promise.all([
            johnProfile.subcollections.emails.writeToNewDoc({
                address: 'john1@gmail.com',
                domain: 'gmail',
                isValid: true
            }),
            johnProfile.subcollections.emails.writeToNewDoc({
                address: 'john2@gmail.com',
                domain: 'gmail',
                isValid: true,
            }),
            johnProfile.subcollections.emails.writeToNewDoc({
                address: 'john3@gmail.com',
                domain: 'gmail',
                isValid: false
            }),
            johnProfile.subcollections.emails.writeToNewDoc({
                address: 'john4@yahoo.com',
                domain: 'yahoo',
                isValid: true
            }),
            johnProfile.subcollections.emails.writeToNewDoc({
                address: 'john5@yahoo.com',
                domain: 'yahoo',
                isValid: false
            }),
        ]);
        
        let result = await johnProfile.subcollections.emails.getByQuery([
            where('domain', '==', 'gmail'),
            where('isValid', '==', true),
            orderBy('address'),
        ]);
        result = map(result, resultValue => omit(resultValue, ['_ref', 'id']));
        expect(result).to.deep.equal([
            {
                address: 'john1@gmail.com',
                domain: 'gmail',
                isValid: true,
                subcollections: {},
            },
            {
                address: 'john2@gmail.com',
                domain: 'gmail',
                isValid: true,
                subcollections: {},
            }
        ]);
    });

    it('can create a new document in a subcollection without any default props merged in', async () => {
        const ProfileModel = new Model({
            collectionName: 'profiles',
            collectionProps: [
                'displayName',
            ]
        });

        const ProfileEmailModel = new Submodel({
            collectionName: 'emails',
            parent: ProfileModel,
            collectionProps: [
                'address',
                'isValid',
            ],
            propDefaults: {
                address: 'No Address',
                isValid: true
            }
        });

        const johnProfile = await ProfileModel.writeToID('john', {
            displayName: 'john',
        });

        const email1 = await johnProfile.subcollections.emails.writeToNewDoc({
            address: 'john@gmail.com'
        });
        const email2 = await johnProfile.subcollections.emails.writeToNewDoc({
            isValid: false
        });

        const results = await Promise.all(map(
            [email1, email2],
            async (docRef) => {
                const doc = await johnProfile.subcollections.emails.getByID(docRef.id);
                return omit(doc, ['_ref', 'id', 'subcollections']);
            }
        ));

        expect(results).to.deep.equal([
            {
                address: 'john@gmail.com',
            },
            {
                isValid: false
            }
        ]);
    });

    it('can handle read and write operations in a subcollection in a transaction', async () => {
        const ProfileModel = new Model({
            collectionName: 'profiles',
            collectionProps: [
                'displayName',
            ]
        });
        
        const ProfileEmailModel = new Submodel({
            collectionName: 'emails',
            parent: ProfileModel,
            collectionProps: [
                'address',
                'isValid',
            ]
        });

        let transactionRunCount = 0;
        const johnProfile = await ProfileModel.writeToID(
            'john',
            {
                displayName: 'john'
            }
        );
        await johnProfile.subcollections.emails.writeToID(
            'initialDoc',
            {
                address: 'john@gmail.com',
            }
        );
        await new Promise(async (parentResolve, parentReject) => {
            let interruptingPromise = new Deferred();
            let initialPromise = new Deferred();
            runTransaction(async (transaction) => {
                transactionRunCount++;
                const initialDoc = await johnProfile.subcollections.emails.getByID(
                    'initialDoc',
                    { transaction }
                );
                initialPromise.resolve();
                await interruptingPromise.promise;
                await johnProfile.subcollections.emails.writeToID(
                    'updatedDoc',
                    {
                        address: initialDoc.address + '-updated'
                    },
                    { transaction }
                );
            }).then(parentResolve);
            await initialPromise.promise;
            johnProfile.subcollections.emails.writeToID(
                'initialDoc',
                {
                    address: 'joey@gmail.com'
                }
            ).then(interruptingPromise.resolve);
        });
        let finalResult = await johnProfile.subcollections.emails.getByID('updatedDoc');
        finalResult = omit(finalResult, ['_ref', 'subcollections']);
        const testObj = assign({}, finalResult, { transactionRunCount });
        expect(testObj).to.deep.equal({
            id: 'updatedDoc',
            address: 'joey@gmail.com-updated',
            transactionRunCount: 2,
        });
    });

    it('will handle deeply-nested submodel instances correctly', async () => {
        const Level1Model = new Model({
            collectionName: 'level1',
            collectionProps: [ 'name' ]
        });
        const Level2Model = new Submodel({
            collectionName: 'level2',
            parent: Level1Model,
            collectionProps: [ 'name' ]
        });
        const Level3Model = new Submodel({
            collectionName: 'level3',
            parent: Level2Model,
            collectionProps: [ 'name' ]
        });
        const Level4Model = new Submodel({
            collectionName: 'level4',
            parent: Level3Model,
            collectionProps: [ 'name' ]
        });

        const level1 = await Level1Model.writeToID('l1', { name: 'l1' });
        const level2 = await level1.subcollections.level2.writeToID('l2', { name: 'l2' });
        const level3 = await level2.subcollections.level3.writeToID('l3', { name: 'l3' });
        const level4 = await level3.subcollections.level4.writeToID('l4', { name: 'l4' });

        let test = await level3.subcollections.level4.getByID('l4');
        test = omit(test, ['_ref', 'subcollections']);
        expect(test).to.deep.equal({
            id: 'l4',
            name: 'l4'
        });
    });

    it('can delete a document in a subcollection correctly', async () => {
        const results = {};

        const ProfileModel = new Model({
            collectionName: 'profiles',
            collectionProps: [ 'displayName' ],
        });
        const ProfileEmailsModel = new Submodel({
            collectionName: 'emails',
            parent: ProfileModel,
            collectionProps: [ 'address' ],
        });

        const johnProfile = await ProfileModel.writeToID('john', { displayName: 'John' });
        await johnProfile
            .subcollections
            .emails
            .writeToID('gmail', { address: 'john@gmail.com' });
        results.firstReading = Boolean(
            await johnProfile
                .subcollections
                .emails
                .getByID('gmail')
        );
        await johnProfile
            .subcollections
            .emails
            .deleteByID('gmail');
        results.secondReading = Boolean(
            await johnProfile
                .subcollections
                .emails
                .getByID('gmail')
        );
        expect(results).to.deep.equal({
            firstReading: true,
            secondReading: false
        });
    });

    it('can subscribe to changes on a specific document', async () => {
        const deferred = new Deferred();

        const ProfileModel = new Model({
            collectionName: 'profiles',
            collectionProps: [
                'displayName',
            ]
        });
        
        const MessagesModel = new Submodel({
            collectionName: 'messages',
            parent: ProfileModel,
            collectionProps: [
                'content'
            ]
        });

        const john = await ProfileModel.writeToID('john', { displayName: 'John' });
        john.subcollections.messages.addListenerByID(
            'TestListener',
            '1',
            (doc) => {
                if (doc?.content === 'Test') {
                    john.subcollections.messages.removeListener('TestListener');
                    deferred.resolve();
                }
            }
        );

        await john.subcollections.messages.writeToID('1', { content: 'Test' });

        await deferred.promise;
        expect(true).to.equal(true);
    });

    it('can remove a registered listener', async () => {
        const readings = {};

        const ProfileModel = new Model({
            collectionName: 'profiles',
            collectionProps: [
                'displayName',
            ]
        });

        const MessagesModel = new Submodel({
            collectionName: 'messages',
            parent: ProfileModel,
            collectionProps: [
                'content'
            ]
        });

        const john = await ProfileModel.writeToID('john', { displayName: 'John' });

        readings.first = Boolean(john.subcollections.messages.listeners.TestListener);

        john.subcollections.messages.addListenerByID(
            'TestListener',
            '1',
            (doc) => {}
        );

        readings.second = Boolean(john.subcollections.messages.listeners.TestListener);

        john.subcollections.messages.removeListener('TestListener');
        
        readings.third = Boolean(john.subcollections.messages.listeners.TestListener);

        expect(readings).to.deep.equal({
            first: false,
            second: true,
            third: false,
        });
    });

    it('can remove all registered listeners', async () => {
        const readings = {};

        const ProfileModel = new Model({
            collectionName: 'profiles',
            collectionProps: [
                'displayName',
            ]
        });

        const MessagesModel = new Submodel({
            collectionName: 'messages',
            parent: ProfileModel,
            collectionProps: [
                'content',
            ]
        });

        const john = await ProfileModel.writeToID('john', { displayName: 'John' });

        readings.first = Object.keys(john.subcollections.messages.listeners).length;

        john.subcollections.messages.addListenerByID(
            'test1',
            '1',
            (doc) => {}
        );
        john.subcollections.messages.addListenerByID(
            'test2',
            '1',
            (doc) => {}
        );
        john.subcollections.messages.addListenerByID(
            'test3',
            '1',
            (doc) => {}
        );

        readings.second = Object.keys(john.subcollections.messages.listeners).length;

        john.subcollections.messages.removeAllListeners();

        readings.third = Object.keys(john.subcollections.messages.listeners).length;

        expect(readings).to.deep.equal({
            first: 0,
            second: 3,
            third: 0,
        });
    });

    it('can register query listeners', async () => {
        const deferred = new Deferred();
        const readings = [];

        const ProfileModel = new Model({
            collectionName: 'profiles',
            collectionProps: [
                'displayName',
            ]
        });

        const MessagesModel = new Submodel({
            collectionName: 'messages',
            parent: ProfileModel,
            collectionProps: [
                'content',
                'partOfTest',
                'reallyPartOfTest',
            ]
        });

        const john = await ProfileModel.writeToID('john', { displayName: 'John' });

        john.subcollections.messages.addListenerByQuery(
            'TestListener',
            [
                where('partOfTest', '==', true),
                where('reallyPartOfTest', '==', true),
                orderBy('content'),
            ],
            (docs) => {
                readings.push(map(docs, 'content'));
                if (readings.length === 3) {
                    john.subcollections.messages.removeAllListeners();
                    deferred.resolve();
                }
            }
        );

        await john.subcollections.messages.writeToID(
            '1',
            {
                content: 'test1',
                partOfTest: true,
                reallyPartOfTest: true,
            }
        );
        await john.subcollections.messages.writeToID(
            'invalid',
            {
                content: 'test3',
                partOfTest: true,
                reallyPartOfTest: false,
            }
        )
        await john.subcollections.messages.writeToID(
            '2',
            {
                content: 'test2',
                partOfTest: true,
                reallyPartOfTest: true
            }
        );
        await john.subcollections.messages.deleteByID('1');

        await deferred.promise;
        expect(readings).to.deep.equal([
            ['test1'],
            ['test1', 'test2'],
            ['test2']
        ]);
    });

    it('throws an error if a listener name is already taken when attempting to create a new listener', async () => {
        const ProfileModel = new Model({
            collectionName: 'profiles',
            collectionProps: [
                'displayName',
            ]
        });

        const MessagesModel = new Submodel({
            collectionName: 'messages',
            parent: ProfileModel,
            collectionProps: [
                'content'
            ]
        });
        
        const john = await ProfileModel.writeToID('john', { displayName: 'john' });

        john.subcollections.messages.addListenerByID('TestListener', 'john', (doc) => {});
        try {
            john.subcollections.messages.addListenerByID('TestListener', 'john', (doc) => {});
            expect(false).to.equal(true);
        } catch (err) {
            expect(true).to.equal(true);
        }
    });

});