import chalk from 'chalk';
import cliSpinners from 'cli-spinners';
import logUpdate from 'log-update';

type SpinnerDefinition = {
	interval: number;
	frames: string[];
};

type ChalkColor = keyof typeof chalk;

export interface LoadingUpdateOptions {
	color?: ChalkColor;
}

export interface LoadingController {
	start: () => void;
	stop: (message?: string) => void;
	done: (message?: string) => void;
	error: (message?: string) => void;
	update: (message: string, options?: LoadingUpdateOptions) => void;
}

interface LoadingOptions {
	spinner?: SpinnerDefinition;
	clearOnEnd?: boolean;
}

const DEFAULT_CONFIG: Required<LoadingOptions> = {
	spinner: cliSpinners.dots,
	clearOnEnd: false,
};

const asChalkFunction = (color: ChalkColor): ((input: string) => string) | undefined => {
	const candidate = chalk[color];
	return typeof candidate === 'function' ? (candidate as (input: string) => string) : undefined;
};

const loading = (message: string, options?: LoadingOptions): LoadingController => {
	if (!message) {
		throw new Error('Loading message is required');
	}

	let intervalId: NodeJS.Timeout | undefined;
	const messageQueue: string[] = [];
	let currentMessage = message;
	let lastMessageTime = Date.now();
	let shouldStop = false;
	let finalIcon: string | null = null;
	let color: ChalkColor = 'white';
	const MIN_DISPLAY_TIME = 250;

	const spinner = options?.spinner ?? DEFAULT_CONFIG.spinner;
	const clearOnEnd = options?.clearOnEnd ?? DEFAULT_CONFIG.clearOnEnd;

	const processQueue = () => {
		const now = Date.now();
		const elapsed = now - lastMessageTime;

		if (messageQueue.length > 0 && elapsed >= MIN_DISPLAY_TIME) {
			const nextMessage = messageQueue.shift();
			if (nextMessage !== undefined) {
				currentMessage = nextMessage;
				lastMessageTime = now;
			}
		}

		if (shouldStop && messageQueue.length === 0 && elapsed >= MIN_DISPLAY_TIME) {
			if (intervalId) {
				clearInterval(intervalId);
			}
			if (finalIcon) {
				logUpdate(`${finalIcon}  ${currentMessage}`.trim());
			}
			if (clearOnEnd) {
				logUpdate.clear();
			} else {
				logUpdate.done();
			}
		}
	};

	const colorize = (text: string): string => {
		const colorFn = asChalkFunction(color);
		return colorFn ? colorFn(text) : text;
	};

	const start = () => {
		const { interval, frames } = spinner;
		let index = 0;

		intervalId = setInterval(() => {
			if (!shouldStop || messageQueue.length > 0) {
				const frame = frames[(index = ++index % frames.length)];
				logUpdate(`${chalk.gray(frame)}  ${colorize(currentMessage)}`.trim());
			}
			processQueue();
		}, interval);
	};

	const done = (successMessage?: string) => {
		if (successMessage) {
			messageQueue.push(successMessage);
		}
		finalIcon = chalk.green('✓');
		shouldStop = true;
	};

	const error = (errorMessage?: string) => {
		if (errorMessage) {
			messageQueue.push(errorMessage);
		}
		finalIcon = chalk.red('✗');
		color = 'red';
		shouldStop = true;
		process.exitCode = 1;
		processQueue();
	};

	const update = (newMessage: string, updateOptions?: LoadingUpdateOptions) => {
		messageQueue.push(newMessage);

		color = updateOptions?.color ?? 'white';
		const colorFn = updateOptions?.color ? asChalkFunction(updateOptions.color) : undefined;
		currentMessage = colorFn ? colorFn(newMessage) : newMessage;
	};

	start();

	return { start, stop: done, done, error, update };
};

export default loading;
