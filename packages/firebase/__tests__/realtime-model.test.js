import { expect } from 'chai';
import { RealtimeModel } from '../lib/realtime-database';
import { setUpApp, setUpFunctionsEmulator, setUpRealtimeDatabaseEmulator } from './utilities/set-up-emulator';
import { clearRealtimeDatabaseEmulatorData } from './utilities/clear-emulator-data';
import freeAppResources from './utilities/free-app-resources';
import { Deferred } from '@unifire-js/async';

describe('Realtime Model', () => {

    before(async () => {
        setUpApp();
        await setUpFunctionsEmulator();
        await setUpRealtimeDatabaseEmulator();
    });

    beforeEach(async () => {
        await clearRealtimeDatabaseEmulatorData();
    });

    after(() => {
        freeAppResources();
    });

    it('can write data to the realtime database with proper sanitization, and then fetch the written data', async () => {
        const RoomModel = new RealtimeModel({
            collectionName: 'rooms',
            collectionProps: [
                'users'
            ]
        });
        await RoomModel.writeToPath(
            'rooms/1',
            {
                users: {
                    john: true,
                    joey: false,
                },
                unsupportedProp: 'Some Value'
            }
        );
        const data = await RoomModel.getByPath('rooms/1');
        expect(data).to.deep.equal({
            users: {
                john: true,
                joey: false,
            }
        });
    });

    it('can write data to the realtime database with default values merged in', async () => {
        const RoomModel = new RealtimeModel({
            collectionName: 'rooms',
            collectionProps: [
                'active',
                'users',
            ],
            propDefaults: {
                active: true,
                users: {},
            }
        });
        await RoomModel.writeToPath(
            'rooms/1',
            {
                users: {
                    john: {
                        vote: 1,
                        inLobby: true
                    },
                    joey: {
                        inLobby: false,
                    }
                }
            },
            { mergeWithDefaultValues: true }
        );
        const data = await RoomModel.getByPath('rooms/1');
        expect(data).to.deep.equal({
            active: true,
            users: {
                john: {
                    vote: 1,
                    inLobby: true,
                },
                joey: {
                    inLobby: false,
                }
            },
        });
    });

    it('can handle deep writes', async () => {
        const RoomModel = new RealtimeModel({
            collectionName: 'rooms',
            collectionProps: [
                'active',
                'users',
            ],
        });
        await RoomModel.writeToPath(
            'test/1/rooms/2',
            {
                active: {
                    isTrue: {
                        reallyTrue: true,
                    },
                },
                users: {
                    john: {
                        displayName: 'john',
                        votes: {
                            first: 1
                        }
                    },
                    joey: {
                        displayName: {
                            realDisplayName: 'joey',
                        },
                        votes: {
                            first: 1,
                            second: 3,
                        }
                    },
                },
            },
        );
        const data = await RoomModel.getByPath('test/1/rooms/2');
        expect(data).to.deep.equal({
            active: {
                isTrue: {
                    reallyTrue: true,
                },
            },
            users: {
                john: {
                    displayName: 'john',
                    votes: {
                        first: 1,
                    },
                },
                joey: {
                    displayName: {
                        realDisplayName: 'joey',
                    },
                    votes: {
                        first: 1,
                        second: 3,
                    }
                }
            },
        });
    });

    it('can subscribe to changes at a specific path', async () => {
        const deferred = new Deferred();

        const RoomModel = new RealtimeModel({
            collectionName: 'rooms',
            collectionProps: [
                'publicInfo',
                'privateInfo',
            ],
        });

        RoomModel.addListenerByPath(
            'TestListener',
            'rooms/1',
            (doc) => {
                if (doc?.publicInfo?.testVar === true) {
                    RoomModel.removeListener('TestListener');
                    deferred.resolve();
                }
            }
        );

        await RoomModel.writeToPath(
            'rooms/1',
            {
                privateInfo: {
                    unneededVar: false
                }
            }
        );

        await RoomModel.writeToPath(
            'rooms/1',
            {
                publicInfo: {
                    testVar: true,
                }
            }
        );

        await deferred.promise;
        expect(true).to.equal(true);
    });

    it('can remove a registered listener', async () => {
        const readings = {};

        const RoomModel = new RealtimeModel({
            collectionName: 'rooms',
            collectionProps: [
                'active',
            ]
        });

        readings.first = Boolean(RoomModel.listeners.TestListener);

        RoomModel.addListenerByPath(
            'TestListener',
            'rooms/1',
            (doc) => {}
        );

        readings.second = Boolean(RoomModel.listeners.TestListener);

        RoomModel.removeListener('TestListener');

        readings.third = Boolean(RoomModel.listeners.TestListener);

        expect(readings).to.deep.equal({
            first: false,
            second: true,
            third: false,
        });
    });

    it('can remove all registered listeners', async () => {
        const readings = {};

        const RoomModel = new RealtimeModel({
            collectionName: 'rooms',
            collectionProps: [
                'active',
            ]
        });

        readings.first = Object.keys(RoomModel.listeners).length;

        RoomModel.addListenerByPath(
            'test1',
            'rooms/1',
            (doc) => {}
        );
        RoomModel.addListenerByPath(
            'test2',
            'rooms/2',
            (doc) => {}
        );
        RoomModel.addListenerByPath(
            'test3',
            'rooms/3',
            (doc) => {}
        );

        readings.second = Object.keys(RoomModel.listeners).length;

        RoomModel.removeAllListeners();

        readings.third = Object.keys(RoomModel.listeners).length;

        expect(readings).to.deep.equal({
            first: 0,
            second: 3,
            third: 0,
        });
    });

    it('will completely overwrite any data at the path when `writeToPath` is called', async () => {
        const RoomModel = new RealtimeModel({
            collectionName: 'rooms',
            collectionProps: [
                'active',
                'users',
            ]
        });

        await RoomModel.writeToPath(
            'rooms/1',
            {
                active: true,
                users: {
                    john: {
                        active: true,
                        vote: 1
                    }
                }
            }
        );
        await RoomModel.writeToPath(
            'rooms/1',
            {
                users: {
                    joey: {
                        vote: 2
                    }
                }
            }
        );

        const data = await RoomModel.getByPath('rooms/1');
        expect(data).to.deep.equal({
            users: {
                joey: {
                    vote: 2
                }
            }
        });
    });

    it('throws an error if a listener name is already taken when attempting to create a new listener', async () => {
        const RoomModel = new RealtimeModel({
            collectionName: 'rooms',
            collectionProps: [
                'active',
            ]
        });

        RoomModel.addListenerByPath('TestListener', 'rooms/1', (doc) => {});
        try {
            RoomModel.addListenerByPath('TestListener', 'rooms/1', (doc) => {});
            expect(false).to.equal(true);
        } catch (err) {
            expect(true).to.equal(true);
        }
    });

});