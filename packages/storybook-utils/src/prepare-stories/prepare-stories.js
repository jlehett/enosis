/**
 * Prepare a storybook story to handle modals. Any story dealing with modals must render the story in an iframe on the
 * docs page so the modal doesn't overlap to docs page UI.
 * @public
 *
 * @param {Storybook.story} story The storybook story to prepare
 * @param {Number} iframeHeight The height of the iframe to wrap the story in on the docs page
 */
export function prepareStoryForModal(story, iframeHeight) {
    story.parameters = {
        docs: {
            inlineStories: false,
            iframeHeight,
        }
    };
}