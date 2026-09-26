import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import type { ApiResponse } from "~/shared/utils/errorHandling";

export type ApiQueryResult<T> = {
	readonly view: T | null;
	readonly isPending: boolean;
	readonly errorMessage: string | null;
};

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
