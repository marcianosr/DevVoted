import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getActiveRunByUserId } from "~/domains/runs/api/queries";
import { getAuthenticatedUserId } from "~/utils/authorization";

import {
	getAllGateTypes,
	getActiveRunsGatePaths,
	getCurrentGateWithType,
	getRunGateHistoryWithTypes,
} from "./queries";
import {
	getAvailableGatesForSelection,
	selectNextGate,
	isAwaitingGateSelection,
} from "../services/gateSelection.service";

/**
 * Get all available gate types
 */
export const getGateTypes = createServerFn({ method: "GET" }).handler(
	async () => {
		return getAllGateTypes();
	}
);

/**
 * Get current gate info for a run
 */
export const getCurrentGate = createServerFn({ method: "GET" })
	.inputValidator(z.object({ runId: z.number() }))
	.handler(async ({ data }) => {
		// Validate the user is authenticated (but we don't enforce ownership here as it's read-only)
		await getAuthenticatedUserId();
		return getCurrentGateWithType(data.runId);
	});

/**
 * Get the full gate path for a run
 */
export const getGatePath = createServerFn({ method: "GET" })
	.inputValidator(z.object({ runId: z.number() }))
	.handler(async ({ data }) => {
		await getAuthenticatedUserId();
		return getRunGateHistoryWithTypes(data.runId);
	});

/**
 * Get available gate options after passing a gate.
 * Returns 3 options from the player's unlocked gate pool.
 */
export const getGateOptions = createServerFn({ method: "GET" })
	.inputValidator(z.object({ currentGateTypeCode: z.string() }))
	.handler(async ({ data }) => {
		const userId = await getAuthenticatedUserId();
		return getAvailableGatesForSelection(data.currentGateTypeCode, userId);
	});

/**
 * Select the next gate type for a run
 */
export const selectGate = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			runId: z.number(),
			gateTypeCode: z.string(),
		})
	)
	.handler(async ({ data }) => {
		const userId = await getAuthenticatedUserId();
		const activeRun = await getActiveRunByUserId(userId);
		if (!activeRun || activeRun.id !== data.runId) {
			throw new Error(
				"Unauthorized: Run does not belong to the authenticated user"
			);
		}
		return selectNextGate(data.runId, data.gateTypeCode);
	});

/**
 * Get gate paths for all users with active runs, sorted by gate number desc.
 * Used for the "Today's Paths" community section in post-answer results.
 */
export const getCommunityGatePaths = createServerFn({ method: "GET" }).handler(
	async () => {
		await getAuthenticatedUserId();
		return getActiveRunsGatePaths();
	}
);

/**
 * Check if a run is awaiting gate selection
 */
export const checkAwaitingGateSelection = createServerFn({ method: "GET" })
	.inputValidator(z.object({ runId: z.number() }))
	.handler(async ({ data }) => {
		await getAuthenticatedUserId();
		return isAwaitingGateSelection(data.runId);
	});
