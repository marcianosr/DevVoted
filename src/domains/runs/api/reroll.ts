import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { applyEffects } from "~/domains/economy/data/configs";
import { getStorageInfo } from "~/domains/economy/services/configManager.service";
import { calculateRerollCost } from "~/domains/economy/services/reroll.service";
import { createRerolledShopOfferings } from "~/domains/economy/services/shopOfferings.service";
import { getTodayDateString } from "~/lib/dateUtils";

import { processRerollShop } from "./shop.queries";

export const rerollShopServerFn = createServerFn()
	.inputValidator(
		z.object({
			runId: z.number().int().positive(),
			date: z
				.string()
				.regex(/^\d{4}-\d{2}-\d{2}$/)
				.optional(),
		})
	)
	.handler(async ({ data }) => {
		const { runId, date } = data;
		const today = date || getTodayDateString();

		try {
			const { originalRun, updatedRun } = await processRerollShop(runId, today);

			const { storageAvailable } = getStorageInfo(originalRun);
			const rerollCost = calculateRerollCost(originalRun.rerolls);

			// Check if user can afford the reroll
			if (storageAvailable < rerollCost) {
				return {
					success: false,
					error: "Not enough storage for reroll",
				};
			}

			// Generate and store new shop offerings in DB
			const configEffects = applyEffects(
				{ poll: {} as any, options: [], hasAnswered: false, run: updatedRun },
				updatedRun.activeConfigIds
			);

			await createRerolledShopOfferings(
				runId,
				today,
				updatedRun.activeConfigIds,
				configEffects
			);

			return {
				success: true,
				data: {
					run: updatedRun,
					rerollCost,
				},
			};
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to reroll shop";
			return { success: false, error: message };
		}
	});
