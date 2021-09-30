import { assign } from 'lodash/assign';
import Deferred from './deferred';
import DataLoadingPipelineModule from './data-loading-pipeline';
import _ from 'lodash';
import typedefs from './typedefs';

var exports = assign(
    {
        Deferred,
    },
    DataLoadingPipelineModule
);

export default exports;