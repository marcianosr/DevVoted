import { handleApiOperation } from "~/utils/errorHandling";

import { AWARD_DEFINITIONS } from "../data/awards.data";
import type {
	Award,
	AwardContext,
	CategoryWinner,
} from "../models/award.model";
import {
	getCategoryMasteryWinners,
	// getCategoryMaxCoverageWinners,
	getCategoryParticipationWinners,
	getCurrentRunMasteryWinners,
	// getCurrentRunMaxCoverageWinners,
	getCurrentRunParticipationWinners,
} from "./queries";

const resolveDescription = (description: string, context: AwardContext) =>
	context === "current-runs"
		? description.replace("across all runs", "in current run")
		: description;

export const getAwardsHandler = async (context: AwardContext) =>
	handleApiOperation(async (): Promise<Award[]> => {
		const isCurrentRuns = context === "current-runs";

		const [masteryWinners, participationWinners] = await Promise.all([
			isCurrentRuns
				? getCurrentRunMasteryWinners()
				: getCategoryMasteryWinners(),
			isCurrentRuns
				? getCurrentRunParticipationWinners()
				: getCategoryParticipationWinners(),
			// Coverage awards are commented out in data/awards.data.ts pending naming.
			// isCurrentRuns
			// 	? getCurrentRunMaxCoverageWinners()
			// 	: getCategoryMaxCoverageWinners(),
		]);

		const winnersByType: Record<Award["type"], CategoryWinner[]> = {
			mastery: masteryWinners,
			participation: participationWinners,
			coverage: [],
		};

		return AWARD_DEFINITIONS.map((def) => {
			const winners = winnersByType[def.type];
			const earners = winners
				.filter((w) => w.categoryCode === def.categoryCode)
				.map(({ userId, displayName, photoUrl, score }) => ({
					userId,
					displayName,
					photoUrl,
					score,
				}));

			return {
				...def,
				description: resolveDescription(def.description, context),
				earners,
			};
		});
	});
