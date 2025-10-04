import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { calculateRerollCost } from "~/domains/economy/services/reroll.service";
import { getStorageInfo } from "~/domains/economy/services/configManager.service";
import { processRerollShop } from "./queries";

export const rerollShopServerFn = createServerFn()
	.inputValidator(
		z.object({
			runId: z.number().int().positive(),
		})
	)
	.handler(async ({ data }) => {
		const { runId } = data;

		try {
			const { originalRun, updatedRun } = await processRerollShop(runId);

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
				error instanceof Error
					? error.message
					: "Failed to reroll shop";
			return { success: false, error: message };
		}
	});
