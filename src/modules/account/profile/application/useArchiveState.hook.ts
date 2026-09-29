import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	equipBorder,
	equipSwatch,
	getArchiveState,
	purchaseBorder,
} from "~/modules/account/profile/application/archive.serverfn";
import { archiveQueryKeys, userQueryKeys } from "~/shared/queryKeys";

export const useArchiveState = (userId: string | undefined) =>
	useQuery({
		queryKey: archiveQueryKeys.state(userId),
		queryFn: async () => {
			const response = await getArchiveState();
			if (!response.success) throw new Error(response.error);
			return response.data;
		},
		enabled: !!userId,
	});

export const usePurchaseBorder = (userId: string | undefined) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (borderId: string) => {
			const response = await purchaseBorder({ data: { borderId } });
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
			const response = await equipBorder({ data: { borderId } });
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

export const useEquipSwatch = (userId: string | undefined) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (swatchId: string | null) => {
			const response = await equipSwatch({ data: { swatchId } });
			if (!response.success) throw new Error(response.error);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: archiveQueryKeys.state(userId),
			});
			queryClient.invalidateQueries({
				queryKey: userQueryKeys.profile(userId ?? ""),
			});
		},
	});
};
