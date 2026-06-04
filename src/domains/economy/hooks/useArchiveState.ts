import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	equipBorderServerFn,
	getArchiveStateServerFn,
	purchaseBorderServerFn,
} from "~/domains/economy/api/archive";
import { archiveQueryKeys } from "~/domains/shared/queryKeys";

export const useArchiveState = (userId: string | undefined) =>
	useQuery({
		queryKey: archiveQueryKeys.state(userId),
		queryFn: async () => {
			const response = await getArchiveStateServerFn();
			if (!response.success) throw new Error(response.error);
			return response.data;
		},
		enabled: !!userId,
	});

export const usePurchaseBorder = (userId: string | undefined) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (borderId: string) => {
			const response = await purchaseBorderServerFn({ data: { borderId } });
			if (!response.success) throw new Error(response.error);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: archiveQueryKeys.state(userId),
			});
		},
	});
};

export const useEquipBorder = (userId: string | undefined) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (borderId: string | null) => {
			const response = await equipBorderServerFn({ data: { borderId } });
			if (!response.success) throw new Error(response.error);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: archiveQueryKeys.state(userId),
			});
		},
	});
};
