import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import {
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
	getUserPollsOrAll,
} from "~/modules/polls/poll/application/poll.serverfn";
import { SUGGEST_POLL_PATH } from "~/shared/lib/pollPath";
import { pollQueryKeys } from "~/shared/queryKeys";

export const PollList = () => {
	const [filter, setFilter] = useState<PollListFilter>(EMPTY_FILTER);
	const [shown, setShown] = useState(PAGE_SIZE);

	const polls = useQuery({
		queryKey: pollQueryKeys.authored(),
		queryFn: () => getUserPollsOrAll(),
	});

	const isAdmin = polls.data?.isAdmin ?? false;

	const creators = useQuery({
		queryKey: pollQueryKeys.creators(),
		queryFn: () => getPollCreators(),
		enabled: isAdmin,
	});

	if (polls.isLoading) return <PollListLoading />;
	if (polls.error || !polls.data?.success) {
		return (
			<PollListError
				message={
					polls.data?.success === false ? polls.data.error : String(polls.error)
				}
			/>
		);
	}

	const all = polls.data.data;
	const known =
		isAdmin && creators.data?.success ? creators.data.data : undefined;
	const page = windowOf(pollRowsOf(visiblePollsOf(all, filter), known), shown);

	const changeFilter = (next: PollListFilter) => {
		setFilter(next);
		setShown(PAGE_SIZE);
	};

	return (
		<PollListUI
			admin={isAdmin}
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
