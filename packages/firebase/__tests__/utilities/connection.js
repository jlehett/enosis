import {
    goOffline,
    goOnline,
    ref,
    get
} from 'firebase/database';
import { getRealtimeDB } from '../../lib/realtime-database/utilities/referencing';

/**
 * Connect to the realtime database.
 */
export function connect() {
    goOnline(getRealtimeDB());
}

/**
 * Disconnect from the realtime database.
 */
export function disconnect() {
    goOffline(getRealtimeDB());
}
