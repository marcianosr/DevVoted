import { useState } from "react";

import {
	type PollDetailView,
	pollDetailViewOf,
} from "~/modules/polls/authoring/application/pollDetail.viewmodel";
import {
	PollDetail as PollDetailUI,
	PollDetailError,
	PollDetailLoading,
} from "~/modules/polls/authoring/presentation/PollDetail.ui";
import { getPollCreators } from "~/modules/polls/poll/application/poll.serverfn";
import { usePollDetail } from "~/modules/polls/poll/application/usePollDetail.hook";
import { useApiQuery } from "~/shared/hooks/useApiQuery.hook";
import { pollQueryKeys } from "~/shared/queryKeys";

type PollDetailProps = {
	pollId: number;
};

export const PollDetail = ({ pollId }: PollDetailProps) => {
	const { view, isPending, errorMessage } = usePollDetail(pollId);
	const creators = useApiQuery({
		queryKey: pollQueryKeys.creators(),
		queryFn: () => getPollCreators(),
	});
	const [shown, setShown] = useState<PollDetailView>("player");

	if (isPending) return <PollDetailLoading />;
	if (!view) {
		return <PollDetailError message={errorMessage ?? "Poll not found"} />;
	}

	return (
		<PollDetailUI
			{...pollDetailViewOf(
				{ ...view.poll, createdAt: new Date(view.poll.createdAt) },
				view.options,
				creators.view ?? undefined,
				shown
			)}
			canEdit={view.canAdminister}
			view={shown}
			onView={setShown}
		/>
	);
};
