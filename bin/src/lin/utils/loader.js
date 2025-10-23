import cliSpinners from 'cli-spinners';
import logUpdate from 'log-update';
import chalk from 'chalk';

const DEFAULT_CONFIG = {
	spinner: cliSpinners.dots,
	clearOnEnd: false,
};

const loading = (message, options) => {
	if (!message) {
		throw new Error('Loading message is required');
	}

	let intervalId;
	let messageQueue = [];
	let currentMessage = message;
	let lastMessageTime = Date.now();
	let shouldStop = false;
	let finalIcon = null;
	let color = "white";
	const MIN_DISPLAY_TIME = 250;

	const spinner = options?.spinner || DEFAULT_CONFIG.spinner;
	const clearOnEnd = options?.clearOnEnd !== undefined ? options.clearOnEnd : DEFAULT_CONFIG.clearOnEnd;

	const processQueue = () => {
		const now = Date.now();
		const elapsed = now - lastMessageTime;

		if (messageQueue.length > 0 && elapsed >= MIN_DISPLAY_TIME) {
			currentMessage = messageQueue.shift();
			lastMessageTime = now;
		}

		if (shouldStop && messageQueue.length === 0 && elapsed >= MIN_DISPLAY_TIME) {
			clearInterval(intervalId);
			if (finalIcon) {
				logUpdate(`${finalIcon}  ${currentMessage}`.trim());
			}
			if (clearOnEnd) {
				logUpdate.clear();
			} else {
				logUpdate.done(); // Appeler done() seulement si on ne clear pas
			}
		}
	};

	const start = () => {
		const { interval, frames } = spinner;
		let index = 0;

		intervalId = setInterval(() => {
			if (!shouldStop || messageQueue.length > 0) { // Ne pas afficher le spinner si on doit s'arrêter
				logUpdate(`${chalk.gray(frames[(index = ++index % frames.length)])}  ${chalk[color](currentMessage)}`.trim());
			}
			processQueue();
		}, interval);
	};


	const done = (message) => {
		if (message) messageQueue.push(message);
		finalIcon = chalk.green('✓');
		shouldStop = true;
	};

	const error = (message) => {
		if (message) messageQueue.push(message);
		finalIcon = chalk.red('✗');
		color = 'red';
		shouldStop = true;
		process.exitCode = 1;
	};

	const update = (newMessage, options) => {
		messageQueue.push(newMessage);

		color = 'white';
		if (options?.color) {
			color = options.color;
			currentMessage = chalk[options.color](newMessage);
		} 
	};

	start();

	return { start, stop: done, done, error, update };
};

export default loading;