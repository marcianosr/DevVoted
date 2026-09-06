import { selectSeededRandom, shuffleSeeded } from "~/shared/lib/seededRandom";

import type { Config } from "~/modules/run/config/domain/config.model";
import { slotsOf } from "~/modules/run/config/domain/config.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { touchesCoverage } from "~/modules/run/config/domain/effect.model";

export const STARTER_POOL: readonly Config[] = [
	CONFIGS.js,
	CONFIGS.ts,
	CONFIGS.css,
	CONFIGS.eslint,
	CONFIGS.unitTests,
	CONFIGS.codeCoverage,
	CONFIGS.indexedDb,
	CONFIGS.coldStart,
];

export const HAND_SIZE = 5;

export const RECOMMENDED_SIZE = 2;

export const FOCUS_BAND = { min: 1, max: 2 } as const;

export const PAIRABLE_PICKS = 3;

const isFocus = (config: Config): boolean => config.focusCategory !== undefined;

const bySlots = (one: Config, other: Config): number =>
	slotsOf(one) - slotsOf(other);

const smallestPicksOccupy = (configs: readonly Config[]): number =>
	[...configs]
		.sort(bySlots)
		.slice(0, PAIRABLE_PICKS)
		.reduce((total, config) => total + slotsOf(config), 0);

const heaviestSpare = (hand: readonly Config[]): Config | undefined => {
	const focusHeld = hand.filter(isFocus).length;
	return [...hand]
		.filter((config) => !isFocus(config) || focusHeld > FOCUS_BAND.min)
		.sort(bySlots)
		.at(-1);
};

const lightestAddable = (
	hand: readonly Config[],
	bench: readonly Config[]
): Config | undefined => {
	const focusHeld = hand.filter(isFocus).length;
	return [...bench]
		.filter((config) => !isFocus(config) || focusHeld < FOCUS_BAND.max)
		.sort(bySlots)
		.at(0);
};

const withPairableCards = (
	hand: readonly Config[],
	bench: readonly Config[],
	slotBudget: number
): readonly Config[] => {
	if (smallestPicksOccupy(hand) <= slotBudget) return hand;

	const crowding = heaviestSpare(hand);
	const lightest = lightestAddable(hand, bench);
	if (!crowding || !lightest) return hand;
	if (slotsOf(lightest) >= slotsOf(crowding)) return hand;

	return withPairableCards(
		hand.map((config) => (config === crowding ? lightest : config)),
		bench.filter((config) => config !== lightest),
		slotBudget
	);
};

const dealtUnderBand = (
	eligible: readonly Config[],
	seed: string
): readonly Config[] => {
	const focus = eligible.filter(isFocus);
	const utility = eligible.filter((config) => !isFocus(config));
	const wanted =
		selectSeededRandom([FOCUS_BAND.min, FOCUS_BAND.max], `${seed}:focus`) ??
		FOCUS_BAND.min;
	const aimed = focus.slice(0, wanted);

	return [...aimed, ...utility, ...focus.slice(aimed.length)].slice(
		0,
		HAND_SIZE
	);
};

export const startingHand = (
	pool: readonly Config[],
	seed: string,
	slotBudget: number
): readonly Config[] => {
	const eligible = shuffleSeeded(
		pool.filter((config) => slotsOf(config) <= slotBudget),
		seed
	);
	const dealt = dealtUnderBand(eligible, seed);

	return shuffleSeeded(
		withPairableCards(
			dealt,
			eligible.filter((config) => !dealt.includes(config)),
			slotBudget
		),
		`${seed}:order`
	);
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
