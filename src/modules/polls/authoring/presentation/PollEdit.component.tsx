import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useRouter } from "@tanstack/react-router";

import {
	hasPollAdminAccess,
	updatePoll,
} from "~/modules/polls/authoring/application/authoring.serverfn";
import {
	PollForm,
	type PollFormData,
} from "~/modules/polls/authoring/presentation/PollForm.component";
import { PollFormPage } from "~/modules/polls/authoring/presentation/PollFormPage.ui";
import {
	PollEditDenied,
	PollEditError,
	PollEditLoading,
} from "~/modules/polls/authoring/presentation/PollEdit.ui";
import { getPollByIdWithOptions } from "~/modules/polls/poll/application/poll.serverfn";
import { pollQueryKeys } from "~/shared/queryKeys";

const titleFor = (pollNumber: number | null, id: number) =>
	`Edit Poll #${pollNumber ?? id}`;

type PollEditProps = {
	pollId: number;
};

export const PollEdit = ({ pollId }: PollEditProps) => {
	const router = useRouter();
	const navigate = useNavigate();

	const access = useQuery({
		queryKey: pollQueryKeys.adminAccess(),
		queryFn: () => hasPollAdminAccess(),
	});

	const poll = useQuery({
		queryKey: pollQueryKeys.detail(pollId),
		queryFn: async () => {
			const response = await getPollByIdWithOptions({ data: { id: pollId } });
			if (!response.success) throw new Error(response.error);
			return response.data;
		},
		enabled: access.data?.hasAccess === true,
		retry: false,
	});

	const update = useMutation({
		mutationFn: async (data: PollFormData) => {
			const response = await updatePoll({ data: { id: pollId, ...data } });
			if (!response.success) throw new Error(response.error);
			return response.data;
		},
		onSuccess: async () => {
			await router.invalidate();
			navigate({ to: "/polls/$pollId", params: { pollId: String(pollId) } });
		},
	});

	if (access.isLoading) return <PollEditLoading />;
	if (!access.data?.hasAccess) return <PollEditDenied />;
	if (poll.isLoading) return <PollEditLoading />;
	if (poll.error || !poll.data) {
		return <PollEditError message={poll.error?.message ?? "Poll not found"} />;
	}

	return (
		<PollFormPage
			title={titleFor(poll.data.poll.pollNumber, poll.data.poll.id)}
			error={update.error?.message}
		>
			<PollForm
				initialData={{ ...poll.data.poll, options: poll.data.options }}
				onSubmit={async (data) => {
					await update.mutateAsync(data);
				}}
				isSubmitting={update.isPending}
				isAdmin
			/>
		</PollFormPage>
	);
};
