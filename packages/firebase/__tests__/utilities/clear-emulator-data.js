import { exec } from 'child_process';
import util from 'util';

const promiseExec = util.promisify(exec);

export default async function() {
    await promiseExec('curl -v -X DELETE "http://localhost:8080/emulator/v1/projects/unifire-testing/databases/(default)/documents"');
};