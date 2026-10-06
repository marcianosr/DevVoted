import { useQueryClient } from "@tanstack/react-query";

import { markPollReviewed } from "~/modules/polls/authoring/application/authoring.serverfn";
import { useApiMutation } from "~/shared/hooks/useApiMutation.hook";
import { pollQueryKeys } from "~/shared/queryKeys";

export type PollReview = {
	readonly review: () => void;
	readonly reviewing: boolean;
};

export const usePollReview = (pollId: number): PollReview => {
	const queryClient = useQueryClient();

	const mark = useApiMutation({
		mutationFn: () => markPollReviewed({ data: { id: pollId } }),
		onSuccess: async (result) => {
			if (!result.success) return;
			await queryClient.invalidateQueries({ queryKey: pollQueryKeys.all });
		},
	});

	return { review: () => mark.mutate(), reviewing: mark.isPending };
};
