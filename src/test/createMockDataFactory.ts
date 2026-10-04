export const createMockDataFactory = <T extends object>(defaults: T) => {
	return (overrides: Partial<T> = {}): T => ({ ...defaults, ...overrides });
};
