import { expect } from 'chai';
import {
    DataLoadingPipeline,
    PopulateDataStep
} from '../../data-loading-pipeline';

describe('Populate Data Step', () => {

    it ('is able to be declared and used without utilizing progressive storage', async () => {
        const dataLoadingPipeline = new DataLoadingPipeline([
            new PopulateDataStep(
                'testVar',
                (progressiveStorage) => {
                    return 'Hello';
                }
            ),
        ]);

        const results = await dataLoadingPipeline.run();
        expect(results.testVar).to.equal('Hello');
    });

    it ('is able to be declared and used while utilizing progressive storage', async () => {
        const populateDataStep1 = new PopulateDataStep(
            'testVar1',
            (progressiveStorage) => {
                return 'Hello,';
            }
        );
        const populateDataStep2 = new PopulateDataStep(
            'testVar2',
            (progressiveStorage) => {
                return progressiveStorage.testVar1 + ' World!';
            }
        );

        const dataLoadingPipeline = new DataLoadingPipeline([
            populateDataStep1,
            populateDataStep2,
        ]);
        
        const results = await dataLoadingPipeline.run();
        expect(results).to.deep.equal({
            testVar1: 'Hello,',
            testVar2: 'Hello, World!',
        });
    });

});