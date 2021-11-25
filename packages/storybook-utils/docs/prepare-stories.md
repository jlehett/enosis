# Prepare Stories

Sometimes a Storybook story needs to be prepared in a special way. For example, modals tend to not work well in Storybook by default, as they will appear over all other content in Storybook, as though it was a modal for Storybook itself.

Modals, in this case, need to be set up to be rendered in an iframe, with a given iframe height.

These utility functions provide methods for preparing stories, like the one above.

## Functions

### prepareStoryForModal(story, iframeHeight)

Prepares a Storybook story to handle modals. Any story dealing with modals must render the story in an iframe on the docs page so the modal doesn't overlap the docs page UI.

#### Arguments

| Argument | Type | Description |
| --- | --- | --- |
| story | Storybook.story | The Storybook story to prepare. |
| iframeHeight | Number | The height of the iframe to wrap the story in on the docs page. |

#### Example

```js
import { prepareStoryForModal } from '@unifire-js/storybook-utils';

// The standard Storybook story, prepared for modal handling
export const BasicTemplate = Template.bind({});
prepareStoryForModal(BasicTemplate, 300);
BasicTemplate.args = {
    dialogTitle: 'Test Title',
    dialogText: 'Test content.',
};
```