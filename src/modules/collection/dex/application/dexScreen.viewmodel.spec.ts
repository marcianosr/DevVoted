import { describe, expect, it } from "vitest";

import {
	DEX_TABS,
	dexAuditsFor,
	dexConfigsFor,
	dexControlsFor,
	dexPollsFor,
	dexRunsFor,
	dexSwatchesFor,
	dexThemeOf,
	isDexTabId,
} from "~/modules/collection/dex/application/dexScreen.viewmodel";
import { auditdex } from "~/modules/collection/dex/domain/auditdex.model";
import { configdex } from "~/modules/collection/dex/domain/configdex.model";
import { controldex } from "~/modules/collection/dex/domain/controldex.model";
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
	const chips = props.groups.flatMap((group) => group.chips);
	const chipNamed = (name: string) =>
		chips.find((chip) => chip.state === "granted" && chip.name === name);

	it("groups the roster by weight, heaviest first, matching the 'by weight' axis", () => {
		const weights = props.groups.map((group) => group.weight);

		expect(weights).toEqual([...weights].sort((a, b) => b - a));
		expect(new Set(weights).size).toBe(weights.length);
	});

	it("seats every chip under its own weight", () => {
		expect(
			props.groups.every((group) =>
				group.chips.every((chip) => chip.slots === group.weight)
			)
		).toBe(true);
	});

	it("heads a group with its weight and how much of it you hold", () => {
		const light = props.groups.find((group) => group.weight === 1);
		const held = light?.chips.filter((chip) => chip.state === "granted").length;

		expect(light?.heading).toBe(`1 weight · ${held} of ${light?.chips.length}`);
	});

	it("reads what you hold before what you owe inside a weight", () => {
		const mixed = props.groups.find(
			(group) =>
				group.chips.some((chip) => chip.state === "granted") &&
				group.chips.some((chip) => chip.state === "locked")
		);
		const states = mixed?.chips.map((chip) => chip.state) ?? [];

		expect(states.indexOf("locked")).toBe(states.lastIndexOf("granted") + 1);
	});

	it("names the ceiling of .js's ladder, which is a fact about the config", () => {
		const js = chipNamed(".js");

		expect(js?.state === "granted" && js.maxVersion).toBe(5);
	});

	it("states a short ladder's own ceiling rather than the roster's", () => {
		const earned = dexConfigsFor(
			configdex([{ configId: "telemetry", viaMetric: "community-peeks" }], [])
		);
		const telemetry = earned.groups
			.flatMap((group) => group.chips)
			.find((chip) => chip.state === "granted" && chip.name === "Telemetry");

		expect(telemetry?.state === "granted" && telemetry.maxVersion).toBe(2);
	});

	it("states .js's effect as a sentence and its figure as a badge", () => {
		const js = chipNamed(".js");

		expect(js?.state === "granted" && js.effect).toBe(
			"JavaScript polls reward ×1.25 coverage"
		);
		expect(js?.state === "granted" && js.figure).toBe("×1.25");
	});

	it("marks a starter apart from the roster it was dealt with", () => {
		const js = chipNamed(".js");

		expect(js?.state === "granted" && js.starter).toBe(true);
	});

	it("leaves a config with no ladder unmarked rather than giving it one rung", () => {
		const flat = chipNamed("Code Coverage");

		expect(flat?.state === "granted" && flat.maxVersion).toBeUndefined();
	});

	it("gives a config whose effect has no figure no badge at all", () => {
		const eslint = chipNamed("ESLint");

		expect(eslint?.state === "granted" && eslint.figure).toBeUndefined();
	});

	it("never carries a locked config's name, only its unlock paths", () => {
		const locked = chips.filter((chip) => chip.state === "locked");

		expect(locked.length).toBeGreaterThan(0);
		expect(
			locked.every((chip) => chip.state === "locked" && chip.paths.length === 2)
		).toBe(true);
	});

	it("keeps a counted path's figures apart, so a bar can be drawn from it", () => {
		const locked = chips.find((chip) => chip.state === "locked");
		const fallback = locked?.state === "locked" ? locked.paths[1] : undefined;

		expect(fallback?.progress).toEqual({
			count: expect.any(Number),
			target: expect.any(Number),
		});
	});

	it("counts nothing on a one-shot objective, which has no progress", () => {
		const oneShot = chips.find(
			(chip) =>
				chip.state === "locked" &&
				chip.paths[0].text === "Clear a gate with every slot filled"
		);

		expect(oneShot?.state === "locked" && oneShot.paths[0].progress).toBeNull();
	});

	it("counts the deck you hold against the whole roster", () => {
		const granted = chips.filter((chip) => chip.state === "granted").length;

		expect(props.count).toBe(`${granted} of ${chips.length}`);
	});

	it("states the run-scoped ladder rule the collection cannot show", () => {
		expect(props.note).toContain("lost when the run ends");
		expect(props.note).toContain("behind the i");
		expect(props.note).toContain("never a version you hold");
	});
});

describe("dexControlsFor", () => {
	const propsFor = (unlockedServiceIds: readonly string[]) =>
		dexControlsFor(controldex(unlockedServiceIds));

	const rowFor = (unlockedServiceIds: readonly string[], id: string) => {
		const row = propsFor(unlockedServiceIds).rows.find(
			(candidate) => candidate.id === id
		);
		if (!row) throw new Error(`no service row for ${id}`);
		return row;
	};

	const priceOf = (unlockedServiceIds: readonly string[], id: string) => {
		const row = rowFor(unlockedServiceIds, id);
		return row.locked === true ? undefined : row.price;
	};

	const unlockOf = (unlockedServiceIds: readonly string[], id: string) => {
		const row = rowFor(unlockedServiceIds, id);
		return row.locked === true ? row.unlock : undefined;
	};

	it("labels the tab services and keeps its id", () => {
		expect(DEX_TABS.find((tab) => tab.id === "controls")?.label).toBe(
			"services"
		);
	});

	it("lists every service in one section, registry first", () => {
		expect(propsFor([]).rows.map((row) => row.id)).toEqual([
			"rebuild",
			"extend",
			"hotReload",
			"returnPolicy",
			"abandon",
			"pin",
			"bootCache",
			"dockerImage",
		]);
		expect(propsFor([]).meta).toBe("registry, then run");
	});

	it("counts the services this account has earned against the whole roster", () => {
		expect(propsFor([]).count).toBe("1 of 8");
		expect(propsFor(["extend", "pin"]).count).toBe("3 of 8");
	});

	it("states where a service is bought and how long the purchase lasts", () => {
		expect(rowFor([], "rebuild").detail).toBe("Registry · this visit");
		expect(rowFor([], "extend").detail).toBe("Registry · rest of the run");
		expect(rowFor([], "pin").detail).toBe("Run · carries into your next run");
		expect(rowFor([], "bootCache").detail).toBe("Next run · consumed on start");
	});

	it("prices an earned service by the ladder the shop actually charges", () => {
		expect(priceOf([], "rebuild")).toBe("from 4 KB, doubling");
		expect(priceOf(["extend"], "extend")).toBe("48 KB, then 96 KB");
	});

	it("says an earned service nobody sells yet is not for sale, rather than pricing it", () => {
		expect(priceOf(["hotReload"], "hotReload")).toBe("not for sale yet");
		expect(priceOf(["bootCache"], "bootCache")).toBe("not for sale yet");
	});

	it("prices kill -9 as free, since the press costs nothing", () => {
		expect(priceOf(["abandon"], "abandon")).toBe("free");
	});

	it("names a locked service and says how to earn it, in place of a price", () => {
		const row = rowFor([], "extend");

		expect(row.title).toBe("Extend the registry");
		expect(row.locked).toBe(true);
		expect(unlockOf([], "extend")).toBe("Reach Cascade");
		expect(priceOf([], "extend")).toBeUndefined();
	});

	it("keeps one footer for the whole roster", () => {
		expect(propsFor([]).note).toContain("unlocked once");
		expect(propsFor([]).note).toContain("bought in the shop today");
	});
});

describe("dexAuditsFor", () => {
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
