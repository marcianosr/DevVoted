import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { isValidInjectionAmount } from "~/domains/economy/data/storageInjectionTiers";
import {
	getCategoryMasterySlot,
	getSlotDefinition,
} from "~/domains/runs/data/pipelineSlots";
import {
	CATEGORY_CODES,
	getCategoryMetadata,
} from "~/domains/shared/categories";
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
import {
	getAnsweredPollsCountInRun,
	getLastAnsweredPollInRun,
} from "~/domains/polls/api/pollResponse.queries";
import { fetchPollByIdWithOptions } from "~/domains/polls/api/poll.queries";
import { applyEffects, configs } from "~/domains/economy/data/configs";
import { buildScoreSummary } from "~/domains/polls/utils/pollResult";
import { getWindowResults } from "~/domains/runs/api/window.queries";
import {
	buildWindowContext,
	getWindowSize,
	type PipelineEvaluationContext,
} from "~/domains/runs/services/pipelineEvaluator.service";
import {
	applyPipelineUpgrade,
	getActiveRunByUserId,
	lootRun,
} from "./run.queries";
import { handleApiOperation } from "~/utils/errorHandling";

const staticGateTypeIdSchema = z.enum([
	"coverage-gain",
	"correct-answers",
	"short-window",
	"cold-start",
] as const);

export const getOrCreateRun = createServerFn({ method: "POST" })
	.validator(
		z
			.object({
				injectFromArchive: z
					.number()
					.int()
					.min(0)
					.refine(isValidInjectionAmount, {
						message: "Injection amount must be 0 or a defined tier.",
					})
					.optional(),
				extraPipelineSlotIds: z.array(staticGateTypeIdSchema).optional(),
			})
			.optional()
	)
	.handler(async ({ data }) => {
		const userId = await getAuthenticatedUserId();
		return await getOrCreateActiveRun(
			userId,
			data?.injectFromArchive ?? 0,
			data?.extraPipelineSlotIds ?? []
		);
	});

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

export const lootFallenRunFn = createServerFn({ method: "POST" })
	.validator(z.object({ runId: z.number() }))
	.handler(async ({ data }) => {
		return handleApiOperation(async () => {
			const userId = await getAuthenticatedUserId();
			const looterRun = await getActiveRunByUserId(userId);
			if (!looterRun) throw new Error("You need an active run to loot.");

			const result = await lootRun(data.runId, userId, looterRun.id);
			if (!result.ok) {
				if (result.reason === "already_looted")
					throw new Error("This run has already been looted.");
				if (result.reason === "self_loot")
					throw new Error("You can't loot your own run.");
				throw new Error("This run can no longer be looted.");
			}
			return { amount: result.amount };
		});
	});

export const skipShopServerFn = createServerFn({ method: "POST" })
	.validator(
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
	.validator(z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }))
	.handler(async ({ data }) => {
		const userId = await getAuthenticatedUserId();
		return await getRandomExposedConfigDeckHandler(userId, data.date);
	});

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
const resolveWindowState = async (userId: string) => {
	const activeRun = await getActiveRunByUserId(userId);
	if (!activeRun) return null;

	const windowSize = getWindowSize(activeRun.pipelineSlots);
	const totalPollsAnswered = await getAnsweredPollsCountInRun(activeRun.id);
	const pollsInCurrentWindow = totalPollsAnswered % windowSize;

	const windowResults =
		pollsInCurrentWindow > 0
			? await getWindowResults(activeRun.id, userId, pollsInCurrentWindow)
			: [];

	const maxStreak = Math.max(
		...activeRun.categoryCoverage.map((c) => c.currentStreak),
		0
	);

	return {
		windowResults,
		windowSize,
		totalPollsAnswered,
		slots: activeRun.pipelineSlots,
		maxStreak,
	};
};

export const getWindowContextFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<PipelineEvaluationContext | null> => {
		const userId = await getAuthenticatedUserId();
		const state = await resolveWindowState(userId);
		if (!state) return null;

		return buildWindowContext(
			state.windowResults,
			state.windowSize,
			state.totalPollsAnswered,
			state.slots,
			state.maxStreak
		);
	}
);

/**
 * The current window context plus the state it held before the most recent
 * answer, so /pipelines can animate each check's progress from previous→new.
 * `previous` drops the newest result (windowResults is newest-first); when the
 * window has 0–1 answers there's no meaningful "before", so previous mirrors
 * current and the UI renders a static (un-juiced) state.
 */
export const getWindowContextWithPreviousFn = createServerFn({
	method: "GET",
}).handler(
	async (): Promise<{
		current: PipelineEvaluationContext;
		previous: PipelineEvaluationContext;
	} | null> => {
		const userId = await getAuthenticatedUserId();
		const state = await resolveWindowState(userId);
		if (!state) return null;

		const { windowResults, windowSize, totalPollsAnswered, slots, maxStreak } =
			state;

		return {
			current: buildWindowContext(
				windowResults,
				windowSize,
				totalPollsAnswered,
				slots,
				maxStreak
			),
			previous: buildWindowContext(
				windowResults.slice(1),
				windowSize,
				Math.max(0, totalPollsAnswered - 1),
				slots,
				maxStreak
			),
		};
	}
);

/**
 * The "how your last answer scored" equation for the /pipelines header: base +
 * config/streak bonuses = earned coverage, plus the category coverage delta.
 * Reuses the stored score breakdown and recomputes per-config coverage effects
 * so the chip breakdown matches the review screen. Null before the first answer.
 */
export const getPipelineScoreHeaderFn = createServerFn({
	method: "GET",
}).handler(async () => {
	const userId = await getAuthenticatedUserId();
	const activeRun = await getActiveRunByUserId(userId);
	if (!activeRun) return null;

	const lastAnswered = await getLastAnsweredPollInRun(activeRun.id, userId);
	if (!lastAnswered) return null;

	const { poll, options } = await fetchPollByIdWithOptions(lastAnswered.pollId);
	const effects = applyEffects(
		{ poll, options, hasAnswered: true, run: activeRun },
		activeRun.activeConfigIds
	);

	const summary = buildScoreSummary(
		lastAnswered.scoreBreakdown,
		effects.perConfigCoverageEffects,
		configs
	);

	// The score block is scoped to one category, so the streak line reports polls
	// answered in that category — not the run-wide total the score breakdown carries.
	const categoryCoverage = activeRun.categoryCoverage.find(
		(coverage) => coverage.categoryCode === poll.categoryCode
	);

	return {
		...summary,
		pollsAnswered: categoryCoverage?.pollsAnswered ?? summary.pollsAnswered,
		categoryName: getCategoryMetadata(poll.categoryCode).name,
		categoryCode: poll.categoryCode,
	};
});

export const applyPipelineUpgradeFn = createServerFn({ method: "POST" })
	.validator(upgradeCardInputSchema)
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
