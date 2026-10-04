import {
	PollDetail as PollDetailUI,
	PollDetailError,
	PollDetailLoading,
} from "~/modules/polls/authoring/presentation/PollDetail.ui";
import { usePollDetail } from "~/modules/polls/poll/application/usePollDetail.hook";

type PollDetailProps = {
	pollId: number;
};

export const PollDetail = ({ pollId }: PollDetailProps) => {
	const { view, isPending, errorMessage } = usePollDetail(pollId);

	if (isPending) return <PollDetailLoading />;
	if (!view) {
		return <PollDetailError message={errorMessage ?? "Poll not found"} />;
	}

	return (
		<PollDetailUI
			id={view.poll.id}
			question={view.poll.question}
			status={view.poll.status}
			categoryCode={view.poll.categoryCode}
			createdAt={new Date(view.poll.createdAt)}
			createdBy={view.poll.createdBy}
			codeBlock={view.poll.codeBlock}
			codeSandboxExample={view.poll.codeSandboxExample}
			options={view.options}
			isAdmin={view.canAdminister}
		/>
	);
};
