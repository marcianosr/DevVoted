import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { finishRunFn } from "~/domains/runs/api/runs";
import { runQueryKeys } from "~/shared/queryKeys";

type UseFinishRunOptions = {
	userId: string | undefined;
};

// Ends the active legacy run from the nav's "End Run" item. Its old wrap-up
// screen retired with the /old routes (DVTD-7q8l), so the player lands home.
export const useFinishRun = ({ userId }: UseFinishRunOptions) => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async () => {
			const result = await finishRunFn();
			if (!result.success) throw new Error(result.error);
			return result;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: runQueryKeys.active(userId) });
			navigate({ to: "/" });
		},
	});
};
