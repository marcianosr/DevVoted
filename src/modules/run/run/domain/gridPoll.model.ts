import { GRID_GROUP_SIZE, GRID_GROUPS } from "~/shared/lib/answerTypes";

type GridTile<Id> = { readonly id: Id; readonly group?: number };

type GridPoll<Id> = { readonly options: readonly GridTile<Id>[] };

export type GroupLock =
	| { readonly kind: "solved"; readonly group: number }
	| { readonly kind: "wrong" };

const groupsOf = <Id>(poll: GridPoll<Id>): readonly number[] => [
	...new Set(
		poll.options.flatMap((option) =>
			option.group === undefined ? [] : [option.group]
		)
	),
];

const tilesIn = <Id>(poll: GridPoll<Id>, group: number): readonly Id[] =>
	poll.options
		.filter((option) => option.group === group)
		.map((option) => option.id);

const isLockable = <Id>(
	poll: GridPoll<Id>,
	locked: readonly Id[],
	optionIds: readonly Id[]
): boolean =>
	optionIds.length === GRID_GROUP_SIZE &&
	new Set(optionIds).size === GRID_GROUP_SIZE &&
	optionIds.every(
		(id) =>
			!locked.includes(id) && poll.options.some((option) => option.id === id)
	);

export const lockInGroup = <Id>(
	poll: GridPoll<Id>,
	locked: readonly Id[],
	optionIds: readonly Id[]
): GroupLock | undefined => {
	if (!isLockable(poll, locked, optionIds)) return undefined;
	const groups = new Set(
		poll.options
			.filter((option) => optionIds.includes(option.id))
			.map((option) => option.group)
	);
	const [group] = groups;
	return groups.size === 1 && group !== undefined
		? { kind: "solved", group }
		: { kind: "wrong" };
};

export const lockFinishesGrid = <Id>(
	locked: readonly Id[],
	lock: GroupLock
): boolean =>
	lock.kind === "wrong" ||
	locked.length / GRID_GROUP_SIZE + 1 >= GRID_GROUPS - 1;

export const solvedGroupsOf = <Id>(
	poll: GridPoll<Id>,
	picked: ReadonlySet<Id>
): readonly number[] =>
	groupsOf(poll).filter((group) =>
		tilesIn(poll, group).every((id) => picked.has(id))
	);

export const gridShareOf = <Id>(
	poll: GridPoll<Id>,
	optionIds: Iterable<Id>
): number => solvedGroupsOf(poll, new Set(optionIds)).length / GRID_GROUPS;

type LabelledGrid = {
	readonly options: readonly {
		readonly id: string;
		readonly label: string;
		readonly group?: number;
	}[];
	readonly groupLabels?: readonly string[];
};

export type GridGroup = {
	readonly label: string;
	readonly tiles: readonly { readonly id: string; readonly label: string }[];
	readonly solved: boolean;
};

export const gridGroupsOf = (
	poll: LabelledGrid,
	picked: readonly string[]
): readonly GridGroup[] => {
	const solved = solvedGroupsOf(poll, new Set(picked));
	return groupsOf(poll).map((group) => ({
		label: poll.groupLabels?.[group] ?? "",
		tiles: poll.options
			.filter((option) => option.group === group)
			.map(({ id, label }) => ({ id, label })),
		solved: solved.includes(group),
	}));
};
