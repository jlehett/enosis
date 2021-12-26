import { expect } from 'chai';
import { RealtimeDatabaseInterface } from '../lib/realtime-database';
import { setUpApp, setUpFunctionsEmulator, setUpRealtimeDatabaseEmulator } from './utilities/set-up-emulator';
import { clearRealtimeDatabaseEmulatorData } from './utilities/clear-emulator-data';
import freeAppResources from './utilities/free-app-resources';
import { Deferred } from '@unifire-js/async';

describe('Realtime Database Interface', () => {

    before(async () => {
        setUpApp();
        await setUpFunctionsEmulator();
        await setUpRealtimeDatabaseEmulator();
    });

    beforeEach(async () => {
        await clearRealtimeDatabaseEmulatorData();
        await RealtimeDatabaseInterface.removeAllListeners();
        await RealtimeDatabaseInterface.removeAllOnDisconnectListeners();
    });

    after(() => {
        freeAppResources();
    });

    it('can write data to the realtime database, and then fetch the written data', async () => {
        await RealtimeDatabaseInterface.writeToPath(
            'rooms/1',
            {
                users: {
                    john: true,
                    joey: false,
                },
            }
        );
        const data = await RealtimeDatabaseInterface.getByPath('rooms/1');
        expect(data).to.deep.equal({
            users: {
                john: true,
                joey: false,
            }
        });
    });

    it('can handle deep writes', async () => {
        await RealtimeDatabaseInterface.writeToPath(
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
        const data = await RealtimeDatabaseInterface.getByPath('test/1/rooms/2');
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

        RealtimeDatabaseInterface.addListenerByPath(
            'TestListener',
            'rooms/1',
            (doc) => {
                if (doc?.publicInfo?.testVar === true) {
                    RealtimeDatabaseInterface.removeListener('TestListener');
                    deferred.resolve();
                }
            }
        );

        await RealtimeDatabaseInterface.writeToPath(
            'rooms/1',
            {
                privateInfo: {
                    unneededVar: false
                }
            }
        );

        await RealtimeDatabaseInterface.writeToPath(
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

        readings.first = Boolean(RealtimeDatabaseInterface.listeners.TestListener);

        RealtimeDatabaseInterface.addListenerByPath(
            'TestListener',
            'rooms/1',
            (doc) => {}
        );

        readings.second = Boolean(RealtimeDatabaseInterface.listeners.TestListener);

        RealtimeDatabaseInterface.removeListener('TestListener');

        readings.third = Boolean(RealtimeDatabaseInterface.listeners.TestListener);

        expect(readings).to.deep.equal({
            first: false,
            second: true,
            third: false,
        });
    });

    it('can remove all registered listeners', async () => {
        const readings = {};

        readings.first = Object.keys(RealtimeDatabaseInterface.listeners).length;

        RealtimeDatabaseInterface.addListenerByPath(
            'test1',
            'rooms/1',
            (doc) => {}
        );
        RealtimeDatabaseInterface.addListenerByPath(
            'test2',
            'rooms/2',
            (doc) => {}
        );
        RealtimeDatabaseInterface.addListenerByPath(
            'test3',
            'rooms/3',
            (doc) => {}
        );

        readings.second = Object.keys(RealtimeDatabaseInterface.listeners).length;

        RealtimeDatabaseInterface.removeAllListeners();

        readings.third = Object.keys(RealtimeDatabaseInterface.listeners).length;

        expect(readings).to.deep.equal({
            first: 0,
            second: 3,
            third: 0,
        });
    });

    it('will completely overwrite any data at the path when `writeToPath` is called', async () => {
        await RealtimeDatabaseInterface.writeToPath(
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
        await RealtimeDatabaseInterface.writeToPath(
            'rooms/1',
            {
                users: {
                    joey: {
                        vote: 2
                    }
                }
            }
        );

        const data = await RealtimeDatabaseInterface.getByPath('rooms/1');
        expect(data).to.deep.equal({
            users: {
                joey: {
                    vote: 2
                }
            }
        });
    });

    it('throws an error if a listener name is already taken when attempting to create a new listener', async () => {
        RealtimeDatabaseInterface.addListenerByPath('TestListener', 'rooms/1', (doc) => {});
        try {
            RealtimeDatabaseInterface.addListenerByPath('TestListener', 'rooms/1', (doc) => {});
            expect(false).to.equal(true);
        } catch (err) {
            expect(true).to.equal(true);
        }
    });

    it('can merge existing data with new data, if specified in the `writeToPath` function', async () => {
        await RealtimeDatabaseInterface.writeToPath(
            'rooms/1',
            {
                users: {
                    john: { active: false },
                    joey: { active: false },
                },
                testing: {
                    what: {
                        is: true,
                    }
                }
            }
        );
        await RealtimeDatabaseInterface.writeToPath(
            'rooms/1',
            {
                users: {
                    john: { active: true }
                }
            },
            { mergeWithExistingData: true }
        );

        const data = await RealtimeDatabaseInterface.getByPath('rooms/1');
        expect(data).to.deep.equal({
            users: {
                john: { active: true },
            },
            testing: {
                what: {
                    is: true,
                }
            }
        });
    });

    it('can delete data at a given path', async () => {
        await RealtimeDatabaseInterface.writeToPath(
            'rooms/1',
            'Test',
        );
        const readings = {
            first: await RealtimeDatabaseInterface.getByPath('rooms/1')
        };
        await RealtimeDatabaseInterface.deleteAtPath('rooms/1');
        readings.second = await RealtimeDatabaseInterface.getByPath('rooms/1');
        expect(readings).to.deep.equal({
            first: 'Test',
            second: null
        });
    });

});