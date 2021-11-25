import { expect } from 'chai';
import { setAsCategory, setAsDisabled, setControlToRadioSelect } from '../lib';

describe('setAsCategory', () => {

    it('can handle an empty argTypes object', () => {
        const argTypes = {};
        setAsCategory(argTypes, 'tests', [ 'test1', 'test2' ]);
        expect(argTypes).to.deep.equal({
            test1: {
                table: {
                    category: 'tests'
                }
            },
            test2: {
                table: {
                    category: 'tests'
                }
            }
        });
    });

    it('can hande an argTypes object with the arg props already specified, but without table properties', () => {
        const argTypes = {
            test1: {
                testProp: 'test',
            },
            test2: {
                testProp: 'test'
            }
        };
        setAsCategory(argTypes, 'tests', [
            'test1',
            'test2'
        ]);
        expect(argTypes).to.deep.equal({
            test1: {
                testProp: 'test',
                table: {
                    category: 'tests',
                }
            },
            test2: {
                testProp: 'test',
                table: {
                    category: 'tests',
                }
            }
        });
    });

    it('can handle an argTypes object with the arg props already specified, with table properties', () => {
        const argTypes = {
            test1: {
                testProp: 'test',
                table: {
                    testProp2: 'test2',
                }
            },
            test2: {
                testProp: 'test',
                table: {
                    testProp2: 'test2',
                }
            }
        };
        setAsCategory(argTypes, 'tests', [
            'test1',
            'test2'
        ]);
        expect(argTypes).to.deep.equal({
            test1: {
                testProp: 'test',
                table: {
                    testProp2: 'test2',
                    category: 'tests',
                },
            },
            test2: {
                testProp: 'test',
                table: {
                    testProp2: 'test2',
                    category: 'tests',
                }
            }
        });
    });

});

describe('setAsDisabled', () => {

    it('can handle an empty argTypes object', () => {
        const argTypes = {};
        setAsDisabled(argTypes, [
            'test1',
            'test2',
        ]);
        expect(argTypes).to.deep.equal({
            test1: {
                table: {
                    disable: true,
                }
            },
            test2: {
                table: {
                    disable: true,
                }
            }
        });
    });

    it('can hande an argTypes object with the arg props already specified, but without table properties', () => {
        const argTypes = {
            test1: {
                testProp: 'test',
            },
            test2: {
                testProp: 'test'
            }
        };
        setAsDisabled(argTypes, [
            'test1',
            'test2'
        ]);
        expect(argTypes).to.deep.equal({
            test1: {
                testProp: 'test',
                table: {
                    disable: true,
                }
            },
            test2: {
                testProp: 'test',
                table: {
                    disable: true,
                }
            }
        });
    });

    it('can handle an argTypes object with the arg props already specified, with table properties', () => {
        const argTypes = {
            test1: {
                testProp: 'test',
                table: {
                    testProp2: 'test2',
                }
            },
            test2: {
                testProp: 'test',
                table: {
                    testProp2: 'test2',
                }
            }
        };
        setAsDisabled(argTypes, [
            'test1',
            'test2'
        ]);
        expect(argTypes).to.deep.equal({
            test1: {
                testProp: 'test',
                table: {
                    testProp2: 'test2',
                    disable: true,
                },
            },
            test2: {
                testProp: 'test',
                table: {
                    testProp2: 'test2',
                    disable: true,
                }
            }
        });
    });

});

describe('setControlToRadioSelect', () => {

    it('can handle an empty argTypes object', () => {
        const argTypes = {};
        setControlToRadioSelect(argTypes, 'test', [ 'opt1', 'opt2', 'opt3' ]);
        expect(argTypes).to.deep.equal({
            test: {
                options: ['opt1', 'opt2', 'opt3'],
                control: { type: 'radio' }
            }
        });
    });

    it('can hande an argTypes object with the arg props already specified', () => {
        const argTypes = {
            test1: {
                testProp: 'test',
            },
            test2: {
                testProp: 'test'
            }
        };
        setControlToRadioSelect(argTypes, 'test1', [ 'opt1', 'opt2', 'opt3' ]);
        expect(argTypes).to.deep.equal({
            test1: {
                testProp: 'test',
                options: ['opt1', 'opt2', 'opt3'],
                control: { type: 'radio' },
            },
            test2: {
                testProp: 'test',
            }
        });
    });

});