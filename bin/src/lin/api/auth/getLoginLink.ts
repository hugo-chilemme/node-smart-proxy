import controller, { type ControllerResult } from '../utils/controller.js';

export interface LoginLinkResponse {
	status: boolean;
	link?: string;
	message?: string;
}

const getLoginLink = (): Promise<ControllerResult<LoginLinkResponse>> =>
	controller<LoginLinkResponse>('/auth/getLoginLink', 'GET');

export default getLoginLink;
