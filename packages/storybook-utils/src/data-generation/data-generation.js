import sample from 'lodash/sample';
import { firstNames, lastNames } from './data/names';

/**
 * Generate a random name (first and last) for testing.
 * @public
 *
 * @returns {string} Returns a randomly generated name
 */
export function generateRandomName() {
    return `${sample(firstNames)} ${sample(lastNames)}`;
}
