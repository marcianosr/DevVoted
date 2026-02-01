import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { applyEffects } from "~/domains/configs/data/configs";
import { getRunWithCategoryCoverage } from "~/domains/runs/api/queries";

import {
	createRerolledShopOfferings as createRerolledShopOfferingsService,
	getNextShopOfferings as getNextShopOfferingsService,
	getOrCreateShopOfferings as getOrCreateShopOfferingsService,
} from "../services/shopOfferings.service";

/**
 * Server function to get or create shop offerings for a run.
 * This wraps the service function to ensure DB code only runs server-side.
 */
export const getShopOfferingsServerFn = createServerFn({ method: "GET" })
	.inputValidator(
		z.object({
			runId: z.number(),
			date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
		})
	)
	.handler(async ({ data }) => {
		const { runId, date } = data;

		// Get run to access activeConfigIds and apply effects
		const run = await getRunWithCategoryCoverage(runId);
		if (!run) {
			return { success: false as const, error: "Run not found" };
		}

		const configEffects = applyEffects(
			{ poll: {} as any, options: [], hasAnswered: false, run },
			run.activeConfigIds
		);

		const offerings = await getOrCreateShopOfferingsService(
			runId,
			date,
			run.activeConfigIds,
			configEffects
		);

		return { success: true as const, data: offerings };
	});

/**
 * Server function to create rerolled shop offerings.
 */
export const createRerolledShopOfferingsServerFn = createServerFn({
	method: "POST",
})
	.inputValidator(
		z.object({
			runId: z.number(),
			date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
		})
	)
	.handler(async ({ data }) => {
		const { runId, date } = data;

		const run = await getRunWithCategoryCoverage(runId);
		if (!run) {
			return { success: false as const, error: "Run not found" };
		}

		const configEffects = applyEffects(
			{ poll: {} as any, options: [], hasAnswered: false, run },
			run.activeConfigIds
		);

		const offerings = await createRerolledShopOfferingsService(
			runId,
			date,
			run.activeConfigIds,
			configEffects
		);

		return { success: true as const, data: offerings };
	});

/**
 * Server function to get pre-generated next shop offerings for preview.
 */
export const getNextShopOfferingsServerFn = createServerFn({ method: "GET" })
	.inputValidator(
		z.object({
			runId: z.number(),
			date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
		})
	)
	.handler(async ({ data }) => {
		const { runId, date } = data;

		const run = await getRunWithCategoryCoverage(runId);
		if (!run) {
			return { success: false as const, error: "Run not found" };
		}

		const configEffects = applyEffects(
			{ poll: {} as any, options: [], hasAnswered: false, run },
			run.activeConfigIds
		);

		const offerings = await getNextShopOfferingsService(
			runId,
			date,
			configEffects
		);

		return { success: true as const, data: offerings ?? [] };
	});
