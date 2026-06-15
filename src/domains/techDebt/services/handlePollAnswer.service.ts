import {
	deleteActiveTechDebt,
	fetchActiveTechDebtsByRun,
	updateActiveTechDebtProgress,
} from "~/domains/techDebt/api/queries";
import {
	advanceTechDebtsOnPollAnswer,
	PollAnswerEvent,
} from "~/domains/techDebt/services/advanceProgress.service";

/**
 * Orchestrates the Tech Debt side-effects of a poll answer:
 *   - load active TDs for the run
 *   - advance their progress through the in-memory event handler
 *   - persist the outcome (delete cleared, update remaining)
 *
 * Returns the ids of cleared Tech Debts so the caller can surface them to
 * the player (toast, animation, etc.). Pure orchestration — game logic lives
 * in advanceProgress.service.
 */
export const handlePollAnswerForTechDebt = async (
	runId: number,
	event: PollAnswerEvent
): Promise<{ clearedTemplateIds: string[] }> => {
	const active = await fetchActiveTechDebtsByRun(runId);
	if (active.length === 0) return { clearedTemplateIds: [] };

	const outcomes = advanceTechDebtsOnPollAnswer(active, event);
	const clearedTemplateIds: string[] = [];

	await Promise.all(
		outcomes.map(async (outcome) => {
			if (outcome.cleared) {
				await deleteActiveTechDebt(outcome.techDebt.id);
				clearedTemplateIds.push(outcome.techDebt.templateId);
				return;
			}
			if (outcome.nextProgress !== outcome.techDebt.progress) {
				await updateActiveTechDebtProgress(
					outcome.techDebt.id,
					outcome.nextProgress
				);
			}
		})
	);

	return { clearedTemplateIds };
};
