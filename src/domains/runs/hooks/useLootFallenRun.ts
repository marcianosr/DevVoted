import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";

import { lootFallenRunFn } from "~/domains/runs/api/runs";

export const useLootFallenRun = () => {
	const router = useRouter();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (runId: number) => {
			const result = await lootFallenRunFn({ data: { runId } });
			if (!result.success) throw new Error(result.error);
			return result.data;
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["communityStats"] });
			router.invalidate();
		},
	});
};
