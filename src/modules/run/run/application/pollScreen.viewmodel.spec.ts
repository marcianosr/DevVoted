import { bandAtLadder } from "~/modules/run/gate/domain/gate.model";
import { describe, expect, it } from "vitest";

import type { Config } from "~/modules/run/config/domain/config.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	buildCountsOf,
	coverageLeadFor,
	pollBarFor,
	pollBreakdownFor,
	pollBuildFor,
	pollDifficultyFor,
	pollFactsFor,
	pollHistoryFor,
	accuracyTrackFor,
	answeredOptionsFor,
	gainFigureOf,
	pollFlightFor,
	pollShakeFor,
	pollPressesOf,
	runPaidFor,
	categoryLeaderFor,
	pollCoverageFor,
	pollClockFor,
	pollCommitFor,
	approvalCommitFor,
	pollStepFor,
	PICK_EVERY,
	pollKeysHintFor,
	SINGLE_KEYS,
	MULTIPLE_KEYS,
} from "~/modules/run/run/application/pollScreen.viewmodel";
import { toRunView } from "~/modules/run/run/application/runView.viewmodel";
import { createRun, type RunState } from "~/modules/run/run/domain/run.model";
import { runReducer } from "~/modules/run/run/domain/runAction.model";
import type {
	AnsweredPoll,
	RunPoll,
} from "~/modules/run/run/domain/runPoll.model";
import {
	ACCURACY_GAIN_PER_GATE,
	floorAt,
	percentOf,
} from "~/modules/run/build/domain/coverageRatio.model";
import { createMockPollView, createMockRunView } from "~/test/runView.factory";
import type { CategoryCode } from "~/shared/lib/categories";

const THREE_OPTIONS = (id: string, category: CategoryCode): RunPoll => ({
	id,
	category,
	question: `${id}?`,
	answerType: "single",
	options: [
		{ id: `${id}-right`, label: "Yes", correct: true },
		{ id: `${id}-wrong-a`, label: "No", correct: false },
		{ id: `${id}-wrong-b`, label: "Maybe", correct: false },
	],
});

const runWith = (
	configs: readonly Config[],
	categories: readonly CategoryCode[],
	storage = 512
): RunState => {
	const polls = categories.map((category, index) =>
		THREE_OPTIONS(`q${index}`, category)
	);
	const base = createRun(polls, [...configs]);

	return {
		...runReducer(
			{
				...base,
				build: {
					...base.build,
					configs: [...configs],
				},
			},
			{ type: "start" }
		),
		storage,
	};
};

const viewOf = (...args: Parameters<typeof runWith>) =>
	toRunView(runWith(...args));

const JS_GATE: readonly CategoryCode[] = ["js", "js", "js", "js", "js"];
const CSS_GATE: readonly CategoryCode[] = ["css", "css", "css", "css", "css"];
const NARROW_LINTER = {
	...CONFIGS.linter,
	eliminatesWrongOptionsFor: ["js", "ts"] as const,
};

describe("buildCountsOf", () => {
	it("never counts one config in two buckets", () => {
		const view = viewOf(
			[CONFIGS.linter, CONFIGS.telemetry, CONFIGS.intellisense, CONFIGS.js],
			JS_GATE
		);
		const counts = buildCountsOf(view);

		expect(counts.applies + counts.ready + counts.offline).toBe(
			view.configs.length
		);
	});

	it("counts Linter ready on a JS poll and on a CSS poll alike", () => {
		expect(buildCountsOf(viewOf([CONFIGS.linter], JS_GATE))).toMatchObject({
			ready: 1,
			applies: 0,
		});
		expect(buildCountsOf(viewOf([CONFIGS.linter], CSS_GATE))).toMatchObject({
			ready: 1,
			applies: 0,
		});
	});

	it("counts a linter sitting the poll out as neither ready nor applying", () => {
		expect(buildCountsOf(viewOf([NARROW_LINTER], CSS_GATE))).toMatchObject({
			ready: 0,
			applies: 0,
		});
	});

	it("drops a press out of ready when the fee is out of reach", () => {
		expect(buildCountsOf(viewOf([CONFIGS.linter], JS_GATE, 0))).toMatchObject({
			ready: 0,
		});
	});

	it("leaves a passive config in applies, never in ready", () => {
		expect(
			buildCountsOf(viewOf([CONFIGS.intellisense], JS_GATE))
		).toMatchObject({ applies: 1, ready: 0 });
	});
});

describe("pollPressesOf", () => {
	it("sells no press for a linter sitting the poll out", () => {
		expect(pollPressesOf(viewOf([NARROW_LINTER], CSS_GATE))).toEqual([]);
	});

	it("refuses a second lint once one wrong answer is left standing", () => {
		const state = runWith([CONFIGS.linter], JS_GATE);
		const [press] = pollPressesOf(
			toRunView(runReducer(state, { type: "lint-poll" }))
		);

		expect(press.ready).toBe(false);
		expect(press.refusal).toBe("one wrong left");
	});

	it("prices the lint off the gate's own ladder", () => {
		const view = viewOf([CONFIGS.linter], JS_GATE);

		expect(pollPressesOf(view)[0].label).toBe("lint 8 KB");
	});

	it("says nothing about a config that sells no press", () => {
		expect(pollPressesOf(viewOf([CONFIGS.intellisense], JS_GATE))).toEqual([]);
	});
});

describe("pollBuildFor", () => {
	it("draws no press badge when the screen passes no handler", () => {
		const build = pollBuildFor(viewOf([CONFIGS.linter], JS_GATE));

		expect(build.configs[0].badges).toEqual([]);
	});

	it("states a sitting-out linter's categories once, on its own badge", () => {
		const build = pollBuildFor(viewOf([NARROW_LINTER], CSS_GATE), {
			onPress: () => {},
		});

		expect(build.configs[0].badges).toEqual([
			{ label: "JavaScript or TypeScript only", color: "pewter" },
		]);
	});

	it("disables a refused press and says why on the badge", () => {
		const state = runWith([CONFIGS.linter], JS_GATE);
		const build = pollBuildFor(
			toRunView(runReducer(state, { type: "lint-poll" })),
			{ onPress: () => {} }
		);
		const press = (build.configs[0].badges ?? []).find(
			(badge) => "onPress" in badge
		);

		expect(press).toMatchObject({
			disabled: true,
			label: "one wrong left",
		});
	});

	it("arms a press the player can afford", () => {
		const build = pollBuildFor(viewOf([CONFIGS.linter], JS_GATE), {
			onPress: () => {},
		});

		expect((build.configs[0].badges ?? [])[0]).toMatchObject({
			disabled: false,
		});
	});
});

const BARE: readonly Config[] = [CONFIGS.linter];

const answering = (state: RunState, right: boolean): RunState => {
	const poll = state.polls[state.currentIndex];
	const option = poll.options.find((candidate) => candidate.correct === right);

	if (option === undefined) throw new Error(`${poll.id} has no such option`);

	return runReducer(
		runReducer(state, { type: "answer", optionIds: [option.id] }),
		{ type: "close-gate" }
	);
};

const playing = (
	categories: readonly CategoryCode[],
	rights: readonly boolean[],
	configs: readonly Config[] = BARE
): RunState => rights.reduce(answering, runWith(configs, categories));

const TWO_GATES: readonly CategoryCode[] = [...JS_GATE, ...CSS_GATE];
const CLEARED = [true, true, true, true, true];

const CARRIED_BONUS = 0.4;

const carrying = (
	rights: readonly boolean[],
	accuracyBonus = CARRIED_BONUS
): RunState =>
	rights.reduce(answering, {
		...runWith(BARE, JS_GATE),
		accuracyBonus,
	});

const textOf = (line: ReturnType<typeof coverageLeadFor>): string =>
	line.map((part) => (typeof part === "string" ? part : part.figure)).join("");

describe("coverageLeadFor", () => {
	it("states the coverage the window guarantees as a share of the bar", () => {
		const run = playing(JS_GATE, [true]);

		expect(textOf(coverageLeadFor(toRunView(run)))).toBe(
			"You hold 20.0% coverage."
		);
	});

	it("speaks in coverage, never in units or the gate's changes", () => {
		const run = playing(JS_GATE, [true, true]);
		const text = textOf(coverageLeadFor(toRunView(run)));

		expect(text).not.toContain("unit");
		expect(text).not.toMatch(/\bchanges?\b/i);
	});

	it("bands the score by how the run is doing", () => {
		const [, score] = coverageLeadFor(toRunView(runWith(BARE, JS_GATE)));

		expect(score).toEqual({ figure: "0.0%", band: "shaky" });
	});

	it("badges the same score as coverage, the denomination the gate judges", () => {
		const run = playing(JS_GATE, [true]);
		const coverage = coverageLeadFor(toRunView(run)).at(-2);

		expect(coverage).toEqual({ figure: "20.0%", band: "shaky" });
	});
});

describe("pollBarFor", () => {
	it("speaks the coverage held against the gate's bands, in percent", () => {
		const view = toRunView(playing(JS_GATE, [true, true]));

		expect(pollBarFor(view)).toEqual({
			...view.gateStake.coverageLadder,
			held: view.gateStake.coverageHeld,
			band: bandAtLadder(
				view.gateStake.coverageHeld,
				view.gateStake.coverageLadder
			).id,
		});
	});

	it("opens the next gate on no more than its floor, never on the whole bar", () => {
		const pewter = pollBarFor(
			toRunView(playing(TWO_GATES, [true, true, true, true, true]))
		);

		expect(pewter.held).toBeGreaterThan(0);
		expect(pewter.held).toBeLessThanOrEqual(percentOf(floorAt(1)));
	});
});

describe("runPaidFor", () => {
	it("leaves out the gate just opened, whose slots have nothing in them yet", () => {
		const cleared = toRunView(playing(TWO_GATES, CLEARED));

		expect(runPaidFor(cleared).rows).toHaveLength(1);
	});

	it("states the accuracy multiplier the closed gate landed", () => {
		const [pallet] = runPaidFor(toRunView(playing(TWO_GATES, CLEARED))).rows;

		expect(pallet.payouts?.multiplier).toBe("×1.08");
	});

	it("states no multiplier for the gate still being answered", () => {
		const [pallet] = runPaidFor(
			toRunView(playing(TWO_GATES, [true, true]))
		).rows;

		expect(pallet.payouts?.multiplier).toBeUndefined();
	});
});

const lastAnswerOf = (state: RunState): AnsweredPoll => {
	const last = toRunView(state).answeredThisGate.at(-1);
	if (last === undefined) throw new Error("nothing answered yet");
	return last;
};

describe("accuracyTrackFor", () => {
	it("opens a fresh run on ×1 sure, up to one plus the gain, on a track that reads to ×2", () => {
		const track = accuracyTrackFor(toRunView(playing(JS_GATE, [])));

		expect(track).toMatchObject({
			figure: "×1 · up to ×1.08",
			sure: 0,
		});
		expect(track.best).toBeCloseTo(ACCURACY_GAIN_PER_GATE);
	});

	it("reads the multiplier the window is sure of and the best still open", () => {
		const track = accuracyTrackFor(toRunView(carrying([true, true])));

		expect(track.figure).toBe(`×1.39 · up to ×1.48`);
		expect(track.sure).toBeCloseTo(0.39);
		expect(track.best).toBeCloseTo(0.48);
	});

	it("lowers the best case on a miss and keeps what is sure", () => {
		const track = accuracyTrackFor(toRunView(carrying([true, false])));

		expect(track.figure).toBe("×1.38 · up to ×1.47");
	});

	it("names the multiplier aloud for a reader", () => {
		const track = accuracyTrackFor(toRunView(carrying([true, false])));

		expect(track.label).toBe("Accuracy ×1.38, up to ×1.47");
	});

	it("stretches the track to the next whole multiplier once the best passes ×2", () => {
		const track = accuracyTrackFor(toRunView(carrying([], 1)));

		expect(track.figure).toBe("×1.96 · up to ×2.08");
		expect(track.best).toBeCloseTo(1.08 / 2);
	});

	it("draws no per-poll segment, so five boxes never read as five polls", () => {
		const track = accuracyTrackFor(toRunView(playing(JS_GATE, [true])));

		expect(Object.keys(track)).not.toContain("segments");
	});

	it("pulses the bar while a right answer lands", () => {
		const run = playing(JS_GATE, [false, true]);
		const answered = lastAnswerOf(run);

		expect(accuracyTrackFor(toRunView(run), answered).pulse).toEqual({
			key: answered.id,
		});
	});

	it("pulses nothing for a wrong answer", () => {
		const run = playing(JS_GATE, [true, false]);

		expect(
			accuracyTrackFor(toRunView(run), lastAnswerOf(run)).pulse
		).toBeUndefined();
	});
});

describe("gainFigureOf", () => {
	it("signs what an answer added to the bar, to the tenth", () => {
		expect(gainFigureOf(24, 36.04)).toBe("+12%");
		expect(gainFigureOf(10, 21.16)).toBe("+11.2%");
	});

	it("names no gain when the bar did not rise", () => {
		expect(gainFigureOf(36, 36)).toBeUndefined();
		expect(gainFigureOf(36, 30)).toBeUndefined();
		expect(gainFigureOf(36, 36.02)).toBeUndefined();
	});
});

describe("pollFlightFor", () => {
	const before = playing(JS_GATE, [true]);
	const right = playing(JS_GATE, [true, true]);
	const wrong = playing(JS_GATE, [true, false]);

	it("flies a right answer's gain to where the bar will stand", () => {
		const view = toRunView(right);
		const flight = pollFlightFor(toRunView(before), view, lastAnswerOf(right));

		expect(flight).toEqual({
			figure: gainFigureOf(
				toRunView(before).gateStake.coverageHeld,
				view.gateStake.coverageHeld
			),
			id: lastAnswerOf(right).id,
			fromHeld: toRunView(before).gateStake.coverageHeld,
			toHeld: view.gateStake.coverageHeld,
		});
	});

	it("sends nothing after a wrong answer", () => {
		expect(
			pollFlightFor(toRunView(before), toRunView(wrong), lastAnswerOf(wrong))
		).toBeUndefined();
	});

	it("sends nothing while no poll is landing", () => {
		expect(
			pollFlightFor(toRunView(before), toRunView(right), undefined)
		).toBeUndefined();
	});

	it("sends nothing when the meter is down, since the bar is not drawn", () => {
		expect(
			pollFlightFor(
				toRunView(before),
				{ ...toRunView(right), meterHidden: true },
				lastAnswerOf(right)
			)
		).toBeUndefined();
	});
});

describe("pollShakeFor", () => {
	it("shakes the card for a wrong answer, keyed to that answer", () => {
		const answered = lastAnswerOf(playing(JS_GATE, [false]));

		expect(pollShakeFor(answered)).toBe(answered.id);
	});

	it("holds the card still for a right answer", () => {
		expect(
			pollShakeFor(lastAnswerOf(playing(JS_GATE, [true])))
		).toBeUndefined();
	});
});

describe("answeredOptionsFor", () => {
	const answered = (picked: readonly string[]): AnsweredPoll => ({
		...lastAnswerOf(playing(JS_GATE, [true])),
		options: ["at(-1)", "pop()", "slice(-1)"],
		picked,
		correct: ["at(-1)"],
	});

	const statesOf = (poll: AnsweredPoll) =>
		answeredOptionsFor(poll).map((option) => option.state);

	it("marks a right pick right and leaves the rest idle", () => {
		expect(statesOf(answered(["at(-1)"]))).toEqual(["right", "idle", "idle"]);
	});

	it("marks a wrong pick wrong and still shows the right answer as right", () => {
		expect(statesOf(answered(["pop()"]))).toEqual(["right", "wrong", "idle"]);
	});
});

const answeredIn = (state: RunState) => {
	const last = toRunView(state).answeredThisGate.at(-1);
	if (last === undefined) throw new Error("nothing answered yet");
	return last;
};

const JS_BUILD: readonly Config[] = [
	CONFIGS.js,
	{ ...CONFIGS.linter, eliminatesWrongOptionsFor: ["css"] as const },
];

describe("pollBuildFor — what each config is worth on this poll", () => {
	it("badges the multiplier a config is applying to the poll in hand", () => {
		const build = pollBuildFor(viewOf(JS_BUILD, JS_GATE));
		const [focus] = build.configs;

		expect(focus.badges).toEqual([
			{ label: "\u00d71.25 here", color: "viridian" },
		]);
	});

	it("tells a config sitting the poll out which categories it waits for", () => {
		const build = pollBuildFor(viewOf(JS_BUILD, JS_GATE));
		const [, linter] = build.configs;

		expect(linter.badges).toEqual([{ label: "CSS only", color: "pewter" }]);
		expect(linter.detail).toBeUndefined();
	});

	it("puts the figure before the press, so the chip reads worth then action", () => {
		const build = pollBuildFor(viewOf([CONFIGS.abTest], JS_GATE), {
			onPress: () => {},
		});
		const badges = build.configs[0].badges ?? [];

		expect(badges).toHaveLength(2);
		expect(badges[0]).toHaveProperty("color");
		expect(badges[1]).toHaveProperty("onPress");
	});

	it("credits nothing while the poll is still unanswered", () => {
		const build = pollBuildFor(viewOf(JS_BUILD, JS_GATE));

		expect(build.configs.every((config) => config.credited !== true)).toBe(
			true
		);
	});

	it("marks only the configs that paid once the answer lands", () => {
		const run = playing(JS_GATE, [true], JS_BUILD);
		const build = pollBuildFor(toRunView(run), {}, answeredIn(run));

		expect(
			build.configs
				.filter((config) => config.credited === true)
				.map((c) => c.name)
		).toEqual([CONFIGS.js.label]);
	});
});

describe("pollBreakdownFor", () => {
	it("opens on the base the answer itself paid", () => {
		const run = playing(JS_GATE, [true], JS_BUILD);
		const [base] = pollBreakdownFor(toRunView(run), answeredIn(run));

		expect(base).toMatchObject({ label: "right answer", detail: "base" });
		expect(base.figures?.[0]).toMatchObject({ label: "1.00" });
	});

	it("states a multiplier as the units it added, so the column can sum", () => {
		const run = playing(JS_GATE, [true], JS_BUILD);
		const [, lift] = pollBreakdownFor(toRunView(run), answeredIn(run));

		expect(lift).toMatchObject({
			label: CONFIGS.js.label,
			detail: "matches JavaScript",
		});
		expect(lift.figures?.[0]).toMatchObject({ label: "+0.25" });
	});

	it("keeps the factor the config was sold in as a tag beside its name", () => {
		const run = playing(JS_GATE, [true], JS_BUILD);
		const [, lift] = pollBreakdownFor(toRunView(run), answeredIn(run));

		expect(lift.tags).toEqual([{ label: "\u00d71.25" }]);
	});

	it("closes on the figure the payout badges show", () => {
		const run = playing(JS_GATE, [true], JS_BUILD);
		const rows = pollBreakdownFor(toRunView(run), answeredIn(run));
		const paid = rows.at(-1);

		expect(paid).toMatchObject({ label: "paid", total: true });
		expect(paid?.figures?.[0]).toMatchObject({ label: "1.25" });
		expect(runPaidFor(toRunView(run)).rows[0].payouts?.slots[0]).toMatchObject({
			figure: "1.25",
		});
	});

	it("states a flat adder in units, with no tag repeating them", () => {
		const run = playing(JS_GATE, [true], [CONFIGS.codeCoverage]);
		const [, add] = pollBreakdownFor(toRunView(run), answeredIn(run));

		expect(add.figures?.[0]).toMatchObject({ label: "+0.10" });
		expect(add.tags).toBeUndefined();
	});

	it("reads a miss as a wrong answer that paid nothing", () => {
		const run = playing(JS_GATE, [false], JS_BUILD);
		const rows = pollBreakdownFor(toRunView(run), answeredIn(run));

		expect(rows[0]).toMatchObject({ label: "wrong answer" });
		expect(rows.at(-1)?.figures?.[0]).toMatchObject({ label: "0" });
	});

	it("keeps the rows summing to the figure it closes on", () => {
		const run = playing(JS_GATE, [true], [CONFIGS.js, CONFIGS.codeCoverage]);
		const rows = pollBreakdownFor(toRunView(run), answeredIn(run));
		const contributions = rows
			.slice(0, -1)
			.map((row) => Number(row.figures?.[0]?.label));

		expect(rows).toHaveLength(4);
		expect(contributions).toEqual(expect.arrayContaining([1, 0.25, 0.1]));
		expect(contributions.reduce((sum, units) => sum + units, 0)).toBeCloseTo(
			1.35
		);
		expect(rows.at(-1)?.figures?.[0]).toMatchObject({ label: "1.35" });
	});
});

describe("the strict wager press", () => {
	const armedView = () =>
		toRunView(
			runReducer(runWith([CONFIGS.strict], JS_GATE), { type: "arm-strict" })
		);

	it("offers the stake as the press, so the cost is on the button", () => {
		const [press] = pollPressesOf(viewOf([CONFIGS.strict], JS_GATE));

		expect(press.label).toBe("arm ±0.5");
		expect(press.ready).toBe(true);
		expect(press.armed).toBe(false);
	});

	it("says it is armed once pressed, so the wager is never silent", () => {
		const [press] = pollPressesOf(armedView());

		expect(press.label).toBe("armed ±0.5");
		expect(press.armed).toBe(true);
	});

	it("lights the badge's armed rung rather than only its label", () => {
		const build = pollBuildFor(armedView(), { onPress: () => {} });

		expect(build.configs[0].badges).toContainEqual(
			expect.objectContaining({ label: "armed ±0.5", armed: true })
		);
	});

	it("refuses the press over a staged reveal, which would wager the next poll", () => {
		const view = armedView();
		const answered = {
			...view.answeredThisGate[0],
			id: "q0",
			outcome: "correct" as const,
		};
		const build = pollBuildFor(view, { onPress: () => {} }, answered);

		expect(build.configs[0].badges).toContainEqual(
			expect.objectContaining({
				label: "wagered on this answer",
				disabled: true,
			})
		);
	});

	it("leaves a one-shot press with no pressed state to state", () => {
		const [press] = pollPressesOf(viewOf([CONFIGS.linter], JS_GATE));

		expect(press.armed).toBeUndefined();
	});
});

describe("the receipt for a lost wager", () => {
	it("bills the wager as its own row and takes it off the total", () => {
		const view = viewOf([CONFIGS.strict], JS_GATE);
		const answered = {
			id: "q0",
			question: "q0?",
			category: "js" as const,
			outcome: "wrong" as const,
			picked: ["No"],
			correct: ["Yes"],
			options: ["Yes", "No", "Maybe"],
			answerType: "single" as const,
			gate: 0,
			coverageEarned: 0,
			coverageLost: 0.5,
			coverageBreakdown: { base: 0, streakBonus: 0, configBonuses: [] },
		};
		const rows = pollBreakdownFor(view, answered);

		expect(rows.map((row) => row.label)).toContain("wager lost");
		expect(rows.at(-1)).toMatchObject({
			total: true,
			figures: [expect.objectContaining({ label: "-0.5" })],
		});
	});
});

describe("pollDifficultyFor", () => {
	const roomOf = (firstAttempts: number, firstAttemptsRight: number) => ({
		firstAttempts,
		firstAttemptsRight,
		attempts: 0,
		misses: 0,
	});

	it("states the room's first-attempt rate under the band that names it", () => {
		expect(pollDifficultyFor(roomOf(90, 28))).toEqual({
			badge: "brutal",
			tone: "cinnabar",
			figure: "31%",
			text: "got it right first time",
		});
	});

	it("withholds the percentage when too few players have tried it", () => {
		expect(pollDifficultyFor(roomOf(3, 0))).toEqual({
			badge: "untested",
			tone: "pewter",
			text: "too few first tries to say",
		});
	});

	it("tones an easy poll green and a hard one amber", () => {
		expect(pollDifficultyFor(roomOf(100, 92)).tone).toBe("viridian");
		expect(pollDifficultyFor(roomOf(100, 44)).tone).toBe("saffron");
	});
});

describe("pollHistoryFor", () => {
	const mineOf = (attempts: number, misses: number, last?: string) => ({
		firstAttempts: 100,
		firstAttemptsRight: 50,
		attempts,
		misses,
		lastAnsweredAt: last,
	});

	it("says nothing about a poll this account has never answered", () => {
		expect(pollHistoryFor(mineOf(0, 0))).toBeUndefined();
	});

	it("counts two misses out of two as both times", () => {
		expect(pollHistoryFor(mineOf(2, 2, "2026-08-04T09:00:00.000Z"))?.text).toBe(
			"answered twice · you missed it both times, last on 4 Aug"
		);
	});

	it("counts three misses out of three as all three", () => {
		expect(pollHistoryFor(mineOf(3, 3, "2026-08-04T09:00:00.000Z"))?.text).toBe(
			"answered 3 times · you missed it all 3 times, last on 4 Aug"
		);
	});

	it("names only the misses when some answers landed", () => {
		expect(pollHistoryFor(mineOf(3, 1, "2026-08-04T09:00:00.000Z"))?.text).toBe(
			"answered 3 times · you missed it once, last on 4 Aug"
		);
	});

	it("says so plainly when the one answer was right", () => {
		expect(pollHistoryFor(mineOf(1, 0, "2026-08-04T09:00:00.000Z"))?.text).toBe(
			"answered once · you got it right, last on 4 Aug"
		);
	});

	it("drops the date clause rather than inventing one", () => {
		expect(pollHistoryFor(mineOf(1, 1))?.text).toBe(
			"answered once · you missed it"
		);
	});
});

describe("pollFactsFor", () => {
	it("gives the band nothing to draw when the poll carries no stats", () => {
		expect(
			pollFactsFor(createMockPollView({ stats: undefined }))
		).toBeUndefined();
	});

	it("gives the band nothing to draw while an answer is on screen", () => {
		expect(pollFactsFor(undefined)).toBeUndefined();
	});

	it("carries both rows for a poll the account has fumbled before", () => {
		const facts = pollFactsFor(createMockPollView());

		expect(facts?.difficulty.badge).toBe("brutal");
		expect(facts?.history?.badge).toBe("seen before");
	});
});

describe("categoryLeaderFor", () => {
	const view = createMockRunView();
	const jsPoll = createMockPollView({
		category: "js",
		categorySeat: {
			category: "js",
			leader: {
				userId: "leader-id",
				handle: "@sabrina",
				best: 17,
				you: false,
			},
		},
	});

	it("names the category the seat is held for", () => {
		expect(categoryLeaderFor(view, jsPoll)?.category).toBe("JavaScript");
	});

	it("carries no title beside the handle", () => {
		expect(categoryLeaderFor(view, jsPoll)?.leader).not.toHaveProperty("title");
	});

	it("states the seat as a run rather than a bare count", () => {
		expect(categoryLeaderFor(view, jsPoll)?.leader?.figure).toBe("17 in a row");
	});

	it("says nothing about how far this account has got", () => {
		expect(categoryLeaderFor(view, jsPoll)).not.toHaveProperty("yourBest");
	});

	it("opens the seat when nobody holds it, and says what claims it", () => {
		const poll = createMockPollView({ categorySeat: { category: "js" } });

		expect(categoryLeaderFor(view, poll)?.leader).toBeUndefined();
		expect(categoryLeaderFor(view, poll)?.claim).toBe("3 in a row claims it");
	});

	it("states no claim while somebody holds the seat", () => {
		expect(categoryLeaderFor(view, jsPoll)?.claim).toBeUndefined();
	});

	it("marks the seat as yours when you hold it", () => {
		const poll = createMockPollView({
			categorySeat: {
				category: "js",
				leader: {
					userId: "sabrina-id",
					handle: "@sabrina",
					best: 17,
					you: true,
				},
			},
		});

		expect(categoryLeaderFor(view, poll)?.leader?.you).toBe(true);
	});

	it("withholds the seat while the category is hidden, category name and all", () => {
		const hidden = createMockRunView({ categoryHidden: true });

		expect(categoryLeaderFor(hidden, jsPoll)).toBeUndefined();
	});

	it("draws nothing while an answer is on screen", () => {
		expect(categoryLeaderFor(view, undefined)).toBeUndefined();
	});

	it("draws nothing for a poll the seat was never read for", () => {
		expect(
			categoryLeaderFor(view, createMockPollView({ categorySeat: undefined }))
		).toBeUndefined();
	});
});

describe("pollCoverageFor", () => {
	it("hands the panel a reading while the meter stands", () => {
		const coverage = pollCoverageFor(createMockRunView());

		expect(coverage.locked).toBeUndefined();
		expect(coverage.bar).toBeDefined();
		expect(coverage.lead).toBeDefined();
	});

	it("locks the panel and withholds every figure once the meter is down", () => {
		const coverage = pollCoverageFor(createMockRunView({ meterHidden: true }));

		expect(coverage.locked).toBe(true);
		expect(coverage.bar).toBeUndefined();
		expect(coverage.lead).toBeUndefined();
		expect(coverage.accuracy).toBeUndefined();
	});
});

describe("a single answer is one tap", () => {
	const submit = () => {};

	it("offers no lock-in on a single-answer poll, picked or not", () => {
		expect(pollCommitFor("single", 0, submit).lock).toBeUndefined();
		expect(pollCommitFor("single", 1, submit).lock).toBeUndefined();
	});
});

describe("the lock-in press on a multi-answer poll", () => {
	const submit = () => {};

	it("asks for every answer that fits and refuses while nothing is picked", () => {
		const { lock } = pollCommitFor("multiple", 0, submit);

		expect(lock?.note).toBe(PICK_EVERY);
		expect(lock?.onPress).toBeUndefined();
	});

	it("counts the picks and locks them in once something is picked", () => {
		const { lock } = pollCommitFor("multiple", 2, submit);

		expect(lock?.label).toBe("Lock in 2 answers");
		expect(lock?.note).toBeUndefined();
		expect(lock?.onPress).toBe(submit);
	});
});

describe("the keyboard tip states the keys for the answer type", () => {
	it("tells a single-answer player a letter answers", () => {
		expect(pollKeysHintFor("single")).toBe(SINGLE_KEYS);
	});

	it("tells a multi-answer player letters pick and Enter locks in", () => {
		expect(pollKeysHintFor("multiple")).toBe(MULTIPLE_KEYS);
	});
});

describe("the poll screen offers no skip while the press is withdrawn", () => {
	const submit = () => {};

	it("offers only the lock-in on a multi-answer poll", () => {
		expect(pollCommitFor("multiple", 1, submit)).toEqual({
			lock: expect.objectContaining({ label: "Lock in 1 answer" }),
		});
	});

	it("offers no press at all on a single-answer poll", () => {
		expect(pollCommitFor("single", 0, submit)).toEqual({});
	});
});

describe("the LGTM press states what the room does", () => {
	const approve = () => {};

	it("tells the player the room answers an approved poll", () => {
		expect(approvalCommitFor(approve).lock?.note).toBe(
			"the room answers this one for you"
		);
	});

	it("states the refusal in place of the promise when the room could not answer", () => {
		const { lock } = approvalCommitFor(approve, "Not enough approvals yet");

		expect(lock?.note).toBe("Not enough approvals yet");
		expect(lock?.onPress).toBe(approve);
	});
});

describe("the poll number on the card's mark", () => {
	const answered = (id: string): AnsweredPoll => ({
		id,
		question: "typeof null === ?",
		category: "js",
		outcome: "correct",
		picked: ["object"],
	});

	const viewAfter = (count: number) =>
		createMockRunView({
			answeredThisGate: Array.from({ length: count }, (_, index) =>
				answered(`poll-${index}`)
			),
		});

	it("numbers the poll being answered", () => {
		expect(pollStepFor(viewAfter(0))).toBe(1);
		expect(pollStepFor(viewAfter(2))).toBe(3);
	});

	it("numbers the revealed poll by the one just answered", () => {
		expect(pollStepFor(viewAfter(2), true)).toBe(2);
	});
});

describe("the poll clock states what the time is worth (ADR-169)", () => {
	const VITE_CLOCK = { label: "Vite", withinMs: 15_000, fast: 1.5, slow: 0.75 };

	it("counts down Vite's window while ×1.5 still pays", () => {
		const view = createMockRunView({ fastAnswer: VITE_CLOCK });

		expect(pollClockFor(view, 3_200)).toEqual({
			label: "Vite ×1.5 · 12s",
			color: "viridian",
		});
	});

	it("says Vite pays ×0.75 once the window has passed", () => {
		const view = createMockRunView({ fastAnswer: VITE_CLOCK });

		expect(pollClockFor(view, 15_500)).toEqual({
			label: "Vite ×0.75",
			color: "pewter",
		});
	});

	it("counts down a 408 limit ahead of Vite, since running out fails the answer", () => {
		const view = createMockRunView({
			pollTimeLimitMs: 10_000,
			fastAnswer: VITE_CLOCK,
		});

		expect(pollClockFor(view, 4_000)).toEqual({
			label: "6s left",
			color: "saffron",
		});
		expect(pollClockFor(view, 7_000)?.color).toBe("cinnabar");
	});

	it("shows no clock where nothing is timed", () => {
		expect(pollClockFor(createMockRunView(), 1_000)).toBeUndefined();
	});
});
