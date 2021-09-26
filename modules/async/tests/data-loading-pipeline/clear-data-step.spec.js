import { expect } from 'chai';
import {
    DataLoadingPipeline,
    PopulateDataStep,
    ClearDataStep
} from '../../data-loading-pipeline';

describe('Clear Data Step', () => {

    it ('is able to clear data under a single key from progressive storage', async () => {
        const populateDataStep1 = new PopulateDataStep(
            'testVar1',
            (progressiveStorage) => {
                return 5;
            }
        );
        const populateDataStep2 = new PopulateDataStep(
            'testVar2',
            (progressiveStorage) => {
                return 6;
            }
        );
        const clearDataStep = new ClearDataStep(['testVar1']);

        const dataLoadingPipeline = new DataLoadingPipeline([
            populateDataStep1,
            clearDataStep,
            populateDataStep2,
        ]);
        
        const results = await dataLoadingPipeline.run();
        expect(results).to.deep.equal({
            testVar2: 6
        });
    });

    it ('is able to clear data under multiple keys from progressive storage', async () => {
        const populateDataStep1 = new PopulateDataStep(
            'testVar1',
            (progressiveStorage) => {
                return 5;
            }
        );
        const populateDataStep2 = new PopulateDataStep(
            'testVar2',
            (progressiveStorage) => {
                return 6;
            }
        );
        const clearDataStep = new ClearDataStep(['testVar1', 'testVar2']);

        const dataLoadingPipeline = new DataLoadingPipeline([
            populateDataStep1,
            populateDataStep2,
            clearDataStep,
        ]);
        
        const results = await dataLoadingPipeline.run();
        expect(results).to.deep.equal({});
    });

});