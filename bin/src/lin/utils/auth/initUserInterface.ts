import chalk from 'chalk';
import api from '../../api/index.js';
import loading from '../../utils/loader.js';
import type { AuthState } from '../../../types/cache.js';

const defaultAuthState: AuthState = {
	accessToken: null,
	refreshToken: null,
	expiry: null,
	identifier: null,
	endpoint: null,
};

const sleep = (duration: number) => new Promise((resolve) => setTimeout(resolve, duration));

const initUserInterface = async (): Promise<void> => {
	const loader = loading('Authenticating user...');

	const cachedAuth = globalThis.cache?.auth;
	globalThis.auth = cachedAuth ?? { ...defaultAuthState };

	const hasTokens = Boolean(globalThis.auth.accessToken && globalThis.auth.refreshToken);

	if (!hasTokens) {
		const response = await api.auth.getLoginLink();

		await sleep(2000);

		const successLink = 'link' in response ? response.link : undefined;
		const isSuccess = response.status === true && Boolean(successLink);

		if (!isSuccess) {
			const errorMessage = response.message
				?? 'Failed to get login link from server. Please check your internet connection or try again later.';
			loader.error(errorMessage);
			return;
		}

		process.stdout.write('\x1B[1A\x1B[2K');

		console.log('');
		console.log(chalk.red('  Authentication required'));
		console.log('');
		console.log(`  ${chalk.dim('›')} Open your browser and visit:`);
		console.log('');
		console.log(`    ${chalk.cyan.bold(successLink)}`);
		console.log('');
		console.log('');

		loader.update('Waiting for authentication...', { color: 'gray' });
		return;
	}

	loader.done('User already authenticated.');
};

export default initUserInterface;
