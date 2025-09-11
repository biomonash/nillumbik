export function getLocalStorage<T>(key: string): T | null {
	const item = window.localStorage.getItem(key);
	return item ? (JSON.parse(item) as T) : null;
}

export function setLocalStorage<T>(key: string, value: T): void {
	window.localStorage.setItem(key, JSON.stringify(value));
}
