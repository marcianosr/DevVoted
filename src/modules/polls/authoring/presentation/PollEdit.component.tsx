import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useRouter } from "@tanstack/react-router";

import {
	hasPollAdminAccess,
	updatePoll,
} from "~/modules/polls/authoring/application/authoring.serverfn";
import {
	STATUS_CHOICES,
	pollFormStateOf,
	type PollFormData,
} from "~/modules/polls/authoring/application/pollForm.viewmodel";
import { PollForm } from "~/modules/polls/authoring/presentation/PollForm.component";
import {
	PollEditDenied,
	PollEditError,
	PollEditLoading,
} from "~/modules/polls/authoring/presentation/PollEdit.ui";
import { getPollByIdWithOptions } from "~/modules/polls/poll/application/poll.serverfn";
import { pollQueryKeys } from "~/shared/queryKeys";

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
		<PollForm
			mode="edit"
			pollNumber={poll.data.poll.pollNumber ?? undefined}
			initial={pollFormStateOf(poll.data.poll, poll.data.options)}
			statuses={STATUS_CHOICES}
			error={update.error?.message}
			submitting={update.isPending}
			onSubmit={(data) => update.mutate(data)}
		/>
	);
};
