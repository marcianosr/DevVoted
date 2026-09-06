import { shuffleSeeded } from "~/shared/lib/seededRandom";

import type { Config } from "~/modules/run/config/domain/config.model";
import { slotsOf } from "~/modules/run/config/domain/config.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { touchesCoverage } from "~/modules/run/config/domain/effect.model";

export const STARTER_POOL: readonly Config[] = [
	CONFIGS.gitRebase,

	CONFIGS.unitTests,
	CONFIGS.js,
	CONFIGS.ts,
	CONFIGS.css,
	// CONFIGS.eslint,
	// CONFIGS.agentsMd,
	// CONFIGS.codeCoverage,
	// CONFIGS.indexedDb,
	// CONFIGS.coldStart,
];

export const HAND_SIZE = 5;

export const RECOMMENDED_SIZE = 2;

const isFocus = (config: Config): boolean => config.focusCategory !== undefined;

export const startingHand = (
	pool: readonly Config[],
	seed: string
): readonly Config[] => {
	const shuffled = shuffleSeeded(pool, seed);
	const hand = shuffled.slice(0, HAND_SIZE);
	if (hand.some(isFocus)) return hand;

	const focus = shuffled.slice(HAND_SIZE).find(isFocus);
	return focus ? [...hand.slice(0, HAND_SIZE - 1), focus] : hand;
};

const occupiedBy = (picks: readonly Config[]): number =>
	picks.reduce((total, pick) => total + slotsOf(pick), 0);

const fitsWith = (
	picks: readonly Config[],
	config: Config,
	maxSlots: number
): boolean => occupiedBy(picks) + slotsOf(config) <= maxSlots;

export const recommendedPicks = (
	hand: readonly Config[],
	maxSlots: number
): readonly Config[] => {
	const seeded = [isFocus, touchesCoverage].reduce<readonly Config[]>(
		(picks, wanted) => {
			const next = hand.find(
				(config) =>
					!picks.includes(config) &&
					wanted(config) &&
					fitsWith(picks, config, maxSlots)
			);
			return next ? [...picks, next] : picks;
		},
		[]
	);

	return hand.reduce<readonly Config[]>(
		(picks, config) =>
			picks.length < RECOMMENDED_SIZE &&
			!picks.includes(config) &&
			fitsWith(picks, config, maxSlots)
				? [...picks, config]
				: picks,
		seeded
	);
};
