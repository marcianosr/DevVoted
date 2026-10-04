import { selectSeededRandom } from "~/shared/lib/seededRandom";
import {
	autoUpgradeAfterCorrectOf,
	type Config,
	isUpgradable,
	levelUp,
} from "~/modules/run/config/domain/config.model";
import type { AnswerOutcome } from "~/modules/run/run/domain/runPoll.model";

export type AutoUpgrade = {
	readonly configs: readonly Config[];
	readonly progress: number;
	readonly bumped?: Config;
	readonly by?: Config;
};

export const autoUpgraderOf = (
	configs: readonly Config[]
): Config | undefined =>
	configs.find((config) => config.autoUpgradeAfterCorrect !== undefined);

export const bumpInFor = (
	config: Config,
	progress: number
): number | undefined => {
	const needed = autoUpgradeAfterCorrectOf(config);
	return needed === undefined ? undefined : Math.max(1, needed - progress);
};

export const autoUpgradeRemaining = (
	configs: readonly Config[],
	progress: number
): number | undefined => {
	const bot = autoUpgraderOf(configs);
	return bot === undefined ? undefined : bumpInFor(bot, progress);
};

const upgradeCandidates = (configs: readonly Config[]): readonly Config[] =>
	configs.filter(isUpgradable);

export const hasUpgradeLeft = (configs: readonly Config[]): boolean =>
	upgradeCandidates(configs).length > 0;

export const autoUpgradeOnAnswer = (
	configs: readonly Config[],
	progress: number,
	outcome: AnswerOutcome,
	seed: string
): AutoUpgrade => {
	const bot = autoUpgraderOf(configs);
	if (!bot || !hasUpgradeLeft(configs)) return { configs, progress: 0 };
	if (outcome === "partial") return { configs, progress };
	if (outcome !== "correct") return { configs, progress: 0 };

	const needed = autoUpgradeAfterCorrectOf(bot);
	const counted = progress + 1;
	if (needed === undefined || counted < needed)
		return { configs, progress: counted };

	const candidates = [...upgradeCandidates(configs)].sort((left, right) =>
		left.id.localeCompare(right.id)
	);
	const picked = selectSeededRandom(candidates, `${seed}-pick`);
	if (!picked) return { configs, progress: 0 };
	const bumped = levelUp(picked);
	return {
		configs: configs.map((config) =>
			config.id === picked.id ? bumped : config
		),
		progress: 0,
		bumped,
		by: bot,
	};
};
