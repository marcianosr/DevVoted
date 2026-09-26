import { useQuery } from "@tanstack/react-query";

import {
	PollDetail as PollDetailUI,
	PollDetailError,
	PollDetailLoading,
} from "~/modules/polls/authoring/presentation/PollDetail.ui";
import { getPollByIdWithOptions } from "~/modules/polls/poll/application/poll.serverfn";
import { pollQueryKeys } from "~/shared/queryKeys";

type PollDetailProps = {
	pollId: number;
};

export const PollDetail = ({ pollId }: PollDetailProps) => {
	const { data, isLoading, error } = useQuery({
		queryKey: pollQueryKeys.detail(pollId),
		queryFn: async () => {
			const response = await getPollByIdWithOptions({ data: { id: pollId } });
			if (!response.success) throw new Error(response.error);
			return { ...response.data, isAdmin: response.isAdmin };
		},
		retry: false,
	});

	if (isLoading) return <PollDetailLoading />;
	if (error || !data) {
		return <PollDetailError message={error?.message ?? "Poll not found"} />;
	}

	return (
		<PollDetailUI
			id={data.poll.id}
			question={data.poll.question}
			status={data.poll.status}
			categoryCode={data.poll.categoryCode}
			createdAt={new Date(data.poll.createdAt)}
			createdBy={data.poll.createdBy}
			codeBlock={data.poll.codeBlock}
			codeSandboxExample={data.poll.codeSandboxExample}
			options={data.options}
			isAdmin={data.isAdmin}
		/>
	);
};
