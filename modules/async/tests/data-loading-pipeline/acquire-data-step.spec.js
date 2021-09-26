import { expect } from 'chai';
import {
    DataLoadingPipeline,
    AcquireDataStep
} from '../../data-loading-pipeline';

describe('Acquire Data Step', () => {
    
    it ('is able to be declared and used without a post-processing function', async () => {
        const dataLoadingPipeline = new DataLoadingPipeline([
            new AcquireDataStep(
                'testVar',
                (progressiveStorage) => {
                    return new Promise((resolve, reject) => {
                        setTimeout(() => resolve(5), 100);
                    });
                }
            ),
        ]);

        const results = await dataLoadingPipeline.run();
        expect(results.testVar).to.equal(5);
    });

    it ('is able to be declared and used with a post-processing function', async () => {
        const dataLoadingPipeline = new DataLoadingPipeline([
            new AcquireDataStep(
                'testVar',
                (progressiveStorage) => {
                    return new Promise((resolve, reject) => {
                        setTimeout(() => resolve(5), 100);
                    });
                },
                (progressiveStorage, data) => {
                    return data + 1;
                }
            ),
        ]);

        const results = await dataLoadingPipeline.run();
        expect(results.testVar).to.equal(6);
    });

});