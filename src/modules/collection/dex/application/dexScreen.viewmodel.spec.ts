import { describe, expect, it } from "vitest";

import {
	ALL_FILTER,
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
import {
	configdex,
	type UnlockFact,
} from "~/modules/collection/dex/domain/configdex.model";
import { controldex } from "~/modules/collection/dex/domain/controldex.model";
import { gatedex } from "~/modules/collection/dex/domain/gatedex.model";
import type { PolldexEntry } from "~/modules/collection/dex/domain/polldex.model";
import {
	runHistory,
	type RunHistoryRow,
} from "~/modules/collection/dex/domain/runHistory.model";
import type { DexConfigRow } from "~/ui/kanto-theme/DexConfigs.ui";

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
	const ROSTER = [
		poll({ id: 1, pollNumber: 1, categoryCode: "css" }),
		poll({ id: 2, pollNumber: 2, categoryCode: "ts" }),
		poll({
			id: 3,
			pollNumber: 3,
			categoryCode: "css",
			seen: false,
			question: null,
		}),
	];

	it("lists every poll it was given, holding none back", () => {
		expect(dexPollsFor(ROSTER).rows).toHaveLength(3);
	});

	it("reads in dex number order rather than the order it was handed", () => {
		const shuffled = dexPollsFor([ROSTER[2], ROSTER[0], ROSTER[1]]);

		expect(shuffled.rows.map((row) => row.number)).toEqual([
			"#001",
			"#002",
			"#003",
		]);
	});

	it("pads a dex number so the column reads as a roster", () => {
		expect(dexPollsFor([poll({ pollNumber: 7 })]).rows[0].number).toBe("#007");
	});

	it("falls back to the poll's own id when it has no roster number", () => {
		expect(
			dexPollsFor([poll({ id: 42, pollNumber: null })]).rows[0].number
		).toBe("#042");
	});

	it("carries the raw correct count, not a rounded percentage", () => {
		const [row] = dexPollsFor([poll()]).rows;

		expect(row.locked).toBeUndefined();
		expect(row.correct).toBe(3);
		expect(row.answered).toBe(4);
	});

	it("withholds the question of a poll never dealt to you", () => {
		const [row] = dexPollsFor([poll({ seen: false, question: null })]).rows;

		expect(row.locked).toBe(true);
		expect(row.question).toBeUndefined();
	});

	it("offers one chip a present category, plus one that shows everything", () => {
		const { filters } = dexPollsFor(ROSTER);

		expect(filters.map((item) => item.value)).toEqual([
			ALL_FILTER,
			"css",
			"ts",
		]);
		expect(filters[1].mark).toBe("CSS");
	});

	it("counts a chip's own seen against that category alone", () => {
		const { filters } = dexPollsFor(ROSTER);

		expect(filters[1].label).toBe("1 of 2");
		expect(filters[2].label).toBe("1 of 1");
	});

	it("leaves out a category holding no polls at all", () => {
		expect(dexPollsFor([poll({ categoryCode: "ts" })]).filters).toHaveLength(2);
	});

	it("shows only the chosen category once a chip is picked", () => {
		const css = dexPollsFor(ROSTER, "css");

		expect(css.rows.map((row) => row.id)).toEqual(["1", "3"]);
	});

	it("shows everything again for a filter value that names no category", () => {
		expect(dexPollsFor(ROSTER, ALL_FILTER).rows).toHaveLength(3);
	});

	it("reads the first row when nothing has been picked", () => {
		const props = dexPollsFor(ROSTER);

		expect(props.selectedId).toBe("1");
		expect(props.detail?.number).toBe("#001");
	});

	it("falls back to the first row when the pick is not in the chosen category", () => {
		const css = dexPollsFor(ROSTER, "css", "2");

		expect(css.selectedId).toBe("1");
	});

	it("names the category of the poll the panel is reading", () => {
		expect(dexPollsFor(ROSTER, ALL_FILTER, "2").detail?.category).toBe(
			"TypeScript"
		);
	});

	it("keeps a poll you have not been dealt in its real category, so a target has a place", () => {
		const detail = dexPollsFor(ROSTER, ALL_FILTER, "3").detail;

		expect(detail?.locked).toBe(true);
		expect(detail?.category).toBe("CSS");
		expect(detail?.question).toBeUndefined();
	});

	it("carries the whole record of a poll the panel is reading", () => {
		const detail = dexPollsFor([poll()], ALL_FILTER).detail;

		expect(detail?.timesSeen).toBe(4);
		expect(detail?.answered).toBe(4);
		expect(detail?.correct).toBe(3);
		expect(detail?.accuracy).toBe(75);
	});

	it("has nothing to read when the roster is empty", () => {
		const empty = dexPollsFor([]);

		expect(empty.selectedId).toBeNull();
		expect(empty.detail).toBeNull();
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
	const entries = configdex([], []);
	const props = dexConfigsFor(entries);
	const isGranted = (row: DexConfigRow) => row.locked !== true;

	const idNamed = (name: string, held: readonly UnlockFact[] = []) => {
		const row = dexConfigsFor(configdex(held, [])).rows.find(
			(candidate) => candidate.name === name
		);
		if (row === undefined) throw new Error(`no row named ${name}`);
		return row.id;
	};

	const detailNamed = (name: string, held: readonly UnlockFact[] = []) => {
		const detail = dexConfigsFor(
			configdex(held, []),
			ALL_FILTER,
			idNamed(name, held)
		).detail;
		if (detail === null) throw new Error(`no detail for ${name}`);
		return detail;
	};

	const cardNamed = (name: string, held: readonly UnlockFact[] = []) =>
		detailNamed(name, held).card;

	const TELEMETRY = [
		{ configId: "telemetry", viaMetric: "community-peeks" },
	] as const;

	it("lists the whole roster, holding nothing back", () => {
		expect(props.rows).toHaveLength(entries.length);
	});

	it("reads lightest first, so the list climbs the weight axis", () => {
		const weights = props.rows.map((row) => row.slots);

		expect(weights).toEqual([...weights].sort((a, b) => a - b));
	});

	it("reads what you hold before what you owe inside a weight", () => {
		const light = props.rows.filter((row) => row.slots === 1).map(isGranted);

		expect(light.indexOf(false)).toBe(light.lastIndexOf(true) + 1);
	});

	it("offers one chip a weight, plus one that holds everything back from nothing", () => {
		const values = props.filters.map((item) => item.value);

		expect(values[0]).toBe(ALL_FILTER);
		expect(values.slice(1)).toEqual(
			[...new Set(props.rows.map((row) => row.slots))]
				.sort((a, b) => a - b)
				.map(String)
		);
	});

	it("counts a chip's own held against its own total, not the roster's", () => {
		const light = props.rows.filter((row) => row.slots === 1);
		const chip = props.filters.find((item) => item.value === "1");

		expect(chip?.mark).toBe("1");
		expect(chip?.label).toBe(
			`${light.filter(isGranted).length} of ${light.length}`
		);
	});

	it("shows only the chosen weight once a chip is picked", () => {
		const light = dexConfigsFor(entries, "1");

		expect(light.rows.every((row) => row.slots === 1)).toBe(true);
		expect(light.rows.length).toBeLessThan(props.rows.length);
	});

	it("keeps counting the whole roster in the header while a weight is chosen", () => {
		expect(dexConfigsFor(entries, "1").count).toBe(props.count);
	});

	it("reads the first row when nothing has been picked", () => {
		expect(props.selectedId).toBe(props.rows[0].id);
	});

	it("falls back to the first row when the pick is not in the chosen weight", () => {
		const light = dexConfigsFor(entries, "1", idNamed("Code Coverage"));

		expect(light.selectedId).toBe(light.rows[0].id);
	});

	it("reads the picked row when it survives the filter", () => {
		const picked = dexConfigsFor(entries, ALL_FILTER, idNamed("Linter"));

		expect(picked.selectedId).toBe(idNamed("Linter"));
	});

	it("has nothing to read when the chosen weight holds nothing", () => {
		const empty = dexConfigsFor([], ALL_FILTER);

		expect(empty.rows).toEqual([]);
		expect(empty.selectedId).toBeNull();
		expect(empty.detail).toBeNull();
	});

	it("heads the panel with the config's own name", () => {
		expect(detailNamed(".js").label).toBe(".js");
	});

	it("withholds the name of a config you have not earned, from the head as well", () => {
		const locked = props.rows.find((row) => row.locked === true);
		const detail = dexConfigsFor(entries, ALL_FILTER, locked?.id).detail;

		expect(detail?.label).toBe("???");
		expect(detail?.card.name).toBeUndefined();
	});

	it("names the ceiling of .js's ladder, which is a fact about the config", () => {
		expect(cardNamed(".js").version).toBe(5);
	});

	it("states a short ladder's own ceiling rather than the roster's", () => {
		expect(cardNamed("Telemetry", TELEMETRY).version).toBe(2);
	});

	it("puts the ladder's ceiling on the row too, so the list reads without the panel", () => {
		const row = props.rows.find((candidate) => candidate.name === ".js");

		expect(row?.version).toBe(5);
		expect(row?.figure).toBe("×1.25");
	});

	it("states .js's effect as a sentence and its figure as a badge", () => {
		const js = cardNamed(".js");

		expect(js.info?.description).toBe("JavaScript polls reward ×1.25 coverage");
		expect(js.badges).toEqual([{ label: "×1.25", color: "viridian" }]);
	});

	it("names the rung an install gives you, which the ceiling tag does not", () => {
		expect(cardNamed(".js").info?.note).toBe("Starter config · v1 of 5");
	});

	it("marks a starter apart from a config that had to be earned", () => {
		expect(cardNamed(".js").info?.note).toContain("Starter config");
		expect(cardNamed("Telemetry", TELEMETRY).info?.note).toBe(
			"Earned: peeked the community split 5 times · v1 of 2"
		);
	});

	it("keeps how a config was earned out of the head, where the panel reads", () => {
		expect(cardNamed("Telemetry", TELEMETRY).detail).toBeUndefined();
	});

	it("leaves a config with no ladder unmarked rather than giving it one rung", () => {
		const flat = cardNamed("IndexedDB");

		expect(flat.version).toBeUndefined();
		expect(flat.info?.note).toBe("Starter config");
	});

	it("gives a config whose effect has no figure no badge at all", () => {
		expect(cardNamed("Linter").badges).toEqual([]);
	});

	it("carries a locked config's weight and both unlock paths, and nothing else", () => {
		const locked = props.rows.filter((row) => row.locked === true);
		const cards = locked.map(
			(row) => dexConfigsFor(entries, ALL_FILTER, row.id).detail?.card
		);

		expect(locked.length).toBeGreaterThan(0);
		expect(
			cards.every(
				(card) => card?.name === undefined && card?.info === undefined
			)
		).toBe(true);
		expect(
			cards.every(
				(card) => card?.slots !== undefined && card?.unlock?.length === 2
			)
		).toBe(true);
	});

	it("keeps a counted path's figures apart, so a bar can be drawn from it", () => {
		const locked = props.rows.find((row) => row.locked === true);
		const card = dexConfigsFor(entries, ALL_FILTER, locked?.id).detail?.card;

		expect(card?.unlock?.[1].progress).toEqual({
			count: expect.any(Number),
			target: expect.any(Number),
		});
	});

	it("counts nothing on a one-shot objective, which has no progress", () => {
		const oneShot = props.rows
			.map((row) => dexConfigsFor(entries, ALL_FILTER, row.id).detail?.card)
			.find(
				(card) =>
					card?.unlock?.[0].text === "Clear a gate with every slot filled"
			);

		expect(oneShot?.unlock?.[0].progress).toBeNull();
	});

	it("counts the deck you hold against the whole roster", () => {
		const granted = props.rows.filter(isGranted).length;

		expect(props.count).toBe(`${granted} of ${props.rows.length}`);
	});

	it("states the run-scoped ladder rule the collection cannot show", () => {
		expect(props.note).toContain("lost when the run ends");
		expect(props.note).toContain("how to unlock it");
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
		return row.locked === true || row.carried === false ? undefined : row.price;
	};

	const unlockOf = (unlockedServiceIds: readonly string[], id: string) => {
		const row = rowFor(unlockedServiceIds, id);
		return row.locked === true ? row.unlock : undefined;
	};

	it("labels the tab services and keeps its id", () => {
		expect(DEX_TABS.find((tab) => tab.id === "controls")?.label).toBe(
			"Services"
		);
	});

	it("lists every service in one section, in roster order", () => {
		expect(propsFor([]).rows.map((row) => row.id)).toEqual([
			"rebuild",
			"skipShop",
			"extend",
			"hotReload",
			"returnPolicy",
			"abandon",
			"pin",
			"bootCache",
			"dockerImage",
		]);
		expect(propsFor([]).meta).toBe("earned once · carried per run");
	});

	it("counts the services this account has earned against the whole roster", () => {
		expect(propsFor([]).count).toBe("2 of 9");
		expect(propsFor(["extend", "pin"]).count).toBe("4 of 9");
	});

	it("states where a service is pressed and how long the purchase lasts", () => {
		expect(rowFor([], "rebuild").detail).toBe("Every shop · this visit");
		expect(rowFor([], "extend").detail).toBe(
			"Shop from Cascade · rest of the run"
		);
		expect(rowFor([], "pin").detail).toBe(
			"Shop, gates 4–10 · carries into your next run"
		);
		expect(rowFor([], "bootCache").detail).toBe(
			"New run · banked at the start"
		);
	});

	it("prices a service pressed in the shop by the ladder the shop actually charges", () => {
		expect(priceOf([], "rebuild")).toBe("from 4 KB, doubling");
	});

	it("prices a carried service by what the new run screen charges to carry it (ADR-153)", () => {
		expect(priceOf(["extend"], "extend")).toBe("new run · 64 KB");
		expect(priceOf(["pin"], "pin")).toBe("new run · 128 KB");
		expect(priceOf(["bootCache"], "bootCache")).toBe(
			"new run · 128 KB to 512 KB"
		);
	});

	it("states a carried service's shop ladder in its panel, since the row names only the carry", () => {
		const detail = dexControlsFor(controldex(["extend"]), "extend").detail;

		expect(detail?.availability).toBe(
			"Carried in at new run for 64 KB of archive. On sale in the shop once you have cleared gate 3. Pressed in the shop for 48 KB, then 96 KB of run storage."
		);
	});

	it("states Boot Cache's rungs in its panel", () => {
		const detail = dexControlsFor(
			controldex(["bootCache"]),
			"bootCache"
		).detail;

		expect(detail?.availability).toBe(
			"Carried in at new run: 128 KB of archive banks 64 KB, 256 KB of archive banks 128 KB, 512 KB of archive banks 256 KB."
		);
	});

	it("says an earned service nobody sells yet is not for sale, rather than pricing it", () => {
		expect(priceOf(["hotReload"], "hotReload")).toBe("not for sale yet");
		expect(priceOf(["dockerImage"], "dockerImage")).toBe("not for sale yet");
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
		expect(propsFor([]).note).toContain("picked at new run");
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
		const rows = dexSwatchesFor(gatedex([])).rows;

		expect(rows[0].swatch.state).toBe("current");
		expect(rows[1].swatch.state).toBe("undiscovered");
	});

	it("marks a held swatch discovered and swept", () => {
		const rows = dexSwatchesFor(gatedex(["swatch-pallet"])).rows;

		expect(rows[0].swatch.state).toBe("discovered");
		expect(rows[0].note).toBe("swept");
	});

	it("names gates by their badge, the same name the run screens show", () => {
		const rows = dexSwatchesFor(gatedex([])).rows;

		expect(rows[3].name).toBe("Thunder");
	});

	it("reads the first gate when nothing has been picked", () => {
		const props = dexSwatchesFor(gatedex([]));

		expect(props.selectedId).toBe("0");
		expect(props.detail?.label).toBe("Pallet");
	});

	it("states how an unearned swatch is minted, which is its whole rule", () => {
		const detail = dexSwatchesFor(gatedex([]), "7").detail;

		expect(detail?.rule).toContain("Answer all five polls");
	});

	it("says a swept gate has already minted its swatch", () => {
		const detail = dexSwatchesFor(gatedex(["swatch-pallet"]), "0").detail;

		expect(detail?.rule).toContain("Minted");
	});

	it("has nothing to read when there is no gate roster at all", () => {
		const empty = dexSwatchesFor([]);

		expect(empty.selectedId).toBeNull();
		expect(empty.detail).toBeNull();
	});
});

describe("dexRunsFor", () => {
	it("reads coverage as a percentage of the run's own window", () => {
		const [row] = dexRunsFor(runHistory([climb()])).rows;

		expect(row.coverage).toBe("56%");
	});

	it("keeps the permalink on the panel, where a row is now a press", () => {
		const props = dexRunsFor(runHistory([climb({ runId: 42 })]));

		expect(props.detail?.href).toBe("/runs/42");
		expect(props.selectedId).toBe("42");
	});

	it("heads the panel with the day the run ended", () => {
		const props = dexRunsFor(runHistory([climb()]));

		expect(props.detail?.label).toBe(props.rows[0].date);
	});

	it("has nothing to read when nothing has been climbed", () => {
		const empty = dexRunsFor([]);

		expect(empty.selectedId).toBeNull();
		expect(empty.detail).toBeNull();
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
