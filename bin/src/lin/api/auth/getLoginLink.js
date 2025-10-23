import controller from '../utils/controller.js';


export default function getLoginLink() {
	return controller('/auth/getLoginLink', 'GET');
}