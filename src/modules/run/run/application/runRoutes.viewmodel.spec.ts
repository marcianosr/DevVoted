import { describe, expect, it } from "vitest";

import {
	returnFromCommunity,
	syncTarget,
} from "~/modules/run/run/application/runRoutes.viewmodel";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";

const climbing = (
	status: Pick<RunView, "status" | "gatesCleared"> &
		Partial<Pick<RunView, "redoingGate" | "peelSlotsRemaining">>
) => ({
	redoingGate: null,
	peelSlotsRemaining: 1,
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

	// A retry shares the clear's status, so the sync is the only thing keeping the
	// player off a payout screen that would name the gate they just missed and
	// pay 0KB for it (ADR-037).
	describe("while a missed gate is being replayed", () => {
		const redoing = climbing({
			status: "rewarding",
			gatesCleared: 3,
			redoingGate: 3,
		});

		it("sends the reward page to the shop", () => {
			expect(syncTarget("/run/reward", redoing, false)).toBe("/run/shop");
		});

		it("stays put on the shop, the prep hub and the review", () => {
			expect(syncTarget("/run/shop", redoing, false)).toBeNull();
			expect(syncTarget("/run/prep", redoing, false)).toBeNull();
			expect(syncTarget("/run/review", redoing, false)).toBeNull();
		});
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

	// A waived peel (ADR-057) has nothing to repair, so the answers lead instead
	// of a repair screen with an empty list.
	it("sends a waived miss to the answers, not to the repair screen", () => {
		expect(
			syncTarget(
				"/run/answer",
				climbing({
					status: "awaiting-strip",
					gatesCleared: 0,
					peelSlotsRemaining: 0,
				}),
				false
			)
		).toBe("/run/review");
	});

	// Paying the last slot drops the debt to 0 mid-screen; the player must keep
	// the repair screen and its own press, not be yanked to the answers.
	it("leaves a player who just paid their peel on the repair screen", () => {
		expect(
			syncTarget(
				"/run/strip",
				climbing({
					status: "awaiting-strip",
					gatesCleared: 1,
					peelSlotsRemaining: 0,
				}),
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

	// /run is the day's hub, not a step in the climb: it reports what your run
	// is doing and offers a press back into it, so pulling a live run off it
	// would make its own Resume row unreachable.
	it("leaves a live run standing on the hub", () => {
		expect(
			syncTarget(
				"/run",
				climbing({ status: "answering", gatesCleared: 1 }),
				false
			)
		).toBeNull();
		expect(
			syncTarget("/run", climbing({ status: "dead", gatesCleared: 3 }), false)
		).toBeNull();
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

	// The hub stays put once you are on it, but it is still where a run with
	// nowhere else to go gets sent: the exemption is about the path you are ON,
	// never about the target.
	it("sends a day without a run back to the hub", () => {
		expect(syncTarget("/run/configure", null, false)).toBe("/run");
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
			redoingGate: null,
			peelSlotsRemaining: 0,
			awaitingTomorrow: true,
		} as const;

		it("sends the answer screen to the community board", () => {
			expect(syncTarget("/run/answer", locked, false)).toBe("/run/community");
		});

		it("sends every other run screen to the community board too", () => {
			expect(syncTarget("/run/shop", locked, false)).toBe("/run/community");
			expect(syncTarget("/run/prep", locked, false)).toBe("/run/community");
		});

		// The hub is the one screen with something to say about the wait: its
		// Resume press carries the countdown, so it is not a blank page to be
		// redirected off.
		it("leaves the hub alone, countdown and all", () => {
			expect(syncTarget("/run", locked, false)).toBeNull();
		});

		it("stays put once on the community board", () => {
			expect(syncTarget("/run/community", locked, false)).toBeNull();
		});

		it("holds position while the run is still loading", () => {
			expect(syncTarget("/run/answer", locked, true)).toBeNull();
		});
	});
});

describe("returnFromCommunity", () => {
	it("offers the start screen, not a run, to a player who has not begun one", () => {
		expect(returnFromCommunity(null)).toEqual({
			path: "/run",
			label: "Today’s climb →",
		});
	});

	it("names the screen a live gate is actually played on", () => {
		expect(
			returnFromCommunity(climbing({ status: "answering", gatesCleared: 0 }))
				.path
		).toBe("/run/answer");
		expect(
			returnFromCommunity(climbing({ status: "answering", gatesCleared: 2 }))
				.path
		).toBe("/run/prep");
	});

	it("returns a paid-out gate to prep rather than replaying its celebration", () => {
		expect(
			returnFromCommunity(climbing({ status: "rewarding", gatesCleared: 1 }))
				.path
		).toBe("/run/prep");
	});

	it("returns a replayed gate to prep too, not to the shop the sync would pick", () => {
		expect(
			returnFromCommunity(
				climbing({ status: "rewarding", gatesCleared: 1, redoingGate: 1 })
			).path
		).toBe("/run/prep");
	});

	it("sends a finished run straight to its ending, won or dead", () => {
		expect(
			returnFromCommunity(climbing({ status: "won", gatesCleared: 13 })).path
		).toBe("/run/over");
		expect(
			returnFromCommunity(climbing({ status: "dead", gatesCleared: 4 })).path
		).toBe("/run/over");
	});

	it("lands somewhere the sync would leave alone, so no status flashes a screen", () => {
		const views = [
			climbing({ status: "configuring", gatesCleared: 0 }),
			climbing({ status: "answering", gatesCleared: 0 }),
			climbing({ status: "answering", gatesCleared: 3 }),
			climbing({ status: "rewarding", gatesCleared: 1 }),
			climbing({ status: "awaiting-strip", gatesCleared: 2 }),
			climbing({ status: "won", gatesCleared: 13 }),
			climbing({ status: "dead", gatesCleared: 4 }),
		];

		views.forEach((view) => {
			expect(
				syncTarget(returnFromCommunity(view).path, view, false)
			).toBeNull();
		});
		expect(syncTarget(returnFromCommunity(null).path, null, false)).toBeNull();
	});
});
