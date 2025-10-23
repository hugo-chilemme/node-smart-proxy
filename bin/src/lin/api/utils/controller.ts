const BASE_URL = 'https://smartproxy.hugochilemme.com/api/v1/';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ControllerError {
	status: false;
	message: string;
	error?: true;
}

type ControllerParams = Record<string, unknown>;

export type ControllerResult<T> = T | ControllerError;

const controller = async <T = unknown>(
	route: string,
	method: HttpMethod = 'POST',
	params: ControllerParams = {}
): Promise<ControllerResult<T>> => {
	if (!globalThis.cache?.__machineId) {
		return {
			status: false,
			error: true,
			message: 'Machine ID not set in cache.',
		};
	}

	const payload: ControllerParams = {
		...params,
		machineId: globalThis.cache.__machineId ?? null,
	};

	try {
		const response = await fetch(`${BASE_URL}${route}`, {
			method,
			headers: {
				'Content-Type': 'application/json;charset=UTF-8',
			},
			body: method === 'GET' ? undefined : JSON.stringify(payload),
		});

		if (!response.ok) {
			return {
				status: false,
				message: `HTTP Error: ${response.status}`,
			};
		}

		return (await response.json()) as T;
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown error';
		return {
			status: false,
			message,
		};
	}
};

export default controller;
