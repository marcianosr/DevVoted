import { describe, expect, it } from "vitest";

import { Pipeline } from "~/modules/run/pipeline/domain/pipeline.model";
import { Config } from "~/modules/run/config/domain/config.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	CheckStatus,
	EMPTY_WINDOW,
	GateWindow,
} from "~/modules/run/config/domain/effect.model";
import { dropCount } from "~/modules/run/run/domain/rules.model";
import {
	checkStatuses,
	currentRequirement,
	gatePassed,
} from "~/modules/run/gate/domain/gate.model";

const pipelineWith = (configs: Config[]): Pipeline => ({
	id: "pipeline",
	slots: 5,
	configs,
});
const win = (partial: Partial<GateWindow>): GateWindow => ({
	...EMPTY_WINDOW,
	...partial,
});

describe("dropCount", () => {
	it("drops more configs deeper in the climb", () => {
		expect(dropCount(0)).toBe(1);
		expect(dropCount(2)).toBe(2);
		expect(dropCount(4)).toBe(3);
	});
});

describe("currentRequirement", () => {
	it("owes nothing without a correct-check config", () => {
		expect(currentRequirement(pipelineWith([]))).toBeNull();
		expect(currentRequirement(pipelineWith([CONFIGS.coldStart]))).toBeNull();
	});

	it("reads Unit Tests' checkAmount and nothing else (ADR-033)", () => {
		expect(currentRequirement(pipelineWith([CONFIGS.unitTests]))).toBe(1);
	});

	it("each Unit Tests level adds one demanded answer", () => {
		expect(
			currentRequirement(pipelineWith([{ ...CONFIGS.unitTests, level: 3 }]))
		).toBe(3);
	});

	it("clamps the total to the window", () => {
		expect(
			currentRequirement(pipelineWith([{ ...CONFIGS.unitTests, level: 5 }]))
		).toBe(5);
		expect(
			currentRequirement(pipelineWith([{ ...CONFIGS.unitTests, level: 9 }]))
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
			"ESLint mastery",
		]);
		expect(statuses[1].state).toBe("success"); // 3 correct ≥ 3
		expect(statuses[2].state).toBe("skipped"); // no JS/TS poll drawn
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

	it("fails the gate when the linter's categories were drawn and none was answered right", () => {
		expect(
			gatePassed(
				pipelineWith([CONFIGS.eslint]),
				win({
					correct: 4,
					answered: 5,
					byCategory: { js: { seen: 1, correct: 0 } },
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

// ADR-028. A closed window (answered: 5) so every check has resolved.
describe("Volkswagen CI", () => {
	const closed = { correct: 3, answered: 5 };
	// Correct (1), IndexedDB (3 correct), AGENTS.md (1 correct) all pass on 3
	// correct; Coverage fails on 0% gained. Exactly the one failure to hide.
	const covered = [
		CONFIGS.unitTests,
		CONFIGS.indexedDb,
		CONFIGS.agentsMd,
		CONFIGS.coverageGain,
		CONFIGS.volkswagenCi,
	];
	const rowFor = (
		configs: Config[],
		window: GateWindow,
		label: string
	): CheckStatus | undefined =>
		checkStatuses(pipelineWith(configs), window, 0).find(
			(check) => check.label === label
		);

	it("reports the single failing check as passing when 3 others passed", () => {
		const window = win(closed);
		expect(rowFor(covered, window, "Coverage")?.state).toBe("skipped");
		expect(gatePassed(pipelineWith(covered), window, 0)).toBe(true);
	});

	it("names the check it hid, and leaves that check's real tally readable", () => {
		const window = win(closed);
		expect(rowFor(covered, window, "Volkswagen CI")).toMatchObject({
			state: "success",
			progress: { kind: "hidCheck", label: "Coverage" },
		});
		expect(rowFor(covered, window, "Coverage")?.progress).toEqual({
			kind: "reportedPassing",
			actual: { kind: "coverage", current: 0, target: 1 },
		});
	});

	it("hides nothing when only two other checks passed", () => {
		const thin = [
			CONFIGS.unitTests,
			CONFIGS.indexedDb,
			CONFIGS.coverageGain,
			CONFIGS.volkswagenCi,
		];
		const window = win(closed);
		expect(rowFor(thin, window, "Coverage")?.state).toBe("failed");
		expect(rowFor(thin, window, "Volkswagen CI")?.progress).toEqual({
			kind: "cover",
			current: 2,
			target: 3,
		});
		expect(gatePassed(pipelineWith(thin), window, 0)).toBe(false);
	});

	it("hides nothing when two checks failed at once", () => {
		const configs = [...covered, CONFIGS.coldStart];
		const window = win({ ...closed, leadingCorrect: 0 });
		expect(rowFor(configs, window, "Volkswagen CI")).toMatchObject({
			state: "failed",
			progress: { kind: "checksFailing", count: 2 },
		});
		expect(gatePassed(pipelineWith(configs), window, 0)).toBe(false);
	});

	it("stays dormant with nothing to hide", () => {
		const clean = [
			CONFIGS.unitTests,
			CONFIGS.indexedDb,
			CONFIGS.agentsMd,
			CONFIGS.volkswagenCi,
		];
		const window = win(closed);
		expect(rowFor(clean, window, "Volkswagen CI")).toMatchObject({
			state: "skipped",
			progress: undefined,
		});
		expect(gatePassed(pipelineWith(clean), window, 0)).toBe(true);
	});

	// Both regressions guard the same hole: a build that cannot fail.
	it("leaves a narrow build mortal — no passing checks, no cover", () => {
		const narrow = [CONFIGS.unitTests, CONFIGS.volkswagenCi];
		const window = win({ correct: 0, answered: 5 });
		expect(rowFor(narrow, window, "Correct")?.state).toBe("failed");
		expect(gatePassed(pipelineWith(narrow), window, 0)).toBe(false);
	});

	it("counts only checks that ran — skipped Focus configs are not cover", () => {
		const padded = [
			CONFIGS.unitTests,
			CONFIGS.js,
			CONFIGS.ts,
			CONFIGS.css,
			CONFIGS.volkswagenCi,
		];
		const window = win({ correct: 0, answered: 5 });
		expect(rowFor(padded, window, ".js mastery")?.state).toBe("skipped");
		expect(rowFor(padded, window, "Volkswagen CI")?.progress).toEqual({
			kind: "cover",
			current: 0,
			target: 3,
		});
		expect(gatePassed(pipelineWith(padded), window, 0)).toBe(false);
	});
});

describe("the checklist is the whole rulebook (ADR-022)", () => {
	// Why this matters beyond tidiness: a rejected design added a correctness
	// floor to gatePassed directly. It worked, but it could fail a gate while
	// every visible row read "skipped", leaving the player no way to see why.
	// Keeping every reason on the checklist is what makes the report readable.
	const everyRoster = Object.values(CONFIGS);

	it("never fails a stocked gate without a failed row to point at", () => {
		const closed = win({ correct: 0, answered: 5, maxMissStreak: 2 });
		for (const config of everyRoster) {
			const pipeline = pipelineWith([config]);
			if (gatePassed(pipeline, closed, 0)) continue;
			const rows = checkStatuses(pipeline, closed, 0);
			expect(
				rows.some((row) => row.state === "failed"),
				`${config.label} fails the gate with no failed row on the checklist`
			).toBe(true);
		}
	});

	it("gives every roster config a row of its own to answer for", () => {
		for (const config of everyRoster) {
			const rows = checkStatuses(pipelineWith([config]), EMPTY_WINDOW, 0);
			expect(
				rows.length,
				`${config.label} contributes no checklist row`
			).toBeGreaterThan(0);
		}
	});
});
