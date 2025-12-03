import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getStorageInfo } from "~/domains/economy/services/configManager.service";
import { calculateRerollCost } from "~/domains/economy/services/reroll.service";

import { processRerollShop } from "./queries";

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

		try {
			const { originalRun, updatedRun } = await processRerollShop(runId, date);

			const { storageAvailable } = getStorageInfo(originalRun);
			const rerollCost = calculateRerollCost(originalRun.rerolls);

			// Check if user can afford the reroll
			if (storageAvailable < rerollCost) {
				return {
					success: false,
					error: "Not enough storage for reroll",
				};
			}

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
