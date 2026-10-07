import {
	neighboursOf,
	pollListQueryOf,
	pollStepOf,
	visiblePollsOf,
	type PollListFilter,
	type PollScreen,
	type PollStep,
} from "~/modules/polls/authoring/application/pollList.viewmodel";
import { getPollList } from "~/modules/polls/poll/application/poll.serverfn";
import { useApiQuery } from "~/shared/hooks/useApiQuery.hook";
import { pollQueryKeys } from "~/shared/queryKeys";

export const usePollStep = (
	pollId: number,
	filter: PollListFilter,
	screen: PollScreen
): PollStep | undefined => {
	const list = useApiQuery({
		queryKey: pollQueryKeys.authored(),
		queryFn: () => getPollList(),
	});
	if (!list.view) return undefined;

	const deals = new Map(
		list.view.deals.map((deal) => [deal.pollId, deal.times])
	);
	const neighbours = neighboursOf(
		visiblePollsOf(list.view.polls, filter, deals),
		pollId
	);
	return neighbours === undefined
		? undefined
		: pollStepOf(neighbours, pollListQueryOf(filter), screen);
};
