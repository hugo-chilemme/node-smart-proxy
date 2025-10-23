import loading from '../../utils/loader.js';
import { checkMultiplePorts } from './utils/checkAvailablePort.js';
import fs from 'fs';

async function initListenersPort() {	
	const loader = loading("Checking configuration for listener ports...");

	let configData = {
		ports: {
			https: 443,
			http: 80,
			socks5: 1080,
		}
	};

	try {
		configData = cache.config;

		// check data validity
		if (!configData.ports || typeof configData.ports !== 'object') {
			throw new Error('Invalid configuration: ports section is missing or malformed. in config.json');
		}

		// check ports is defined
		const requiredPorts = ['https', 'http', 'socks5'];
		for (const port of requiredPorts) {
			if (configData.ports[port] === undefined) {
				throw new Error(`Invalid configuration: ${port} port is missing.`);
			}

			// is not a valid port number
			if (typeof configData.ports[port] !== 'number' || configData.ports[port] < 1 || configData.ports[port] > 65535) {
				throw new Error(`Invalid configuration: ${port} port is not a valid port number.`);
			}
		}
	} catch (error) {
		return loader.error(error.message);
	}

	// check port is available, if not, throw error
	const ports = configData.ports;

	try {
		await checkMultiplePorts(Object.values(ports));
	} catch (error) {
		return loader.error(error.message);
	}

	loader.done("Configuration ports is ready and available.");
}

export default initListenersPort;