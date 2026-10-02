import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import {
	createPoll,
	updatePoll,
} from "~/modules/polls/authoring/application/authoring.serverfn";
import type { PollFormData } from "~/modules/polls/authoring/application/pollForm.viewmodel";
import { useApiMutation } from "~/shared/hooks/useApiMutation.hook";
import { pollQueryKeys } from "~/shared/queryKeys";

export type PollAuthoring = {
	readonly submit: (data: PollFormData) => void;
	readonly submitting: boolean;
	readonly error: string | undefined;
};

const savePoll = (pollId: number | undefined, data: PollFormData) =>
	pollId === undefined
		? createPoll({ data })
		: updatePoll({ data: { id: pollId, ...data } });

export const usePollAuthoring = (pollId?: number): PollAuthoring => {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const save = useApiMutation({
		mutationFn: (data: PollFormData) => savePoll(pollId, data),
		onSuccess: async (result) => {
			if (!result.success) return;
			await queryClient.invalidateQueries({ queryKey: pollQueryKeys.all });
			await navigate({
				to: "/polls/$pollId",
				params: { pollId: String(result.data.id) },
			});
		},
	});

	return {
		submit: save.mutate,
		submitting: save.isPending,
		error: save.errorMessage ?? undefined,
	};
};
