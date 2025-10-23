import loading from '../../utils/loader.js';
import type { ConfigState, PortsConfig } from '../../../types/cache.js';
import { checkMultiplePorts } from './utils/checkAvailablePort.js';

const REQUIRED_PORTS: (keyof PortsConfig)[] = ['https', 'http', 'socks5'];

const defaultConfig: ConfigState = {
	ports: {
		https: 443,
		http: 80,
		socks5: 1080,
	},
};

const assertValidPorts = (ports: PortsConfig): void => {
	for (const portKey of REQUIRED_PORTS) {
		const portValue = ports[portKey];

		if (portValue === undefined) {
			throw new Error(`Invalid configuration: ${portKey} port is missing.`);
		}

		if (typeof portValue !== 'number' || Number.isNaN(portValue) || portValue < 1 || portValue > 65535) {
			throw new Error(`Invalid configuration: ${portKey} port is not a valid port number.`);
		}
	}
};

const initListenersPort = async (): Promise<void> => {
	const loader = loading('Checking configuration for listener ports...');

	const configData: ConfigState = globalThis.cache?.config ?? defaultConfig;

	try {
		if (!configData.ports || typeof configData.ports !== 'object') {
			throw new Error('Invalid configuration: ports section is missing or malformed in config.json');
		}

		assertValidPorts(configData.ports);
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unexpected configuration error.';
		loader.error(message);
		return;
	}

	try {
		await checkMultiplePorts(Object.values(configData.ports));
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown port availability error.';
		loader.error(message);
		return;
	}

	loader.done('Configuration ports are ready and available.');
};

export default initListenersPort;
