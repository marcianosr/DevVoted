export type PollSplitTally = {
	readonly answeredCount: number;
	readonly picksByOptionId: Readonly<Record<number, number>>;
};

export type PollSplit = {
	readonly percentByOptionId: Readonly<Record<string, number>>;
	readonly answeredCount?: number;
};

type OptionTally = {
	readonly optionId: string;
	readonly picks: number;
};

const MAJORITY_SHARE = 0.5;

const percentOf = (part: number, total: number): number =>
	total === 0 ? 0 : Math.round((part / total) * 100);

export const toPollSplit = (
	record: PollSplitTally,
	options: { readonly withSampleSize: boolean }
): PollSplit => ({
	percentByOptionId: Object.fromEntries(
		Object.entries(record.picksByOptionId).map(([optionId, picks]) => [
			optionId,
			percentOf(picks, record.answeredCount),
		])
	),
	...(options.withSampleSize ? { answeredCount: record.answeredCount } : {}),
});

const byIdAsNumber = (one: string, other: string): number =>
	Number(one) - Number(other);

const stillOffered =
	(optionIds: readonly string[]) =>
	({ optionId }: OptionTally): boolean =>
		optionIds.includes(optionId);

const pickedByMostAnswerers =
	(answeredCount: number) =>
	({ picks }: OptionTally): boolean =>
		picks > answeredCount * MAJORITY_SHARE;

const mostPicked = (leader: OptionTally, next: OptionTally): OptionTally => {
	if (next.picks > leader.picks) return next;
	if (next.picks < leader.picks) return leader;
	return Number(next.optionId) < Number(leader.optionId) ? next : leader;
};

export const crowdPickFor = (
	tally: PollSplitTally,
	optionIds: readonly string[]
): readonly string[] => {
	const offered = Object.entries(tally.picksByOptionId)
		.map(([optionId, picks]) => ({ optionId, picks }))
		.filter(stillOffered(optionIds));

	if (offered.length === 0) return [];

	const majority = offered.filter(pickedByMostAnswerers(tally.answeredCount));
	if (majority.length > 0)
		return majority.map(({ optionId }) => optionId).sort(byIdAsNumber);

	return [offered.reduce(mostPicked).optionId];
};
