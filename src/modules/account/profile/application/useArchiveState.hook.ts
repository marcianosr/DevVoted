import { useQueryClient } from "@tanstack/react-query";

import {
	getArchiveState,
	purchaseBorder,
} from "~/modules/account/profile/application/archive.serverfn";
import { useApiMutation } from "~/shared/hooks/useApiMutation.hook";
import { useApiQuery } from "~/shared/hooks/useApiQuery.hook";
import { archiveQueryKeys } from "~/shared/queryKeys";

export const useArchiveState = (userId: string | undefined) =>
	useApiQuery({
		queryKey: archiveQueryKeys.state(userId),
		queryFn: () => getArchiveState(),
		enabled: !!userId,
	});

export const usePurchaseBorder = (userId: string | undefined) => {
	const queryClient = useQueryClient();
	return useApiMutation({
		mutationFn: (borderId: string) => purchaseBorder({ data: { borderId } }),
		onSuccess: (result) => {
			if (!result.success) return;
			queryClient.invalidateQueries({
				queryKey: archiveQueryKeys.state(userId),
			});
		},
	});
};
