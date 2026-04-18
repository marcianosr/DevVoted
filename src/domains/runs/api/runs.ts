import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getSlotDefinition } from "~/domains/runs/data/pipelineSlots";
import type {
	GateDifficulty,
	GateTypeId,
	UpgradeCard,
} from "~/domains/runs/models/pipeline";
import { applyUpgradeCard } from "~/domains/runs/services/pipeline.service";
import { getAuthenticatedUserId } from "~/utils/authorization";

import { getRandomExposedConfigDeckHandler } from "./exposedDeck.handler";
import {
	finishRunHandler,
	getAllRunsHandler,
	getLastRunForUser,
	getOrCreateActiveRun,
	getUserActiveRun,
	skipShopHandler,
} from "./handlers";
import {
	getAnsweredPollsCountInRun,
	getWindowResults,
} from "~/domains/polls/api/queries";
import {
	getWindowSize,
	type PipelineEvaluationContext,
} from "~/domains/runs/services/pipelineEvaluator.service";

import {
	appendPipelineSlotSnapshot,
	clearPendingUpgradeCards,
	getActiveRunByUserId,
	savePipelineSlots,
} from "./queries";

export const getOrCreateRun = createServerFn({ method: "GET" }).handler(
	async () => {
		const userId = await getAuthenticatedUserId();
		return await getOrCreateActiveRun(userId);
	}
);

export const getActiveRun = createServerFn({ method: "GET" }).handler(
	async () => {
		try {
			const userId = await getAuthenticatedUserId();
			return await getUserActiveRun(userId);
		} catch (error) {
			console.error("getActiveRun error:", error);
			// Return null for unauthenticated users (e.g., on /login page)
			return null;
		}
	}
);

export const getLastRunForGameOver = createServerFn({ method: "GET" }).handler(
	async () => {
		const userId = await getAuthenticatedUserId();

		return await getLastRunForUser(userId);
	}
);

export const finishRunFn = createServerFn({ method: "POST" }).handler(
	async () => {
		const userId = await getAuthenticatedUserId();
		return await finishRunHandler(userId);
	}
);

export const skipShopServerFn = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			runId: z.number(),
			date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
			storageBonus: z.number().default(0),
		})
	)
	.handler(async ({ data }) => {
		const userId = await getAuthenticatedUserId();
		return await skipShopHandler(
			userId,
			data.runId,
			data.date,
			data.storageBonus
		);
	});

export const getAllRunsServerFn = createServerFn({ method: "GET" }).handler(
	async () => {
		return await getAllRunsHandler();
	}
);

export const getExposedConfigDeck = createServerFn({ method: "GET" })
	.inputValidator(z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }))
	.handler(async ({ data }) => {
		const userId = await getAuthenticatedUserId();
		return await getRandomExposedConfigDeckHandler(userId, data.date);
	});

const gateTypeIdSchema = z.enum([
	"coverage-gain",
	"correct-answers",
	"disabled-config",
	"short-window",
] as const);

const difficultySchema = z.enum(["easy", "normal", "hard", "intense"] as const);

const upgradeCardInputSchema = z.discriminatedUnion("kind", [
	z.object({
		kind: z.literal("add-slot"),
		gateTypeId: gateTypeIdSchema,
		difficulty: difficultySchema,
	}),
	z.object({
		kind: z.literal("upgrade-slot"),
		gateTypeId: gateTypeIdSchema,
		from: difficultySchema,
		to: difficultySchema,
	}),
]);

/**
 * Applies a pipeline upgrade card to the player's active run.
 * Reconstructs the full slot definition server-side from the card intent,
 * so clients only need to send minimal data (no complex PipelineSlot payload).
 */
export const getWindowContextFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<PipelineEvaluationContext | null> => {
		const userId = await getAuthenticatedUserId();
		const activeRun = await getActiveRunByUserId(userId);

		if (!activeRun) return null;

		const windowSize = getWindowSize(activeRun.pipelineSlots);
		const totalPollsAnswered = await getAnsweredPollsCountInRun(activeRun.id);
		const pollsInCurrentWindow = totalPollsAnswered % windowSize;

		const windowResults =
			pollsInCurrentWindow > 0
				? await getWindowResults(activeRun.id, userId, pollsInCurrentWindow)
				: [];

		return {
			correctAnswersInWindow: windowResults.filter((r) => r.isCorrect).length,
			pollsAnsweredInWindow: windowResults.length,
			coverageGainedInWindow: 0,
			currentStreakAtWindowEnd: Math.max(
				...activeRun.categoryCoverage.map((c) => c.currentStreak),
				0
			),
			pollsInWindow: windowSize,
			disabledConfigCount: 0,
		};
	}
);

export const applyPipelineUpgradeFn = createServerFn({ method: "POST" })
	.inputValidator(upgradeCardInputSchema)
	.handler(async ({ data }) => {
		const userId = await getAuthenticatedUserId();
		const activeRun = await getActiveRunByUserId(userId);

		if (!activeRun) throw new Error("No active run found");

		const card: UpgradeCard =
			data.kind === "add-slot"
				? {
						kind: "add-slot",
						slot: getSlotDefinition(
							data.gateTypeId as GateTypeId,
							data.difficulty as GateDifficulty
						),
					}
				: {
						kind: "upgrade-slot",
						gateTypeId: data.gateTypeId as GateTypeId,
						from: data.from as GateDifficulty,
						to: data.to as GateDifficulty,
						slot: getSlotDefinition(
							data.gateTypeId as GateTypeId,
							data.to as GateDifficulty
						),
					};

		const newSlots = applyUpgradeCard(activeRun.pipelineSlots, card);
		await Promise.all([
			appendPipelineSlotSnapshot(activeRun.id, activeRun.pipelineSlots),
			savePipelineSlots(activeRun.id, newSlots),
			clearPendingUpgradeCards(activeRun.id),
		]);

		return { applied: true };
	});
