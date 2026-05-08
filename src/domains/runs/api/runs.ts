import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
	getCategoryMasterySlot,
	getSlotDefinition,
} from "~/domains/runs/data/pipelineSlots";
import { CATEGORY_CODES } from "~/domains/shared/categories";
import type { UpgradeCard } from "~/domains/runs/models/pipeline.model";
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
import { getAnsweredPollsCountInRun } from "~/domains/polls/api/pollResponse.queries";
import { getWindowResults } from "~/domains/runs/api/window.queries";
import {
	buildCategoryPollResults,
	getWindowSize,
	type PipelineEvaluationContext,
} from "~/domains/runs/services/pipelineEvaluator.service";
import {
	applyPipelineUpgrade,
	getAllRunsByUserId,
	getActiveRunByUserId,
} from "./run.queries";

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

export const getRunsByUserIdFn = createServerFn({ method: "GET" })
	.inputValidator(z.object({ userId: z.string() }))
	.handler(async ({ data }) => getAllRunsByUserId(data.userId));

export const getExposedConfigDeck = createServerFn({ method: "GET" })
	.inputValidator(z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }))
	.handler(async ({ data }) => {
		const userId = await getAuthenticatedUserId();
		return await getRandomExposedConfigDeckHandler(userId, data.date);
	});

const staticGateTypeIdSchema = z.enum([
	"coverage-gain",
	"correct-answers",
	"short-window",
	"cold-start",
] as const);

const difficultySchema = z.enum(["low", "medium", "high", "critical"] as const);
const categoryCodeSchema = z.enum(CATEGORY_CODES);

const upgradeCardInputSchema = z.discriminatedUnion("kind", [
	z.object({
		kind: z.literal("add-slot"),
		gateTypeId: staticGateTypeIdSchema,
		difficulty: difficultySchema,
	}),
	z.object({
		kind: z.literal("add-category-mastery-slot"),
		category: categoryCodeSchema,
		difficulty: difficultySchema,
	}),
	z.object({
		kind: z.literal("upgrade-slot"),
		gateTypeId: staticGateTypeIdSchema,
		from: difficultySchema,
		to: difficultySchema,
	}),
	z.object({
		kind: z.literal("upgrade-category-mastery-slot"),
		category: categoryCodeSchema,
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

		const chronologicalWindowResults = [...windowResults].reverse();
		let firstConsecutiveCorrectFromWindowStart = 0;
		for (const r of chronologicalWindowResults) {
			if (!r.isCorrect) break;
			firstConsecutiveCorrectFromWindowStart++;
		}

		return {
			correctAnswersInWindow: windowResults.filter((r) => r.isCorrect).length,
			pollsAnsweredInWindow: windowResults.length,
			coverageGainedInWindow: windowResults.reduce(
				(sum, r) => sum + r.coverageDelta,
				0
			),
			currentStreakAtWindowEnd: Math.max(
				...activeRun.categoryCoverage.map((c) => c.currentStreak),
				0
			),
			pollsInWindow: windowSize,
			currentGate: Math.max(1, Math.ceil(totalPollsAnswered / windowSize)),
			firstConsecutiveCorrectFromWindowStart,
			categoryPollResults: buildCategoryPollResults(windowResults),
		};
	}
);

export const applyPipelineUpgradeFn = createServerFn({ method: "POST" })
	.inputValidator(upgradeCardInputSchema)
	.handler(async ({ data }) => {
		const userId = await getAuthenticatedUserId();
		const activeRun = await getActiveRunByUserId(userId);

		if (!activeRun) throw new Error("No active run found");

		let card: UpgradeCard;

		if (data.kind === "add-slot") {
			const slot = getSlotDefinition(data.gateTypeId, data.difficulty);
			if (!slot) throw new Error("Invalid slot combination");
			card = { kind: "add-slot", slot };
		} else if (data.kind === "add-category-mastery-slot") {
			card = {
				kind: "add-slot",
				slot: getCategoryMasterySlot(data.category, data.difficulty),
			};
		} else if (data.kind === "upgrade-category-mastery-slot") {
			card = {
				kind: "upgrade-category-mastery-slot",
				category: data.category,
				from: data.from,
				to: data.to,
				slot: getCategoryMasterySlot(data.category, data.to),
			};
		} else {
			const slot = getSlotDefinition(data.gateTypeId, data.to);
			if (!slot) throw new Error("Invalid slot combination");
			card = {
				kind: "upgrade-slot",
				gateTypeId: data.gateTypeId,
				from: data.from,
				to: data.to,
				slot,
			};
		}

		const newSlots = applyUpgradeCard(activeRun.pipelineSlots, card);
		await applyPipelineUpgrade(
			activeRun.id,
			activeRun.pipelineSlots,
			newSlots,
			activeRun.pipelineSlotSnapshots
		);

		return { applied: true };
	});
