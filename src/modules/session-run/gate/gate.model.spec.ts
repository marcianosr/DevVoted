import { describe, expect, it } from "vitest";

import { Pipeline } from "../pipeline/pipeline.model";
import { Config } from "../configs/config.model";
import { CONFIGS } from "../configs/configRoster.model";
import { EMPTY_WINDOW, GateWindow } from "../configs/effect.model";
import { dropCount, escalation } from "../rules.model";
import {
	checkStatuses,
	currentRequirement,
	gateDemands,
	gatePassed,
} from "./gate.model";

const pipelineWith = (configs: Config[]): Pipeline => ({
	id: "pipeline",
	slots: 5,
	configs,
});
const win = (partial: Partial<GateWindow>): GateWindow => ({
	...EMPTY_WINDOW,
	...partial,
});

describe("escalation and dropCount", () => {
	it("adds +1 every two gates cleared", () => {
		expect(escalation(0)).toBe(0);
		expect(escalation(2)).toBe(1);
		expect(escalation(4)).toBe(2);
	});

	it("drops more configs deeper in the climb", () => {
		expect(dropCount(0)).toBe(1);
		expect(dropCount(2)).toBe(2);
		expect(dropCount(4)).toBe(3);
	});
});

describe("currentRequirement", () => {
	it("starts at 1 and escalates", () => {
		expect(currentRequirement(pipelineWith([]), 0)).toBe(1);
		expect(currentRequirement(pipelineWith([]), 2)).toBe(2);
	});
});

describe("checkStatuses", () => {
	it("always leads with the Correct baseline", () => {
		const [first] = checkStatuses(
			pipelineWith([]),
			win({ correct: 1, answered: 5 }),
			0
		);
		expect(first.label).toBe("Correct");
		expect(first.state).toBe("success");
	});

	it("adds a Coverage check that can fail while Correct passes", () => {
		const statuses = checkStatuses(
			pipelineWith([CONFIGS.coverageGain]),
			win({ correct: 3, answered: 5, coverageGained: 3 }),
			0
		);
		expect(statuses.map((check) => check.label)).toEqual([
			"Correct",
			"Coverage",
		]);
		expect(statuses[0].state).toBe("success");
		expect(statuses[1].state).toBe("failed"); // 3% < 4%, window closed
	});

	it("counts fast answers for Speed", () => {
		const [, speed] = checkStatuses(
			pipelineWith([CONFIGS.speed]),
			win({ correct: 5, answered: 5, fast: 1 }),
			0
		);
		expect(speed.label).toBe("Speed");
		expect(speed.state).toBe("failed"); // 1 fast < 2, window closed
	});

	it("ignores a Focus mastery until its category appears", () => {
		const unseen = checkStatuses(
			pipelineWith([CONFIGS.js]),
			win({ correct: 1, answered: 5 }),
			0
		);
		expect(unseen.find((check) => check.label === ".js mastery")?.state).toBe(
			"skipped"
		); // not seen → skipped (still passes)
		const seenMissed = checkStatuses(
			pipelineWith([CONFIGS.js]),
			win({
				correct: 1,
				answered: 5,
				byCategory: { js: { seen: 1, correct: 0 } },
			}),
			0
		);
		expect(
			seenMissed.find((check) => check.label === ".js mastery")?.state
		).toBe("failed");
	});
});

describe("gatePassed", () => {
	it("passes only when every check is met", () => {
		expect(
			gatePassed(
				pipelineWith([CONFIGS.speed]),
				win({ correct: 5, answered: 5, fast: 2 }),
				0
			)
		).toBe(true);
		expect(
			gatePassed(
				pipelineWith([CONFIGS.speed]),
				win({ correct: 5, answered: 5, fast: 1 }),
				0
			)
		).toBe(false);
	});
});

describe("gateDemands", () => {
	it("summarises the stacked demands in plain language", () => {
		const demands = gateDemands(
			pipelineWith([CONFIGS.speed, CONFIGS.coverageGain]),
			0
		);
		expect(demands[0]).toBe("1 correct answer");
		expect(demands).toContain("2 fast answers");
		expect(demands).toContain("+4% coverage this window");
	});
});
