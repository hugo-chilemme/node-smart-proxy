
const BASE_URL = 'https://smartproxy.hugochilemme.com/api/v1/';

export default function controller(route, method = "POST", params = {})
{

	params.machineId = cache.__machineId || null;

	if (!cache.__machineId) {
		return {
			error: true,
			message: "Machine ID not set in cache.",
		}
	}

	return fetch(`${BASE_URL}${route}`, {
		method: method,
		headers: {
			'Content-Type': 'application/json;charset=UTF-8'
		},
		body: JSON.stringify(params)
	})
	.then(response => {
		if (response.ok) {
			return response.json();
		}
		return {
			status: false,
			message: `HTTP Error: ${response.status}`
		}
	})
	.catch(error => {
		return {
			status: false,
			message: error.message
		};
	});
}
