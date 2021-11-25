import { expect } from 'chai';
import { prepareStoryForModal } from '../lib';

describe('prepareStoryForModal', () => {

    it('can set the proper parameters on a story object', () => {
        const story = {
            parameters: {},
        };
        prepareStoryForModal(story, 300);
        expect(story.parameters).to.deep.equal({
            docs: {
                inlineStories: false,
                iframeHeight: 300
            }
        });
    });

});