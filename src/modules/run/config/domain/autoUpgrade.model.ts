import { selectSeededRandom } from "~/shared/lib/seededRandom";
import {
	autoUpgradeOneInOf,
	type Config,
	isUpgradable,
	levelUp,
} from "~/modules/run/config/domain/config.model";

/** A clear's auto-upgrade outcome: the pipeline after it, and the config it
 * bumped (already at its new level) when the roll hit. */
export type AutoUpgrade = {
	readonly configs: readonly Config[];
	readonly bumped?: Config;
};

const unchanged = (configs: readonly Config[]): AutoUpgrade => ({ configs });

/** "1 in N" taken literally: N slots, hit when the seed lands on the first. */
const rollHits = (oneIn: number, seed: string): boolean =>
	selectSeededRandom(
		Array.from({ length: oneIn }, (_, slot) => slot),
		seed
	) === 0;

// Every upgradable config qualifies, Dependabot itself included, and the Focus
// mastery gate is deliberately ignored (Marciano, 2026-08-20): an auto-merge
// lands without review, so a bump can hand you a level your coverage never
// earned. ADR-039's "coverage is permission" still governs the shop — this is
// the legendary's privilege, not a new shop rule.
const upgradeCandidates = (configs: readonly Config[]): readonly Config[] =>
	configs.filter(isUpgradable);

/**
 * Dependabot's clear-time effect: a seeded 1-in-N roll, then a seeded pick
 * among the candidates — sorted by id first (the audits' precedent), so the
 * pick answers to which configs are installed rather than to purchase order.
 * Seeded rather than rolled live for the same reason the shop draft is: the
 * reducer stays pure, so a replayed clear replays its outcome.
 */
export const autoUpgradeOnClear = (
	configs: readonly Config[],
	seed: string
): AutoUpgrade => {
	const bot = configs.find((config) => config.autoUpgradeOneIn !== undefined);
	if (!bot) return unchanged(configs);
	const oneIn = autoUpgradeOneInOf(bot);
	if (oneIn === undefined || !rollHits(oneIn, `${seed}-roll`))
		return unchanged(configs);
	const candidates = [...upgradeCandidates(configs)].sort((left, right) =>
		left.id.localeCompare(right.id)
	);
	const picked = selectSeededRandom(candidates, `${seed}-pick`);
	if (!picked) return unchanged(configs);
	const bumped = levelUp(picked);
	return {
		configs: configs.map((config) =>
			config.id === picked.id ? bumped : config
		),
		bumped,
	};
};
