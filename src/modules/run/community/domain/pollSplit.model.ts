/**
 * How the community answered one poll, as the answering screen draws it: a
 * percentage per option and — only once Telemetry is level 2 — the number of
 * answers those percentages stand on.
 *
 * The sample size is optional rather than always present because its absence is
 * the product being sold at level 1: with no denominator, a two-player 100% and
 * a hundred-player 100% are the same bar, and the player has to decide how much
 * to trust a number they cannot calibrate. Modelling it as "always send it, hide
 * it in the UI" would put the whole mechanic one devtools tab away.
 */
export type PollSplit = {
	/** Share of answerers per option id, 0–100. Absent options were never picked. */
	readonly percentByOptionId: Readonly<Record<string, number>>;
	readonly answeredCount?: number;
};

const percentOf = (part: number, total: number): number =>
	total === 0 ? 0 : Math.round((part / total) * 100);

/**
 * Percentages are shares of *answerers*, not of picks, so a multi-answer poll
 * sums past 100 — the same reading the community board takes of a finished poll,
 * which is what makes the two screens comparable.
 */
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
