/**
 * Mock function to wait a certain amount of time before resolving.
 * @public
 *
 * @param {Number} timeInMilliseconds The number of milliseconds to wait before resolving the promise that the
 * mock function returns
 * @returns {Promise<void>} Resolves after timeInMilliseconds has elapsed
 */
export function mockDelay(timeInMilliseconds) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, timeInMilliseconds);
    });
};