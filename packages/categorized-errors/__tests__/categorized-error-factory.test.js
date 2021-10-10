import { expect } from 'chai';
import pick from 'lodash/pick';
import {
    CategorizedErrorFactory
} from '..';

describe('Categorized Error Factory', () => {
    // Test Constants
    let categorizedErrorFactory;

    before(() => {
        categorizedErrorFactory = new CategorizedErrorFactory({
            BASIC_ERROR_NO_CATEGORIES: {
                message: 'This is a test!',
            },
            TEMPLATE_ERROR_NO_CATEGORIES: {
                messageTemplate: 'The test var was <%= testVar %>',
            },
            BASIC_ERROR_MULTIPLE_CATEGORIES: {
                message: 'This is a test with categories!',
                categories: ['SAFE', 'TEST'],
            },
            TEMPLATE_ERROR_MULTIPLE_CATEGORIES: {
                messageTemplate: 'The test var was <%= testVar %>',
                categories: ['SAFE', 'TEST'],
            },
        });
    });

    it('stores IDs properly', () => {
        expect(categorizedErrorFactory.ids).to.deep.equal({
            BASIC_ERROR_NO_CATEGORIES: 'BASIC_ERROR_NO_CATEGORIES',
            TEMPLATE_ERROR_NO_CATEGORIES: 'TEMPLATE_ERROR_NO_CATEGORIES',
            BASIC_ERROR_MULTIPLE_CATEGORIES: 'BASIC_ERROR_MULTIPLE_CATEGORIES',
            TEMPLATE_ERROR_MULTIPLE_CATEGORIES: 'TEMPLATE_ERROR_MULTIPLE_CATEGORIES',
        });
    });

    it('stores categories properly', () => {
        expect(categorizedErrorFactory.categories).to.deep.equal({
            SAFE: 'SAFE',
            TEST: 'TEST',
        });
    });

    it('create basic error factories properly with categories', () => {
        const basicErrorWithCategories = categorizedErrorFactory
            .factories.BASIC_ERROR_MULTIPLE_CATEGORIES();
        // Only grab the properties we can test
        const testObj = pick(
            basicErrorWithCategories,
            ['id', 'message', 'categories']
        );
        expect(testObj).to.deep.equal({
            id: 'BASIC_ERROR_MULTIPLE_CATEGORIES',
            message: 'This is a test with categories!',
            categories: ['SAFE', 'TEST'],
        });
    });

    it('produces errors with an `inCategory` function that properly detects if the error is in a category', () => {
        const basicErrorWithCategories = categorizedErrorFactory
            .factories.BASIC_ERROR_MULTIPLE_CATEGORIES();
        const inCategory = basicErrorWithCategories.inCategory('SAFE');
        expect(inCategory).to.equal(true);
    });

    it('produces errors with an `inCategory` function that properly detects if the error is NOT in a category', () => {
        const basicErrorWithCategories = categorizedErrorFactory
            .factories.BASIC_ERROR_MULTIPLE_CATEGORIES();
        const inCategory = basicErrorWithCategories.inCategory('UNSAFE');
        expect(inCategory).to.equal(false);
    });

    it('produces templated errors properly', () => {
        const templateErrorNoCategories = categorizedErrorFactory
            .factories.TEMPLATE_ERROR_NO_CATEGORIES({ testVar: 5 });
        expect(templateErrorNoCategories.message).to.equal(
            'The test var was 5'
        );
    });

});