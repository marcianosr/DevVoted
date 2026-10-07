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
	readonly submitAndNext?: (data: PollFormData) => void;
	readonly submitting: boolean;
	readonly error: string | undefined;
};

type PollSave = { data: PollFormData; reviewed: boolean };

const savePoll = (pollId: number | undefined, { data, reviewed }: PollSave) =>
	pollId === undefined
		? createPoll({ data })
		: updatePoll({ data: { id: pollId, ...data, reviewed } });

export const usePollAuthoring = (
	pollId?: number,
	afterReview?: string
): PollAuthoring => {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const save = useApiMutation({
		mutationFn: (request: PollSave) => savePoll(pollId, request),
		onSuccess: async (result, { reviewed }) => {
			if (!result.success) return;
			await queryClient.invalidateQueries({ queryKey: pollQueryKeys.all });
			if (reviewed && afterReview !== undefined) {
				await navigate({ href: afterReview });
				return;
			}
			await navigate({
				to: "/polls/$pollId",
				params: { pollId: String(result.data.id) },
			});
		},
	});

	return {
		submit: (data) => save.mutate({ data, reviewed: false }),
		...(afterReview === undefined
			? {}
			: { submitAndNext: (data) => save.mutate({ data, reviewed: true }) }),
		submitting: save.isPending,
		error: save.errorMessage ?? undefined,
	};
};
