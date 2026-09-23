import { describe, expect, it } from "vitest";

import type { Config } from "~/modules/run/config/domain/config.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	buildCountsOf,
	coverageLeadFor,
	pollBreakdownFor,
	pollBuildFor,
	pollDifficultyFor,
	pollFactsFor,
	pollHistoryFor,
	pollPaidFor,
	pollPressesOf,
	hallOfFameFor,
} from "~/modules/run/run/application/pollScreen.viewmodel";
import { toRunView } from "~/modules/run/run/application/runView.viewmodel";
import { createRun, type RunState } from "~/modules/run/run/domain/run.model";
import { runReducer } from "~/modules/run/run/domain/runAction.model";
import type { RunPoll } from "~/modules/run/run/domain/runPoll.model";
import { SLICE_WINDOW } from "~/modules/run/run/domain/rules.model";
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

describe("buildCountsOf", () => {
	it("never counts one config in two buckets", () => {
		const view = viewOf(
			[CONFIGS.eslint, CONFIGS.telemetry, CONFIGS.intellisense, CONFIGS.js],
			JS_GATE
		);
		const counts = buildCountsOf(view);

		expect(counts.applies + counts.ready + counts.offline).toBe(
			view.configs.length
		);
	});

	it("counts ESLint ready on a JS poll and only applying on a CSS poll", () => {
		expect(buildCountsOf(viewOf([CONFIGS.eslint], JS_GATE))).toMatchObject({
			ready: 1,
			applies: 0,
		});
		expect(buildCountsOf(viewOf([CONFIGS.eslint], CSS_GATE))).toMatchObject({
			ready: 0,
			applies: 0,
		});
	});

	it("drops a press out of ready when the fee is out of reach", () => {
		expect(buildCountsOf(viewOf([CONFIGS.eslint], JS_GATE, 0))).toMatchObject({
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
	it("names the categories a linter is waiting for", () => {
		const [press] = pollPressesOf(viewOf([CONFIGS.eslint], CSS_GATE));

		expect(press.ready).toBe(false);
		expect(press.refusal).toBe("waits for JS or TS");
	});

	it("refuses a second lint once one wrong answer is left standing", () => {
		const state = runWith([CONFIGS.eslint], JS_GATE);
		const [press] = pollPressesOf(
			toRunView(runReducer(state, { type: "lint-poll" }))
		);

		expect(press.ready).toBe(false);
		expect(press.refusal).toBe("one wrong left");
	});

	it("prices the lint off the gate's own ladder", () => {
		const view = viewOf([CONFIGS.eslint], JS_GATE);

		expect(pollPressesOf(view)[0].label).toBe("lint 8 KB");
	});

	it("says nothing about a config that sells no press", () => {
		expect(pollPressesOf(viewOf([CONFIGS.intellisense], JS_GATE))).toEqual([]);
	});
});

describe("pollBuildFor", () => {
	it("draws no press badge when the screen passes no handler", () => {
		const build = pollBuildFor(viewOf([CONFIGS.eslint], JS_GATE));

		expect(build.configs[0].badges).toEqual([]);
	});

	it("disables a refused press and says why on the badge", () => {
		const build = pollBuildFor(viewOf([CONFIGS.eslint], CSS_GATE), {
			onPress: () => {},
		});
		const [badge] = build.configs[0].badges ?? [];

		expect(badge).toMatchObject({
			disabled: true,
			label: "waits for JS or TS",
		});
	});

	it("arms a press the player can afford", () => {
		const build = pollBuildFor(viewOf([CONFIGS.eslint], JS_GATE), {
			onPress: () => {},
		});

		expect((build.configs[0].badges ?? [])[0]).toMatchObject({
			disabled: false,
		});
	});
});

const BARE: readonly Config[] = [CONFIGS.eslint];

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

const textOf = (line: ReturnType<typeof coverageLeadFor>): string =>
	line.map((part) => (typeof part === "string" ? part : part.figure)).join("");

describe("coverageLeadFor", () => {
	it("states the units scored against the slots the run has opened", () => {
		const run = playing(JS_GATE, [true]);

		expect(textOf(coverageLeadFor(toRunView(run)))).toBe(
			`You have scored 1 unit across ${SLICE_WINDOW} slots, which is 20.0% coverage.`
		);
	});

	it("pluralises past one unit, because a multiple pays two into one slot", () => {
		const run = playing(JS_GATE, [true, true]);

		expect(textOf(coverageLeadFor(toRunView(run)))).toContain("units across");
	});

	it("greens the score and leaves the slot count plain", () => {
		const [, score, , slots] = coverageLeadFor(
			toRunView(runWith(BARE, JS_GATE))
		);

		expect(score).toEqual({ figure: "0", gain: true });
		expect(slots).toEqual({ figure: `${SLICE_WINDOW}` });
	});

	it("badges the same score as coverage, the denomination the gate judges", () => {
		const run = playing(JS_GATE, [true]);
		const coverage = coverageLeadFor(toRunView(run)).at(-2);

		expect(coverage).toEqual({ figure: "20.0%", gain: true });
	});
});

describe("pollPaidFor", () => {
	it("gives one row only: the gate being played, not the run's history", () => {
		const paid = pollPaidFor(toRunView(playing(TWO_GATES, CLEARED)));

		expect(paid.rows).toHaveLength(1);
		expect(paid.rows[0].swatch.gateName).toBe("Boulder");
	});

	it("pays every answer what it earned, and a miss nothing", () => {
		const [row] = pollPaidFor(toRunView(playing(JS_GATE, [true, false]))).rows;

		expect(row.payouts?.slots[0]).toMatchObject({
			figure: "1",
			color: "viridian",
		});
		expect(row.payouts?.slots[1]).toMatchObject({
			figure: "0",
			color: "cinnabar",
		});
	});

	it("hands every chip the receipt for its own poll, not just the last one", () => {
		const [row] = pollPaidFor(
			toRunView(playing(JS_GATE, [true, false], JS_BUILD))
		).rows;

		expect(row.payouts?.slots[0]?.receipt?.at(-1)).toMatchObject({
			label: "paid",
			total: true,
		});
		expect(row.payouts?.slots[1]?.receipt?.at(-1)?.figures?.[0]).toMatchObject({
			label: "0",
		});
	});

	it("leaves a slot still to come empty rather than paying it zero", () => {
		const [row] = pollPaidFor(toRunView(playing(JS_GATE, [true]))).rows;

		expect(row.payouts?.slots).toHaveLength(SLICE_WINDOW);
		expect(row.payouts?.slots[1]).toBeUndefined();
	});

	it("totals the row in the units the sentence above it counts", () => {
		const [row] = pollPaidFor(toRunView(playing(JS_GATE, [true, false]))).rows;

		expect(row.payouts?.total).toBe("1");
	});

	it("marks the one row it draws as the gate in hand", () => {
		const paid = pollPaidFor(toRunView(playing(TWO_GATES, CLEARED)));

		expect(paid.rows[0].current).toBe(true);
	});
});

const answeredIn = (state: RunState) => {
	const last = toRunView(state).answeredThisGate.at(-1);
	if (last === undefined) throw new Error("nothing answered yet");
	return last;
};

const JS_BUILD: readonly Config[] = [CONFIGS.js, CONFIGS.stylelint];

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

		expect(linter.detail).toBe("CSS only");
		expect(linter.badges).toEqual([]);
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
		expect(pollPaidFor(toRunView(run)).rows[0].payouts?.slots[0]).toMatchObject(
			{
				figure: "1.25",
			}
		);
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
		const [press] = pollPressesOf(viewOf([CONFIGS.eslint], JS_GATE));

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

describe("hallOfFameFor", () => {
	const view = createMockRunView();
	const jsPoll = createMockPollView({
		category: "js",
		record: {
			category: "js",
			holder: {
				handle: "@sabrina",
				githubLogin: "sabrina",
				streak: 17,
				you: false,
			},
			yourBest: 4,
		},
	});

	it("names the category the record was set in", () => {
		expect(hallOfFameFor(view, jsPoll)?.caption).toBe(
			"the longest run of correct JavaScript answers"
		);
	});

	it("titles the holder after the category they maintain", () => {
		expect(hallOfFameFor(view, jsPoll)?.holder?.title).toBe(
			"JavaScript Maintainer"
		);
	});

	it("states the record as a run rather than a bare count", () => {
		expect(hallOfFameFor(view, jsPoll)?.holder?.figure).toBe("17 in a row");
	});

	it("states how far this account has ever got", () => {
		expect(hallOfFameFor(view, jsPoll)?.yourBest).toBe("your best 4");
	});

	it("leaves the record unclaimed when nobody holds it", () => {
		const poll = createMockPollView({
			record: { category: "js", yourBest: 2 },
		});

		expect(hallOfFameFor(view, poll)?.holder).toBeUndefined();
		expect(hallOfFameFor(view, poll)?.yourBest).toBe("your best 2");
	});

	it("says nothing about an account that has never strung two together", () => {
		const poll = createMockPollView({
			record: { category: "js", yourBest: 0 },
		});

		expect(hallOfFameFor(view, poll)?.yourBest).toBeUndefined();
	});

	it("does not restate the record as your best when you are the holder", () => {
		const poll = createMockPollView({
			record: {
				category: "js",
				holder: { handle: "@sabrina", streak: 17, you: true },
				yourBest: 17,
			},
		});

		expect(hallOfFameFor(view, poll)?.holder?.you).toBe(true);
		expect(hallOfFameFor(view, poll)?.yourBest).toBeUndefined();
	});

	it("withholds the record while the category is hidden, caption and all", () => {
		const hidden = createMockRunView({ categoryHidden: true });

		expect(hallOfFameFor(hidden, jsPoll)).toBeUndefined();
	});

	it("draws nothing while an answer is on screen", () => {
		expect(hallOfFameFor(view, undefined)).toBeUndefined();
	});

	it("draws nothing for a poll the record was never read for", () => {
		expect(
			hallOfFameFor(view, createMockPollView({ record: undefined }))
		).toBeUndefined();
	});
});
