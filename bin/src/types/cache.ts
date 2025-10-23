export interface AuthState {
	accessToken: string | null;
	refreshToken: string | null;
	expiry: number | null;
	identifier: string | null;
	endpoint: string | null;
}

export interface PortsConfig {
	https: number;
	http: number;
	socks5: number;
}

export interface ConfigState {
	ports: PortsConfig;
}

export interface CacheStore {
	__dir: string;
	__machineId: string;
	auth?: AuthState;
	config?: ConfigState;
	[key: string]: unknown;
}
