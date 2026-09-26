import { describe, expect, it } from "vitest";

import {
	gatedex,
	gatesClearedIn,
} from "~/modules/collection/dex/domain/gatedex.model";
import { ALL_SWATCHES } from "~/modules/run/gate/domain/swatch.model";
import {
	failPeelShareFor,
	VICTORY_GATE,
} from "~/modules/run/run/domain/rules.model";

const swatchIdsUpTo = (gate: number): readonly string[] =>
	ALL_SWATCHES.filter((swatch) => swatch.gate <= gate).map(
		(swatch) => swatch.id
	);

const rowFor = (gate: number, owned: readonly string[] = []) => {
	const entry = gatedex(owned).find((row) => row.gate === gate);
	if (!entry) throw new Error(`no gatedex row for gate ${gate}`);
	return entry;
};

const unlockLabelsOf = (
	entry: ReturnType<typeof gatedex>[number]
): readonly string[] => entry.unlocks.map((unlock) => unlock.action);

const unlockLabels = (gate: number): readonly string[] =>
	unlockLabelsOf(rowFor(gate));

const everyUnlockLabel = (): readonly string[] =>
	gatedex([]).flatMap(unlockLabelsOf);

describe("gatedex", () => {
	it("lists one row per gate, in climb order", () => {
		expect(gatedex([]).map((entry) => entry.gate)).toEqual(
			ALL_SWATCHES.map((swatch) => swatch.gate)
		);
	});

	it("marks a gate cleared once its swatch is owned", () => {
		expect(rowFor(0, swatchIdsUpTo(0)).state).toBe("cleared");
	});

	it("points 'next' at the lowest gate whose swatch is missing", () => {
		const ladder = gatedex(swatchIdsUpTo(2));

		expect(ladder.filter((entry) => entry.state === "next")).toHaveLength(1);
		expect(rowFor(3, swatchIdsUpTo(2)).state).toBe("next");
	});

	it("opens on gate 0 for an account that has never cleared anything", () => {
		expect(rowFor(0).state).toBe("next");
	});

	it("leaves no gate 'next' once every swatch is owned", () => {
		const ladder = gatedex(ALL_SWATCHES.map((swatch) => swatch.id));

		expect(ladder.every((entry) => entry.state === "cleared")).toBe(true);
	});

	it("points 'next' at a gap rather than shifting the rows below it", () => {
		const skippedBoulder = swatchIdsUpTo(3).filter(
			(id) => id !== ALL_SWATCHES[1].id
		);

		expect(rowFor(1, skippedBoulder).state).toBe("next");
		expect(rowFor(3, skippedBoulder).state).toBe("cleared");
	});

	it("counts the cleared rows, which is the tab's numerator", () => {
		expect(gatesClearedIn(gatedex(swatchIdsUpTo(4)))).toBe(5);
	});

	it("names only the last gate as the one that wins the run", () => {
		expect(gatedex([]).filter((entry) => entry.winsTheRun)).toHaveLength(1);
		expect(rowFor(VICTORY_GATE).winsTheRun).toBe(true);
	});

	it("states the gate's own peel share, since no audit is certain any more", () => {
		expect(rowFor(11).peelShare).toBe(failPeelShareFor(11));
		expect(rowFor(12).peelShare).toBeGreaterThan(rowFor(10).peelShare);
	});

	it("states a gate's audit shape as a capacity, since rivals fill it", () => {
		expect(rowFor(3).auditCapacity).toBe(1);
		expect(rowFor(3).auditPool.length).toBeGreaterThan(1);
		expect(rowFor(8).auditCapacity).toBe(2);
		expect(rowFor(12).auditCapacity).toBe(3);
	});

	it("gives the clean gates no pool and no capacity", () => {
		for (const gate of [0, 1, 2]) {
			expect(rowFor(gate).auditCapacity).toBe(0);
			expect(rowFor(gate).auditPool).toEqual([]);
		}
	});

	it("promises no width, because slots are bought and never handed over", () => {
		expect(everyUnlockLabel()).toEqual(
			expect.arrayContaining([
				"rebuild",
				"extend",
				"hotReload",
				"returnPolicy",
				"abandon",
				"pin",
			])
		);
		expect(everyUnlockLabel()).toHaveLength(6);
	});

	it("hangs a shop action one gate below its gatesCleared floor", () => {
		expect(unlockLabels(0)).toContain("rebuild");
		expect(unlockLabels(2)).toContain("extend");
		expect(unlockLabels(3)).toContain("pin");
	});

	it("hangs no archive service on any gate, since the profile sells it before the run", () => {
		expect(everyUnlockLabel()).not.toContain("bootCache");
		expect(everyUnlockLabel()).not.toContain("dockerImage");
	});

	it("promises no lock — that action belongs to .lock, not a gate", () => {
		expect(everyUnlockLabel()).not.toContain("lock");
	});
});
