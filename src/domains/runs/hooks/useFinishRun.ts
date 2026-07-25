import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { finishRunFn } from "~/domains/runs/api/runs";
import { runQueryKeys } from "~/domains/shared/queryKeys";

type UseFinishRunOptions = {
	userId: string | undefined;
	redirectTo: "/old/start" | "/old/game-over";
};

// Shared mutation for ending the active run. Used by both the /game-over
// "Start New Run" button and the profile dropdown "End Run" item. The redirect
// target differs by call site — game-over sends the player back to /start
// (they were already on the wrap-up screen), while dropdown End Run sends them
// to /game-over so they can see the wrap-up they just earned.
export const useFinishRun = ({ userId, redirectTo }: UseFinishRunOptions) => {
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
			navigate({ to: redirectTo });
		},
	});
};
