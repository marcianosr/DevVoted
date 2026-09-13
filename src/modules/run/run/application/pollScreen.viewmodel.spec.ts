import { describe, expect, it } from "vitest";

import { occupiedSlots } from "~/modules/run/build/domain/build.model";
import type { Config } from "~/modules/run/config/domain/config.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	buildCountsOf,
	pollBuildFor,
	pollPressesOf,
	trailFor,
} from "~/modules/run/run/application/pollScreen.viewmodel";
import { toRunView } from "~/modules/run/run/application/runView.viewmodel";
import { createRun, type RunState } from "~/modules/run/run/domain/run.model";
import { runReducer } from "~/modules/run/run/domain/runAction.model";
import type { RunPoll } from "~/modules/run/run/domain/runPoll.model";
import { BASE_SLOTS } from "~/modules/run/run/domain/rules.model";
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
					slots: Math.max(BASE_SLOTS, occupiedSlots(configs)),
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

describe("trailFor", () => {
	it("reads the gate's correct count once .length is installed", () => {
		const view = viewOf([CONFIGS.length], JS_GATE);

		expect(trailFor(view).holds).toBe(
			`${view.correctAnswersThisGate} correct answers in this gate`
		);
	});

	it("stays quiet without a config that counts", () => {
		expect(
			trailFor(viewOf([CONFIGS.intellisense], JS_GATE)).holds
		).toBeUndefined();
	});
});
