import { describe, expect, it } from "vitest";

import { syncTarget } from "~/modules/run/run/application/runRoutes.viewmodel";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";

const climbing = (status: Pick<RunView, "status" | "gatesCleared">) => ({
	...status,
	awaitingTomorrow: false,
});

describe("syncTarget", () => {
	it("holds position while the run is still loading, even off-route", () => {
		expect(
			syncTarget(
				"/run/shop",
				climbing({ status: "answering", gatesCleared: 1 }),
				true
			)
		).toBeNull();
		expect(syncTarget("/run/shop", null, true)).toBeNull();
	});

	// A null view means "no run today, go start one" — but only once the read
	// resolved. While it is unknown the same null must move nobody (DVTD-cmqj).
	it("holds position when the run could not be read, though null alone sends home", () => {
		expect(syncTarget("/run/configure", null, true)).toBeNull();
		expect(syncTarget("/run/configure", null, false)).toBe("/run");
	});

	it("stays put on the allowed screen for the current status", () => {
		expect(
			syncTarget(
				"/run/prep",
				climbing({ status: "answering", gatesCleared: 1 }),
				false
			)
		).toBeNull();
		expect(
			syncTarget(
				"/run/answer",
				climbing({ status: "answering", gatesCleared: 1 }),
				false
			)
		).toBeNull();
		expect(syncTarget("/run", null, false)).toBeNull();
		expect(
			syncTarget(
				"/run/over",
				climbing({ status: "dead", gatesCleared: 1 }),
				false
			)
		).toBeNull();
	});

	// One server status, four page turns: the payout, the answers, the shop,
	// and the prep hub the shop feeds into (ADR-032).
	it("stays put on any of the reward pages while rewarding", () => {
		expect(
			syncTarget(
				"/run/prep",
				climbing({ status: "rewarding", gatesCleared: 1 }),
				false
			)
		).toBeNull();
		expect(
			syncTarget(
				"/run/reward",
				climbing({ status: "rewarding", gatesCleared: 0 }),
				false
			)
		).toBeNull();
		expect(
			syncTarget(
				"/run/review",
				climbing({ status: "rewarding", gatesCleared: 0 }),
				false
			)
		).toBeNull();
		expect(
			syncTarget(
				"/run/shop",
				climbing({ status: "rewarding", gatesCleared: 0 }),
				false
			)
		).toBeNull();
	});

	// The failed gate closes on its answers too: strip → review, with the
	// resume waiting on the review page.
	it("stays put on the strip and review pages while a strip is owed", () => {
		expect(
			syncTarget(
				"/run/strip",
				climbing({ status: "awaiting-strip", gatesCleared: 1 }),
				false
			)
		).toBeNull();
		expect(
			syncTarget(
				"/run/review",
				climbing({ status: "awaiting-strip", gatesCleared: 1 }),
				false
			)
		).toBeNull();
	});

	// Landing on the status must always put the repair first.
	it("redirects a stale screen to the strip page while a strip is owed", () => {
		expect(
			syncTarget(
				"/run/answer",
				climbing({ status: "awaiting-strip", gatesCleared: 1 }),
				false
			)
		).toBe("/run/strip");
	});

	// The review is only ever this gate's answers, so it has no meaning once the
	// status has moved on — the sync sends the player back to the live screen.
	it("redirects the review page away once the gate is no longer being paid out", () => {
		expect(
			syncTarget(
				"/run/review",
				climbing({ status: "answering", gatesCleared: 1 }),
				false
			)
		).toBe("/run/prep");
	});

	it("redirects a stale screen to the canonical route for the status", () => {
		expect(
			syncTarget(
				"/run/answer",
				climbing({ status: "rewarding", gatesCleared: 0 }),
				false
			)
		).toBe("/run/reward");
		expect(
			syncTarget(
				"/run/shop",
				climbing({ status: "answering", gatesCleared: 1 }),
				false
			)
		).toBe("/run/prep");
	});

	// The community board's "back to your run" always lands on plain `/run`,
	// so this is the real trigger that shows prep before every gate past the
	// first one.
	it("sends a bare /run into a gate in progress to the prep screen", () => {
		expect(
			syncTarget(
				"/run",
				climbing({ status: "answering", gatesCleared: 1 }),
				false
			)
		).toBe("/run/prep");
	});

	// Gate 0 has no prep route at all (Configure already covers it), so a deep
	// link there goes straight to the poll, not through a redirect to prep.
	it("sends a stale screen on gate 0 straight to the poll, never to prep", () => {
		expect(
			syncTarget(
				"/run/shop",
				climbing({ status: "answering", gatesCleared: 0 }),
				false
			)
		).toBe("/run/answer");
		expect(
			syncTarget(
				"/run/prep",
				climbing({ status: "answering", gatesCleared: 0 }),
				false
			)
		).toBe("/run/answer");
	});

	it("routes a finished run to the run-over screen, won or dead", () => {
		expect(
			syncTarget(
				"/run/answer",
				climbing({ status: "won", gatesCleared: 12 }),
				false
			)
		).toBe("/run/over");
		expect(
			syncTarget(
				"/run/shop",
				climbing({ status: "dead", gatesCleared: 3 }),
				false
			)
		).toBe("/run/over");
	});

	it("sends a day without a run back to the start screen", () => {
		expect(syncTarget("/run/configure", null, false)).toBe("/run");
	});

	it("pulls the start screen forward into a live run", () => {
		expect(
			syncTarget(
				"/run",
				climbing({ status: "configuring", gatesCleared: 0 }),
				false
			)
		).toBe("/run/configure");
	});

	it("stands down on paths that are not run screens", () => {
		expect(
			syncTarget(
				"/run/community",
				climbing({ status: "rewarding", gatesCleared: 0 }),
				false
			)
		).toBeNull();
		expect(
			syncTarget(
				"/dex",
				climbing({ status: "answering", gatesCleared: 1 }),
				false
			)
		).toBeNull();
	});

	// The daily lock (ADR-014): today's polls are spent, the run waits for
	// tomorrow's segment. There is nothing to show on any run screen, so the
	// player lands on the community board instead of a blank answer page.
	describe("while the run awaits tomorrow's polls", () => {
		const locked = {
			status: "answering",
			gatesCleared: 1,
			awaitingTomorrow: true,
		} as const;

		it("sends the answer screen to the community board", () => {
			expect(syncTarget("/run/answer", locked, false)).toBe("/run/community");
		});

		it("sends every other run screen to the community board too", () => {
			expect(syncTarget("/run", locked, false)).toBe("/run/community");
			expect(syncTarget("/run/shop", locked, false)).toBe("/run/community");
		});

		it("stays put once on the community board", () => {
			expect(syncTarget("/run/community", locked, false)).toBeNull();
		});

		it("holds position while the run is still loading", () => {
			expect(syncTarget("/run/answer", locked, true)).toBeNull();
		});
	});
});
