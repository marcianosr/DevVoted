import { useState } from "react";

import {
	type PollDetailView,
	pollDetailViewOf,
} from "~/modules/polls/authoring/application/pollDetail.viewmodel";
import {
	pollListHrefOf,
	pollListFilterOf,
	pollListQueryOf,
	pollListSearchOf,
	pollScreenHrefOf,
} from "~/modules/polls/authoring/application/pollList.viewmodel";
import { usePollReview } from "~/modules/polls/authoring/application/usePollReview.hook";
import { usePollStep } from "~/modules/polls/authoring/application/usePollStep.hook";
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
	search: Record<string, unknown>;
};

export const PollDetail = ({ pollId, search }: PollDetailProps) => {
	const filter = pollListFilterOf(pollListSearchOf(search));
	const { view, isPending, errorMessage } = usePollDetail(pollId);
	const step = usePollStep(pollId, filter, "detail");
	const review = usePollReview(pollId);
	const query = pollListQueryOf(filter);
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
			editHref={pollScreenHrefOf(pollId, "edit", query)}
			listHref={pollListHrefOf(query)}
			step={step}
			onReview={
				view.canAdminister && !review.reviewing ? review.review : undefined
			}
			view={shown}
			onView={setShown}
		/>
	);
};
