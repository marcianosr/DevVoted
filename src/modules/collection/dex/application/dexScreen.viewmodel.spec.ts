import { describe, expect, it } from "vitest";

import {
	DEX_TABS,
	dexAuditsFor,
	dexConfigsFor,
	dexPollsFor,
	dexRunsFor,
	dexSwatchesFor,
	dexThemeOf,
	isDexTabId,
} from "~/modules/collection/dex/application/dexScreen.viewmodel";
import { auditdex } from "~/modules/collection/dex/domain/auditdex.model";
import { configdex } from "~/modules/collection/dex/domain/configdex.model";
import { gatedex } from "~/modules/collection/dex/domain/gatedex.model";
import type { PolldexEntry } from "~/modules/collection/dex/domain/polldex.model";
import {
	runHistory,
	type RunHistoryRow,
} from "~/modules/collection/dex/domain/runHistory.model";

const poll = (overrides: Partial<PolldexEntry> = {}): PolldexEntry => ({
	id: 1,
	pollNumber: 1,
	categoryCode: "ts",
	seen: true,
	question: "Which utility type makes every property optional?",
	timesSeen: 4,
	answeredCount: 4,
	correctCount: 3,
	accuracy: 75,
	...overrides,
});

const climb = (overrides: Partial<RunHistoryRow> = {}): RunHistoryRow => ({
	runId: 1,
	gatesCleared: 4,
	engineStatus: "dead",
	coverage: 14,
	startedAt: new Date("2026-09-11T10:00:00Z"),
	finishedAt: new Date("2026-09-11T12:00:00Z"),
	swatchGates: [0, 1, 2],
	...overrides,
});

describe("DEX_TABS", () => {
	it("gives every tab its own colour, so the screen reads as the tab opened", () => {
		const colors = DEX_TABS.map((tab) => tab.color);

		expect(new Set(colors).size).toBe(DEX_TABS.length);
	});

	it("narrows a known tab id and rejects anything else", () => {
		expect(isDexTabId("swatches")).toBe(true);
		expect(isDexTabId("gates")).toBe(false);
	});

	it("falls back to the first tab's colour for an id it does not know", () => {
		expect(dexThemeOf("swatches")).toBe("lavender");
		expect(dexThemeOf("nonsense")).toBe(DEX_TABS[0].color);
	});

	it("keeps configs on a colour that does not tint the ground it badges on", () => {
		expect(dexThemeOf("configs")).toBe("pallet");
	});
});

describe("dexPollsFor", () => {
	it("names the category rather than printing its code", () => {
		const [row] = dexPollsFor([poll()]).rows;

		expect(row.category).toBe("TypeScript");
	});

	it("carries the raw correct count, not a rounded percentage", () => {
		const [row] = dexPollsFor([poll()]).rows;

		expect(row.locked).toBeUndefined();
		expect(row.correct).toBe(3);
		expect(row.answered).toBe(4);
	});

	it("locks a poll never dealt, giving up its category as well", () => {
		const [row] = dexPollsFor([
			poll({ seen: false, question: null, categoryCode: "react" }),
		]).rows;

		expect(row.locked).toBe(true);
		expect(row.category).toBeUndefined();
	});

	it("counts seen against the whole roster", () => {
		const props = dexPollsFor([poll({ id: 1 }), poll({ id: 2, seen: false })]);

		expect(props.count).toBe("1 of 2");
	});

	it("says how many categories are present, in the plural that fits", () => {
		expect(dexPollsFor([poll()]).meta).toBe("1 category");
		expect(
			dexPollsFor([poll({ id: 1 }), poll({ id: 2, categoryCode: "css" })]).meta
		).toBe("2 categories");
	});
});

describe("dexConfigsFor", () => {
	const props = dexConfigsFor(configdex([], []));

	it("orders the whole roster heaviest first, matching the 'by weight' axis", () => {
		const slots = props.rows.map((row) => row.slots);

		expect(slots).toEqual([...slots].sort((a, b) => b - a));
	});

	it("does not group the deck you hold apart from the deck you owe", () => {
		const heaviest = props.rows[0];

		expect(heaviest.slots).toBe(Math.max(...props.rows.map((r) => r.slots)));
		expect(heaviest.state).toBe("locked");
	});

	it("climbs .js from ×1.25 to ×2.25 over five versions", () => {
		const js = props.rows.find(
			(row) => row.state === "granted" && row.name === ".js"
		);

		expect(js?.state === "granted" && js.versions?.length).toBe(5);
		expect(js?.state === "granted" && js.versions?.[0].effect).toBe(
			"JavaScript polls reward ×1.25 coverage"
		);
		expect(js?.state === "granted" && js.versions?.[4].effect).toBe(
			"JavaScript polls reward ×2.25 coverage"
		);
	});

	it("phrases a rung, since a card reads it as its only sentence", () => {
		const js = props.rows.find(
			(row) => row.state === "granted" && row.name === ".js"
		);

		expect(js?.state === "granted" && js.versions?.[1].effect).toContain(
			"polls reward"
		);
	});

	it("marks a starter apart from the roster it was dealt with", () => {
		const js = props.rows.find(
			(row) => row.state === "granted" && row.name === ".js"
		);

		expect(js?.state === "granted" && js.starter).toBe(true);
	});

	it("prices v1 as null, since installing it already gives you that rung", () => {
		const js = props.rows.find(
			(row) => row.state === "granted" && row.name === ".js"
		);

		expect(js?.state === "granted" && js.versions?.[0].price).toBeNull();
		expect(js?.state === "granted" && js.versions?.[1].price).toBe("64 KB");
	});

	it("states each rung's odds of being rolled from a fresh install, none for v1 (ADR-097)", () => {
		const js = props.rows.find(
			(row) => row.state === "granted" && row.name === ".js"
		);
		const versions = js?.state === "granted" ? js.versions : undefined;

		expect(versions?.map((rung) => rung.odds)).toEqual([
			null,
			"1 in 2 rolls",
			"1 in 4 rolls",
			"1 in 8 rolls",
			"1 in 8 rolls",
		]);
	});

	it("tells the reader how the registry rolls a version", () => {
		expect(props.note).toContain("coin flip");
	});

	it("leaves a config with no ladder unmarked rather than giving it one rung", () => {
		const flat = props.rows.find(
			(row) => row.state === "granted" && row.name === "Code Coverage"
		);

		expect(flat?.state === "granted" && flat.versions).toBeUndefined();
	});

	it("never carries a locked config's name, only its unlock paths", () => {
		const locked = props.rows.filter((row) => row.state === "locked");

		expect(locked.length).toBeGreaterThan(0);
		expect(
			locked.every((row) => row.state === "locked" && row.paths.length === 2)
		).toBe(true);
	});

	it("keeps a counted path's figures apart, so a bar can be drawn from it", () => {
		const locked = props.rows.find((row) => row.state === "locked");
		const fallback = locked?.state === "locked" ? locked.paths[1] : undefined;

		expect(fallback?.progress).toEqual({
			count: expect.any(Number),
			target: expect.any(Number),
		});
	});

	it("counts nothing on a one-shot objective, which has no progress", () => {
		const oneShot = props.rows.find(
			(row) =>
				row.state === "locked" &&
				row.paths[0].text === "Clear a gate with every slot filled"
		);

		expect(oneShot?.state === "locked" && oneShot.paths[0].progress).toBeNull();
	});

	it("states the run-scoped ladder rule the collection cannot show", () => {
		expect(props.note).toContain("lost when the run ends");
	});
});

describe("dexAuditsFor", () => {
	// Clearing through gate 3 opens pool A and nothing deeper, so it is the
	// smallest roster that has both met audits and unmet ones.
	const CLIMBED = [
		"swatch-pallet",
		"swatch-boulder",
		"swatch-cascade",
		"swatch-thunder",
	];
	const props = dexAuditsFor(auditdex(gatedex(CLIMBED)));

	it("splits the code off the label so a row can seat it apart", () => {
		const met = props.rows.find((row) => !row.locked);

		expect(met?.code).toBeGreaterThanOrEqual(200);
		expect(met?.name).not.toMatch(/^\d/);
	});

	it("locks an audit never met", () => {
		expect(props.rows.some((row) => row.locked)).toBe(true);
	});

	it("gives every row the gates it can land on", () => {
		expect(props.rows.every((row) => row.gates.length > 0)).toBe(true);
	});
});

describe("dexSwatchesFor", () => {
	it("marks the next gate current and the rest undiscovered", () => {
		const cards = dexSwatchesFor(gatedex([])).cards;

		expect(cards[0].swatch.state).toBe("current");
		expect(cards[1].swatch.state).toBe("undiscovered");
	});

	it("marks a held swatch discovered and swept", () => {
		const cards = dexSwatchesFor(gatedex(["swatch-pallet"])).cards;

		expect(cards[0].swatch.state).toBe("discovered");
		expect(cards[0].note).toBe("swept");
	});

	it("names gates by their badge, the same name the run screens show", () => {
		const cards = dexSwatchesFor(gatedex([])).cards;

		expect(cards[3].name).toBe("Thunder");
	});
});

describe("dexRunsFor", () => {
	it("reads coverage as a percentage of the run's own window", () => {
		const [row] = dexRunsFor(runHistory([climb()])).rows;

		expect(row.coverage).toBe("56%");
	});

	it("points each row at that run's own permalink in the archive", () => {
		const [row] = dexRunsFor(runHistory([climb({ runId: 42 })])).rows;

		expect(row.href).toBe("/runs/42");
	});

	it("names the gate that held the run", () => {
		const [row] = dexRunsFor(runHistory([climb()])).rows;

		expect(row.outcome).toBe("Lavender held");
	});

	it("draws the run against the full ladder, marking only what it swept", () => {
		const [row] = dexRunsFor(runHistory([climb()])).rows;
		const swept = row.swatches.filter(
			(fill) => fill.state === "discovered"
		).length;

		expect(row.swatches).toHaveLength(13);
		expect(swept).toBe(3);
	});

	it("reports the deepest gate any climb reached", () => {
		const props = dexRunsFor(
			runHistory([
				climb({ runId: 1, gatesCleared: 2 }),
				climb({ runId: 2, gatesCleared: 9 }),
			])
		);

		expect(props.meta).toBe("best reached gate 9");
		expect(props.count).toBe("2 runs");
	});

	it("says so plainly when nothing has been climbed", () => {
		const props = dexRunsFor([]);

		expect(props.meta).toBe("no climbs yet");
		expect(props.count).toBe("0 runs");
	});
});
