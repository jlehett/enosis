import { expect } from 'chai';
import { Deferred } from '../lib';

describe('Deferred Object', () => {

    it('is able to be resolved from external scope', async () => {
        const deferred = new Deferred();
        setTimeout(() => {
            deferred.resolve(5);
        }, 250);
        const value = await deferred.promise;
        expect(value).to.equal(5);
    });

    it('is able to be rejected from external scope', async () => {
        const deferred = new Deferred();
        setTimeout(() => {
            deferred.reject(5);
        }, 250);
        try {
            await deferred.promise;
        } catch (err) {
            expect(err).to.equal(5);
        }
    });

    it('is able to accurately track the `settled` property', async () => {
        const resultsObj = {};
        const deferred = new Deferred();

        resultsObj.firstReading = deferred.settled;

        setTimeout(deferred.resolve, 250);
        await deferred.promise;

        resultsObj.secondReading = deferred.settled;

        expect(resultsObj).to.deep.equal({
            firstReading: false,
            secondReading: true
        });
    });

    it('is able to use the static `resolve` method', async () => {
        const resolvedDeferred = Deferred.resolve(5);
        const result = {
            settled: resolvedDeferred.settled,
            value: await resolvedDeferred.promise,
        };
        expect(result).to.deep.equal({
            settled: true,
            value: 5
        });
    });

    it('is able to use the static `reject` method', async () => {
        const rejectedDeferred = Deferred.reject(5);
        const result = { settled: rejectedDeferred.settled };
        try {
            await rejectedDeferred.promise;
        } catch (err) {
            result.value = err;
        }
        expect(result).to.deep.equal({
            settled: true,
            value: 5
        });
    });

});