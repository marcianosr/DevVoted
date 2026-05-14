import { handleApiOperation } from "~/utils/errorHandling";

import { AWARD_DEFINITIONS } from "../data/awards.data";
import type { Award, AwardContext } from "../models/award.model";
import {
	getCategoryMasteryWinners,
	getCategoryParticipationWinners,
	getCurrentRunMasteryWinners,
	getCurrentRunParticipationWinners,
} from "./queries";

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
		]);

		return AWARD_DEFINITIONS.map((def) => {
			const winners =
				def.type === "mastery" ? masteryWinners : participationWinners;

			const earners = winners
				.filter((w) => w.categoryCode === def.categoryCode)
				.map(({ userId, displayName, photoUrl, score }) => ({
					userId,
					displayName,
					photoUrl,
					score,
				}));

			return { ...def, earners };
		});
	});
