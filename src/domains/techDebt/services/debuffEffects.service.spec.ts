import { describe, expect, it } from "vitest";

import { ActiveTechDebt } from "~/domains/techDebt/models/techDebt.model";

import { isShopLockedByTechDebt } from "./debuffEffects.service";

const activeTd = (
	templateId: ActiveTechDebt["templateId"]
): ActiveTechDebt => ({
	id: 1,
	runId: 13,
	templateId,
	acquiredAt: new Date("2026-05-13T00:00:00Z"),
	// Progress shape varies by template; for these tests the kind is what matters,
	// and the predicate doesn't read progress at all.
	progress: { kind: "pipelinesCompleted", completed: 0 },
});

describe("isShopLockedByTechDebt", () => {
	it("returns false when no Tech Debts are active", () => {
		expect(isShopLockedByTechDebt([])).toBe(false);
	});

	it("returns false when active Tech Debts do not include Flaky Suite", () => {
		expect(isShopLockedByTechDebt([activeTd("legacy-module")])).toBe(false);
	});

	it("returns true when Flaky Suite is active", () => {
		expect(isShopLockedByTechDebt([activeTd("flaky-suite")])).toBe(true);
	});

	it("returns true when Flaky Suite is among multiple active Tech Debts", () => {
		expect(
			isShopLockedByTechDebt([
				activeTd("legacy-module"),
				activeTd("flaky-suite"),
				activeTd("lost-docs"),
			])
		).toBe(true);
	});
});
