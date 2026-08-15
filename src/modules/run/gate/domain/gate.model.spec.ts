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
				0,
				0,
				50
			)
		).toBe(true);
		expect(
			gatePassed(
				pipelineWith([CONFIGS.coverageGain]),
				win({ correct: 5, answered: 5, coverageGained: 0.5 }),
				0,
				0,
				50
			)
		).toBe(false);
	});

	it("fails a checks-passing window whose run total sits under the gate's demand (ADR-034)", () => {
		const pipeline = pipelineWith([CONFIGS.coverageGain]);
		const window = win({ correct: 5, answered: 5, coverageGained: 5 });
		expect(gatePassed(pipeline, window, 0, 0, 2.9)).toBe(false);
		expect(gatePassed(pipeline, window, 0, 0, 3)).toBe(true);
	});

	it("starves a caller that forgets the run total, like the storage floor", () => {
		const pipeline = pipelineWith([CONFIGS.coverageGain]);
		const window = win({ correct: 5, answered: 5, coverageGained: 5 });
		expect(gatePassed(pipeline, window, 0)).toBe(false);
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
				0,
				0,
				50
			)
		).toBe(false);
	});

	// ADR-017: with checks coming only from configs, an empty checklist would
	// pass vacuously and a stripped-bare run could never die.
	it("never passes a bare pipeline — nothing installed, nothing ships", () => {
		expect(
			gatePassed(pipelineWith([]), win({ correct: 5, answered: 5 }), 0, 0, 50)
		).toBe(false);
	});
});

describe("Moore's Law's storage floor", () => {
	const closed = win({ correct: 5, answered: 5 });
	const floorCheck = (window: GateWindow, storageKb: number) =>
		checkStatuses(pipelineWith([CONFIGS.mooresLaw]), window, 0, storageKb)[0];

	it("passes a window that closes on the floor", () => {
		expect(floorCheck(closed, 32).state).toBe("success");
	});

	it("fails a window that closes a single KB short", () => {
		expect(floorCheck(closed, 31).state).toBe("failed");
	});

	it("demands 32KB more per level, so an upgrade raises both halves", () => {
		const atLevel = (level: number) =>
			checkStatuses(
				pipelineWith([{ ...CONFIGS.mooresLaw, level }]),
				closed,
				0,
				96
			)[0];

		expect(atLevel(3).target).toBe(96);
		expect(atLevel(3).state).toBe("success");
		expect(atLevel(4).target).toBe(128);
		expect(atLevel(4).state).toBe("failed"); // the same 96KB now falls short
	});

	it("stays running while the window is open, however much is held", () => {
		// Not sticky either way: a lint fee can still drain the balance below the
		// floor before the gate resolves, so a rich mid-window build is unproven.
		expect(floorCheck(win({ correct: 2, answered: 2 }), 512).state).toBe(
			"running"
		);
	});

	it("reports the balance against the floor in KB", () => {
		expect(floorCheck(closed, 200).progress).toEqual({
			kind: "storage",
			current: 200,
			target: 32,
		});
	});

	it("fails the gate when the balance falls short", () => {
		expect(
			gatePassed(pipelineWith([CONFIGS.mooresLaw]), closed, 0, 31, 50)
		).toBe(false);
		expect(
			gatePassed(pipelineWith([CONFIGS.mooresLaw]), closed, 0, 32, 50)
		).toBe(true);
	});

	it("fails closed when no balance is supplied", () => {
		// A caller that forgets the balance starves the check rather than passing
		// it vacuously — the hole ADR-022's roster type exists to prevent.
		expect(
			gatePassed(pipelineWith([CONFIGS.mooresLaw]), closed, 0, undefined, 50)
		).toBe(false);
	});
});

describe(".length's pick budget", () => {
	const budgetCheck = (window: GateWindow) =>
		checkStatuses(pipelineWith([CONFIGS.length]), window, 0)[0];

	it("stands down on a window with no budget, which is a legacy snapshot", () => {
		// 0 is impossible for a real window: every poll has a correct option.
		const check = budgetCheck(win({ answered: 5, picks: 5 }));
		expect(check.state).toBe("skipped");
		expect(check.progress).toBeUndefined();
	});

	it("counts picks spent against the budget", () => {
		expect(
			budgetCheck(win({ answered: 2, picks: 3, budget: 7 })).progress
		).toEqual({ kind: "answers", current: 3, target: 7 });
	});

	it("stays running while the window is open and under budget", () => {
		expect(budgetCheck(win({ answered: 3, picks: 4, budget: 7 })).state).toBe(
			"running"
		);
	});

	it("passes on the exact spend", () => {
		expect(budgetCheck(win({ answered: 5, picks: 7, budget: 7 })).state).toBe(
			"success"
		);
	});

	it("fails the moment the spend goes over, with the window still open", () => {
		// Picks only grow, so over budget is unrecoverable: reporting anything but
		// failed would be a lie the player then acts on.
		expect(budgetCheck(win({ answered: 2, picks: 8, budget: 7 })).state).toBe(
			"failed"
		);
	});

	it("fails a window that closes under budget", () => {
		expect(budgetCheck(win({ answered: 5, picks: 6, budget: 7 })).state).toBe(
			"failed"
		);
	});

	it("judges the spend and never the answers", () => {
		const perfectButShort = win({
			answered: 5,
			correct: 5,
			picks: 6,
			budget: 7,
		});
		const wrongButExact = win({ answered: 5, correct: 0, picks: 7, budget: 7 });
		expect(budgetCheck(perfectButShort).state).toBe("failed");
		expect(budgetCheck(wrongButExact).state).toBe("success");
	});

	it("fails the gate on a misspend and clears it on the exact number", () => {
		const pipeline = pipelineWith([CONFIGS.length]);
		expect(
			gatePassed(pipeline, win({ answered: 5, picks: 6, budget: 7 }), 0, 0, 50)
		).toBe(false);
		expect(
			gatePassed(pipeline, win({ answered: 5, picks: 7, budget: 7 }), 0, 0, 50)
		).toBe(true);
	});
});

describe("Telemetry's peek demand", () => {
	const peekCheck = (window: GateWindow) =>
		checkStatuses(pipelineWith([CONFIGS.telemetry]), window, 0)[0];

	it("fails a closed window that bought no peeks — the demand is never excused", () => {
		// The one check on the roster that cannot be dodged by declining to use the
		// config: carrying Telemetry owes the gate a fee, full stop.
		const check = peekCheck(win({ correct: 5, answered: 5 }));
		expect(check.state).toBe("failed");
		expect(check.progress).toEqual({ kind: "answers", current: 0, target: 1 });
	});

	it("passes the moment the peek is bought, however the polls go", () => {
		// Sticky success: a bought peek cannot be unbought, and correctness is no
		// longer any of this check's business.
		expect(peekCheck(win({ answered: 2, peeked: 1, correct: 0 })).state).toBe(
			"success"
		);
	});

	it("stays running while the window is open and short of the demand", () => {
		expect(peekCheck(win({ answered: 3 })).state).toBe("running");
	});

	it("counts peeks bought against peeks owed", () => {
		expect(peekCheck(win({ answered: 2 })).progress).toEqual({
			kind: "answers",
			current: 0,
			target: 1,
		});
	});

	it("reads its demand off checkAmount, so the count is a roster dial", () => {
		const atThree = checkStatuses(
			pipelineWith([{ ...CONFIGS.telemetry, checkAmount: 3 }]),
			win({ answered: 5, peeked: 2 }),
			0
		)[0];
		expect(atThree.target).toBe(3);
		expect(atThree.state).toBe("failed");
	});

	it("fails the gate on an unpeeked window and clears it on the first peek", () => {
		const pipeline = pipelineWith([CONFIGS.telemetry]);
		expect(gatePassed(pipeline, win({ answered: 5 }), 0, 0, 50)).toBe(false);
		expect(
			gatePassed(pipeline, win({ answered: 5, peeked: 1 }), 0, 0, 50)
		).toBe(true);
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
		expect(gatePassed(pipelineWith(covered), window, 0, 0, 50)).toBe(true);
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
		expect(gatePassed(pipelineWith(thin), window, 0, 0, 50)).toBe(false);
	});

	it("hides nothing when two checks failed at once", () => {
		const configs = [...covered, CONFIGS.coldStart];
		const window = win({ ...closed, leadingCorrect: 0 });
		expect(rowFor(configs, window, "Volkswagen CI")).toMatchObject({
			state: "failed",
			progress: { kind: "checksFailing", count: 2 },
		});
		expect(gatePassed(pipelineWith(configs), window, 0, 0, 50)).toBe(false);
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
		expect(gatePassed(pipelineWith(clean), window, 0, 0, 50)).toBe(true);
	});

	// Both regressions guard the same hole: a build that cannot fail.
	it("leaves a narrow build mortal — no passing checks, no cover", () => {
		const narrow = [CONFIGS.unitTests, CONFIGS.volkswagenCi];
		const window = win({ correct: 0, answered: 5 });
		expect(rowFor(narrow, window, "Correct")?.state).toBe("failed");
		expect(gatePassed(pipelineWith(narrow), window, 0, 0, 50)).toBe(false);
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
		expect(gatePassed(pipelineWith(padded), window, 0, 0, 50)).toBe(false);
	});
});

describe("the checklist is the whole rulebook (ADR-022)", () => {
	// Why this matters beyond tidiness: a rejected design added a correctness
	// floor to gatePassed directly. It worked, but it could fail a gate while
	// every visible row read "skipped", leaving the player no way to see why.
	// Keeping every reason on the checklist is what makes the report readable.
	// The one carve-out is the gate's own coverage stake (ADR-034): it is not a
	// config's row, so it lives on the GateStake receipt instead — met here so
	// check failures stay this invariant's subject.
	const everyRoster = Object.values(CONFIGS);

	it("never fails a stocked gate without a failed row to point at", () => {
		const closed = win({ correct: 0, answered: 5, maxMissStreak: 2 });
		for (const config of everyRoster) {
			const pipeline = pipelineWith([config]);
			if (gatePassed(pipeline, closed, 0, 0, 50)) continue;
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
