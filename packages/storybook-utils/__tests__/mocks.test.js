import { expect } from 'chai';
import { mockDelay } from '../lib';

describe('mockDelay', () => {

    it('can mock a delay that resolves', async () => {
        await mockDelay(250);
        expect(true).to.equal(true);
    });

});