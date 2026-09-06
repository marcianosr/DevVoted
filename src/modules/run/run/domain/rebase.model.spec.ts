import { describe, expect, it } from "vitest";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	gateSliceOf,
	rebase,
	upcomingSlotsOf,
} from "~/modules/run/run/domain/rebase.model";
import { SLICE_WINDOW } from "~/modules/run/run/domain/rules.model";
import { createRun, type RunState } from "~/modules/run/run/domain/run.model";
import { runReducer } from "~/modules/run/run/domain/runAction.model";
import { handed, poll } from "~/modules/run/run/domain/run.factory";

const CATEGORIES = ["react", "css", "ts", "java", "git", "python"] as const;

const gatePolls = () =>
	CATEGORIES.map((category, index) => poll(`poll-${index}`, true, category));

const prepping = (...configIds: string[]): RunState => {
	const base = createRun(gatePolls(), [...handed, CONFIGS.gitRebase]);
	return configIds.reduce(
		(state, configId) => runReducer(state, { type: "install", configId }),
		base
	);
};

const orderOf = (state: RunState): string[] =>
	state.polls.map((entry) => entry.id);

describe("the gate slice a rebase may touch", () => {
	it("stops at the gate's width even when the day holds more polls", () => {
		expect(gateSliceOf(prepping())).toHaveLength(SLICE_WINDOW);
	});

	it("starts at the cursor, so answered polls are out of reach", () => {
		const state = { ...prepping(), currentIndex: 2 };
		expect(gateSliceOf(state).map((entry) => entry.id)).toEqual([
			"poll-2",
			"poll-3",
			"poll-4",
			"poll-5",
		]);
	});
});

describe("what the config reveals", () => {
	it("names the gate's polls by category once git rebase -i is installed", () => {
		expect(upcomingSlotsOf(prepping("git-rebase"))).toEqual([
			{ id: "poll-0", category: "react" },
			{ id: "poll-1", category: "css" },
			{ id: "poll-2", category: "ts" },
			{ id: "poll-3", category: "java" },
			{ id: "poll-4", category: "git" },
		]);
	});

	it("reveals nothing without the config", () => {
		expect(upcomingSlotsOf(prepping("js"))).toEqual([]);
	});
});

describe("moving a poll", () => {
	it("pulls a later poll to the front and keeps the rest in order", () => {
		const state = rebase(prepping("git-rebase"), 3, 0);
		expect(orderOf(state)).toEqual([
			"poll-3",
			"poll-0",
			"poll-1",
			"poll-2",
			"poll-4",
			"poll-5",
		]);
	});

	it("pushes an early poll to the back of the gate", () => {
		const state = rebase(prepping("git-rebase"), 0, 4);
		expect(orderOf(state)).toEqual([
			"poll-1",
			"poll-2",
			"poll-3",
			"poll-4",
			"poll-0",
			"poll-5",
		]);
	});

	it("leaves the polls past the gate where they are", () => {
		const state = rebase(prepping("git-rebase"), 4, 0);
		expect(state.polls[5].id).toBe("poll-5");
	});

	it("refuses a move without the config installed", () => {
		const state = prepping("js");
		expect(rebase(state, 3, 0)).toBe(state);
	});

	it("refuses a target outside the gate", () => {
		const state = prepping("git-rebase");
		expect(rebase(state, 0, SLICE_WINDOW)).toBe(state);
		expect(rebase(state, -1, 0)).toBe(state);
	});

	it("refuses a move that changes nothing", () => {
		const state = prepping("git-rebase");
		expect(rebase(state, 2, 2)).toBe(state);
	});
});

describe("the reducer's prep-only guard", () => {
	const rebasing = (state: RunState) =>
		runReducer(state, { type: "rebase", from: 3, to: 0 });

	it("reorders at the run's opening build screen", () => {
		expect(orderOf(rebasing(prepping("git-rebase")))[0]).toBe("poll-3");
	});

	it("reorders at the shop-then-prep hub between gates", () => {
		const atPrep: RunState = { ...prepping("git-rebase"), status: "rewarding" };
		expect(orderOf(rebasing(atPrep))[0]).toBe("poll-3");
	});

	it("refuses once the gate is under way", () => {
		const answering = runReducer(prepping("git-rebase"), { type: "start" });
		expect(rebasing(answering)).toBe(answering);
	});

	it("reveals nothing to a player already answering", () => {
		const answering = runReducer(prepping("git-rebase"), { type: "start" });
		expect(upcomingSlotsOf(answering)).toEqual([]);
	});
});
