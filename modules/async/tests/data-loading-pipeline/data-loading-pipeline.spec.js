import { expect } from 'chai';
import {
    DataLoadingPipeline,
    AcquireDataStep
} from '../../data-loading-pipeline';

describe('Data Loading Pipeline', () => {
    
    it ('is able to be used with a single data pipeline step', async () => {
        const acquireDataStep = new AcquireDataStep(
            'testVar',
            (progressiveStorage) => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => resolve(5), 100);
                });
            },
        );

        const dataLoadingPipeline = new DataLoadingPipeline([
            acquireDataStep
        ]);
        
        const results = await dataLoadingPipeline.run();
        expect(results.testVar).to.equal(5);
    });

    it ('is able to be used with multiple data pipeline steps', async () => {
        const acquireDataStep1 = new AcquireDataStep(
            'testVar1',
            (progressiveStorage) => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => resolve(5), 100);
                });
            },
            (progressiveStorage, data) => {
                return data + 1;
            }
        );
        const acquireDataStep2 = new AcquireDataStep(
            'testVar2',
            (progressiveStorage) => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => resolve(progressiveStorage.testVar1 + 1), 100);
                });
            },
            (progressiveStorage, data) => {
                return data + progressiveStorage.testVar1;
            }
        );

        const dataLoadingPipeline = new DataLoadingPipeline([
            acquireDataStep1,
            acquireDataStep2,
        ]);
        
        const results = await dataLoadingPipeline.run();
        expect(results).to.deep.equal({
            testVar1: 6,
            testVar2: 13,
        });
    });

});