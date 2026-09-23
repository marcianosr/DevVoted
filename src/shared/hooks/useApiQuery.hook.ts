import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import type { ApiResponse } from "~/shared/utils/errorHandling";

export type ApiQueryResult<T> = {
	readonly view: T | null;
	readonly isPending: boolean;
	readonly errorMessage: string | null;
};

/**
 * Flattens a server function's `ApiResponse<T>` into the shape screens read.
 *
 * A rejected query and a handled failure both leave `view` null, and so does a
 * genuinely empty result — three states that read as opposite things to a
 * player: "nothing here yet" versus "this broke". Folding both failure modes
 * into one `errorMessage` is what lets a caller tell them apart, so a null view
 * is a real answer rather than a guess.
 */
export const useApiQuery = <T>(
	options: UseQueryOptions<ApiResponse<T>, Error>
): ApiQueryResult<T> => {
	const query = useQuery(options);

	const response = query.data;
	const view: T | null = response?.success === true ? response.data : null;
	const errorMessage =
		response?.success === false
			? response.error
			: (query.error?.message ?? null);

	return { view, isPending: query.isPending, errorMessage };
};
