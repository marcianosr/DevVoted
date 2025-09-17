import {
	orchestrateScoreCalculation,
	ScoreCalculation,
} from "~/domains/score/services/score.service";
import { awardXpToRun } from "../api/queries";
import { Run } from "../models/run";
import { CategoryCode } from "~/domains/shared/categories";
import { applyEffects } from "~/domains/configs/data/configs";

type IncrementProgress = {
	categoryCode: CategoryCode;
	run: Run;
	correctnessFactor: number;
};
type IncrementRunProgressResult = ScoreCalculation;

/**
 * Increments run progress after answering a poll.
 * 
 * Complete Flow:
 * 1. Apply config effects to get score modifiers (amp bonuses, XP bonuses)
 * 2. Pass modifiers to score calculation along with correctness
 * 3. Update database with new XP and streak values
 * 
 * @param categoryCode - The category of the answered poll
 * @param run - Current run with active configs
 * @param correctnessFactor - How well the poll was answered (0-1.5)
 * @returns Score breakdown and updated totals
 */
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

	// Step 1: Apply config effects to get score modifiers
	// Effects can add/multiply amp or add flat XP bonuses
	const effectCtx = {
		poll: { categoryCode },
		options: [],
		hasAnswered: true,
		run,
	};

	const {
		score: scoreMods,  // Contains ampAdd, ampMul, xpAdd from configs
		renderProps,       // UI hints (not used in scoring)
		meta,             // Metadata (not used in scoring)
	} = applyEffects(effectCtx, run.activeConfigIds);

	// Step 2: Calculate score with config modifiers and correctness
	const {
		breakdown,
		newBestStreak,
		newStreak,
		newPollsAnswered,
		newTotalXP,
	} = orchestrateScoreCalculation({
		correctnessFactor,
		currentBestStreak: currentCategoryXP.bestStreak,
		currentXP: currentCategoryXP.currentXp,
		currentStreak: currentCategoryXP.currentStreak,
		totalPollsAnswered,

		// Pass config modifiers from effects
		configAmpMul: scoreMods.ampMul ?? 1,   // Default 1x multiplier
		configAmpAdd: scoreMods.ampAdd ?? 0,   // Default no amp bonus
		configXpAdd: scoreMods.xpAdd ?? 0,     // Default no flat XP
	});

	// Step 3: Persist updated values to database
	await awardXpToRun(
		run.id,
		categoryCode,
		newTotalXP,      // New total XP for the category
		newStreak,       // Current streak (0 if wrong answer)
		newBestStreak,   // Best streak ever achieved
		currentCategoryXP.pollsAnswered + 1 // Increment poll count
	);

	return {
		breakdown,
		newTotalXP,
		newStreak,
		newBestStreak,
		newPollsAnswered,
	};
};
