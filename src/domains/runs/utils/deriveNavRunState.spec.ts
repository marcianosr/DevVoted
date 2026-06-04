import { describe, expect, it } from "vitest";

import { createMockRun } from "~/domains/runs/models/run.mock";
import { createMockRunCategoryCoverage } from "~/domains/runs/models/runCategoryCoverage.mock";
import { deriveNavRunState } from "~/domains/runs/utils/deriveNavRunState";

const buildActiveRunResponse = (run = createMockRun()) => ({
	success: true as const,
	data: run,
});

describe("deriveNavRunState", () => {
	it("returns empty state when activeRun is undefined", () => {
		expect(deriveNavRunState(undefined)).toEqual({
			hasActiveRun: false,
			hasPendingPipelineUpgrade: false,
			currentGate: 0,
			canEndRun: false,
		});
	});

	it("returns empty state when the response succeeded but data is null", () => {
		const result = deriveNavRunState({ success: true, data: null });

		expect(result.hasActiveRun).toBe(false);
		expect(result.canEndRun).toBe(false);
	});

	it("returns empty state on failure response", () => {
		const result = deriveNavRunState({
			success: false,
			error: "Banjo broke the run",
		});

		expect(result.hasActiveRun).toBe(false);
	});

	it("flags hasActiveRun true when a real run is loaded", () => {
		const run = createMockRun({ id: 42 });
		const result = deriveNavRunState(buildActiveRunResponse(run));

		expect(result.hasActiveRun).toBe(true);
	});

	it("reflects pending pipeline upgrades", () => {
		const run = createMockRun({
			id: 13,
			pendingUpgradeCards: [
				{
					kind: "add-slot",
					slot: {
						gateTypeId: "correct-answers",
						difficulty: "low",
						requirement: { type: "correct-answers", count: 1 },
						reward: 0,
					},
				},
			],
		});

		const result = deriveNavRunState(buildActiveRunResponse(run));

		expect(result.hasPendingPipelineUpgrade).toBe(true);
	});

	it("blocks End Run before gate 5 (anti-farm rule)", () => {
		const run = createMockRun({
			id: 1,
			categoryCoverage: [createMockRunCategoryCoverage({ pollsAnswered: 10 })],
		});

		const result = deriveNavRunState(buildActiveRunResponse(run));

		expect(result.currentGate).toBe(2);
		expect(result.canEndRun).toBe(false);
	});

	it("allows End Run at gate 5+", () => {
		const run = createMockRun({
			id: 1,
			categoryCoverage: [createMockRunCategoryCoverage({ pollsAnswered: 25 })],
		});

		const result = deriveNavRunState(buildActiveRunResponse(run));

		expect(result.currentGate).toBe(5);
		expect(result.canEndRun).toBe(true);
	});
});
