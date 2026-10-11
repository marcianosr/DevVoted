import { describe, expect, it } from "vitest";

import {
	type DayRun,
	buildCostOf,
	dayRecordsOf,
	dayRunOn,
	isComeback,
	kbGeneratedOf,
	kbSpentOf,
	outcomeOf,
	outcomesOf,
} from "~/modules/run/community/domain/dayRecords.model";
import type { RecordedClose } from "~/modules/run/run/domain/run.model";
import type { CoverageBandId } from "~/modules/run/build/domain/coverageRatio.model";
import { PIN_START_KB_PER_GATE } from "~/modules/run/run/domain/rules.model";
import { TEST_DATES } from "~/test/kanto";

const cleared = (
	gate: number,
	band: CoverageBandId,
	kb = 0
): RecordedClose => ({ gate, band, cleared: true, closing: "cleared", kb });

const held = (gate: number, band: CoverageBandId = "shaky"): RecordedClose => ({
	gate,
	band,
	cleared: false,
	closing: "held",
	heldBy: "band",
	kb: 0,
});

const config = (id: string, slots: number) => ({ id, label: id, slots });

const run = (overrides: Partial<DayRun> & { userId: string }): DayRun => ({
	fallen: false,
	closes: [],
	closesBefore: [],
	build: { configs: [] },
	auditSchedule: {},
	startedAtGate: 0,
	warmBootKb: 0,
	storageKb: 0,
	...overrides,
});

describe("outcomeOf", () => {
	it("files a run that fell today under danger, whatever its last close", () => {
		expect(
			outcomeOf(
				run({
					userId: "giovanni",
					fallen: true,
					closes: [cleared(1, "perfect")],
				})
			)
		).toBe("danger");
	});

	it("files a run the gate held under shaky", () => {
		expect(outcomeOf(run({ userId: "brock", closes: [held(2, "ok")] }))).toBe(
			"shaky"
		);
	});

	it("files a clear under the band it closed on", () => {
		expect(
			outcomeOf(run({ userId: "misty", closes: [cleared(1, "perfect")] }))
		).toBe("perfect");
		expect(
			outcomeOf(run({ userId: "surge", closes: [cleared(1, "healthy")] }))
		).toBe("healthy");
	});

	it("files a clear on a shaky band under ok, because the gate let it through", () => {
		expect(
			outcomeOf(run({ userId: "erika", closes: [cleared(3, "shaky")] }))
		).toBe("ok");
	});

	it("files nothing for a live run that has not closed a gate", () => {
		expect(outcomeOf(run({ userId: "koga" }))).toBeNull();
	});
});

describe("outcomesOf", () => {
	it("files a player who fell and climbs again under danger and under the live run, so the corpse stays in reach", () => {
		const outcomes = outcomesOf([
			run({ userId: "sabrina", fallen: true, closes: [held(2)] }),
			run({ userId: "sabrina", closes: [cleared(1, "healthy")] }),
		]);

		expect(outcomes.healthy).toEqual(["sabrina"]);
		expect(outcomes.danger).toEqual(["sabrina"]);
	});

	it("files a player who fell twice under danger once", () => {
		const outcomes = outcomesOf([
			run({ userId: "sabrina", fallen: true, closes: [held(2)] }),
			run({ userId: "sabrina", fallen: true, closes: [held(4)] }),
		]);

		expect(outcomes.danger).toEqual(["sabrina"]);
	});
});

describe("isComeback", () => {
	it("is a comeback when the gate held earlier and the latest close cleared it", () => {
		expect(
			isComeback(run({ userId: "blaine", closes: [held(4), cleared(4, "ok")] }))
		).toBe(true);
	});

	it("is no comeback when the hold was at another gate", () => {
		expect(
			isComeback(
				run({
					userId: "blaine",
					closes: [held(3), cleared(3, "ok"), cleared(4, "ok")],
				})
			)
		).toBe(false);
	});

	it("is a comeback when the gate held on an earlier day and cleared today", () => {
		expect(
			isComeback(
				run({
					userId: "blaine",
					closesBefore: [held(4)],
					closes: [cleared(4, "ok")],
				})
			)
		).toBe(true);
	});

	it("is no comeback while the gate still holds", () => {
		expect(
			isComeback(run({ userId: "blaine", closes: [held(4), held(4)] }))
		).toBe(false);
	});
});

describe("KB figures", () => {
	it("generates the sum of every close's reward", () => {
		expect(
			kbGeneratedOf(
				run({
					userId: "lance",
					closes: [cleared(0, "ok", 40), cleared(1, "ok", 60)],
				})
			)
		).toBe(100);
	});

	it("spends what the start and the rewards held minus what is left", () => {
		const spent = kbSpentOf(
			run({
				userId: "lance",
				startedAtGate: 2,
				warmBootKb: 16,
				closes: [cleared(2, "ok", 100)],
				storageKb: 50,
			})
		);

		expect(spent).toBe(PIN_START_KB_PER_GATE * 2 + 16 + 100 - 50);
	});

	it("spends from what the run held after its last close before today", () => {
		const spent = kbSpentOf(
			run({
				userId: "lance",
				startedAtGate: 2,
				warmBootKb: 16,
				closesBefore: [{ ...cleared(2, "ok", 100), storageKbAfter: 80 }],
				closes: [cleared(3, "ok", 60)],
				storageKb: 50,
			})
		);

		expect(spent).toBe(80 + 60 - 50);
	});

	it("never spends a negative amount", () => {
		expect(kbSpentOf(run({ userId: "lance", storageKb: 10 }))).toBe(0);
	});
});

describe("buildCostOf", () => {
	it("charges nothing for a config the roster no longer lists", () => {
		expect(buildCostOf({ configs: [config("retired", 2)] })).toBe(0);
	});
});

describe("dayRecordsOf", () => {
	const RUNS = [
		run({
			userId: "brock",
			build: { configs: [config("ts", 3), config("css", 2)] },
			auditSchedule: { 1: ["not-found"], 2: ["not-found", "rolling-outage"] },
			closes: [held(1), cleared(1, "ok", 80)],
			storageKb: 20,
		}),
		run({
			userId: "misty",
			build: { configs: [config("ts", 3)] },
			closes: [cleared(0, "perfect", 40)],
			storageKb: 40,
		}),
		run({ userId: "koga" }),
	];

	const recordOf = (id: string) =>
		dayRecordsOf(RUNS).find((record) => record.id === id);

	it("names the heaviest and the lightest build, skipping an empty one", () => {
		expect(recordOf("biggest-build")).toMatchObject({
			figure: 5,
			holderIds: ["brock"],
		});
		expect(recordOf("lightest-build")).toMatchObject({
			figure: 3,
			holderIds: ["misty"],
		});
	});

	it("names the config most players run, counted once per player", () => {
		expect(recordOf("top-config")).toMatchObject({
			configId: "ts",
			figure: 2,
			holderIds: ["brock", "misty"],
		});
	});

	it("counts every audit scheduled across the run", () => {
		expect(recordOf("most-audits")).toMatchObject({
			figure: 3,
			holderIds: ["brock"],
		});
	});

	it("totals the community's KB and names the top earner", () => {
		expect(recordOf("kb-generated")).toMatchObject({
			figure: 120,
			holderIds: ["brock"],
		});
	});

	it("draws no comeback row when nobody came back", () => {
		expect(
			dayRecordsOf([run({ userId: "misty", closes: [cleared(0, "ok")] })]).some(
				(record) => record.id === "comeback"
			)
		).toBe(false);
	});

	it("draws no records on a day nobody played", () => {
		expect(dayRecordsOf([])).toEqual([]);
	});
});

describe("dayRunOn", () => {
	const { christmasEve, christmas } = TEST_DATES;
	const onDay = (close: RecordedClose, closedOn: string): RecordedClose => ({
		...close,
		closedOn,
	});

	it("keeps only the closes made that day and files the rest before it", () => {
		const yesterday = onDay(cleared(1, "ok", 40), christmasEve);
		const today = onDay(cleared(2, "ok", 60), christmas);

		const day = dayRunOn(christmas)(
			run({ userId: "misty", closes: [yesterday, today] })
		);

		expect(day?.closes).toEqual([today]);
		expect(day?.closesBefore).toEqual([yesterday]);
	});

	it("leaves out a live run that closed no gate that day", () => {
		expect(
			dayRunOn(christmas)(
				run({
					userId: "misty",
					closes: [onDay(cleared(1, "perfect"), christmasEve)],
				})
			)
		).toBeNull();
	});

	it("keeps a run that fell that day even without a close on it", () => {
		expect(
			dayRunOn(christmas)(
				run({
					userId: "giovanni",
					fallen: true,
					closes: [onDay(cleared(1, "ok"), christmasEve)],
				})
			)?.fallen
		).toBe(true);
	});

	it("treats a close without a day as made before it", () => {
		expect(
			dayRunOn(christmas)(run({ userId: "misty", closes: [cleared(1, "ok")] }))
		).toBeNull();
	});
});
