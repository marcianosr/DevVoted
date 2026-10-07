import { describe, expect, it } from "vitest";

import {
	nextFrom,
	prepBackOf,
	canReview,
	prepDepartureOf,
	returnFromCommunity,
	reviewBackOf,
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

	it("holds position when the run could not be read, though null alone sends home", () => {
		expect(syncTarget("/run/new", null, true)).toBeNull();
		expect(syncTarget("/run/new", null, false)).toBe("/run");
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
				"/run/poll",
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
				"/run/gate",
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

	describe("while a missed gate is being replayed", () => {
		const redoing = climbing({
			status: "rewarding",
			gatesCleared: 3,
			redoingGate: 3,
		});

		it("sends the reward page to the shop", () => {
			expect(syncTarget("/run/gate", redoing, false)).toBe("/run/shop");
		});

		it("stays put on the shop, the prep hub and the review", () => {
			expect(syncTarget("/run/shop", redoing, false)).toBeNull();
			expect(syncTarget("/run/prep", redoing, false)).toBeNull();
			expect(syncTarget("/run/review", redoing, false)).toBeNull();
		});
	});

	it("stays put on the strip and review pages while a strip is owed", () => {
		expect(
			syncTarget(
				"/run/gate",
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

	it("sends a waived miss to the answers, not to the repair screen", () => {
		expect(
			syncTarget(
				"/run/poll",
				climbing({
					status: "awaiting-strip",
					gatesCleared: 0,
					peelSlotsRemaining: 0,
				}),
				false
			)
		).toBe("/run/review");
	});

	it("leaves a player who just paid their peel on the repair screen", () => {
		expect(
			syncTarget(
				"/run/gate",
				climbing({
					status: "awaiting-strip",
					gatesCleared: 1,
					peelSlotsRemaining: 0,
				}),
				false
			)
		).toBeNull();
	});

	it("redirects a stale screen to the strip page while a strip is owed", () => {
		expect(
			syncTarget(
				"/run/poll",
				climbing({ status: "awaiting-strip", gatesCleared: 1 }),
				false
			)
		).toBe("/run/gate");
	});

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
				"/run/poll",
				climbing({ status: "rewarding", gatesCleared: 0 }),
				false
			)
		).toBe("/run/gate");
		expect(
			syncTarget(
				"/run/shop",
				climbing({ status: "answering", gatesCleared: 1 }),
				false
			)
		).toBe("/run/prep");
	});

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

	it("sends a stale screen on gate 0 straight to the poll, never to prep", () => {
		expect(
			syncTarget(
				"/run/shop",
				climbing({ status: "answering", gatesCleared: 0 }),
				false
			)
		).toBe("/run/poll");
		expect(
			syncTarget(
				"/run/prep",
				climbing({ status: "answering", gatesCleared: 0 }),
				false
			)
		).toBe("/run/poll");
	});

	it("keeps the build and its prep both legal before the run starts", () => {
		const opening = climbing({ status: "configuring", gatesCleared: 0 });
		expect(syncTarget("/run/new", opening, false)).toBeNull();
		expect(syncTarget("/run/prep", opening, false)).toBeNull();
		expect(syncTarget("/run/shop", opening, false)).toBe("/run/new");
	});

	it("serves both ends of a gate from the one gate route", () => {
		expect(
			syncTarget(
				"/run/gate",
				climbing({ status: "rewarding", gatesCleared: 2 }),
				false
			)
		).toBeNull();
		expect(
			syncTarget(
				"/run/gate",
				climbing({ status: "awaiting-strip", gatesCleared: 2 }),
				false
			)
		).toBeNull();
	});

	it("routes a finished run to the run-over screen, won or dead", () => {
		expect(
			syncTarget(
				"/run/poll",
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

	it("lets a finished run open the review of its last gate, won or dead", () => {
		expect(
			syncTarget(
				"/run/review",
				climbing({ status: "won", gatesCleared: 12 }),
				false
			)
		).toBeNull();
		expect(
			syncTarget(
				"/run/review",
				climbing({ status: "dead", gatesCleared: 3 }),
				false
			)
		).toBeNull();
	});

	it("sends a day without a run back to the hub", () => {
		expect(syncTarget("/run/new", null, false)).toBe("/run");
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

	describe("while the run awaits tomorrow's polls", () => {
		const locked = {
			status: "answering",
			gatesCleared: 1,
			redoingGate: null,
			peelSlotsRemaining: 0,
			awaitingTomorrow: true,
		} as const;

		it("sends the answer screen to the community board", () => {
			expect(syncTarget("/run/poll", locked, false)).toBe("/run/community");
		});

		it("sends every other run screen to the community board too", () => {
			expect(syncTarget("/run/shop", locked, false)).toBe("/run/community");
			expect(syncTarget("/run/prep", locked, false)).toBe("/run/community");
		});

		it("leaves the hub alone, countdown and all", () => {
			expect(syncTarget("/run", locked, false)).toBeNull();
		});

		it("stays put once on the community board", () => {
			expect(syncTarget("/run/community", locked, false)).toBeNull();
		});

		it("holds position while the run is still loading", () => {
			expect(syncTarget("/run/poll", locked, true)).toBeNull();
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
		).toBe("/run/poll");
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

describe("nextFrom", () => {
	it("sends the build to prep once it is drafted", () => {
		expect(
			nextFrom("new", climbing({ status: "configuring", gatesCleared: 0 }))
		).toBe("/run/prep");
	});

	it("sends prep to the poll once the gate is being answered", () => {
		expect(
			nextFrom("prep", climbing({ status: "answering", gatesCleared: 2 }))
		).toBe("/run/poll");
	});

	it("keeps prep in place while the gate still has to be opened", () => {
		expect(
			nextFrom("prep", climbing({ status: "configuring", gatesCleared: 0 }))
		).toBeNull();
		expect(
			nextFrom("prep", climbing({ status: "rewarding", gatesCleared: 1 }))
		).toBeNull();
	});

	it("sends a held gate to its review and a paid-out gate to the shop", () => {
		expect(
			nextFrom("gate", climbing({ status: "awaiting-strip", gatesCleared: 2 }))
		).toBe("/run/review");
		expect(
			nextFrom("gate", climbing({ status: "rewarding", gatesCleared: 2 }))
		).toBe("/run/shop");
	});

	it("sends the shop on to prep", () => {
		expect(
			nextFrom("shop", climbing({ status: "rewarding", gatesCleared: 1 }))
		).toBe("/run/prep");
	});

	it("sends a finished run back to the hub, with or without a view", () => {
		expect(
			nextFrom("over", climbing({ status: "dead", gatesCleared: 4 }))
		).toBe("/run");
		expect(nextFrom("over", null)).toBe("/run");
	});

	it("lands every forward press where the sync leaves it alone", () => {
		const presses = [
			["new", climbing({ status: "configuring", gatesCleared: 0 })],
			["prep", climbing({ status: "answering", gatesCleared: 0 })],
			["prep", climbing({ status: "answering", gatesCleared: 3 })],
			["gate", climbing({ status: "rewarding", gatesCleared: 1 })],
			["gate", climbing({ status: "awaiting-strip", gatesCleared: 2 })],
			["shop", climbing({ status: "rewarding", gatesCleared: 1 })],
			[
				"shop",
				climbing({ status: "rewarding", gatesCleared: 1, redoingGate: 1 }),
			],
		] as const;

		presses.forEach(([screen, view]) => {
			const target = nextFrom(screen, view);
			expect(target).not.toBeNull();
			expect(syncTarget(target ?? "", view, false)).toBeNull();
		});
	});
});

describe("prepBackOf", () => {
	it("returns prep to the build before the first gate", () => {
		expect(
			prepBackOf(climbing({ status: "configuring", gatesCleared: 0 }))
		).toEqual({ path: "/run/new", label: "← Back to the build" });
	});

	it("returns prep to the shop while a gate is being paid out", () => {
		expect(
			prepBackOf(climbing({ status: "rewarding", gatesCleared: 1 }))
		).toEqual({ path: "/run/shop", label: "Back to the shop" });
	});

	it("offers no way back from prep once the gate is being answered", () => {
		expect(
			prepBackOf(climbing({ status: "answering", gatesCleared: 2 }))
		).toBeNull();
	});

	it("lands every back press from prep where the sync leaves it alone", () => {
		const views = [
			climbing({ status: "configuring", gatesCleared: 0 }),
			climbing({ status: "rewarding", gatesCleared: 1 }),
			climbing({ status: "rewarding", gatesCleared: 1, redoingGate: 1 }),
		];

		views.forEach((view) => {
			expect(syncTarget(prepBackOf(view)?.path ?? "", view, false)).toBeNull();
		});
	});
});

describe("canReview", () => {
	it("offers the review once a run has ended, won or dead", () => {
		expect(canReview(climbing({ status: "won", gatesCleared: 13 }))).toBe(true);
		expect(canReview(climbing({ status: "dead", gatesCleared: 4 }))).toBe(true);
	});

	it("withholds the review mid-gate and on a day without a run", () => {
		expect(canReview(climbing({ status: "answering", gatesCleared: 2 }))).toBe(
			false
		);
		expect(canReview(null)).toBe(false);
	});
});

describe("reviewBackOf", () => {
	it("returns the review to the gate it reviews while the run goes on", () => {
		expect(
			reviewBackOf(climbing({ status: "rewarding", gatesCleared: 1 }))
		).toEqual({ path: "/run/gate", label: "Back to the gate" });
	});

	it("returns a finished run's review to its result, won or dead", () => {
		const back = { path: "/run/over", label: "Back to the result" };

		expect(reviewBackOf(climbing({ status: "won", gatesCleared: 13 }))).toEqual(
			back
		);
		expect(reviewBackOf(climbing({ status: "dead", gatesCleared: 4 }))).toEqual(
			back
		);
	});

	it("lands every back press from the review where the sync leaves it alone", () => {
		const views = [
			climbing({ status: "rewarding", gatesCleared: 1 }),
			climbing({ status: "awaiting-strip", gatesCleared: 2 }),
			climbing({ status: "won", gatesCleared: 13 }),
			climbing({ status: "dead", gatesCleared: 4 }),
		];

		views.forEach((view) => {
			expect(syncTarget(reviewBackOf(view).path, view, false)).toBeNull();
		});
	});
});

describe("prepDepartureOf", () => {
	it("starts the run when prep is left before the first gate", () => {
		expect(
			prepDepartureOf(climbing({ status: "configuring", gatesCleared: 0 }))
		).toEqual({ type: "start" });
	});

	it("finishes the reward when prep is left after a paid-out gate", () => {
		expect(
			prepDepartureOf(climbing({ status: "rewarding", gatesCleared: 1 }))
		).toEqual({ type: "finish-reward" });
	});

	it("needs no action once the gate is already being answered", () => {
		expect(
			prepDepartureOf(climbing({ status: "answering", gatesCleared: 2 }))
		).toBeNull();
	});
});
