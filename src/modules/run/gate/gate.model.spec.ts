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

	it("reads Unit Tests' checkAmount — its level never raises the demand", () => {
		expect(currentRequirement(pipelineWith([CONFIGS.unitTests]), 0)).toBe(1);
		expect(
			currentRequirement(pipelineWith([{ ...CONFIGS.unitTests, level: 3 }]), 0)
		).toBe(1);
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
			win({ correct: 3, answered: 5, coverageGained: 0.5 }),
			0
		);
		expect(statuses.map((check) => check.label)).toEqual([
			"Correct",
			"Coverage",
		]);
		expect(statuses[0].state).toBe("success");
		expect(statuses[1].state).toBe("failed"); // 0.5% < 1%, window closed
	});

	it("fails Cold Start when the opening answer missed", () => {
		const [, coldStart] = checkStatuses(
			pipelineWith([CONFIGS.coldStart]),
			win({ correct: 4, answered: 5, leadingCorrect: 0 }),
			0
		);
		expect(coldStart.label).toBe("Cold start");
		expect(coldStart.state).toBe("failed");
	});

	it("composes every installed config's check into the window's checklist", () => {
		const statuses = checkStatuses(
			pipelineWith([CONFIGS.unitTests, CONFIGS.indexedDb, CONFIGS.eslint]),
			win({ correct: 3, answered: 5 }),
			0
		);
		expect(statuses.map((check) => check.label)).toEqual([
			"Correct",
			"IndexedDB",
			"ESLint linted",
		]);
		expect(statuses[1].state).toBe("success"); // 3 correct ≥ 3
		expect(statuses[2].state).toBe("skipped"); // never linted
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
				pipelineWith([CONFIGS.coverageGain]),
				win({ correct: 5, answered: 5, coverageGained: 5 }),
				0
			)
		).toBe(true);
		expect(
			gatePassed(
				pipelineWith([CONFIGS.coverageGain]),
				win({ correct: 5, answered: 5, coverageGained: 0.5 }),
				0
			)
		).toBe(false);
	});

	it("fails the gate when a linted poll was missed, even with every answer demand met", () => {
		expect(
			gatePassed(
				pipelineWith([CONFIGS.eslint]),
				win({
					correct: 4,
					answered: 5,
					lintedByConfig: { eslint: { polls: 1, correct: 0 } },
				}),
				0
			)
		).toBe(false);
	});
});

describe("gateDemands", () => {
	it("summarises the stacked demands in plain language", () => {
		const demands = gateDemands(
			pipelineWith([CONFIGS.coldStart, CONFIGS.coverageGain]),
			0
		);
		expect(demands[0]).toBe("1 correct answer");
		expect(demands).toContain("your first answer correct");
		expect(demands).toContain("+1% coverage this window");
	});
});
