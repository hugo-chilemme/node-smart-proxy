import fs from 'fs';
import loading from './utils/loader.js';
import createCacheDir from './utils/config/createCacheDir.js';
import initListenersPort from './utils/network/initListenersPort.js';
import initUserInterface from './utils/auth/initUserInterface.js';

async function initialize() {
	await createCacheDir();
	await initListenersPort();

	await initUserInterface();
}

initialize();