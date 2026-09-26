import { describe, expect, it } from "vitest";

import { slotsOf } from "~/modules/run/config/domain/config.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { GATE_COUNT } from "~/modules/run/run/domain/rules.model";
import {
	runAnswers,
	runOverFrame,
	runPayoutRows,
	SAMPLE_GATE,
} from "~/test/kantoRunOver.factory";

import { runOverPropsFor } from "./runOverScreen.viewmodel";

const propsFor = (overrides = {}) => runOverPropsFor(runOverFrame(overrides));

describe("runOverPropsFor", () => {
	describe("the header", () => {
		it("counts the gates held against the whole ladder", () => {
			const { header } = propsFor();

			expect(header.figure.amount).toBe("4 gates");
			expect(header.figure.note).toBe(`of ${GATE_COUNT}`);
		});

		it("names the gate that stopped the run and the line it missed", () => {
			const { header } = propsFor();

			expect(header.title).toBe("Run over");
			expect(header.subtitle).toContain("Lavender held");
			expect(header.subtitle).toContain("no retry, no peel");
		});

		it("measures a death against the floor, not the healthy line", () => {
			const frame = runOverFrame();
			const { header } = runOverPropsFor(frame);

			expect(header.subtitle).toContain(`line of ${frame.bar.floor}%`);
			expect(header.subtitle).not.toContain(`line of ${frame.bar.healthy}%`);
		});

		it("measures a summit against the healthy line it cleared", () => {
			const frame = runOverFrame({
				won: true,
				gate: 12,
				bar: { floor: 10, ok: 60, healthy: 90, held: 93 },
			});
			const { header } = runOverPropsFor(frame);

			expect(header.title).toBe("The climb is done");
			expect(header.subtitle).toContain("line of 90%");
			expect(header.subtitle).toContain("every gate held");
		});

		it("fills the track with swatches earned, not with gates reached", () => {
			const { header } = propsFor({ swatchGates: [0, 2] });
			const states = header.swatches.map((fill) => fill.state);

			expect(states[0]).toBe("discovered");
			expect(states[1]).toBe("undiscovered");
			expect(states[2]).toBe("discovered");
			expect(states[SAMPLE_GATE]).toBe("current");
		});

		it("says nothing was earned rather than printing a zero", () => {
			expect(propsFor({ swatchGates: [] }).header.caption).toContain(
				"nothing earned"
			);
		});
	});

	describe("the coverage reading", () => {
		it("reports the units held against the window the run opened", () => {
			expect(propsFor().coverage.meta).toBe("14 against a window of 25");
		});

		it("states the shortfall against the line the run actually missed", () => {
			const frame = runOverFrame();
			const { coverage } = runOverPropsFor(frame);

			expect(coverage.note).toContain(
				`${Math.round((frame.bar.floor - frame.bar.held) * 10) / 10}%`
			);
			expect(coverage.note).toContain("Lavender");
		});

		it("reads a cleared line as held rather than as a negative shortfall", () => {
			const { coverage } = propsFor({
				won: true,
				bar: { floor: 10, ok: 40, healthy: 50, held: 72 },
			});

			expect(coverage.note).toContain("72% held");
		});
	});

	describe("the gate table", () => {
		it("names every gate instead of counting its answers again", () => {
			const { gates } = propsFor();

			expect(gates.payouts.rows.map((row) => row.label)).toEqual([
				"Pallet",
				"Boulder",
				"Cascade",
				"Thunder",
				"Lavender",
			]);
		});

		it("scores each gate out of the polls it asked", () => {
			const { gates } = propsFor();

			expect(gates.payouts.rows[0].payouts?.total).toBe("4.3 of 5");
		});

		it("tags the gate that paid the most and names it in the header", () => {
			const { gates } = propsFor();

			expect(gates.payouts.rows[0].tag).toEqual({ label: "best" });
			expect(gates.payouts.rows[1].tag).toBeUndefined();
			expect(gates.meta).toBe("best was Pallet");
		});

		it("tags no gate at all when none of them paid", () => {
			const paid = [[0, 0, 0, 0, 0]];
			const { gates } = propsFor({
				gate: 0,
				answers: runAnswers(paid),
				payouts: { rows: runPayoutRows(paid) },
			});

			expect(gates.meta).toBe("no gate paid");
			expect(gates.payouts.rows[0].tag).toBeUndefined();
		});

		it("totals the run off the units held, so it cannot drift from the bar", () => {
			const { gates, coverage } = propsFor();

			expect(gates.total.score).toBe("14 of 25");
			expect(gates.total.badge.label).toBe(coverage.badge.label);
		});
	});

	describe("the category split", () => {
		it("counts right answers per category across the whole run", () => {
			const paid = [[1, 1, 0, 0, 0]];
			const { categories } = propsFor({
				gate: 0,
				answers: runAnswers(paid),
				payouts: { rows: runPayoutRows(paid) },
			});

			expect(categories.meta).toBe("2 of 5");
			expect(categories.rows).toHaveLength(5);
		});

		it("ranks the strongest category first and flags it", () => {
			const { categories } = propsFor();

			expect(categories.rows[0].tag).toEqual({ label: "best" });
		});

		it("calls the weakest category a leak only when it is under half", () => {
			const { categories } = propsFor();
			const last = categories.rows[categories.rows.length - 1];

			expect(last.correct / last.seen).toBeLessThan(0.5);
			expect(last.tag).toEqual({ label: "leak", color: "cinnabar" });
			expect(last.theme).toBe("cinnabar");
		});

		it("tags nothing when there is only one category to rank", () => {
			const single = runAnswers([[1, 0]]).map((answer) => ({
				...answer,
				category: "css" as const,
			}));
			const { categories } = propsFor({ answers: single });

			expect(categories.rows).toHaveLength(1);
			expect(categories.rows[0].tag).toBeUndefined();
		});
	});

	describe("the build at the end", () => {
		it("bills the rung it held, not the weight it used", () => {
			const { build } = propsFor({ space: 12, weight: 9 });

			expect(build.meta).toBe("9 weight");
			expect(build.badge.label).toBe("64 KB a gate");
		});

		it("names the upkeep the whole run paid and the weight that idled", () => {
			const { build } = propsFor();

			expect(build.note).toContain("96 KB across 4 gates");
			expect(build.note).toContain("3 weight of it never paid for itself");
		});

		it("says nothing about idle weight when the build filled its space", () => {
			const { build } = propsFor({ space: 12, weight: 12 });

			expect(build.note).not.toContain("never paid for itself");
		});

		it("reports a bare build rather than an upkeep sum it never owed", () => {
			expect(propsFor({ configs: [] }).build.note).toBe(
				"The run ended with nothing installed."
			);
		});
	});

	describe("the storage split", () => {
		it("banks the share the gates earned and burns the rest", () => {
			const { storage } = propsFor({ balanceKb: 512, gate: 4 });
			const [archived, lost] = storage.rows;

			expect(archived.figure).toBe("+158 KB");
			expect(lost.figure).toBe("354 KB");
			expect(lost.spent).toBe(true);
		});

		it("banks every kilobyte a summit earned", () => {
			const { storage } = propsFor({ won: true, gate: 12, balanceKb: 512 });

			expect(storage.rows[0].figure).toBe("+512 KB");
			expect(storage.rows[1].figure).toBe("0 B");
		});

		it("withholds the account archive until a caller supplies it", () => {
			expect(propsFor().storage.rows).toHaveLength(2);
			expect(propsFor({ archiveAfterKb: 8_400 }).storage.rows).toHaveLength(3);
		});
	});

	describe("what the run keeps", () => {
		it("keeps the swatches and registers the configs it unlocked", () => {
			const { unlocked } = propsFor();

			expect(unlocked.badge.label).toBe("6 new");
			expect(unlocked.rows[0].label).toBe("4 swatches on your profile");
			expect(unlocked.rows[0].badge.label).toBe("kept");
			expect(unlocked.rows[1].badge.label).toBe("registered");
			expect(unlocked.rows[1].chip?.name).toBe(CONFIGS.cache.label);
		});

		it("always closes on what the run does not carry forward", () => {
			const { unlocked } = propsFor({ swatchGates: [], unlocked: [] });
			const last = unlocked.rows[unlocked.rows.length - 1];

			expect(unlocked.badge.label).toBe("nothing new");
			expect(unlocked.rows).toHaveLength(1);
			expect(last.label).toBe("The build and the run balance");
			expect(last.spent).toBe(true);
		});

		it("says one swatch in the singular", () => {
			const { unlocked } = propsFor({ swatchGates: [0], unlocked: [] });

			expect(unlocked.rows[0].label).toBe("1 swatch on your profile");
		});

		it("names a registered config with its chip and says what it is now good for", () => {
			const { unlocked } = propsFor({
				swatchGates: [],
				unlocked: [
					{ config: CONFIGS.cache, detail: "Earned: answered 30 polls" },
				],
			});

			expect(unlocked.rows[0].chip).toMatchObject({
				name: CONFIGS.cache.label,
				slots: slotsOf(CONFIGS.cache),
				version: 1,
				badges: [],
			});
			expect(unlocked.rows[0].detail).toBe("Able to install in future builds");
		});

		it("quotes no sell price for a config the finished run can no longer sell", () => {
			const { unlocked } = propsFor({
				swatchGates: [],
				unlocked: [
					{ config: CONFIGS.cache, detail: "Earned: answered 30 polls" },
				],
			});

			expect(unlocked.rows[0].chip?.info?.description).toBeDefined();
			expect(unlocked.rows[0].chip?.info?.sellPrice).toBeUndefined();
		});
	});

	it("offers the community beside a fresh run, not instead of it", () => {
		const { footer } = propsFor();

		expect(footer.action.label).toBe("Start new run");
		expect(footer.asides?.[0].label).toBe("Community");
	});
});
