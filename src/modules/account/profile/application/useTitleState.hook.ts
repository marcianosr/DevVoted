import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	getTitleState,
	removeTitle,
	wearTitle,
} from "~/modules/account/profile/application/title.serverfn";
import { titleQueryKeys } from "~/shared/queryKeys";

export const useTitleState = (userId: string | undefined) =>
	useQuery({
		queryKey: titleQueryKeys.state(userId),
		queryFn: async () => {
			const response = await getTitleState();
			if (!response.success) throw new Error(response.error);
			return response.data;
		},
		enabled: !!userId,
	});

export type ToggleTitle = { titleId: string; worn: boolean };

export const useToggleTitle = (userId: string | undefined) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ titleId, worn }: ToggleTitle) => {
			const response = worn
				? await removeTitle({ data: { titleId } })
				: await wearTitle({ data: { titleId } });
			if (!response.success) throw new Error(response.error);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: titleQueryKeys.state(userId) });
		},
	});
};
