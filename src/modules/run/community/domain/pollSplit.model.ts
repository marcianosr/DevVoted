export type PollSplit = {
	readonly percentByOptionId: Readonly<Record<string, number>>;
	readonly answeredCount?: number;
};

const percentOf = (part: number, total: number): number =>
	total === 0 ? 0 : Math.round((part / total) * 100);

export const toPollSplit = (
	record: {
		readonly answeredCount: number;
		readonly picksByOptionId: Readonly<Record<number, number>>;
	},
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
