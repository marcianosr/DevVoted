import deepmerge from "deepmerge";
import { PartialDeep } from "type-fest";

type CreateMockData<T> = (overrides?: PartialDeep<T>) => T;

/**
 * Creates a reusable function to generate mock data for any domain model.
 *
 * @template T - The type of the domain model response.
 * @param {T} initialResponseData - The initial default data for the domain model.
 * @returns {CreateMockData<T>} A function that takes optional overrides and returns merged mock data.
 */
export const createMockDataFactory = <T>(
	initialResponseData: T
): CreateMockData<T> => {
	return (overrides?: PartialDeep<T>): T =>
		deepmerge<T>(initialResponseData, (overrides ?? {}) as Partial<T>, {
			arrayMerge: (_, sourceArray) => sourceArray,
		}) as T;
};
