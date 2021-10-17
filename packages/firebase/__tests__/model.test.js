import { expect } from 'chai';
import {
    assign,
    omit,
    map,
} from 'lodash';
import {
    Model,
    Submodel,
} from '../lib';
import SubmodelInstance from '../lib/firestore/submodel-instance';
import { getFirebaseApp } from '../lib/firebase-app/firebase-app';
import {
    getFirestore,
    runTransaction,
    where,
    orderBy,
} from '@firebase/firestore';
import setUpEmulator from './utilities/set-up-emulator';
import clearEmulatorData from './utilities/clear-emulator-data';
import freeAppResources from './utilities/free-app-resources';
import { Deferred } from '../../async/lib';

describe('Model', () => {

    before(async () => {
        await setUpEmulator();
    });

    beforeEach(async () => {
        await clearEmulatorData();
    });

    it('can write a document to the database with proper sanitization, and then fetch the written doc', async () => {
        const profileModel = new Model({
            collectionName: 'profiles',
            collectionProps: [
                'displayName',
                'email'
            ]
        });
        await profileModel.writeToID(
            'testing',
            {
                displayName: 'Hello',
                invalidProp: 'Not Valid'
            }
        );
        let result = await profileModel.getByID('testing');
        result = omit(result, ['_ref']);
        expect(result).to.deep.equal({
            id: 'testing',
            displayName: 'Hello',
            subcollections: {}
        });
    });

    it('can write a document to the database with default values merged in', async () => {
        const profileModel = new Model({
            collectionName: 'profiles',
            collectionProps: [
                'displayName',
                'email'
            ],
            propDefaults: {
                displayName: 'No Name',
                email: 'No Email'
            }
        });
        await profileModel.writeToID(
            'testing',
            {
                displayName: 'john'
            },
            { mergeWithDefaultValues: true }
        );
        let result = await profileModel.getByID('testing');
        result = omit(result, ['_ref']);
        expect(result).to.deep.equal({
            id: 'testing',
            displayName: 'john',
            email: 'No Email',
            subcollections: {},
        });
    });

    it('can query for data with compound queries', async () => {
        const profileModel = new Model({
            collectionName: 'profiles',
            collectionProps: [
                'displayName',
                'email',
                'address',
            ]
        });
        await profileModel.writeToID(
            'test1',
            {
                displayName: 'john',
                email: 'john@gmail.com',
                address: '111 Test Rd'
            }
        );
        await profileModel.writeToID(
            'test2',
            {
                displayName: 'john',
                email: 'john@gmail.com',
                address: '222 Test Rd'
            }
        );
        await profileModel.writeToID(
            'test3',
            {
                displayName: 'joey',
                email: 'joey@gmail.com',
                address: '333 Test Rd'
            }
        );
        await profileModel.writeToID(
            'test4',
            {
                displayName: 'joey',
                email: 'john@gmail.com',
                address: '444 Test Rd'
            }
        );
        await profileModel.writeToID(
            'test5',
            {
                displayName: 'john',
                email: 'joey@gmail.com',
                address: '555 Test Rd'
            }
        );
        let result = await profileModel.getByQuery({
            whereFns: [
                where('displayName', '==', 'john'),
                where('email', '==', 'john@gmail.com')
            ]
        });
        result = map(result, resultValue => omit(resultValue, ['_ref']));
        expect(result).to.deep.equal([
            {
                id: 'test1',
                displayName: 'john',
                email: 'john@gmail.com',
                address: '111 Test Rd',
                subcollections: {},
            },
            {
                id: 'test2',
                displayName: 'john',
                email: 'john@gmail.com',
                address: '222 Test Rd',
                subcollections: {},
            }
        ]);
    });

    it('can create a new document without any default data defined', async () => {
        const profileModel = new Model({
            collectionName: 'profiles',
            collectionProps: [
                'displayName',
                'email'
            ],
            propDefaults: {
                displayName: 'No Name',
                email: 'No Email'
            }
        });
        await profileModel.writeToNewDoc({
            displayName: 'john',
            invalidProp: 'invalid'
        });
        const result = await profileModel.getByQuery({
            whereFns: [
                where('displayName', '==', 'john')
            ]
        });
        const resultToTest = omit(result[0], ['id', '_ref']);
        expect(resultToTest).to.deep.equal({
            displayName: 'john',
            subcollections: {},
        });
    });

    it('can create a new document with some defined default data merged with passed-in data', async () => {
        const profileModel = new Model({
            collectionName: 'profiles',
            collectionProps: [
                'displayName',
                'email'
            ],
            propDefaults: {
                displayName: 'No Name',
                email: 'No Email'
            }
        });
        await profileModel.writeToNewDoc(
            {
                displayName: 'john',
                invalidProp: 'invalid'
            },
            { mergeWithDefaultValues: true }
        );
        const result = await profileModel.getByQuery({
            whereFns: [
                where('displayName', '==', 'john')
            ]
        });
        const resultToTest = omit(result[0], ['id', '_ref']);
        expect(resultToTest).to.deep.equal({
            displayName: 'john',
            email: 'No Email',
            subcollections: {},
        });
    });

    it('can handle read and write operations in a transaction', async () => {
        const profileModel = new Model({
            collectionName: 'profiles',
            collectionProps: [
                'displayName',
                'email'
            ]
        });
        let transactionRunCount = 0;
        profileModel.writeToID(
            'initialDoc',
            {
                displayName: 'john'
            }
        );
        const db = getFirestore(getFirebaseApp());
        await new Promise(async (parentResolve, parentReject) => {
            let interruptingPromise = new Deferred();
            let initialPromise = new Deferred();
            runTransaction(db, async (transaction) => {
                transactionRunCount++;
                const initialDoc = await profileModel.getByID(
                    'initialDoc',
                    { transaction }
                );
                initialPromise.resolve();
                await interruptingPromise.promise;
                await profileModel.writeToID(
                    'updatedDoc',
                    {
                        displayName: initialDoc.displayName + '-updated'
                    },
                    { transaction }
                );
            }).then(parentResolve);
            await initialPromise.promise;
            profileModel.writeToID(
                'initialDoc',
                {
                    displayName: 'joey'
                }
            ).then(interruptingPromise.resolve);
        });
        let finalResult = await profileModel.getByID('updatedDoc');
        finalResult = omit(finalResult, ['_ref']);
        const testObj = assign({}, finalResult, { transactionRunCount });
        expect(testObj).to.deep.equal({
            id: 'updatedDoc',
            displayName: 'joey-updated',
            transactionRunCount: 2,
            subcollections: {},
        });
    });

    it('can handle creating compound queries with orderByFns and a limit', async () => {
        const profileModel = new Model({
            collectionName: 'profiles',
            collectionProps: [
                'displayName',
                'email',
                'address',
                'phone',
            ]
        });
        await profileModel.writeToNewDoc({
            displayName: 'john',
            email: '1@gmail.com',
            address: '111',
            phone: '999',
        });
        await profileModel.writeToNewDoc({
            displayName: 'john',
            email: '2@gmail.com',
            address: '111',
            phone: '999',
        });
        await profileModel.writeToNewDoc({
            displayName: 'john',
            email: '3@gmail.com',
            address: '111',
            phone: '999',
        });
        await profileModel.writeToNewDoc({
            displayName: 'john',
            email: '4@gmail.com',
            address: '111',
            phone: '999',
        });
        await profileModel.writeToNewDoc({
            displayName: 'john',
            email: '4@gmail.com',
            address: '111',
            phone: '998',
        });
        await profileModel.writeToNewDoc({
            displayName: 'john',
            email: '5@gmail.com',
            address: '222',
            phone: '999',
        });
        await profileModel.writeToNewDoc({
            displayName: 'joey',
            email: '6@gmail.com',
            address: '111',
            phone: '999',
        });
        const result = await profileModel.getByQuery({
            whereFns: [
                where('displayName', '==', 'john'),
                where('address', '==', '111')
            ],
            orderByFns: [
                orderBy('email', 'desc'),
                orderBy('phone')
            ],
            limit: 4
        });
        const resultsToTest = map(result, (docData) => {
            return omit(docData, ['id', '_ref']);
        });
        expect(resultsToTest).to.deep.equal([
            {
                displayName: 'john',
                email: '4@gmail.com',
                address: '111',
                phone: '998',
                subcollections: {},
            },
            {
                displayName: 'john',
                email: '4@gmail.com',
                address: '111',
                phone: '999',
                subcollections: {},
            },
            {
                displayName: 'john',
                email: '3@gmail.com',
                address: '111',
                phone: '999',
                subcollections: {},
            },
            {
                displayName: 'john',
                email: '2@gmail.com',
                address: '111',
                phone: '999',
                subcollections: {},
            }
        ]);
    });

    it('will completely overwrite existing data unless otherwise specified in a write operation', async () => {
        const profileModel = new Model({
            collectionName: 'profiles',
            collectionProps: [
                'profileName',
                'email'
            ]
        });
        await profileModel.writeToID(
            'test',
            {
                profileName: 'john',
                email: 'john@gmail.com'
            }
        );
        await profileModel.writeToID(
            'test',
            {
                profileName: 'joey'
            }
        );
        let result = await profileModel.getByID('test');
        result = omit(result, ['_ref']);
        expect(result).to.deep.equal({
            id: 'test',
            profileName: 'joey',
            subcollections: {},
        });
    });

    it('will merge in existing data in a write operation, if specified', async () => {
        const profileModel = new Model({
            collectionName: 'profiles',
            collectionProps: [
                'profileName',
                'email'
            ]
        });
        await profileModel.writeToID(
            'test',
            {
                profileName: 'john',
                email: 'john@gmail.com'
            }
        );
        await profileModel.writeToID(
            'test',
            {
                profileName: 'joey'
            },
            { mergeWithExistingValues: true }
        );
        let result = await profileModel.getByID('test');
        result = omit(result, ['_ref']);
        expect(result).to.deep.equal({
            id: 'test',
            profileName: 'joey',
            email: 'john@gmail.com',
            subcollections: {},
        });
    });

    it('will handle storing subcollections appropriately', async () => {
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

        const result = await ProfileModel.getByID('john');
        const typesMatchExpected = map(result.subcollections, (subcollection) => {
            return subcollection instanceof SubmodelInstance;
        });
        const everythingIsGood = !typesMatchExpected.includes(false);
        expect(everythingIsGood).to.equal(true);
    });

    after(() => {
        freeAppResources();
    })
});