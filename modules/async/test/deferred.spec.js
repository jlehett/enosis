import { expect } from 'chai';
import Deferred from '../deferred';

describe('Deferred Object', () => {

    it('is able to be instantiated', () => {
        const deferred = new Deferred();
        expect(deferred).not.to.equal(null);
    });

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
    })

});