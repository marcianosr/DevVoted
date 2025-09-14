import {
	orchestrateScoreCalculation,
	ScoreCalculation,
} from "~/domains/score/services/score.service";
import { awardXpToRun } from "../api/queries";
import { Run } from "../models/run";

// Map config IDs to their corresponding categories
const CONFIG_CATEGORY_MAP: Record<string, string> = {
	".html": "general-frontend", // No separate HTML category
	".css": "css",
	".js": "js",
	".ts": "typescript",
	".jsx": "react",
	".git": "general-frontend", // Git goes to general frontend
	"package.json": "general-frontend",
};

const calculateConfigAmpBonus = (
	activeConfigIds: string[],
	categoryCode: string
): number => {
	// Check if any active configs match this category
	let totalBonus = 0;

	for (const configId of activeConfigIds) {
		if (CONFIG_CATEGORY_MAP[configId] === categoryCode) {
			totalBonus += 0.5; // Each matching config adds 0.5 amp
		}
	}

	return totalBonus;
};

type IncrementProgress = {
	categoryCode: string;
	run: Run;
	correctnessFactor: number;
};
type IncrementRunProgressResult = ScoreCalculation;

export const incrementRunProgress = async ({
	categoryCode,
	run,
	correctnessFactor,
}: IncrementProgress): Promise<IncrementRunProgressResult> => {
	const currentCategoryXP = run.categoryXp.find(
		(xp) => xp.categoryCode === categoryCode
	);

	if (!currentCategoryXP) {
		throw new Error(`Category ${categoryCode} not found`);
	}

	// Calculate total polls answered across all categories + 1 for current poll
	const totalPollsAnswered = run.categoryXp.reduce(
		(sum, xp) => sum + xp.pollsAnswered,
		0
	);

	// Calculate config amp bonus for this category based on effects
	const configAmpBonus = calculateConfigAmpBonus(
		run.activeConfigIds,
		categoryCode
	);

	const {
		breakdown,
		newBestStreak,
		newStreak,
		newPollsAnswered,
		newTotalXP,
	} = orchestrateScoreCalculation(
		currentCategoryXP.currentXp,
		currentCategoryXP.currentStreak,
		currentCategoryXP.bestStreak,
		totalPollsAnswered,
		correctnessFactor,
		configAmpBonus
	);

	//Write new values to DB
	await awardXpToRun(
		run.id,
		categoryCode,
		newTotalXP, // New total XP for the category
		newStreak, // Need to add this to the calculation return
		newBestStreak, // New best streak
		currentCategoryXP.pollsAnswered + 1 // Category polls + 1, NOT total
	);

	return {
		breakdown,
		newTotalXP,
		newStreak,
		newBestStreak,
		newPollsAnswered,
	};
};
