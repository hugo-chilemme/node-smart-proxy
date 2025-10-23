import net from 'net';

/**
 * Check if a port is available
 * @param {number} port - Port number to check
 * @param {string} host - Host address (default: '0.0.0.0')
 * @returns {Promise<boolean>} - True if port is available, false otherwise
 */
function checkAvailablePort(port, host = '0.0.0.0') {
	return new Promise((resolve) => {
		const server = net.createServer();
		
		server.once('error', (err) => {
			if (err.code === 'EADDRINUSE') {
				resolve(false);
			} else {
				resolve(false);
			}
		});
		
		server.once('listening', () => {
			server.close();
			resolve(true);
		});
		
		server.listen(port, host);
	});
}

/**
 * Check multiple ports availability
 * @param {number[]} ports - Array of port numbers to check
 * @param {string} host - Host address (default: '0.0.0.0')
 * @returns {Promise<Object>} - Object with port numbers as keys and availability as values
 */
async function checkMultiplePorts(ports, host = '0.0.0.0') {
	const results = {};
	
	for (const port of ports) {
		results[port] = await checkAvailablePort(port, host);
		if (!results[port]) {
			throw new Error(`Port ${port} is already in use.`);
		}
	}
	
	return results;
}

/**
 * Find next available port starting from a given port
 * @param {number} startPort - Starting port number
 * @param {number} maxAttempts - Maximum number of ports to try (default: 100)
 * @param {string} host - Host address (default: '0.0.0.0')
 * @returns {Promise<number|null>} - Available port number or null if none found
 */
async function findAvailablePort(startPort, maxAttempts = 100, host = '0.0.0.0') {
	for (let i = 0; i < maxAttempts; i++) {
		const port = startPort + i;
		const isAvailable = await checkAvailablePort(port, host);
		
		if (isAvailable) {
			return port;
		}
	}
	
	return null;
}

export {
	checkAvailablePort,
	checkMultiplePorts,
	findAvailablePort
};