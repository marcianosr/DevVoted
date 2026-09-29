import type { Config } from "~/modules/run/config/domain/config.model";
import { touchesCoverage } from "~/modules/run/config/domain/effect.model";

export type ConfigGroup =
	"coverage" | "storage" | "answerHelp" | "risk" | "misc";

export const CONFIG_GROUP_ORDER = [
	"coverage",
	"storage",
	"answerHelp",
	"risk",
	"misc",
] as const satisfies readonly ConfigGroup[];

const movesStorage = (config: Config): boolean =>
	config.storageOnClear !== undefined ||
	config.storagePerCorrect !== undefined ||
	config.storageInterestPct !== undefined ||
	config.escrowPerCorrect !== undefined ||
	config.chainStartKb !== undefined ||
	config.emptySlotDiscountKb !== undefined ||
	config.storagePerExtraPick !== undefined ||
	config.draftCostFactor !== undefined ||
	config.refundsPeeledConfigs !== undefined;

const helpsAnswer = (config: Config): boolean =>
	config.eliminatesWrongOptionsFor !== undefined ||
	config.peeksCommunitySplit !== undefined ||
	config.revealsCorrectCount !== undefined ||
	config.revealsUpcomingCategories !== undefined ||
	config.reordersGatePolls !== undefined ||
	config.projectsGateOutcome !== undefined ||
	config.submitsCrowdPick !== undefined;

const commitsBeforeKnowing = (config: Config): boolean =>
	config.wagersAnswer !== undefined ||
	config.commitsBand !== undefined ||
	config.coveragePerEstimate !== undefined;

const coversABadOutcome = (config: Config): boolean =>
	config.catchesFatal !== undefined || config.suppressesAudit !== undefined;

export const configGroupOf = (config: Config): ConfigGroup => {
	if (touchesCoverage(config)) return "coverage";
	if (movesStorage(config)) return "storage";
	if (helpsAnswer(config)) return "answerHelp";
	if (commitsBeforeKnowing(config) || coversABadOutcome(config)) return "risk";
	return "misc";
};
