import { describe, expect, it } from "vitest";

import {
	gatedex,
	gatesClearedIn,
} from "~/modules/collection/dex/domain/gatedex.model";
import { ALL_SWATCHES } from "~/modules/run/gate/domain/swatch.model";
import { VICTORY_GATE } from "~/modules/run/run/domain/rules.model";

const swatchIdsUpTo = (gate: number): readonly string[] =>
	ALL_SWATCHES.filter((swatch) => swatch.gate <= gate).map(
		(swatch) => swatch.id
	);

const rowFor = (gate: number, owned: readonly string[] = []) => {
	const entry = gatedex(owned).find((row) => row.gate === gate);
	if (!entry) throw new Error(`no gatedex row for gate ${gate}`);
	return entry;
};

/** One flat label per unlock, so a row's grants can be asserted as strings
 * without the Dex's own copy leaking into the domain's tests. */
const unlockLabelsOf = (
	entry: ReturnType<typeof gatedex>[number]
): readonly string[] =>
	entry.unlocks.map((unlock) => {
		if (unlock.kind === "slot") return `slot ${unlock.slot}`;
		return unlock.kind === "plan" ? `plan ${unlock.capKb}` : unlock.action;
	});

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

	it("adds an audit's extra peels to the gate's own row and says so", () => {
		// Gate 11 carries Strip, which peels one config on top of the base row.
		expect(rowFor(11).peelsAudited).toBe(true);
		expect(rowFor(11).peels).toBeGreaterThan(rowFor(10).peels);
	});

	it("leaves peelsAudited false where the gate's own row is the whole story", () => {
		expect(rowFor(3).peelsAudited).toBe(false);
	});

	it("names the audits a gate carries", () => {
		expect(rowFor(3).audits).toEqual(["Cost Overrun"]);
		expect(rowFor(8).audits).toEqual(["Timeout", "Flaky Build"]);
	});

	it("hangs a slot on the gate whose clear grants it", () => {
		expect(unlockLabels(1)).toContain("slot 4");
		expect(unlockLabels(3)).toContain("slot 5");
	});

	it("hangs a coverage-only slot on no gate at all", () => {
		// Slot 6 opens on lifetime coverage, so no row may claim it.
		expect(everyUnlockLabel()).not.toContain("slot 6");
	});

	it("hangs a shop action one gate below its gatesCleared floor", () => {
		// LOCK_FROM_GATE is 2, and gatesCleared reaches 2 when gate 1 falls.
		expect(unlockLabels(1)).toContain("lock");
		expect(unlockLabels(2)).toContain("extend");
		expect(unlockLabels(3)).toContain("pin");
	});

	it("hangs a storage plan one gate below its fromGate, and the opening two on none", () => {
		expect(unlockLabels(1)).toContain("plan 768");
		expect(unlockLabels(3)).toContain("plan 1024");
		expect(everyUnlockLabel()).not.toContain("plan 640");
	});
});
