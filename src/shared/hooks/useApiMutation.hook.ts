import { useMutation, type UseMutationOptions } from "@tanstack/react-query";

import { apiErrorMessageOf } from "~/shared/hooks/useApiQuery.hook";
import type { ApiResponse } from "~/shared/utils/errorHandling";

export const useApiMutation = <T, TVariables = void>(
	options: UseMutationOptions<ApiResponse<T>, Error, TVariables>
) => {
	const mutation = useMutation(options);

	return {
		...mutation,
		errorMessage: apiErrorMessageOf(mutation.data, mutation.error),
	};
};
