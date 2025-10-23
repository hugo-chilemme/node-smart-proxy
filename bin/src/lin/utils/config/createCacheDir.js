import loading from '../../utils/loader.js';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import machineId from "../../api/utils/machineId.js";

global.cache = {
	__dir: process.cwd() + '/.cache',
	__machineId: machineId(),
}

const authTemplate = {
	accessToken: null,
	refreshToken: null,
	expiry: null,
	identifier: null,
	endpoint: null,
};

const configTemplate = {
	ports: {
		https: 443,
		http: 80,
		socks5: 1080,
	}
};

async function initializeCacheDir() {
	if (process.argv.includes('--clean-cache')) {
		await fs.rm('./.cache', { recursive: true, force: true })
	};

	const loader = await loading("Starting services...");

	const cacheDir = process.cwd() + '/.cache';
	if (!existsSync(cacheDir)) {
		await fs.mkdir(cacheDir);
		await loader.update("Created cache directory...");
	}

	const cacheFiles = {
		'config.json': configTemplate,
		'auth.json': authTemplate,
	}

	const filePromises = [];
	for (const [file, content] of Object.entries(cacheFiles)) {
		const filePath = cacheDir + '/' + file;
		if (!existsSync(filePath)) {
			filePromises.push(
				fs.writeFile(filePath, JSON.stringify(content))
					.then(() => loader.update(`Created ${file}...`))
					.catch(() => loader.error(`Failed to create ${file}.`))
			);
		}
	}

	await Promise.all(filePromises);

	// Read all files and store in global cache
	const files = await fs.readdir(cacheDir);
	for (const file of files) {
		const filePath = cacheDir + '/' + file;
		const fileContent = await fs.readFile(filePath, 'utf-8');
		const fileName = file.replace('.json', '');
		global.cache[fileName] = JSON.parse(fileContent);
	}

	await loader.done("All files and directories are set up.");
	await new Promise(resolve => setTimeout(resolve, 250)); // small delay for better UX
}

export default initializeCacheDir;