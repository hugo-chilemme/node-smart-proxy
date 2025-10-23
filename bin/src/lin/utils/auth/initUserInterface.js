import loading from '../../utils/loader.js';
import fs from 'fs';
import chalk from 'chalk';
import api from '../../api/index.js';


global.auth = {};
async function initUserInterface() {
	const loader = loading("Authentificating user...");

	try {
		auth = cache.auth;


	} catch (error) {
		auth = authTemplate;
	}



	if (!auth.accessToken || !auth.refreshToken) {

		const { status, link } = await api.auth.getLoginLink();
		
		await new Promise(resolve => setTimeout(resolve, 2000)); // simulate waiting for user to login

		if (!status) {
			return loader.error("Failed to get login link from server. Please check your internet connection or try again later.");
		}

		
		
		// delete last line of console
		process.stdout.write('\x1B[1A\x1B[2K');
		
		console.log("");
		console.log(chalk.red("  Authentication required"));
		console.log("");
		console.log(`  ${chalk.dim("›")} Open your browser and visit:`);
		console.log("");
		console.log(`    ${chalk.cyan.bold(link)}`);
		console.log("");
		console.log("");

		loader.update("Waiting for authentication...", { color: 'gray' });
	}
	
}

export default initUserInterface;