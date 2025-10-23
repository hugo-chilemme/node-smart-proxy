import createCacheDir from './utils/config/createCacheDir.js';
import initListenersPort from './utils/network/initListenersPort.js';
import initUserInterface from './utils/auth/initUserInterface.js';

async function initialize(): Promise<void> {
	await createCacheDir();
	await initListenersPort();

	await initUserInterface();
}

void initialize();
