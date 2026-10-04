import { describe, expect, it } from "vitest";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";

import { accuracyFor, gainsFor, scoringFor } from "./scoring.viewmodel";

const PALLET = 0;
const LAVENDER = 4;
const CHAMPION = 12;

const bestCoverageOf = (
	gain: { steps?: readonly { coverage: string }[] } | undefined
) => gain?.steps?.at(-1)?.coverage ?? "";

describe("gainsFor", () => {
	it("gives each step the coverage it adds at the gate, the best on the last", () => {
		const [single, multiple] = gainsFor(LAVENDER);

		expect(bestCoverageOf(single)).toBe("+14.3%");
		expect(bestCoverageOf(multiple)).toBe("+28.6%");
		expect(multiple?.steps?.[0]?.coverage).toBe("+0%");
	});

	it("states no gain badge of its own, the steps carry it", () => {
		expect(gainsFor(LAVENDER).every((gain) => gain.figure === undefined)).toBe(
			true
		);
	});

	it("pays a right answer more at Pallet than at the Champion", () => {
		const [pallet] = gainsFor(PALLET);
		const [champion] = gainsFor(CHAMPION);

		expect(Number.parseFloat(bestCoverageOf(pallet))).toBeGreaterThan(
			Number.parseFloat(bestCoverageOf(champion))
		);
	});
});

describe("the steps read with your build", () => {
	it("states what each step earns with a build that lifts every poll", () => {
		const [single] = gainsFor(LAVENDER, [CONFIGS.intellisense]);

		expect(single?.steps?.map((step) => step.built)).toEqual(["0", "1.5"]);
	});

	it("leaves the build reading off when the build lifts no poll alike", () => {
		const [single, multiple] = gainsFor(LAVENDER, [CONFIGS.js]);

		expect(single?.steps?.every((step) => step.built === undefined)).toBe(true);
		expect(multiple?.steps?.every((step) => step.built === undefined)).toBe(
			true
		);
	});

	it("leaves the build reading off with no build at all", () => {
		const [single] = gainsFor(LAVENDER);

		expect(single?.steps?.every((step) => step.built === undefined)).toBe(true);
	});
});

describe("the steps under each gain", () => {
	const [single, multiple] = gainsFor(LAVENDER);

	it("prices a single answer as nothing or one unit", () => {
		expect((single.steps ?? []).map((step) => step.figure)).toEqual(["0", "1"]);
		expect((single.steps ?? []).map((step) => step.tone)).toEqual([
			"none",
			"full",
		]);
	});

	it("prices a multiple answer by quarter shares of two units", () => {
		expect((multiple.steps ?? []).map((step) => step.figure)).toEqual([
			"0",
			"0.5",
			"1",
			"1.5",
			"2",
		]);
		expect((multiple.steps ?? []).map((step) => step.tone)).toEqual([
			"none",
			"partial",
			"partial",
			"partial",
			"full",
		]);
	});
});

describe("accuracyFor", () => {
	it("quotes the multiplier a flawless window reaches at the close", () => {
		expect(accuracyFor(0)).toEqual({
			label: "Accuracy Bonus",
			figure: "up to ×1.08",
		});
	});

	it("quotes a higher ceiling once a bonus is carried in", () => {
		const carried = (accuracyFor(0.16).figure ?? "").replace("up to ×", "");

		expect(Number.parseFloat(carried)).toBeGreaterThan(1.08);
	});
});

describe("scoringFor", () => {
	it("carries the two gains and the accuracy bonus", () => {
		const scoring = scoringFor(LAVENDER, 0);

		expect(scoring.gains).toHaveLength(2);
		expect(scoring.accuracy.figure).toBe("up to ×1.08");
	});
});
