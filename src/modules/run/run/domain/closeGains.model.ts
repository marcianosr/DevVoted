import { closesOf, type RunState } from "~/modules/run/run/domain/run.model";

export type RunGains = {
	readonly unlockedConfigIds: readonly string[];
	readonly earnedTitleIds: readonly string[];
};

export const closesAGate = (before: RunState, after: RunState): boolean =>
	closesOf(after).length > closesOf(before).length;

const hasGains = ({ unlockedConfigIds, earnedTitleIds }: RunGains): boolean =>
	unlockedConfigIds.length > 0 || earnedTitleIds.length > 0;

export const recordGains = (
	before: RunState,
	after: RunState,
	today: string,
	gains: RunGains
): RunState => {
	const unlockedConfigIds = [
		...(after.unlockedSinceClose ?? []),
		...gains.unlockedConfigIds,
	];

	if (!closesAGate(before, after))
		return hasGains(gains)
			? { ...after, unlockedSinceClose: unlockedConfigIds }
			: after;

	const closes = closesOf(after);
	const recorded = closes[closes.length - 1];

	return {
		...after,
		unlockedSinceClose: [],
		closes: [
			...closes.slice(0, -1),
			{
				...recorded,
				unlockedConfigIds,
				earnedTitleIds: gains.earnedTitleIds,
				closedOn: today,
				storageKbAfter: after.storage,
			},
		],
	};
};
