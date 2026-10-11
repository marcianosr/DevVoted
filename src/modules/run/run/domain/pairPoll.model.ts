import { PAIR_SIZE } from "~/shared/lib/answerTypes";

type PairTile<Id> = { readonly id: Id; readonly group?: number };

type PairPoll<Id> = { readonly options: readonly PairTile<Id>[] };

export type PairSide = "left" | "right";

export type PairLink = readonly [left: string, right: string];

const pairIndexesOf = <Id>(poll: PairPoll<Id>): readonly number[] => [
	...new Set(
		poll.options.flatMap((option) =>
			option.group === undefined ? [] : [option.group]
		)
	),
];

const pairCountOf = <Id>(poll: PairPoll<Id>): number =>
	pairIndexesOf(poll).length;

const payingPairsOf = <Id>(poll: PairPoll<Id>): number => pairCountOf(poll) - 1;

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

const runsLeftToRight = (
	poll: PairPoll<string>,
	[left, right]: PairLink
): boolean => sideOf(poll, left) === "left" && sideOf(poll, right) === "right";

const isFullMatching = (
	poll: PairPoll<string>,
	links: readonly PairLink[]
): boolean =>
	links.length === pairCountOf(poll) &&
	new Set(links.flat()).size === links.length * PAIR_SIZE &&
	links.every((link) => runsLeftToRight(poll, link));

const joinsAPair = (poll: PairPoll<string>, [left, right]: PairLink) =>
	pairOf(poll, left) === pairOf(poll, right);

export const checkedPairsOf = (
	poll: PairPoll<string>,
	links: readonly PairLink[]
): readonly string[] | undefined =>
	isFullMatching(poll, links)
		? links.filter((link) => joinsAPair(poll, link)).flat()
		: undefined;

export const pairShareOf = <Id>(
	poll: PairPoll<Id>,
	optionIds: Iterable<Id>
): number => {
	const paying = payingPairsOf(poll);
	return (
		Math.min(matchedPairsOf(poll, new Set(optionIds)).length, paying) / paying
	);
};

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
	readonly linked?: string;
};

const labelOf = (poll: LabelledPairs, id: string | undefined): string =>
	poll.options.find((option) => option.id === id)?.label ?? "";

const linkedRightOf = (
	links: readonly PairLink[],
	left: string | undefined
): string | undefined => links.find(([from]) => from === left)?.[1];

export const answeredPairsOf = (
	poll: LabelledPairs,
	picked: readonly string[],
	links: readonly PairLink[] = []
): readonly AnsweredPair[] => {
	const matched = matchedPairsOf(poll, new Set(picked));
	return pairIndexesOf(poll).map((pair) => {
		const [left, right] = tilesIn(poll, pair);
		const linked = linkedRightOf(links, left);
		return {
			left: labelOf(poll, left),
			right: labelOf(poll, right),
			matched: matched.includes(pair),
			...(linked === undefined ? {} : { linked: labelOf(poll, linked) }),
		};
	});
};
