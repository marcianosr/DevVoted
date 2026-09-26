import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import {
	PollList as PollListUI,
	PollListError,
	PollListLoading,
	type FilterChoice,
} from "~/modules/polls/authoring/presentation/PollList.ui";
import {
	getPollCreators,
	getUserPollsOrAll,
} from "~/modules/polls/poll/application/poll.serverfn";
import {
	POLL_STATUSES,
	type Poll,
	type PollStatus,
} from "~/modules/polls/poll/domain/poll.model";
import { getCategories, type CategoryCode } from "~/shared/lib/categories";
import { pollQueryKeys } from "~/shared/queryKeys";

const ALL = "all";

type StatusFilter = PollStatus | typeof ALL;
type CategoryFilter = CategoryCode | typeof ALL;

const capitalise = (word: string) =>
	word.charAt(0).toUpperCase() + word.slice(1);

const STATUS_CHOICES: readonly FilterChoice<StatusFilter>[] = [
	{ value: ALL, label: "All" },
	...POLL_STATUSES.map((status) => ({
		value: status,
		label: capitalise(status),
	})),
];

const countByCategory = (polls: readonly Poll[]) =>
	polls.reduce<Record<string, number>>(
		(counts, poll) => ({
			...counts,
			[poll.categoryCode]: (counts[poll.categoryCode] ?? 0) + 1,
		}),
		{}
	);

export const PollList = () => {
	const [statusFilter, setStatusFilter] = useState<StatusFilter>(ALL);
	const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>(ALL);
	const [creatorFilter, setCreatorFilter] = useState<string>(ALL);

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
	const counts = countByCategory(all);

	const categoryChoices: readonly FilterChoice<CategoryFilter>[] = [
		{ value: ALL, label: "All", count: all.length },
		...getCategories().map((category) => ({
			value: category.code,
			label: category.name,
			count: counts[category.code] ?? 0,
		})),
	];

	const creatorChoices: readonly FilterChoice<string>[] = [
		{ value: ALL, label: "All" },
		...(creators.data?.success ? creators.data.data : []).map((creator) => ({
			value: creator.id,
			label: creator.displayName,
		})),
	];

	const visible = all.filter(
		(poll) =>
			(statusFilter === ALL || poll.status === statusFilter) &&
			(categoryFilter === ALL || poll.categoryCode === categoryFilter) &&
			(creatorFilter === ALL || poll.createdBy === creatorFilter)
	);

	return (
		<PollListUI
			polls={visible}
			total={all.length}
			isAdmin={isAdmin}
			statusChoices={STATUS_CHOICES}
			statusFilter={statusFilter}
			categoryChoices={categoryChoices}
			categoryFilter={categoryFilter}
			creatorChoices={creatorChoices}
			creatorFilter={creatorFilter}
			onStatusChange={setStatusFilter}
			onCategoryChange={setCategoryFilter}
			onCreatorChange={setCreatorFilter}
		/>
	);
};
