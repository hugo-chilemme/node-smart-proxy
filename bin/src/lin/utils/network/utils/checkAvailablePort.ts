import net from 'node:net';

type Host = string;

const checkAvailablePort = (port: number, host: Host = '0.0.0.0'): Promise<boolean> =>
		new Promise((resolve) => {
			const server = net.createServer();

			server.once('error', () => {
				server.close();
				resolve(false);
			});

		server.once('listening', () => {
			server.close();
			resolve(true);
		});

		server.listen(port, host);
	});

const checkMultiplePorts = async (ports: number[], host: Host = '0.0.0.0'): Promise<Record<number, boolean>> => {
	const results: Record<number, boolean> = {};

	for (const port of ports) {
		results[port] = await checkAvailablePort(port, host);
		if (!results[port]) {
			throw new Error(`Port ${port} is already in use.`);
		}
	}

	return results;
};

const findAvailablePort = async (
	startPort: number,
	maxAttempts = 100,
	host: Host = '0.0.0.0'
): Promise<number | null> => {
	for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
		const port = startPort + attempt;
		const isAvailable = await checkAvailablePort(port, host);

		if (isAvailable) {
			return port;
		}
	}

	return null;
};

export {
	checkAvailablePort,
	checkMultiplePorts,
	findAvailablePort,
};
