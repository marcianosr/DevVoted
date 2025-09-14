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

	// Build a minimal EffectCtx; pass the real poll if you have it here
	const effectCtx = {
		poll: { categoryCode },
		options: [],
		hasAnswered: true,
		run,
	};

	const {
		score: scoreMods,
		renderProps,
		meta,
	} = applyEffects(effectCtx, run.activeConfigIds);

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

		configAmpMul: scoreMods.ampMul ?? 1,
		configAmpAdd: scoreMods.ampAdd ?? 0,
		configXpAdd: scoreMods.xpAdd ?? 0,
	});

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
