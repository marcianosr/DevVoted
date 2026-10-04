import { useState } from "react";

import {
	APPROVED_POLL_REWARD,
	EMPTY_FILTER,
	PAGE_SIZE,
	pollListChoicesOf,
	pollRowsOf,
	visiblePollsOf,
	windowOf,
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

export const PollList = () => {
	const [filter, setFilter] = useState<PollListFilter>(EMPTY_FILTER);
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
	const known = canAdminister ? (creators.view ?? undefined) : undefined;
	const page = windowOf(pollRowsOf(visiblePollsOf(all, filter), known), shown);

	const changeFilter = (next: PollListFilter) => {
		setFilter(next);
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
			filter={filter}
			choices={pollListChoicesOf(all, filter, known)}
			suggestHref={SUGGEST_POLL_PATH}
			onFilterChange={changeFilter}
			onLoadMore={page.more ? () => setShown(shown + PAGE_SIZE) : undefined}
		/>
	);
};
