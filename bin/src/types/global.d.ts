import type { AuthState, CacheStore } from './cache';

declare global {
	// eslint-disable-next-line no-var
	var cache: CacheStore;
	// eslint-disable-next-line no-var
	var auth: AuthState;
}

export {};
