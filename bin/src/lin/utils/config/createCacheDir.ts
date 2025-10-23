import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import loading, { type LoadingController } from '../../utils/loader.js';
import machineId from '../../api/utils/machineId.js';
import type { AuthState, CacheStore, ConfigState } from '../../../types/cache.js';

const authTemplate: AuthState = {
	accessToken: null,
	refreshToken: null,
	expiry: null,
	identifier: null,
	endpoint: null,
};

const configTemplate: ConfigState = {
	ports: {
		https: 443,
		http: 80,
		socks5: 1080,
	},
};

const CACHE_DIR = path.join(process.cwd(), '.cache');

globalThis.cache = {
	__dir: CACHE_DIR,
	__machineId: machineId(),
} satisfies CacheStore;

const sleep = (duration: number) => new Promise((resolve) => setTimeout(resolve, duration));

async function initializeCacheDir(): Promise<void> {
	if (process.argv.includes('--clean-cache')) {
		await fs.rm(CACHE_DIR, { recursive: true, force: true });
	}

	const loader: LoadingController = loading('Starting services...');

	if (!existsSync(CACHE_DIR)) {
		await fs.mkdir(CACHE_DIR, { recursive: true });
		loader.update('Created cache directory...');
	}

	const cacheFiles: Record<string, AuthState | ConfigState> = {
		'config.json': configTemplate,
		'auth.json': authTemplate,
	};

	const filePromises: Promise<void>[] = [];
	for (const [file, content] of Object.entries(cacheFiles)) {
		const filePath = path.join(CACHE_DIR, file);
		if (!existsSync(filePath)) {
			filePromises.push(
				fs.writeFile(filePath, JSON.stringify(content))
					.then(() => {
						loader.update(`Created ${file}...`);
					})
					.catch(() => {
						loader.error(`Failed to create ${file}.`);
					})
			);
		}
	}

	await Promise.all(filePromises);

	// Read all files and store in global cache
	const files = await fs.readdir(CACHE_DIR);
	for (const file of files) {
		const filePath = path.join(CACHE_DIR, file);
		const fileContent = await fs.readFile(filePath, 'utf-8');
		const fileName = file.replace('.json', '');
		globalThis.cache[fileName] = JSON.parse(fileContent);
	}

	loader.done('All files and directories are set up.');
	await sleep(250);
	return true;
}

export default initializeCacheDir;
