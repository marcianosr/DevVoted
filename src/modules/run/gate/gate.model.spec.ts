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
	it("owes nothing without a correct-check config (ADR-017)", () => {
		expect(currentRequirement(pipelineWith([]), 0)).toBeNull();
		expect(currentRequirement(pipelineWith([CONFIGS.coldStart]), 2)).toBeNull();
	});

	it("reads Unit Tests' checkAmount and escalates with gate depth", () => {
		expect(currentRequirement(pipelineWith([CONFIGS.unitTests]), 0)).toBe(1);
		expect(currentRequirement(pipelineWith([CONFIGS.unitTests]), 2)).toBe(2);
	});

	it("each Unit Tests level adds one demanded answer", () => {
		expect(
			currentRequirement(pipelineWith([{ ...CONFIGS.unitTests, level: 3 }]), 0)
		).toBe(3);
	});

	it("caps auto-escalation at 4 of 5 — an L1 build always survives one miss", () => {
		expect(currentRequirement(pipelineWith([CONFIGS.unitTests]), 12)).toBe(4);
	});

	it("clamps the total to the window — only bought levels reach 5 of 5", () => {
		expect(
			currentRequirement(pipelineWith([{ ...CONFIGS.unitTests, level: 3 }]), 12)
		).toBe(5);
		expect(
			currentRequirement(pipelineWith([{ ...CONFIGS.unitTests, level: 5 }]), 0)
		).toBe(5);
	});
});

describe("checkStatuses", () => {
	it("contributes no Correct check without a correct-check config", () => {
		expect(checkStatuses(pipelineWith([]), EMPTY_WINDOW, 0)).toEqual([]);
		const labels = checkStatuses(
			pipelineWith([CONFIGS.coldStart]),
			win({ correct: 1, answered: 5, leadingCorrect: 1 }),
			0
		).map((check) => check.label);
		expect(labels).not.toContain("Correct");
	});

	it("leads with Unit Tests' Correct check when it is installed", () => {
		const [first] = checkStatuses(
			pipelineWith([CONFIGS.unitTests]),
			win({ correct: 1, answered: 5 }),
			0
		);
		expect(first.label).toBe("Correct");
		expect(first.state).toBe("success");
		expect(first.sourceConfigId).toBe(CONFIGS.unitTests.id);
	});

	it("adds a Coverage check that can fail while Correct passes", () => {
		const statuses = checkStatuses(
			pipelineWith([CONFIGS.unitTests, CONFIGS.coverageGain]),
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
		const [coldStart] = checkStatuses(
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

	// ADR-017: with checks coming only from configs, an empty checklist would
	// pass vacuously and a stripped-bare run could never die.
	it("never passes a bare pipeline — nothing installed, nothing ships", () => {
		expect(
			gatePassed(pipelineWith([]), win({ correct: 5, answered: 5 }), 0)
		).toBe(false);
	});
});

describe("gateDemands", () => {
	it("summarises the stacked demands in plain language", () => {
		const demands = gateDemands(
			pipelineWith([CONFIGS.coldStart, CONFIGS.coverageGain]),
			0
		);
		expect(demands).toContain("your first answer correct");
		expect(demands).toContain("+1% coverage this window");
	});

	it("only demands correct answers when a correct-check config asks", () => {
		expect(gateDemands(pipelineWith([CONFIGS.coldStart]), 0)).not.toContain(
			"1 correct answer"
		);
		expect(gateDemands(pipelineWith([CONFIGS.unitTests]), 0)[0]).toBe(
			"1 correct answer"
		);
	});
});
