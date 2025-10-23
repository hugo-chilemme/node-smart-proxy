import getLoginLink, { type LoginLinkResponse } from './auth/getLoginLink.js';

export interface AuthApi {
	getLoginLink: () => Promise<LoginLinkResponse>;
}

export interface Api {
	auth: AuthApi;
}

const api: Api = {
	auth: {
		getLoginLink,
	},
};

export default api;
