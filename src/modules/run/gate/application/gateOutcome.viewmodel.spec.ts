import { describe, expect, it } from "vitest";

import {
	type GateAnswer,
	type GateOutcomeFrame,
	closedBarFor,
	gateOutcomePropsFor,
} from "~/modules/run/gate/application/gateOutcome.viewmodel";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { STORAGE_BALANCE } from "~/shared/lib/copy";
import type { VerdictOutcome } from "~/ui/kanto-theme/Verdict.ui";

const GATE_0_LADDER = { floor: 0, ok: 40, healthy: 60 };
const GATE_4_LADDER = { floor: 5, ok: 15, healthy: 25 };

describe("closedBarFor", () => {
	it("leaves a genuine clear's reading untouched", () => {
		expect(closedBarFor("cleared", GATE_4_LADDER, 30).held).toBe(30);
		expect(closedBarFor("cleared", GATE_0_LADDER, 100).held).toBe(100);
	});

	it("never lifts a flawless opening gate onto its healthy line", () => {
		expect(closedBarFor("cleared", GATE_0_LADDER, 100).held).not.toBe(
			GATE_0_LADDER.healthy
		);
	});

	it("holds a missed gate inside the band its verdict names", () => {
		expect(closedBarFor("held", GATE_4_LADDER, 30).held).toBeLessThan(
			GATE_4_LADDER.ok
		);
		expect(closedBarFor("held", GATE_4_LADDER, 30, "band").held).toBeLessThan(
			GATE_4_LADDER.ok
		);
		expect(closedBarFor("fatal", GATE_4_LADDER, 30).held).toBeLessThan(
			GATE_4_LADDER.floor
		);
	});

	it("keeps the honest reading when the floor rule held the gate, not the meter", () => {
		expect(closedBarFor("held", GATE_4_LADDER, 30, "floor").held).toBe(30);
	});
});

const GATE = 4;

const answerAt = (outcome: VerdictOutcome): GateAnswer => ({
	category: "js",
	question: "Which method returns the last element of an array?",
	outcome,
	coverage: 5,
	units: 1.25,
	answerType: "single",
	options: ["at(-1)", "pop()"],
	picked: ["at(-1)"],
	correct: ["at(-1)"],
});

const frameOf = (
	swatchGates: readonly number[],
	held: number
): GateOutcomeFrame => ({
	gate: GATE,
	answers: Array.from({ length: 5 }, () => answerAt("correct")),
	swatchGates,
	balanceBeforeKb: 64,
	configs: [],
	bar: { ...GATE_4_LADDER, held },
	payoutKb: 32,
	bonusKb: 0,
	faucetKb: 0,
	billKb: 0,
});

const CLEARED = 30;
const SHORT = 10;

const heldByFloor = (): GateOutcomeFrame => ({
	...frameOf([], CLEARED),
	heldBy: "floor",
	answers: [
		answerAt("correct"),
		...Array.from({ length: 4 }, () => answerAt("wrong")),
	],
});

describe("a gate the floor rule held on a good meter (ADR-094)", () => {
	it("reads as a hold with the peel choice, whatever the bar says", () => {
		const props = gateOutcomePropsFor(heldByFloor());

		expect(props.header.title).toBe("Lavender holds");
		expect(props.tail?.choice).toBeDefined();
		expect(props.storage.badges?.[0]?.label).toBe("nothing paid");
	});

	const dropBadgeFor = (frame: GateOutcomeFrame, name: string) => {
		const chip = gateOutcomePropsFor(
			frame
		).tail?.choice?.peel.drop.configs.find((config) => config.name === name);
		return chip?.badges?.at(-1);
	};

	const peeling = (chosen: readonly string[]): GateOutcomeFrame => ({
		...heldByFloor(),
		configs: [CONFIGS.js, CONFIGS.ts, CONFIGS.css],
		chosen,
	});

	it("keeps every drop live while the peel is still owed", () => {
		const badge = dropBadgeFor(peeling([]), CONFIGS.js.label);

		expect(badge).toEqual(expect.objectContaining({ disabled: false }));
	});

	it("spends no config the peel did not ask for, once it is settled", () => {
		const settled = peeling([CONFIGS.js.id]);

		expect(dropBadgeFor(settled, CONFIGS.ts.label)).toEqual(
			expect.objectContaining({ disabled: true })
		);
		expect(dropBadgeFor(settled, CONFIGS.css.label)).toEqual(
			expect.objectContaining({ disabled: true })
		);
	});

	it("lets a config already dropping be taken back after the bill is met", () => {
		const badge = dropBadgeFor(peeling([CONFIGS.js.id]), CONFIGS.js.label);

		expect(badge).toEqual(
			expect.objectContaining({ armed: true, disabled: false })
		);
	});

	it("says the day came up short, not the meter", () => {
		const props = gateOutcomePropsFor(heldByFloor());

		expect(props.header.subtitle).toContain("1 of 5 right, 2 needed");
		expect(props.header.subtitle).not.toContain("the meter fell short");
		expect(props.coverage.badges?.[1]?.label).toBe("1 of 5 right");
	});

	it("leaves the bar reading where the run actually stands", () => {
		expect(gateOutcomePropsFor(heldByFloor()).bar.held).toBe(CLEARED);
	});

	it("still states what the gate itself gained, beside the shortfall", () => {
		const badges = gateOutcomePropsFor(heldByFloor()).coverage.badges;

		expect(badges?.[0]?.label).toMatch(/^[+-]\d/);
		expect(badges).toHaveLength(2);
	});
});

describe("the By category panel", () => {
	it("totals nothing: the gate's gain is its header badge, the line is the bar", () => {
		const props = gateOutcomePropsFor(frameOf([], CLEARED));

		expect(props.coverage.rows.some((row) => row.total === true)).toBe(false);
		expect(
			props.coverage.rows.some((row) =>
				row.figures?.some((figure) =>
					(figure.locked === true ? "" : figure.label).includes("needed")
				)
			)
		).toBe(false);
	});

	it("states each category's share as a percentage, as its own summary does", () => {
		const props = gateOutcomePropsFor(frameOf([], CLEARED));

		for (const row of props.coverage.rows)
			expect(
				row.figures?.every((figure) =>
					(figure.locked === true ? "%" : figure.label).endsWith("%")
				)
			).toBe(true);
	});
});

describe("gateOutcomePropsFor and the swatch", () => {
	it("hands the swatch to a flawless window even where the gate only holds", () => {
		const header = gateOutcomePropsFor(frameOf([GATE], SHORT)).header;

		expect(header.earned).toBe(true);
		expect(header.chips).toContainEqual(
			expect.objectContaining({ label: "swatch earned" })
		);
	});

	it("withholds the swatch from a clear the window did not earn", () => {
		const header = gateOutcomePropsFor(frameOf([], CLEARED)).header;

		expect(header.earned).toBe(false);
		expect(header.chips).not.toContainEqual(
			expect.objectContaining({ label: "swatch earned" })
		);
	});

	it("never says 'earned' in a headline that only reports the clear", () => {
		expect(gateOutcomePropsFor(frameOf([], CLEARED)).header.title).toBe(
			"Lavender cleared"
		);
		expect(gateOutcomePropsFor(frameOf([GATE], SHORT)).header.title).toBe(
			"Lavender holds"
		);
	});

	it("fills only the gates the run played clean on the track", () => {
		const { swatches } = gateOutcomePropsFor(
			frameOf([1, GATE], CLEARED)
		).header;

		expect(swatches.map((fill) => fill.state)).toEqual([
			"undiscovered",
			"discovered",
			"undiscovered",
			"undiscovered",
			"discovered",
			"current",
			...Array.from({ length: 7 }, () => "undiscovered"),
		]);
	});
});

describe("the storage ledger names Database's transaction", () => {
	const labelsOf = (frame: GateOutcomeFrame) =>
		gateOutcomePropsFor(frame).storage.rows.map((row) => row.label);

	const rowNamed = (frame: GateOutcomeFrame, label: string) =>
		gateOutcomePropsFor(frame).storage.rows.find((row) => row.label === label);

	it("gives a committed transaction its own row on a clear", () => {
		const row = rowNamed(
			{ ...frameOf([], CLEARED), escrowCommittedKb: 16 },
			"transaction committed"
		);

		expect(row?.figures).toContainEqual(
			expect.objectContaining({ label: "+16 KB" })
		);
	});

	it("keeps the commit out of the gate's own row, so the column still adds up", () => {
		const committed = gateOutcomePropsFor({
			...frameOf([], CLEARED),
			escrowCommittedKb: 16,
		});
		const plain = gateOutcomePropsFor(frameOf([], CLEARED));
		const gateRowOf = (props: typeof plain) =>
			props.storage.rows.find((row) => row.label === "Gate cleared");

		expect(gateRowOf(committed)?.figures).toContainEqual(
			expect.objectContaining({ label: "+16 KB" })
		);
		expect(gateRowOf(plain)?.figures).toContainEqual(
			expect.objectContaining({ label: "+32 KB" })
		);
	});

	it("names a rolled-back transaction on a held gate, and what it would have paid", () => {
		const row = rowNamed(
			{ ...frameOf([], SHORT), escrowRolledBackKb: 40 },
			"transaction rolled back"
		);

		expect(row?.detail).toBe("· 80 KB unpaid");
		expect(row?.figures).toContainEqual(
			expect.objectContaining({ label: "nothing paid" })
		);
	});

	it("moves no KB when it rolls back — the balance never held it", () => {
		const held = frameOf([], SHORT);
		const balanceIn = (frame: GateOutcomeFrame) =>
			gateOutcomePropsFor(frame).storage.rows.find((row) => row.total)?.figures;

		expect(balanceIn({ ...held, escrowRolledBackKb: 40 })).toEqual(
			balanceIn(held)
		);
	});

	it("draws no transaction row for a build without Database", () => {
		expect(labelsOf(frameOf([], CLEARED))).not.toContain(
			"transaction committed"
		);
		expect(labelsOf(frameOf([], SHORT))).not.toContain(
			"transaction rolled back"
		);
	});
});

describe("a clear whose parts are known", () => {
	const itemised = (): GateOutcomeFrame => ({
		...frameOf([], CLEARED),
		configs: [CONFIGS.unitTests],
		payoutKb: 121,
		clearKb: 68,
		overflowKb: 53,
		streak: 4,
	});
	const rowNamed = (frame: GateOutcomeFrame, label: string) =>
		gateOutcomePropsFor(frame).storage.rows.find((row) => row.label === label);

	it("keeps the gate's own row to the base and names the streak it paid on", () => {
		const row = rowNamed(itemised(), "Gate cleared");

		expect(row?.notes).toEqual(["streak ×1.4"]);
		expect(row?.figures).toContainEqual(
			expect.objectContaining({ label: "+36 KB" })
		);
	});

	it("gives a flat clear payout its own row under the config that pays it", () => {
		expect(rowNamed(itemised(), "Build Artifacts")?.figures).toContainEqual(
			expect.objectContaining({ label: "+32 KB" })
		);
	});

	it("names the surplus sold past the full bar", () => {
		expect(rowNamed(itemised(), "surplus")?.figures).toContainEqual(
			expect.objectContaining({ label: "+53 KB" })
		);
	});

	it("counts every payout row in the strip", () => {
		expect(gateOutcomePropsFor(itemised()).storage.summary).toBe(
			"3 payouts, 0 bills"
		);
	});

	it("reads the balance it moved from, landed on, and the step between", () => {
		const row = rowNamed(itemised(), STORAGE_BALANCE);

		expect(row?.total).toBe(true);
		expect(row?.figures?.[0]).toEqual(
			expect.objectContaining({ label: "64 →", tone: "quiet" })
		);
		expect(row?.figures?.[1]).toEqual(
			expect.objectContaining({ label: expect.stringContaining("KB") })
		);
		expect(row?.figures?.[2]).toEqual(
			expect.objectContaining({ label: expect.stringMatching(/^[+-]/) })
		);
	});

	it("badges the landing rather than spelling it in a bare span", () => {
		const row = rowNamed(itemised(), STORAGE_BALANCE);

		expect(row?.figures?.[1]).not.toHaveProperty("tone");
	});

	it("keeps the whole payout on the gate's row when the parts are unknown", () => {
		const row = rowNamed(frameOf([], CLEARED), "Gate cleared");

		expect(row?.notes).toEqual([]);
		expect(row?.figures).toContainEqual(
			expect.objectContaining({ label: "+32 KB" })
		);
	});

	it("reads each answer in the units the poll screen paid it in", () => {
		const answers = gateOutcomePropsFor(frameOf([], CLEARED)).answers;

		expect(answers.rows[0]?.figures).toContainEqual(
			expect.objectContaining({ label: "+1.25" })
		);
	});
});

describe("a caught gate reads as a hold that owes its reason", () => {
	const caught = (): GateOutcomeFrame => ({
		...frameOf([], SHORT),
		bar: closedBarFor("held", GATE_4_LADDER, 2, "catch"),
		heldBy: "catch",
		caughtFatalBy: "Try/Catch",
	});

	it("keeps the sub-floor reading the run actually had", () => {
		expect(closedBarFor("held", GATE_4_LADDER, 2, "catch").held).toBe(2);
		expect(closedBarFor("held", GATE_4_LADDER, 2, "band").held).toBe(
			GATE_4_LADDER.floor
		);
	});

	it("titles it as a hold, not as the run ending", () => {
		expect(gateOutcomePropsFor(caught()).header.title).toBe("Lavender holds");
	});

	it("names the catch in the subtitle rather than leaving the hold unexplained", () => {
		expect(gateOutcomePropsFor(caught()).header.subtitle).toContain("caught");
	});

	it("chips what spent itself saving the run", () => {
		expect(gateOutcomePropsFor(caught()).header.chips).toContainEqual(
			expect.objectContaining({ label: "Try/Catch caught" })
		);
	});

	it("chips nothing on a hold that nothing caught", () => {
		expect(
			gateOutcomePropsFor(frameOf([], SHORT)).header.chips
		).not.toContainEqual(
			expect.objectContaining({ label: "Try/Catch caught" })
		);
	});
});

describe("what surviving a rival's audits paid, and the heldAudit the clear armed (ADR-099)", () => {
	const survived = (): GateOutcomeFrame => ({
		...frameOf([], CLEARED),
		payoutKb: 96,
		clearKb: 32,
		incidentSurvivalKb: 64,
	});
	const rowNamed = (frame: GateOutcomeFrame, label: string) =>
		gateOutcomePropsFor(frame).storage.rows.find((row) => row.label === label);

	it("gives the survival bonus its own row and keeps the gate's row to the clear", () => {
		expect(rowNamed(survived(), "audits survived")?.figures).toContainEqual(
			expect.objectContaining({ label: "+64 KB" })
		);
		expect(rowNamed(survived(), "Gate cleared")?.figures).toContainEqual(
			expect.objectContaining({ label: "+32 KB" })
		);
	});

	it("draws no survival row on a gate nobody attacked", () => {
		expect(rowNamed(frameOf([], CLEARED), "audits survived")).toBeUndefined();
	});

	it("chips the audit the clear armed", () => {
		const props = gateOutcomePropsFor({
			...frameOf([], CLEARED),
			auditHanded: true,
		});
		expect(props.header.chips).toContainEqual(
			expect.objectContaining({ label: "audit earned" })
		);
	});
});
