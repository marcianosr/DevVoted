import { describe, expect, it } from "vitest";

import {
	type GateAnswer,
	type GateOutcomeFrame,
	gateOutcomePropsFor,
	outcomeRevealOf,
	peelPicksOf,
	peelPlanOf,
} from "~/modules/run/gate/application/gateOutcome.viewmodel";
import { slotsOf } from "~/modules/run/config/domain/config.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { bandAtLadder, clearsAt } from "~/modules/run/gate/domain/gate.model";
import { coverageGainPercentFor } from "~/modules/run/build/domain/coverageRatio.model";
import {
	roundToOneDecimal,
	VICTORY_GATE,
} from "~/modules/run/run/domain/rules.model";
import { STORAGE_BALANCE } from "~/shared/lib/copy";
import type { VerdictOutcome } from "~/ui/kanto-theme/Verdict.ui";

const GATE_4_LADDER = { floor: 5, ok: 15, healthy: 25 };

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
	closing: clearsAt(bandAtLadder(held, GATE_4_LADDER).id, GATE)
		? "cleared"
		: "held",
	answers: Array.from({ length: 5 }, () => answerAt("correct")),
	swatchGates,
	balanceBeforeKb: 64,
	configs: [],
	bar: { ...GATE_4_LADDER, held, band: bandAtLadder(held, GATE_4_LADDER).id },
	payoutKb: 32,
	bonusKb: 0,
	faucetKb: 0,
	billKb: 0,
});

const CLEARED = 30;
const SHORT = 10;

const heldByUnscored = (): GateOutcomeFrame => ({
	...frameOf([], CLEARED),
	closing: "held",
	heldBy: "unscored",
	answers: [
		answerAt("correct"),
		...Array.from({ length: 4 }, () => answerAt("wrong")),
	],
});

describe("a Champion that closed on OK", () => {
	const championOnOk = (): GateOutcomeFrame => ({
		...frameOf([], GATE_4_LADDER.ok + 5),
		gate: VICTORY_GATE,
		closing: "held",
		heldBy: "band",
	});

	it("reads as a hold with the peel choice, not as a summit", () => {
		const props = gateOutcomePropsFor(championOnOk());

		expect(props.header.title).toBe("Champion holds");
		expect(props.tail?.choice).toBeDefined();
		expect(props.tail?.ending).toBeUndefined();
	});
});

describe("a close recorded under the old window minimum", () => {
	it("reads as a hold with the peel choice, whatever the bar says", () => {
		const props = gateOutcomePropsFor(heldByUnscored());

		expect(props.header.title).toBe("Lavender holds");
		expect(props.tail?.choice).toBeDefined();
		expect(props.storage.badges?.[0]?.label).toBe("nothing paid");
	});

	const peeling = (frame: Partial<GateOutcomeFrame>): GateOutcomeFrame => ({
		...heldByUnscored(),
		configs: [CONFIGS.cache, CONFIGS.indexedDb],
		peelSlotsRemaining: 3,
		balanceBeforeKb: 0,
		...frame,
	});

	const pressOf = (frame: GateOutcomeFrame) =>
		gateOutcomePropsFor(frame).footer.action;

	it("offers storage and every config that pays alone, storage picked first", () => {
		const frame = peeling({ balanceBeforeKb: 512 });

		expect(peelPlanOf(frame)).toEqual({
			kind: "single",
			storage: true,
			singles: [CONFIGS.cache],
			move: { kind: "storage" },
		});
		expect(peelPicksOf(frame)).toEqual({ chosen: [], fromStorage: true });
		expect(pressOf(frame).label).toBe("Pay from storage");
	});

	it("lets a picked config replace storage as the move", () => {
		const frame = peeling({
			balanceBeforeKb: 512,
			chosen: [CONFIGS.cache.id],
			fromStorage: true,
		});

		expect(peelPicksOf(frame)).toEqual({
			chosen: [CONFIGS.cache.id],
			fromStorage: false,
		});
		expect(pressOf(frame).label).toBe("Drop Cache");
	});

	it("ignores a picked config that cannot pay the peel alone", () => {
		const frame = peeling({
			balanceBeforeKb: 512,
			chosen: [CONFIGS.indexedDb.id],
		});

		expect(peelPicksOf(frame)).toEqual({ chosen: [], fromStorage: true });
	});

	it("waits for a config when storage falls short", () => {
		const frame = peeling({ balanceBeforeKb: 8 });

		expect(pressOf(frame)).toEqual({ label: "Pick a config" });
		expect(gateOutcomePropsFor(frame).footer.note).toBe(
			"you have 8 KB · 40 KB short"
		);
	});

	it("combines drops and storage only when no single move pays", () => {
		expect(
			peelPlanOf(
				peeling({
					configs: [CONFIGS.indexedDb, CONFIGS.telemetry],
					balanceBeforeKb: 16,
				})
			)
		).toEqual({ kind: "mix" });
	});

	it("leaves only the way out when everything together falls short", () => {
		const frame = peeling({ configs: [CONFIGS.indexedDb] });

		expect(peelPlanOf(frame)).toEqual({ kind: "stuck" });
		expect(pressOf(frame).onPress).toBeUndefined();
	});

	it("says the window came up short, not the meter", () => {
		const props = gateOutcomePropsFor(heldByUnscored());

		expect(props.header.note).toContain("the window came up short");
		expect(props.header.note).not.toContain("the meter fell short");
		expect(props.coverageHold).toBe("the window came up short");
	});

	it("keeps the meter's own honest band beside the reason it held", () => {
		const props = gateOutcomePropsFor(heldByUnscored());

		expect(props.outcome).toBe("shaky");
		expect(props.bar.held).toBe(CLEARED);
	});

	it("leaves the bar reading where the run actually stands", () => {
		expect(gateOutcomePropsFor(heldByUnscored()).bar.held).toBe(CLEARED);
	});

	it("states the gate's gain with no coverage shortfall, since there is none", () => {
		const badges = gateOutcomePropsFor(heldByUnscored()).coverage.badges;

		expect(badges?.[0]?.label).toMatch(/^[+-]\d/);
		expect(badges).toHaveLength(1);
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
	it("reads the swatch off the run's record, not off the band it closed in", () => {
		const props = gateOutcomePropsFor(frameOf([GATE], SHORT));

		expect(props.header.swatchState).toBe("discovered");
		expect(props.earned?.rows.map((row) => row.name)).toEqual([
			"Lavender swatch earned",
		]);
	});

	it("withholds the swatch from a clear the window did not earn", () => {
		const props = gateOutcomePropsFor(frameOf([], CLEARED));

		expect(props.header.swatchState).toBe("current");
		expect(props.earned?.rows.map((row) => row.name)).toEqual([
			"Lavender swatch missed",
		]);
	});

	it("states the swatch only in the Earned panel, never as a header line", () => {
		expect(
			gateOutcomePropsFor(frameOf([], CLEARED)).header.note
		).toBeUndefined();
		expect(
			gateOutcomePropsFor(frameOf([GATE], CLEARED)).header.note
		).toBeUndefined();
	});

	it("never says 'earned' in a headline that only reports the clear", () => {
		expect(gateOutcomePropsFor(frameOf([], CLEARED)).header.title).toBe(
			"Lavender cleared"
		);
		expect(gateOutcomePropsFor(frameOf([GATE], SHORT)).header.title).toBe(
			"Lavender holds"
		);
	});

	it("asks a missed swatch for a full bar and badges the coverage held", () => {
		const row = gateOutcomePropsFor(frameOf([], CLEARED)).earned?.rows.at(-1);

		expect(row?.detail).toBe("needs 100% coverage");
		expect(row?.badge).toEqual({ label: "30%" });
		expect(row?.marks).toBeUndefined();
	});

	it("caps the earned swatch's badge at a full bar", () => {
		const row = gateOutcomePropsFor(frameOf([GATE], 130)).earned?.rows.at(-1);

		expect(row?.badge?.label).toBe("100%");
	});

	it("never names the gate's codebase on the bar, the Earned panel or the next gate's note", () => {
		for (const frame of [frameOf([], CLEARED), frameOf([GATE], 100)]) {
			const props = gateOutcomePropsFor(frame);
			const stated = [
				props.bar.note ?? "",
				props.earned?.summary ?? "",
				...(props.earned?.rows ?? []).flatMap((row) => [
					row.name,
					row.detail ?? "",
					row.badge?.label ?? "",
				]),
			].join(" ");

			expect(stated).not.toMatch(/\bchanges?\b/i);
		}
	});

	it("lists what a single and a multiple choice are worth at the gate a clear opens", () => {
		expect(gateOutcomePropsFor(frameOf([], CLEARED)).nextGate).toEqual({
			title: "At Celadon",
			rates: [
				{
					label: "single choice",
					gain: `+${roundToOneDecimal(coverageGainPercentFor(1, GATE + 1))}%`,
				},
				{
					label: "multiple choice",
					gain: `+${roundToOneDecimal(coverageGainPercentFor(2, GATE + 1))}%`,
				},
			],
		});
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
			"Transaction committed"
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
			"Transaction rolled back"
		);

		expect(row?.notes).toEqual(["80 KB unpaid"]);
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
			"Transaction committed"
		);
		expect(labelsOf(frameOf([], SHORT))).not.toContain(
			"Transaction rolled back"
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
	});
	const rowNamed = (frame: GateOutcomeFrame, label: string) =>
		gateOutcomePropsFor(frame).storage.rows.find((row) => row.label === label);

	it("keeps the gate's own row to the base with no streak note", () => {
		const row = rowNamed(itemised(), "Gate cleared");

		expect(row?.notes).toBeUndefined();
		expect(row?.figures).toContainEqual(
			expect.objectContaining({ label: "+36 KB" })
		);
	});

	it("gives a flat clear payout its own row, led by the chip of the config that pays it", () => {
		expect(gateOutcomePropsFor(itemised()).storage.rows).toContainEqual(
			expect.objectContaining({
				config: expect.objectContaining({ name: "Build Artifacts" }),
				notes: ["on the clear"],
				figures: [expect.objectContaining({ label: "+32 KB" })],
			})
		);
	});

	it("names the surplus sold past the full bar", () => {
		expect(rowNamed(itemised(), "Surplus")?.figures).toContainEqual(
			expect.objectContaining({ label: "+53 KB" })
		);
	});

	it("counts every payout row in the strip and leaves out bills it never sent", () => {
		expect(gateOutcomePropsFor(itemised()).storage.summary).toBe("3 payouts");
	});

	it("names the bill beside the payouts when the build sent one", () => {
		expect(
			gateOutcomePropsFor({ ...itemised(), billKb: 8 }).storage.summary
		).toBe("3 payouts, 1 bill");
	});

	it("states the bill once, as its figure, with no rate note under the row", () => {
		const row = rowNamed({ ...itemised(), billKb: 8 }, "Storage plan");

		expect(row?.notes).toBeUndefined();
		expect(row?.figures).toEqual([{ label: "−8 KB", color: "cinnabar" }]);
	});

	it("reads the balance it moved from and landed on, leaving the step to the fold's badge", () => {
		const row = rowNamed(itemised(), STORAGE_BALANCE);

		expect(row?.total).toBe(true);
		expect(row?.figures?.[0]).toEqual(
			expect.objectContaining({ label: "64 →", tone: "quiet" })
		);
		expect(row?.figures?.[1]).toEqual(
			expect.objectContaining({ label: expect.stringContaining("KB") })
		);
		expect(row?.figures).toHaveLength(2);
	});

	it("badges the landing rather than spelling it in a bare span", () => {
		const row = rowNamed(itemised(), STORAGE_BALANCE);

		expect(row?.figures?.[1]).not.toHaveProperty("tone");
	});

	it("badges the landing green with the floppy, like the header balance", () => {
		const row = rowNamed(itemised(), STORAGE_BALANCE);

		expect(row?.figures?.[1]).toEqual(
			expect.objectContaining({ color: "viridian", icon: "floppy" })
		);
	});

	it("keeps the whole payout on the gate's row when the parts are unknown", () => {
		const row = rowNamed(frameOf([], CLEARED), "Gate cleared");

		expect(row?.notes).toBeUndefined();
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
		closing: "held",
		bar: { ...GATE_4_LADDER, held: 2, band: "danger" },
		heldBy: "catch",
		caughtFatalBy: "Try/Catch",
	});

	it("keeps the sub-floor reading the run actually had", () => {
		expect(gateOutcomePropsFor(caught()).bar.held).toBe(2);
	});

	it("titles it as a hold, not as the run ending", () => {
		expect(gateOutcomePropsFor(caught()).header.title).toBe("Lavender holds");
	});

	it("names the catch in the note rather than leaving the hold unexplained", () => {
		expect(gateOutcomePropsFor(caught()).header.note).toContain("caught");
	});

	it("chips what spent itself saving the run", () => {
		expect(gateOutcomePropsFor(caught()).header.badges).toContainEqual(
			expect.objectContaining({ label: "Try/Catch caught" })
		);
	});

	const peelingCaught = (chosen: readonly string[]): GateOutcomeFrame => ({
		...caught(),
		configs: [CONFIGS.tryCatch, CONFIGS.cache],
		peelSlotsRemaining: slotsOf(CONFIGS.tryCatch) + 3,
		balanceBeforeKb: 10_000,
		chosen,
	});

	const choiceOf = (frame: GateOutcomeFrame) =>
		gateOutcomePropsFor(frame).tail?.choice;

	const rowsOf = (frame: GateOutcomeFrame) => {
		const options = choiceOf(frame)?.options;
		return options?.kind === "radio" ? options.rows : [];
	};

	it("lifts the catch out of the moves into a step of its own", () => {
		const frame = peelingCaught([]);

		expect(choiceOf(frame)?.catch?.config.name).toBe(CONFIGS.tryCatch.label);
		expect(rowsOf(frame).map((row) => row.name)).not.toContain(
			CONFIGS.tryCatch.label
		);
	});

	it("refuses the press until the catch is picked", () => {
		expect(gateOutcomePropsFor(peelingCaught([])).footer.action).toEqual({
			label: "Drop Try/Catch first",
		});
	});

	it("keeps every move shut and unpicked until the catch is picked", () => {
		for (const row of rowsOf(peelingCaught([])))
			expect(row.pick).toEqual(
				expect.objectContaining({ disabled: true, checked: false })
			);
	});

	it("badges the catch as the drop that comes first", () => {
		expect(choiceOf(peelingCaught([]))?.catch?.config.badges).toContainEqual(
			expect.objectContaining({ label: "drop first" })
		);
	});

	it("keeps the catch step on screen once it is picked, struck through", () => {
		expect(
			choiceOf(peelingCaught([CONFIGS.tryCatch.id]))?.catch?.config.lost
		).toBe(true);
	});

	it("asks only for what the catch left owed once it is picked", () => {
		const frame = peelingCaught([CONFIGS.tryCatch.id]);

		expect(choiceOf(frame)?.owed).toBe("48 KB");
		for (const row of rowsOf(frame)) expect(row.pick.disabled).toBe(false);
	});

	it("keeps the catch in the drop whichever move pays the rest", () => {
		const frame = peelingCaught([CONFIGS.tryCatch.id, CONFIGS.cache.id]);

		expect(peelPicksOf(frame)).toEqual({
			chosen: [CONFIGS.tryCatch.id, CONFIGS.cache.id],
			fromStorage: false,
		});
	});

	it("opens the retry when the catch alone covers the peel", () => {
		const frame = {
			...peelingCaught([CONFIGS.tryCatch.id]),
			peelSlotsRemaining: slotsOf(CONFIGS.tryCatch),
		};

		expect(gateOutcomePropsFor(frame).footer.action.label).toBe("Retry gate 4");
		expect(choiceOf(frame)?.owed).toBeUndefined();
	});

	it("quotes no refund on the catch, since the catch pays none", () => {
		const frame = {
			...peelingCaught([CONFIGS.tryCatch.id]),
			configs: [CONFIGS.tryCatch, CONFIGS.garbageCollection],
		};

		expect(choiceOf(frame)?.catch?.config.badges).toHaveLength(1);
	});

	it("has no catch step on a hold that nothing caught", () => {
		expect(choiceOf(frameOf([], SHORT))?.catch).toBeUndefined();
	});

	it("chips nothing on a hold that nothing caught", () => {
		expect(
			gateOutcomePropsFor(frameOf([], SHORT)).header.badges
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
		expect(rowNamed(survived(), "Audits survived")?.figures).toContainEqual(
			expect.objectContaining({ label: "+64 KB" })
		);
		expect(rowNamed(survived(), "Gate cleared")?.figures).toContainEqual(
			expect.objectContaining({ label: "+32 KB" })
		);
	});

	it("draws no survival row on a gate nobody attacked", () => {
		expect(rowNamed(frameOf([], CLEARED), "Audits survived")).toBeUndefined();
	});

	it("chips nothing earned: a clear is paid in KB, never in ammunition", () => {
		const props = gateOutcomePropsFor(frameOf([], CLEARED));

		expect(props.header.badges).not.toContainEqual(
			expect.objectContaining({ label: "audit earned" })
		);
	});
});

describe("the storage fold's headline", () => {
	it("states the balance change, the bill already taken off", () => {
		const billed: GateOutcomeFrame = {
			...frameOf([], CLEARED),
			payoutKb: 85,
			billKb: 16,
		};

		expect(gateOutcomePropsFor(billed).storage.badges?.[0]?.label).toBe(
			"+69 KB"
		);
	});
});

describe("a PERFECT close states its bonus (ADR-075)", () => {
	const perfect = (bonusKb: number): GateOutcomeFrame => ({
		...frameOf([GATE], 100),
		payoutKb: 48,
		bonusKb,
	});

	it("opens a bonus panel with the KB it paid", () => {
		const { bonus } = gateOutcomePropsFor(perfect(16));

		expect(bonus?.badges?.[0].label).toBe("+16 KB");
		expect(bonus?.detail).toContain("×1.5");
	});

	it("leaves the panel out when the bonus paid nothing", () => {
		expect(gateOutcomePropsFor(perfect(0)).bonus).toBeUndefined();
	});
});

describe("outcomeRevealOf", () => {
	const PERFECT = 100;

	it("plays a clear that counts the balance up by the payout and names the next gate", () => {
		const reveal = outcomeRevealOf(frameOf([], CLEARED));

		expect(reveal.kind).toBe("cleared");
		expect(reveal.stamp).toBe("healthy");
		expect(reveal.balance).toEqual({
			label: STORAGE_BALANCE,
			fromKb: 64,
			toKb: 96,
		});
		expect(reveal.next?.label).toBe("Next: Celadon");
		expect(reveal.archive).toBeUndefined();
	});

	it("plays perfect for a full bar and stamps PERFECT", () => {
		const reveal = outcomeRevealOf(frameOf([GATE], PERFECT));

		expect(reveal.kind).toBe("perfect");
		expect(reveal.stamp).toBe("perfect");
	});

	it("plays shaky for a held gate, keeps the balance and names no next gate", () => {
		const reveal = outcomeRevealOf(frameOf([], SHORT));

		expect(reveal.kind).toBe("shaky");
		expect(reveal.stamp).toBe("shaky");
		expect(reveal.balance.toKb).toBe(reveal.balance.fromKb);
		expect(reveal.next).toBeUndefined();
		expect(reveal.note).toContain("fresh polls on the retry");
	});

	it("plays the catch with the catcher's name and stamps the danger the bar read", () => {
		const reveal = outcomeRevealOf({
			...frameOf([], 2),
			closing: "held",
			heldBy: "catch",
			caughtFatalBy: "Try/Catch",
		});

		expect(reveal.kind).toBe("caught");
		expect(reveal.stamp).toBe("danger");
		expect(reveal.catcher?.name).toBe("Try/Catch");
	});

	it("plays the end with an archive line naming the gate and what is left unspent", () => {
		const reveal = outcomeRevealOf({ ...frameOf([], 2), closing: "fatal" });

		expect(reveal.kind).toBe("ended");
		expect(reveal.title).toBe("Run over");
		expect(reveal.archive).toEqual([
			"Run over",
			"gate 4 · Lavender",
			"64 KB unspent",
			"Swatches you earned stay on your profile.",
		]);
	});
});
