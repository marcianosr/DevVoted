import { PAIR_SIZE, PAIRS } from "~/shared/lib/answerTypes";

type PairTile<Id> = { readonly id: Id; readonly group?: number };

type PairPoll<Id> = { readonly options: readonly PairTile<Id>[] };

export type PairSide = "left" | "right";

export type PairsProgress = {
	readonly matched: readonly string[];
	readonly missed: readonly number[];
};

export const NO_PAIRS_RESOLVED: PairsProgress = { matched: [], missed: [] };

export type PairMatch =
	| { readonly kind: "matched"; readonly pair: number }
	| { readonly kind: "missed"; readonly pair: number };

const PAYING_PAIRS = PAIRS - 1;

const pairIndexesOf = <Id>(poll: PairPoll<Id>): readonly number[] => [
	...new Set(
		poll.options.flatMap((option) =>
			option.group === undefined ? [] : [option.group]
		)
	),
];

const tilesIn = <Id>(poll: PairPoll<Id>, pair: number): readonly Id[] =>
	poll.options
		.filter((option) => option.group === pair)
		.map((option) => option.id);

const pairOf = <Id>(poll: PairPoll<Id>, id: Id): number | undefined =>
	poll.options.find((option) => option.id === id)?.group;

export const sideOf = <Id>(
	poll: PairPoll<Id>,
	id: Id
): PairSide | undefined => {
	const pair = pairOf(poll, id);
	if (pair === undefined) return undefined;
	return tilesIn(poll, pair)[0] === id ? "left" : "right";
};

const matchedPairsOf = <Id>(
	poll: PairPoll<Id>,
	picked: ReadonlySet<Id>
): readonly number[] =>
	pairIndexesOf(poll).filter((pair) =>
		tilesIn(poll, pair).every((id) => picked.has(id))
	);

const isResolved = (
	poll: PairPoll<string>,
	progress: PairsProgress,
	pair: number
): boolean =>
	progress.missed.includes(pair) ||
	matchedPairsOf(poll, new Set(progress.matched)).includes(pair);

const isMatchable = (
	poll: PairPoll<string>,
	progress: PairsProgress,
	[anchor, partner]: readonly string[]
): boolean => {
	const anchorPair = pairOf(poll, anchor);
	const partnerPair = pairOf(poll, partner);
	return (
		anchorPair !== undefined &&
		partnerPair !== undefined &&
		sideOf(poll, anchor) !== sideOf(poll, partner) &&
		!isResolved(poll, progress, anchorPair) &&
		!isResolved(poll, progress, partnerPair)
	);
};

export const matchPair = (
	poll: PairPoll<string>,
	progress: PairsProgress,
	optionIds: readonly string[]
): PairMatch | undefined => {
	if (optionIds.length !== PAIR_SIZE) return undefined;
	if (!isMatchable(poll, progress, optionIds)) return undefined;
	const [anchor, partner] = optionIds;
	const pair = pairOf(poll, anchor) ?? 0;
	return pairOf(poll, partner) === pair
		? { kind: "matched", pair }
		: { kind: "missed", pair };
};

export const pairsProgressAfter = (
	progress: PairsProgress,
	match: PairMatch,
	optionIds: readonly string[] = []
): PairsProgress =>
	match.kind === "matched"
		? { ...progress, matched: [...progress.matched, ...optionIds] }
		: { ...progress, missed: [...progress.missed, match.pair] };

export const pairsFinished = (progress: PairsProgress): boolean =>
	progress.matched.length / PAIR_SIZE + progress.missed.length >= PAYING_PAIRS;

export const pairShareOf = <Id>(
	poll: PairPoll<Id>,
	optionIds: Iterable<Id>
): number =>
	Math.min(matchedPairsOf(poll, new Set(optionIds)).length, PAYING_PAIRS) /
	PAYING_PAIRS;

type LabelledPairs = {
	readonly options: readonly {
		readonly id: string;
		readonly label: string;
		readonly group?: number;
	}[];
};

export type AnsweredPair = {
	readonly left: string;
	readonly right: string;
	readonly matched: boolean;
};

const labelOf = (poll: LabelledPairs, id: string | undefined): string =>
	poll.options.find((option) => option.id === id)?.label ?? "";

export const answeredPairsOf = (
	poll: LabelledPairs,
	picked: readonly string[]
): readonly AnsweredPair[] => {
	const matched = matchedPairsOf(poll, new Set(picked));
	return pairIndexesOf(poll).map((pair) => {
		const [left, right] = tilesIn(poll, pair);
		return {
			left: labelOf(poll, left),
			right: labelOf(poll, right),
			matched: matched.includes(pair),
		};
	});
};
