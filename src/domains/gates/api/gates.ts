import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getAuthenticatedUserId } from "~/utils/authorization";

import {
	getAllGateTypes,
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
 * Get available gate options after passing a gate
 */
export const getGateOptions = createServerFn({ method: "GET" })
	.inputValidator(z.object({ currentGateTypeCode: z.string() }))
	.handler(async ({ data }) => {
		await getAuthenticatedUserId();
		return getAvailableGatesForSelection(data.currentGateTypeCode);
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
		// We should verify that the run belongs to the authenticated user
		// For now we just check authentication
		await getAuthenticatedUserId();
		return selectNextGate(data.runId, data.gateTypeCode);
	});

/**
 * Check if a run is awaiting gate selection
 */
export const checkAwaitingGateSelection = createServerFn({ method: "GET" })
	.inputValidator(z.object({ runId: z.number() }))
	.handler(async ({ data }) => {
		await getAuthenticatedUserId();
		return isAwaitingGateSelection(data.runId);
	});
