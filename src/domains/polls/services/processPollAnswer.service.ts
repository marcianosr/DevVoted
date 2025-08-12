import { getActiveRunByUserId, awardXpToRun } from "~/domains/runs/api/queries";
import {
	checkXpThreshold,
	endRunForThresholdFailure,
} from "~/domains/runs/services/runCompletion.service";
import { createPollResponse } from "~/domains/polls/api/queries";
import { calculateMultipleChoiceXP } from "~/domains/runs/constants/xpSystem";
import type { ThresholdInfo } from "~/domains/runs/services/thresholdCalculator.service";

export type PollAnswerResult = {
	readonly xpEarned: number;
	readonly runEnded: boolean;
	readonly thresholdInfo: ThresholdInfo | null;
};

export type PollAnswerInput = {
	readonly pollId: number;
	readonly userId: string;
	readonly selectedOptionIds: number[];
	readonly categoryCode: string;
	readonly nCorrect: number;
	readonly nTotal: number;
	readonly nWrong: number;
};

export const processPollAnswer = async (
	params: PollAnswerInput
): Promise<PollAnswerResult> => {
	const {
		pollId,
		userId,
		selectedOptionIds,
		categoryCode,
		nCorrect,
		nTotal,
		nWrong,
	} = params;

	const xpEarned = calculateMultipleChoiceXP(nCorrect, nTotal, nWrong);
	await createPollResponse({
		pollId,
		userId,
		selectedOptionIds,
	});

	const { runEnded, thresholdInfo } = await handleXpFlow(
		userId,
		categoryCode,
		xpEarned
	);

	return {
		xpEarned,
		runEnded,
		thresholdInfo,
	};
};

const handleXpFlow = async (
	userId: string,
	categoryCode: string,
	xpEarned: number
): Promise<{ runEnded: boolean; thresholdInfo: ThresholdInfo | null }> => {
	let runEnded = false;
	let thresholdInfo: ThresholdInfo | null = null;

	try {
		const activeRun = await getActiveRunByUserId(userId);
		if (!activeRun) return { runEnded, thresholdInfo };

		// Always award XP regardless of set position
		await awardXpToRun(activeRun.id, categoryCode, xpEarned);

		// Always get threshold info for display purposes
		thresholdInfo = await checkXpThreshold(activeRun.id);

		// Only check threshold and potentially end run on 3rd poll of each set
		if (
			thresholdInfo.isThresholdCheckPoll &&
			!thresholdInfo.meetsThreshold
		) {
			await endRunForThresholdFailure(activeRun.id);
			runEnded = true;
		}
	} catch (error) {
		console.error("Error handling XP flow:", error);
	}

	return { runEnded, thresholdInfo };
};
