import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import {
	APPROVED_POLL_REWARD,
	EMPTY_FILTER,
	PAGE_SIZE,
	activeFiltersOf,
	withoutFilter,
	pollListChoicesOf,
	pollListFilterOf,
	pollListQueryOf,
	pollListSearchOf,
	pollRowsOf,
	searchOfFilter,
	visiblePollsOf,
	windowOf,
	yesterdaysRowsOf,
	type PollListFilter,
} from "~/modules/polls/authoring/application/pollList.viewmodel";
import {
	PollList as PollListUI,
	PollListError,
	PollListLoading,
} from "~/modules/polls/authoring/presentation/PollList.ui";
import {
	getPollCreators,
	getPollList,
} from "~/modules/polls/poll/application/poll.serverfn";
import { useApiQuery } from "~/shared/hooks/useApiQuery.hook";
import { SUGGEST_POLL_PATH } from "~/shared/lib/pollPath";
import { pollQueryKeys } from "~/shared/queryKeys";

type PollListProps = {
	search: Record<string, unknown>;
};

export const PollList = ({ search }: PollListProps) => {
	const navigate = useNavigate();
	const filter = pollListFilterOf(pollListSearchOf(search));
	const [shown, setShown] = useState(PAGE_SIZE);

	const list = useApiQuery({
		queryKey: pollQueryKeys.authored(),
		queryFn: () => getPollList(),
	});
	const canAdminister = list.view?.canAdminister ?? false;

	const creators = useApiQuery({
		queryKey: pollQueryKeys.creators(),
		queryFn: () => getPollCreators(),
		enabled: canAdminister,
	});

	if (list.isPending) return <PollListLoading />;
	if (!list.view) {
		return <PollListError message={list.errorMessage ?? "Polls not found"} />;
	}

	const all = list.view.polls;
	const deals = new Map(
		list.view.deals.map((deal) => [deal.pollId, deal.times])
	);
	const known = canAdminister ? (creators.view ?? undefined) : undefined;
	const page = windowOf(
		pollRowsOf(
			visiblePollsOf(all, filter, deals),
			known,
			deals,
			pollListQueryOf(filter)
		),
		shown
	);
	const choices = pollListChoicesOf(all, filter, known, deals);

	const changeFilter = (next: PollListFilter) => {
		void navigate({
			to: "/polls",
			search: searchOfFilter(next),
			replace: true,
		});
		setShown(PAGE_SIZE);
	};

	return (
		<PollListUI
			admin={canAdminister}
			reward={APPROVED_POLL_REWARD}
			total={all.length}
			matching={page.total}
			shown={page.shown}
			rows={page.rows}
			yesterday={yesterdaysRowsOf(all, list.view.yesterday, known, deals)}
			filter={filter}
			choices={choices}
			activeFilters={activeFiltersOf(filter, choices)}
			onClearFilter={(key) => changeFilter(withoutFilter(filter, key))}
			onClearAll={() => changeFilter(EMPTY_FILTER)}
			suggestHref={SUGGEST_POLL_PATH}
			onFilterChange={changeFilter}
			onLoadMore={page.more ? () => setShown(shown + PAGE_SIZE) : undefined}
		/>
	);
};
