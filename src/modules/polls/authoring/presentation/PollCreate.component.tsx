import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { createPoll } from "~/modules/polls/authoring/application/authoring.serverfn";
import {
	PollForm,
	type PollFormData,
} from "~/modules/polls/authoring/presentation/PollForm.component";
import { PollFormPage } from "~/modules/polls/authoring/presentation/PollFormPage.ui";

const TITLE = "Create New Poll";

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
		<PollFormPage title={TITLE} error={create.error?.message}>
			<PollForm
				onSubmit={async (data) => {
					await create.mutateAsync(data);
				}}
				isSubmitting={create.isPending}
			/>
		</PollFormPage>
	);
};
