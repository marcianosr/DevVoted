import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { createPoll } from "~/modules/polls/authoring/application/authoring.serverfn";
import type { PollFormData } from "~/modules/polls/authoring/application/pollForm.viewmodel";
import { PollForm } from "~/modules/polls/authoring/presentation/PollForm.component";

export const PollCreate = () => {
	const navigate = useNavigate();

	const create = useMutation({
		mutationFn: async (data: PollFormData) => {
			const response = await createPoll({ data });
			if (!response.success) throw new Error(response.error);
			return response.data;
		},
		onSuccess: (poll) => {
			navigate({ to: "/polls/$pollId", params: { pollId: String(poll.id) } });
		},
	});

	return (
		<PollForm
			mode="suggest"
			error={create.error?.message}
			submitting={create.isPending}
			onSubmit={(data) => create.mutate(data)}
		/>
	);
};
