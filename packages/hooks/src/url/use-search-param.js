import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Provides the user with the value of the specified search param from the current URL.
 * 
 * @param {string} key The key for the search param to get the value of
 * @returns {string | null} The value of the search param if it exists; otherwise, null
 */
export default function(key) {
    return new URLSearchParams(useLocation().search).get(key);
}